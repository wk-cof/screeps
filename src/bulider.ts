/// <reference path="../typings/tsd.d.ts" />
var builder = {
    buildRoad: () => {

    },
    upgradeController: (creep, spawn) => {
        if (creep.carry.energy == 0){// creep.carryCapacity) {
            if (spawn.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        }
        else {
            // var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            var targets = [Game.rooms['W18S21'].controller];
            if (targets.length) {
                if (creep.upgradeController(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }

    }

};
module.exports = builder;