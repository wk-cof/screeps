/// <reference path="../typings/tsd.d.ts" />
/// <reference path="harvester.ts" />
import {IBuilder} from "./builder";
var harvester = require('harvester');
var builder:IBuilder = require('builder');
var CreepAssembler = require('creep-assembler');
var config = require('config');

//declare var CreepAssembler:any;

// Globals

module.exports.loop = function () {
    // ============================== Game Maintenance11 =================================================================

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

    //CreepAssembler.maintainCreeps(spawn1);
    let creepNames:string[] = existingCreepNames;
    let workers:string[] = _.filter(creepNames, (creepName) => creepName.match(/worker/i));
    let builders:string[] = _.filter(creepNames, (creepName) => creepName.match(/builder/i));
    let upgraders:string[] = _.filter(creepNames, (creepName) => creepName.match(/upgrader/i));

    if (workers.length < config.workerCount) {
        console.log('not enough workers. Building an additional one');
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.worker, spawn1);
    } else if (builders.length < config.builderCount) {
        console.log('not enough builders. Building an additional one');
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.builder, spawn1);
    } else if (upgraders.length < config.upgraderCount) {
        console.log('not enough upgraders. Building an additional one');
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.upgrader, spawn1);
    }

    // ============================== Creep functions and rebuilding ===================================================
    // find the spawn
    let spawnObject:Spawn = Game.spawns[spawn1];
    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName];
        if (creep.memory['role'] === CreepAssembler.CreepTypes.upgrader) {
            //console.log('upgraders: ' + creep);
            builder.upgradeController(creep, spawnObject);
        }
        else if (creep.memory['role'] === CreepAssembler.CreepTypes.worker) {
            //console.log('workers: ' + creep);
            harvester(creep, Game.spawns[spawn1]);
        }
        else if (creep.memory['role'] === CreepAssembler.CreepTypes.builder) {
            //console.log('builders: ' + creep);
            //builder.maintainRoad(creep);
            builder.buildOnConstructionSite(creep, spawnObject);
        }

        // when the creep runs out of energy, it dies. Recharge creeps
        if (creep.ticksToLive < config.healThreshold){
            if (creep.pos.isNearTo(spawnObject)){

                if (spawnObject.renewCreep(creep) === OK){
                    console.log(creep + ' is renewed to ' + creep.ticksToLive + ' ticks');
                }
            }
        }

    }
    return null;
}; 