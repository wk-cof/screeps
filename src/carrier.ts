import * as MyCreep from 'creep';

export interface IMyCarrier extends MyCreep.IMyCreep {
    transferEnergyFromTo(from:Structure, to:Structure|Creep): boolean;
    runRoutine(spawn:Spawn):boolean;
}

export class MyCarrier extends MyCreep.MyCreep implements IMyCarrier {
    public constructor(private creep:Creep) {
        super(creep);
        this.buildThreshold = 220;
    }

    public runRoutine(spawn:Spawn|Storage):boolean {
        let routine:Function[] = [
            this.transferToClosestAvailableExtension,
            this.transferEnergyToTower,
            this.transferEnergyToStorage
        ];
        if (this.creep.carry.energy === 0) {
            //if (spawn.structureType == STRUCTURE_SPAWN && spawn.energy > 99) {
            //    this.getEnergy(spawn);
            //}
            //else {
            //
            //}

            if (!this.pickUpResources() && !this.getEnergyFromClosestLink()) {
                this.getEnergy(this.creep.room.storage);
            }
        }
        else {
            let actionTaken = false;
            let actionIndex = 0;
            while (!actionTaken && actionIndex < routine.length) {
                actionTaken = routine[actionIndex].call(this, spawn);
                actionIndex++;
            }
            return actionTaken;
        }
        return true;
    }

    public transferEnergyFromTo(from:Structure|Creep, to:Structure|Creep) {
        if (this.creep.carry.energy === 0) {
            this.getEnergyFromSpawn(<Spawn>from);
        }
        else {
            if (to) {
                this.doOrMoveTo(this.creep.transferEnergy, to);
            }
        }
        return true;
    }

    public transferEnergyToTower(from:Structure) {
        //console.log('transferring energy to tower');
        let closestTower = this.findClosestByRange(FIND_MY_STRUCTURES,
            (object) => object.structureType === STRUCTURE_TOWER);
        if (closestTower && closestTower.energy < closestTower.energyCapacity) {
            this.transferEnergyFromTo(from, closestTower);
            return true;
        }
        return false;
    }

    public getEnergyFromClosestLink() {
        let closestLink = <Link>this.findClosestByRange(FIND_MY_STRUCTURES, (o) => o.structureType === STRUCTURE_LINK);
        if (closestLink && closestLink.energy > closestLink.energyCapacity * 0.5) {
            this.getEnergy(closestLink);
            return true;
        }
        return false;

    }

    public transferEnergyToStorage(from:Structure|Creep) {
        //console.log('transferring energy to storage');
        let storage = this.creep.room.storage;
        if (storage) {
            this.transferEnergyFromTo(from, storage);
        }
    }

    public pickUpResources() {
        //if (this.creep.carry.energy === 0) {
        //let resources = this.creep.pos.find(FIND_DROPPED_RESOURCES);
        let resources = <any>this.creep.pos.findInRange(FIND_DROPPED_RESOURCES, 10);
        if (resources.length && resources[0].amount > 10) {
            this.doOrMoveTo(this.creep.pickup, resources[0]);
            return true;
        }
        return false;
    }
}
