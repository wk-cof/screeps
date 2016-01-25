/// <reference path="../typings/tsd.d.ts" />
var mine = function (creep) {
    if (creep.carry.energy < creep.carryCapacity) {
        var sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[1]);
        }
    }
    else {
        if (creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.spawns['Spawn1']);
        }
    }
        // var sources = creep.room.find(FIND_SOURCES);
        //     creep.moveTo(sources[0]);

};
module.exports = mine;