import * as MyCreep from 'creep';

export interface IMyHarvester extends MyCreep.IMyCreep {
    mine(spawn:Spawn): boolean;
    mineToClosestLink(): boolean;
}

export class MyHarvester extends MyCreep.MyCreep implements IMyHarvester {
    public constructor(private creep:Creep) {
        super(creep);
    }

    public mine(spawn:Spawn|Link) {
        if (this.creep.carry.energy === this.creep.carryCapacity) {
            // check if the spawn is full. If it is, transfer to the closest empty extension.
            //if (spawn.energy < spawn.energyCapacity) {
            this.doOrMoveTo(this.creep.transferEnergy, spawn);
            //}
            //else {
            //    return (<MyCreep.IMyCreep>this).transferToClosestAvailableExtension();
            //}
        }

        if (this.creep.carry.energy < this.creep.carryCapacity) {
            let closestSource = this.findClosestByRange(FIND_SOURCES);
            this.doOrMoveTo(this.creep.harvest, closestSource);
        }
        return true;
    }

    public mineToClosestLink() {
        let closestLink = <Link>(<MyCreep.IMyCreep>this).findClosestByRange(FIND_MY_STRUCTURES,
            (object:Link) => object.structureType === STRUCTURE_LINK);

        return this.mine(closestLink);
    }

}
