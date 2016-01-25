/// <reference path="../typings/tsd.d.ts" />

export interface IBuilder{
    buildRoad:(creep:Creep, spawn:Spawn) => void;
    upgradeController:(creep:Creep, spawn:Spawn) => void;
}

var builder = {
    buildRoad: (creep:Creep, spawn:Spawn) => {
        if (creep.carry.energy == 0){// creep.carryCapacity) {
            if (spawn.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        }
        else {
             var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.upgradeController(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }
    },
    upgradeController : (creep:Creep, spawn:Spawn) => {
        if (creep.carry.energy == 0){// creep.carryCapacity) {
            if (spawn.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        }
        else {
            // var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            var targets = [Game.rooms['W16S22'].controller];
            if (targets.length) {
                if (creep.upgradeController(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }

    }

};
module.exports = builder;