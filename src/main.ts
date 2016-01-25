/// <reference path="../typings/tsd.d.ts" />
/// <reference path="harvester.ts" />
import {IBuilder} from "./bulider";
var harvester = require('harvester');
var builder:IBuilder = require('builder');


function buildCreep(bodyParts, spawnName, name, role) {
    var result = Game.spawns[spawnName].createCreep(bodyParts, name);
    // error
    if (result < 0){
        return result;
    }
    Game.creeps[name].memory['role'] = role;
    return result;
}

function buildBuilder(spawnName, name) {
    return buildCreep([WORK, WORK, CARRY, MOVE], spawnName, name, 'builder');
}

function isLegalCreepName(name){
    return _.isUndefined(Memory.creeps[name]);
}

function buildWorker(spawnName) {
    let templateName = 'Worker';
    let index = 1;
    while(!isLegalCreepName(templateName+index)){
        index++;
    }
    let newName = templateName+index;
    console.log('Found a new legal creep name: ' + newName);

    if( _.isObject(buildCreep([WORK, CARRY, MOVE], spawnName, newName, 'worker')) ){
        console.log('Successfully Created a new worker.');
    }
}

module.exports.loop = function () {
    var spawnNames:string[] = _.keys(Game.spawns);
    let spawn1 = spawnNames[0];

    // Find existing creeps
    var existingCreepNames = _.keys(Game.creeps);

    // Find creeps that we have in memory
    if (!Memory.creeps) {
        Memory.creeps = {};
    }
    let memoryCreeps = Memory.creeps;

    let creepNames:string[] = _.keys(Memory.creeps);
    let workers:string[] = _.filter(creepNames, (creepName) => creepName.match(/worker/i));
    if (workers.length < 3) {
        buildWorker(spawn1);
    }


    // let creeps : MyCreeps = <MyCreeps> Game.creeps;
    for (let name in Game.creeps) {
        var creep = Game.creeps[name];
        //if (creep.memory['role'] === 'builder') {
        //    builder.upgradeController(creep, spawn1);
        //}
        //else
        if (creep.memory['role'] == 'worker') {
            harvester(creep, spawn1);
        }
    }
    return null;
}; 