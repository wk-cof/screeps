import {MyCreep} from "creep";
import {IMyCreep} from "creep";
import {Builder} from "builder";
import {MyFlag} from "flag";

//export interface IMyHarvester extends IMyCreep {
//    mine(spawn:Spawn): boolean;
//    mineToClosestLink(): boolean;
//}

//export class MyHarvester extends MyCreep implements IMyHarvester {
//    public constructor(private creep:Creep) {
//        super(creep);
//    }
//
//    public mine(source, dest:Spawn|Link|Storage) {
//        if (this.creep.carry.energy === this.creep.carryCapacity) {
//            this.doOrMoveTo(this.creep.transferEnergy, target);
//        }
//
//        if (this.creep.carry.energy < this.creep.carryCapacity) {
//            let closestSource = this.findClosestByRange(FIND_SOURCES);
//            this.doOrMoveTo(this.creep.harvest, closestSource);
//        }
//        return true;
//    }
//
    //public mineToClosestLink() {
    //    let closestLink = <Link>(<IMyCreep>this).findClosestByRange(FIND_MY_STRUCTURES,
    //        (object:Link) => object.structureType === STRUCTURE_LINK);
    //
    //    return this.mine(closestLink);
    //}
//
//}

export class FlagMiner extends MyCreep {
    constructor(private creep:FlagMinerCreep,
                private energyDestinations:Structure[]) {
        super(creep);
    }

    public mine(flags:MyFlag[]) {
        //let target = Game.getObjectById(this.energySourceIds[0]);
        let creepMemory = (<FlagMinerMemory>this.creepMemory);
        if (!creepMemory || !creepMemory.flagName) {
            // figure out which flag to mine to
            for (let idx in flags) {
                let currentFlag = flags[idx];
                if (currentFlag.needMoreWorkers()) {
                    this.creep.memory.flagName = currentFlag.getFlag().name;
                }
            }
        }
        else {
            //TODO: This solution is not very maintainable. Can't easily reoder creep to mine to a different dest.
            let flag = Game.flags[creepMemory.flagName];
            let underlyingSource = flag.pos.lookFor('source')[0];
            if (this.creep.carry.energy < this.creep.carryCapacity) {
                this.doOrMoveTo(this.creep.harvest, underlyingSource);
            }
            else {
                let target = this.creep.pos.findClosestByRange(this.energyDestinations);
                this.doOrMoveTo(this.creep.transferEnergy, target);
            }
        }
    }
}