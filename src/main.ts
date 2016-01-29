/// <reference path="../typings/tsd.d.ts" />
/// <reference path="harvester.ts" />
import {IBuilder} from "./builder";
var harvester = require('harvester');
var builder:IBuilder = require('builder');
var CreepAssembler = require('creep-assembler');

//declare var CreepAssembler:any;

// Globals

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

    //CreepAssembler.maintainCreeps(spawn1);
    let creepNames:string[] = existingCreepNames;
    let workers:string[] = _.filter(creepNames, (creepName) => creepName.match(/worker/i));
    let builders:string[] = _.filter(creepNames, (creepName) => creepName.match(/builder/i));
    let upgraders:string[] = _.filter(creepNames, (creepName) => creepName.match(/upgrader/i));

    if (workers.length < 5) {
        console.log('not enough workers. Building an additional one');
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.worker, spawn1);
    } else if (builders.length < 0) {
        console.log('not enough builders. Building an additional one');
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.builder, spawn1);
    } else if (upgraders.length < 4) {
        console.log('not enough upgraders. Building an additional one');
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.upgrader, spawn1);
    }

    // ============================== Creep rebuilding =================================================================
    // when the creep runs out of energy, it dies. Check for the DED dudes and recreate new ones.


    // ============================== Creep functions ==================================================================
    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName];
        if (creep.memory['role'] === CreepAssembler.CreepTypes.upgrader) {
            //console.log('upgraders: ' + creep);
            builder.upgradeController(creep, Game.spawns[spawn1]);
        }
        else if (creep.memory['role'] === CreepAssembler.CreepTypes.worker) {
            //console.log('workers: ' + creep);
            harvester(creep, Game.spawns[spawn1]);
        }
        else if (creep.memory['role'] === CreepAssembler.CreepTypes.builder) {
            //console.log('builders: ' + creep);
            //builder.maintainRoad(creep);
            builder.buildOnConstructionSite(creep, Game.spawns[spawn1]);
        }
    }
    return null;
}; 