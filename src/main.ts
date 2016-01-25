/// <reference path="../typings/tsd.d.ts" />
/// <reference path="harvester.ts" />
var harvester = require('harvester');
var build = require('builder');

var workerName = 'Worker';
var workerIndex = 1;
var builderName = 'Builder';
var builderIndex = 3;
module.exports.loop = function () {
    // if (Game.creeps.Builder1.upgradeController(Game.rooms.W18S21.controller) === ERR_NOT_IN_RANGE) {
    //     
    // }
    if (workerIndex < 3) {
        if (Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], workerName + workerIndex) !== -6) {
            Game.creeps[workerName + workerIndex].memory['role'] = 'worker';
            workerIndex++;
        }
    }
    else {
        if (builderIndex < 2 && Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, MOVE], builderName + builderIndex) !== -6) {
            Game.creeps[builderName + builderIndex].memory['role'] = 'builder';
            builderIndex++;
        }
    }
    
    // let creeps : MyCreeps = <MyCreeps> Game.creeps;
    var spawn1 = Game.spawns['Spawn1'];
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory['role'] === 'builder') {
            build(creep, spawn1);
        }
        else if(creep.memory['role'] == 'worker') {
            harvester(creep, spawn1);
        }
    }
    return null;
}; 