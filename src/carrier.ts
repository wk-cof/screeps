var MyCreep = require('creep');

module CarrierModule {
    import IMyCreep = MyCreep.IMyCreep;
    export interface IMyCarrier extends IMyCreep{
        transferEnergyFromTo(from:Structure, to:Structure|Creep): boolean;
        runRoutine(spawn:Spawn):boolean;
    }

    export class MyCarrier extends MyCreep.MyCreep implements IMyCarrier {
        public constructor(private creep:Creep){
            super(creep);
            this.buildThreshold = 220;
        }

        public runRoutine(spawn:Spawn):boolean {
            let routine: Function[] = [
                this.transferToClosestAvailableExtension,
                this.transferEnergyToTower,
                this.transferEnergyToStorage
            ];
            if (this.creep.carry.energy === 0) {
                if (spawn.structureType == STRUCTURE_SPAWN && spawn.energy > 99) {
                    this.getEnergy(spawn);
                }
                else {
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

        public getEnergyFromHarvesters() {

        }

        public transferEnergyToStorage(from:Structure|Creep) {
            //console.log('transferring energy to storage');
            let storage = this.creep.room.storage;
            if(storage) {
                this.transferEnergyFromTo(from, storage);
            }
        }
    }
}

module.exports = CarrierModule;