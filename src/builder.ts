/// <reference path="../typings/tsd.d.ts" />

var MyCreep = require('creep');

module BuilderModule {
    import IMyCreep = MyCreep.IMyCreep;
    export interface IBuilder extends IMyCreep{
        buildOnNearestConstructionSite:(spawn:Spawn) => void;
        upgradeController:(spawn:Spawn) => void;
        maintainRoads:(spawn:Spawn) => void;
        findClosestByRange(structureType:number, filterFunction:Function);

    }
// TODO: use a generic getEnergy function in the future


    export class Builder extends MyCreep.MyCreep implements IBuilder {
        constructor(private creep:Creep) {
            super(creep);
        }

        public buildOnNearestConstructionSite(spawn:Spawn) {
            console.log(`building for the spawn ${spawn}`);
            if (this.creep.carry.energy === 0) {
                this.getEnergyFromSpawn(spawn);
            }
            else {
                let targets = this.findAllInTheRoom(FIND_CONSTRUCTION_SITES);

                if (targets.length) {
                    var closestTarget = this.creep.pos.findClosestByRange(targets);
                    this.doOrMoveTo(this.creep.build, closestTarget);
                }
            }
        }

        public upgradeController(spawn:Spawn) {
            if (this.creep.carry.energy === 0) {
                this.getEnergyFromSpawn(spawn);
            }
            else {
                let target = spawn.room.controller;
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
    }

}
module.exports = BuilderModule;