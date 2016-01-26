/// <reference path="../typings/tsd.d.ts" />
/// <reference path="harvester.ts" />
import {IBuilder} from "./builder";
var harvester = require('harvester');
var builder:IBuilder = require('builder');


module Build{

    export enum CreepTypes{
        builder,
        worker,
        upgrader
    }

     function buildCreepInterface(bodyParts, spawnName, name, memory) {
        return Game.spawns[spawnName].createCreep(bodyParts, name, memory);

    }

    function buildCreep(name, type, spawnName){
        console.log('Building creep: ' + name + ', Type: ' + type);
        // assign body parts based on type
        let bodyParts;

        switch (type){
            case CreepTypes.builder:
                bodyParts = [WORK, WORK, CARRY, MOVE];
                break;
            case CreepTypes.worker:
                bodyParts = [WORK, CARRY, MOVE];
                break;
            case CreepTypes.upgrader:
                bodyParts = [WORK, CARRY, MOVE];
                break;
            default:
                bodyParts = [WORK, WORK, CARRY, MOVE];
        }

        if( _.isObject(buildCreepInterface(bodyParts, spawnName, name, {role: type})) ){
            console.log('Successfully Created a new creep: ' + name + ' with body parts: ' + bodyParts.toString());
            return true;
        }
        return false;
    }


    function isLegalCreepName(name){
        return _.isUndefined(Memory.creeps[name]);
    }

    export function buildCreepAutoName(type, spawnName){
        let templateName = type;
        let index = 1;
        while(!isLegalCreepName(templateName+index)){
            index++;
        }
        let newName = templateName+index;
        return buildCreep(newName, type, spawnName);

    }

    function isCreepAlive(creepName:string){
        return _.isObject(Game.creeps[creepName]);
    }

    export function maintainCreeps(spawn){
        var creepNames:string[] = _.keys(Memory.creeps);
        for(let creep in creepNames){
            if(!isCreepAlive(creep)){
                console.log(creep + ' is ded');
                buildCreep(creep, Memory.creeps[creep], spawn);
            }
        }
    }
}

module.exports.loop = function () {
    // ============================== Game Maintenance =================================================================

    // Declarations
    let spawnNames:string[] = _.keys(Game.spawns);
    let spawn1 = spawnNames[0];

    // Find existing creeps
    let existingCreepNames = _.keys(Game.creeps);

    // Find creeps that we have in memory
    if (!Memory.creeps) {
        Memory.creeps = {};
    }
    let memoryCreeps = Memory.creeps;

    Build.maintainCreeps(spawn1);
    let creepNames:string[] = _.keys(Memory.creeps);
    let workers:string[] = _.filter(creepNames, (creepName) => creepName.match(/worker/i));
    let builders:string[] = _.filter(creepNames, (creepName) => creepName.match(/builder/i));
    let upgraders:string[] = _.filter(creepNames, (creepName) => creepName.match(/upgrader/i));

    if (workers.length < 3) {
        Build.buildCreepAutoName(Build.CreepTypes.worker, spawn1);
    } else if (builders.length < 1) {
        Build.buildCreepAutoName(Build.CreepTypes.builder, spawn1);
    } else if (upgraders.length < 2) {
        Build.buildCreepAutoName(Build.CreepTypes.upgrader, spawn1);
    }

    // ============================== Creep rebuilding =================================================================
    // when the creep runs out of energy, it dies. Check for the DED dudes and recreate new ones.


    // ============================== Creep functions ==================================================================
    for (let name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory['role'] === Build.CreepTypes.upgrader) {
            builder.upgradeController(creep, Game.spawns[spawn1]);
        }
        else if (creep.memory['role'] === Build.CreepTypes.worker) {
            harvester(creep, spawn1);
        }
        else if (creep.memory['role'] === Build.CreepTypes.builder) {
            builder.buildRoad(creep, Game.spawns[spawn1]);
        }
    }
    return null;
}; 