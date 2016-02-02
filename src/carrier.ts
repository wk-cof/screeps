var MyCreep = require('creep');

module CarrierModule {
    import IMyCreep = MyCreep.IMyCreep;
    export interface IMyCarrier extends IMyCreep{
        transferEnergyFromTo:(from:Structure, to:Structure|Creep) => boolean;

    }

    export class MyCarrier extends MyCreep.MyCreep implements IMyCarrier {
        public constructor(private creep:Creep){
            super(creep);
        }

        public transferEnergyFromTo(from:Structure, to:Structure|Creep) {
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
            let closestTower = this.findClosestByRange(FIND_MY_STRUCTURES,
                (object) => object.structureType === STRUCTURE_TOWER);
            this.transferEnergyFromTo(from, closestTower);
        }
    }
}

module.exports = CarrierModule;