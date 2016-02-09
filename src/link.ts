export class LinkTransfer {
    public fromLink:Link;
    public toLink:Link;
    public resourceLink:Link;

    constructor(roomName:string) {

        if (!Memory.rooms) {
            Memory.rooms = {};
        }
        if (!Memory.rooms[roomName]) {
            Memory.rooms[roomName] = {};
        }

        let links = Game.rooms[roomName].find<Link>(FIND_MY_STRUCTURES,
            {filter: (object:Link) => object.structureType === STRUCTURE_LINK});
        _.each(links, (link) => {
            let linkLocation = JSON.stringify(link.pos);
            // If link is not in memory, figure out it's role
            if (!Memory.rooms[roomName][linkLocation]) {
                let linkMemory = {
                    pos: link.pos,
                    role: null
                };
                // find link's role
                if (link.pos.findInRange(FIND_MY_SPAWNS, 2).length) {
                    linkMemory.role = 'spawn'
                }
                else if (link.pos.findInRange([Game.rooms[roomName].controller], 2).length) {
                    linkMemory.role = 'controller';
                }
                else if (link.pos.findInRange(FIND_SOURCES, 2).length) {
                    linkMemory.role = 'source';
                }
                else {
                    linkMemory.role = 'other';
                }
                Memory.rooms[roomName][linkLocation] = linkMemory;
            }

            switch(Memory.rooms[roomName][linkLocation].role) {
                case 'spawn':
                    break;
                case 'source':
                    this.fromLink = link;
                    break;
                case 'controller':
                    this.toLink = link;
                    break;
                default:
                    this.resourceLink = link;
                    break;

            }
        });
    }

    public transfer():number {
        // transfer all energy away from resource link to source or spawn link
        if (this.resourceLink && this.resourceLink.cooldown === 0) {
            let toCapacity = this.toLink.energyCapacity - this.toLink.energy;
            let fromCapacity = this.fromLink.energyCapacity - this.fromLink.energy;

            let targetLink:Link = toCapacity > fromCapacity ? this.toLink : this.fromLink;
            let targetCapacity  = toCapacity > fromCapacity ? toCapacity : fromCapacity;
            this.resourceLink.transferEnergy(targetLink,
                this.resourceLink.energy > targetCapacity? targetCapacity: this.resourceLink.energy);
        }
        if (this.fromLink && this.fromLink.cooldown === 0) {
            let availableEnergy = this.fromLink.energy;
            let availableCapacity = this.toLink.energyCapacity - this.toLink.energy;
            if (availableCapacity > 50) {
                this.fromLink.transferEnergy(this.toLink,
                    availableEnergy > availableCapacity ? availableCapacity : availableEnergy);
            }
        }
        return OK;
    }
}