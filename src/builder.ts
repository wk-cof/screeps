/// <reference path="../typings/tsd.d.ts" />

const buildThreshold = 199;
module BuilderModule {
    export interface IBuilder {
        buildOnNearestConstructionSite:(spawn:Spawn) => void;
        upgradeController:(spawn:Spawn) => void;
        maintainRoads:(spawn:Spawn) => void;
        findClosestByRange(structureType:number, filterFunction:Function);

    }
// TODO: use a generic getEnergy function in the future


    export class Builder implements IBuilder {
        constructor(private creep:Creep) {
        }

        private getEnergyFromSpawn(spawn:Spawn) {
            if (this.creep.pos.isNearTo(spawn) === false) {
                this.creep.moveTo(spawn);
            }
            else if (spawn.energy > buildThreshold) {
                spawn.transferEnergy(this.creep)
            }
        }

        private doOrMoveTo(action:Function, target:Structure|Creep|ConstructionSite) {
            console.log(`target: ${target}`);
            if (this.creep.pos.isNearTo(target)) {
                console.log('applying action')
                action.call(this.creep, target);
                //this.creep.build(<ConstructionSite>target);
            }
            else {
                console.log('moving to target')
                this.creep.moveTo(target);
            }
        }

        private findAllInTheRoom(findConstant:number) {
            return this.creep.room.find<ConstructionSite>(findConstant);
        }


        public buildOnNearestConstructionSite(spawn:Spawn) {
            console.log(`building for the spawn ${spawn}`);
            if (this.creep.carry.energy === 0) {// creep.carryCapacity) {
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
            if (this.creep.carry.energy === 0) {// creep.carryCapacity) {
                this.getEnergyFromSpawn(spawn);
            }
            else {
                let target = spawn.room.controller;
                if (target) {
                    this.doOrMoveTo(this.creep.upgradeController, target);
                }
            }

        }

        public findClosestByRange(structureType:number, filterFunction:Function) {

            if (filterFunction) {
                return this.creep.pos.findClosestByRange(structureType, {
                    filter: filterFunction
                });
            }
            return this.creep.pos.findClosestByRange(structureType);
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