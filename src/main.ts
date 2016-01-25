/// <reference path="../typings/tsd.d.ts" />
/// <reference path="harvester.ts" />
import {IBuilder} from "./bulider";
var harvester = require('harvester');
var builder:IBuilder = require('builder');


module Build{
     function buildCreep(bodyParts, spawnName, name, memory) {
        return Game.spawns[spawnName].createCreep(bodyParts, name, memory);

    }

    function isLegalCreepName(name){
        return _.isUndefined(Memory.creeps[name]);
    }

    export function buildCreepType(type, spawnName){
        let templateName = type;
        let index = 1;
        while(!isLegalCreepName(templateName+index)){
            index++;
        }
        let newName = templateName+index;

        if( _.isObject(buildCreep([WORK, CARRY, MOVE], spawnName, newName, {role: type})) ){
            console.log('Successfully Created a new builder: ' + newName);
        }
    }

    export function buildBuilder(spawnName) {
        let templateName = 'Builder';
        let index = 1;
        while(!isLegalCreepName(templateName+index)){
            index++;
        }
        let newName = templateName+index;

        if( _.isObject(buildCreep([WORK, CARRY, MOVE], spawnName, newName, {role: 'builder'})) ){
            console.log('Successfully Created a new builder: ' + newName);
        }
    }

    export function buildWorker(spawnName) {
        let templateName = 'Worker';
        let index = 1;
        while(!isLegalCreepName(templateName+index)){
            index++;
        }
        let newName = templateName+index;

        if( _.isObject(buildCreep([WORK, CARRY, MOVE], spawnName, newName, {role: 'worker'})) ){
            console.log('Successfully Created a new worker: ' + newName);
        }
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
    let builders:string[] = _.filter(creepNames, (creepName) => creepName.match(/builder/i));
    let upgraders:string[] = _.filter(creepNames, (creepName) => creepName.match(/upgrader/i));

    if (workers.length < 3) {
        Build.buildCreepType('worker', spawn1);
    } else if (builders.length < 1) {
        Build.buildCreepType('builder', spawn1);
    } else if (upgraders.length < 2) {
        Build.buildCreepType('upgrader', spawn1);
    }


    // let creeps : MyCreeps = <MyCreeps> Game.creeps;
    for (let name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory['role'] === 'upgrader') {
            builder.upgradeController(creep, Game.spawns[spawn1]);
        }
        else if (creep.memory['role'] == 'worker') {
            harvester(creep, spawn1);
        }
        else if (creep.memory['role'] == 'builder') {
            builder.buildRoad(creep, Game.spawns[spawn1]);
        }
    }
    return null;
}; 