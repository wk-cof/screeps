import MyCreep = require('creep');

module HarvesterModule {
    import IMyCreep = MyCreep.IMyCreep;

    export interface IMyHarvester extends IMyCreep {
        transferToClosestAvailableExtension: () => boolean;
        mine: (spawn:Spawn) => boolean;
    }

    export class MyHarvester extends MyCreep.MyCreep implements IMyHarvester {
        public constructor(private creep:Creep) {
            super(creep);
        }

        public transferToClosestAvailableExtension() {
            let extension:Extension = this.findClosestByRange(FIND_MY_STRUCTURES,
                (object:Extension) => object.structureType === STRUCTURE_EXTENSION && (object.energy < object.energyCapacity));

            this.doOrMoveTo(this.creep.transferEnergy, extension);
        }


        public mine(spawn:Spawn|Link) {
            if (this.creep.carry.energy < this.creep.carryCapacity) {
                let closestSource = this.findClosestByRange(FIND_SOURCES);
                this.doOrMoveTo(this.creep.harvest, closestSource);
            }
            else {
                // check if the spawn is full. If it is, transfer to the closest empty extension.
                if (spawn.energy < spawn.energyCapacity) {
                    this.doOrMoveTo(this.creep.transferEnergy, spawn);
                }
                else {
                    return this.transferToClosestAvailableExtension();
                }
            }
            return true;
        }

        public mineToClosestLink() {
            let closestLink = this.findClosestByRange(FIND_MY_STRUCTURES,
                (object:Link) => object.structureType === STRUCTURE_LINK);

            return this.mine(closestLink);

        }

    }
}

module.exports = HarvesterModule;