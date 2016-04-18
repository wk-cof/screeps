import {MyFlag} from "flag";

export class MyLink {
    // Energy will flow towards the lower rank. Energy doesn't flow between same ranks.
    private linkMemory:LinkMemory;

    constructor(private link:Link) {
        if (!link) {
            throw 'MyLink requires an argument';
        }
    }

    // Default rank without a flag is 0
    public getRank():number {
        // get the rank from memory
        if (!Memory.links) {
            Memory.links = {};
        }

        if (!Memory.links[this.link.id]) {
            // find a flag on top of the link and write the result to memory
            this.createMemory();
        }
        else if (!this.linkMemory) {
            this.readMemory();
        }
        if (!this.linkMemory) {
            Memory.links[this.link.id] = undefined;
            this.createMemory();
            return 999;
        }

        return this.linkMemory.rank;
    }

    getLink():Link {
        return this.link;
    }

    private createMemory() {
        let flag = this.link.pos.lookFor<Flag>('flag')[0];
        if (!flag) {
            return 0;
        }
        let linkFlag = new MyFlag(flag);
        if (linkFlag.isLinkFlag()) {
            this.linkMemory = {
                id: this.link.id,
                rank: flag.memory.order
            };
            Memory.links[this.link.id] = this.linkMemory;
        }
        else {
            console.log(JSON.stringify(flag) +  ' is NOT A  LINK FLAG');
        }
    }

    private readMemory() {
        this.linkMemory = Memory.links[this.link.id];
    }
}

export class LinkTransfer {
    private links:MyLink[] = [];

    constructor(roomName:string) {
        let linkObjects = Game.rooms[roomName].find<Link>(FIND_MY_STRUCTURES,
            {filter: (object:Link) => object.structureType === STRUCTURE_LINK});
        _.each(linkObjects, (link:Link) => {
            this.links.push(new MyLink(link));
        });
    }

    public transfer():number {
        this.sortLinks();

        // assume sorted array
        let i = 0, j = this.links.length - 1;
        while (i < j) {
            let receivingLink = this.links[i].getLink();
            let availableCapacity = receivingLink.energyCapacity - receivingLink.energy;
            if (availableCapacity > 50) {
                // find sourceLink: skip if not enough energy or it can't currently transfer
                while (j > i && (this.links[j].getLink().energy < 50 || this.links[j].getLink().cooldown > 0)) {
                    j--;
                }
                if (this.links[i].getRank() < this.links[j].getRank()) {
                    let availableEnergy = this.links[j].getLink().energy;
                    return this.links[j].getLink().transferEnergy(this.links[i].getLink(),
                        availableEnergy > availableCapacity ? availableCapacity : availableEnergy);

                }
            }
            i++;
        }
        return ERR_NOT_FOUND;
    }

    private sortLinks() {
        this.links = _.sortBy(this.links, (link) => {
            return link.getRank();
        });
    }
}
