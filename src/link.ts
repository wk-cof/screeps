export class LinkTransfer {
    public fromLink:Link;
    public toLink:Link;

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
                console.log(`no memory for ${linkLocation}`);
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
                case 'source':
                    this.fromLink = link;
                    break;
                case 'controller':
                default:
                    this.toLink = link;
            }
            //console.log(this.fromLink, this.toLink);
        });
    }

    public transfer():number {
        let availableEnergy = this.fromLink.energy;
        let availableCapacity = this.toLink.energyCapacity - this.toLink.energy;
        if (this.fromLink.cooldown === 0 && availableCapacity > 0) {
            return this.fromLink.transferEnergy(this.toLink,
                availableEnergy > availableCapacity ? availableCapacity : availableEnergy);
        }
        return OK;
    }
}