var MyCreep = require('creep');

module BuilderModule {
    import IMyCreep = MyCreep.IMyCreep;
    export interface IBuilder extends IMyCreep {
        buildOnNearestConstructionSite(spawn:Spawn): void;
        upgradeController(spawn:Spawn): void;
        maintainRoads(spawn:Spawn): void;
        findClosestByRange(structureType:number, filterFunction:Function);
        reinforceWalls(energySource:Spawn|Link|Storage): boolean;

    }
// TODO: use a generic getEnergy function in the future


    export class Builder extends MyCreep.MyCreep implements IBuilder {

        private wallMaxLife = 10000;

        constructor(private creep:Creep) {
            super(creep);
        }

        /**
         * building is different from the rest of the actions since it can be performed from several tiles away.
         * TODO: Find a better way to estimate the distance in order to avoid unnecessary build calls
         */
        private buildOrMoveTo(buildTarget:ConstructionSite):boolean {
            if (this.creep.build(buildTarget) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(buildTarget);
            }
            return true;
        }


        public buildOnNearestConstructionSite(spawn:Spawn) {
            //console.log(`building for the spawn ${spawn}`);
            if (this.creep.carry.energy === 0) {
                this.getEnergy(spawn);
            }
            else {
                let targets = this.findAllInTheRoom(FIND_CONSTRUCTION_SITES);

                if (targets.length) {
                    var closestTarget = this.creep.pos.findClosestByRange(targets);
                    this.buildOrMoveTo(closestTarget);
                }
            }
        }

        public upgradeController(source:Spawn|Storage|Link) {
            if (this.creep.carry.energy === 0) {
                this.getEnergy(source);
            }
            else {
                let target = source.room.controller;
                if (target) {
                    this.doOrMoveTo(this.creep.upgradeController, target);
                }
            }

        }

        /**
         *
         * @param spawn{Spawn} Parent spawn
         * @returns {boolean} true if action was taken. False if no action required.
         */
        public maintainRoads(spawn:Spawn):boolean {
            if (this.creep.carry.energy === 0) {
                this.getEnergyFromSpawn(spawn);
            }
            else {
                let closestRoad = <Road>this.findClosestByRange(FIND_STRUCTURES,
                    (object:Structure) => (object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax / 2)));

                if (!closestRoad) {
                    return false;
                }
                this.doOrMoveTo(this.creep.repair, closestRoad);
            }
            return true;

        }

        public reinforceWalls(energySource:Spawn|Link|Storage) {
            if (this.creep.carry.energy === 0) {
                this.getEnergy(energySource);
            }
            var target = this.creep.room.find(FIND_STRUCTURES, {
                filter: (object) => {
                    return object.structureType == STRUCTURE_WALL && object.hits < this.wallMaxLife;
                }
            });
            if(target.length) {
                if(this.creep.repair(target[0]) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target[0]);
                }
            }
            return true;
        }
    }

}
module.exports = BuilderModule;