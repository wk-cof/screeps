/// <reference path="../typings/tsd.d.ts" />

const buildThreshold = 199;

export interface IBuilder {
    buildOnConstructionSite:(creep:Creep, spawn:Spawn) => void;
    upgradeController:(creep:Creep, spawn:Spawn) => void;
    maintainRoad:(creep:Creep) => void;
}

var builder = {
    buildOnConstructionSite: (creep:Creep, spawn:Spawn) => {
        //console.log('builder log: ' + creep);
        //console.log(creep.carry.energy, creep.carryCapacity);

        if (creep.carry.energy == 0) {// creep.carryCapacity) {
            if (spawn.energy > buildThreshold && spawn.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        }
        else {
            let targets = creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }
    },
    upgradeController: (creep:Creep, spawn:Spawn) => {
        if (creep.carry.energy == 0) {// creep.carryCapacity) {
            if (spawn.energy > buildThreshold && spawn.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        }
        else {
            // var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            let target = spawn.room.controller;
            if (target) {
                if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }

    },
    maintainRoad: (creep:Creep) => {
        let isMoveRequired = false;
        let moveTarget = null;
        if (creep.carry.energy === 0) {
            let spawn = creep.pos.findClosest<Spawn>(FIND_MY_SPAWNS);
            if (creep.pos.isNearTo(spawn)) {
                if (spawn.energy > buildThreshold) {
                    let transferResult = spawn.transferEnergy(creep);
                }
            }
            else {
                isMoveRequired = true;
                moveTarget = spawn;
            }
        }
        if (creep.carry.energy > 0) {
            var roadToRepair : Road = <Road>creep.pos.findClosestByRange(FIND_STRUCTURES, <any>{
                filter: (object:Structure) => {
                    //console.log(object.pos.toString());
                    return (object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax / 2));
                }
            });
            if(!roadToRepair){
                return;
            }
            console.log('reparing road at coordinates: (' + roadToRepair.pos.toString() );
            if (roadToRepair && creep.pos.isNearTo(roadToRepair)) {
                creep.repair(roadToRepair);
            }
            else {
                isMoveRequired = true;
                moveTarget = roadToRepair;
            }
        }

        if (isMoveRequired) {
            creep.moveTo(moveTarget);
        }
    }
};
module.exports = builder;