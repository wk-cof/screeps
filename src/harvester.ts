import {MyCreep} from "creep";
import {IMyCreep} from "creep";
import {Builder} from "builder";

export interface IMyHarvester extends IMyCreep {
    mine(spawn:Spawn): boolean;
    mineToClosestLink(): boolean;
}

export class MyHarvester extends MyCreep implements IMyHarvester {
    public constructor(private creep:Creep) {
        super(creep);
    }

    public mine(target:Spawn|Link|Storage) {
        if (this.creep.carry.energy === this.creep.carryCapacity) {
            this.doOrMoveTo(this.creep.transferEnergy, target);
        }

        if (this.creep.carry.energy < this.creep.carryCapacity) {
            let closestSource = this.findClosestByRange(FIND_SOURCES);
            this.doOrMoveTo(this.creep.harvest, closestSource);
        }
        return true;
    }

    public mineToClosestLink() {
        let closestLink = <Link>(<IMyCreep>this).findClosestByRange(FIND_MY_STRUCTURES,
            (object:Link) => object.structureType === STRUCTURE_LINK);

        return this.mine(closestLink);
    }

}

export class FlagMiner extends Builder {
    constructor(private creep:Creep, private flag:Flag) {
        super(creep);
    }

    public mine(target:Structure) {
        if (this.creep.carry.energy < this.creep.carryCapacity) {
            // check if creep and the flag are in the same room
            if (this.creep.room.name === this.flag.roomName) {
                let sources = this.creep.room.lookForAt('source', this.flag);
                if (sources.length) {
                    this.doOrMoveTo(this.creep.harvest, sources[0]);
                }
            }
            else {
                this.creep.moveTo(this.flag);
            }
        }
        else {
            let constructionSites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
            if (constructionSites.length) {
                this.buildOrMoveTo(constructionSites[0]);
            }
            else {
                this.doOrMoveTo(this.creep.transferEnergy, target);
            }
        }
    }
}