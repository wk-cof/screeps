/// <reference path="harvester.ts" />
var HM = require('harvester');
var BM = require('builder');
var CM = require('carrier');
//var CreepAssembler = require('creep-assembler');
import * as CreepAssembler from 'creep-assembler';
var config = require('config');
//import TowerModule = require('tower');
import * as TowerModule from 'tower';
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

// ============================== Creep rebuilding =====================================================================

    //CreepAssembler.maintainCreeps(spawn1);
    let creepNames:string[] = existingCreepNames;
    let workersNames:string[] = _.filter(creepNames, (creepName) => creepName.match(/worker/i));
    let buildersNames:string[] = _.filter(creepNames, (creepName) => creepName.match(/builder/i));
    let upgradersNames:string[] = _.filter(creepNames, (creepName) => creepName.match(/upgrader/i));
    let carrierNames:string[] = _.filter(creepNames, (creepName) => creepName.match(/carrier/i));

    if (workersNames.length < config.workerCount) {
        console.log('not enough workers. Building an additional one');
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.worker, spawn1);
    } else if (buildersNames.length < config.builderCount) {
        console.log('not enough builders. Building an additional one');
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.builder, spawn1);
    } else if (upgradersNames.length < config.upgraderCount) {
        console.log('not enough upgraders. Building an additional one');
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.upgrader, spawn1);
    } else if (carrierNames.length < config.carrierCount) {
        CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes.carrier, spawn1);
    }

    // ============================== Creep functions ==================================================================
    // find the spawn
    let spawnObject:Spawn = Game.spawns[spawn1];
    let roomStorage:Storage = <Storage>Game.spawns[spawn1].room.storage;

    let towers = spawnObject.room.find<Tower>(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
    _.each(towers, (tower) => {
        let myTower:TowerModule.IMyTower = new TowerModule.MyTower(tower);
        myTower.runRoutine();
    });

    //}

    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName];

        switch (creep.memory['role']) {
            case CreepAssembler.CreepTypes.worker:
                //console.log('workers: ' + creep);
                let harvester = new HM.MyHarvester(creep);
                harvester.mine(spawnObject);
                break;
            case CreepAssembler.CreepTypes.upgrader:
                let upgrader = new BM.Builder(creep);
                upgrader.upgradeController(roomStorage);
                break;
            case CreepAssembler.CreepTypes.builder:
                let builder = new BM.Builder(creep);
                builder.reinforce(roomStorage, STRUCTURE_RAMPART);
                break;
            case CreepAssembler.CreepTypes.linkMiner:
                let linkMiner = new HM.MyHarvester(creep);
                linkMiner.mineToClosestLink();
                break;
            case CreepAssembler.CreepTypes.carrier:
                let carrier = new CM.MyCarrier(creep);
                carrier.runRoutine(spawnObject);
                if (creep.ticksToLive < 400) {
                    if (creep.pos.isNearTo(spawnObject)) {

                        if (spawnObject.renewCreep(creep) === OK) {
                            console.log(creep + ' is renewed to ' + creep.ticksToLive + ' ticks');
                        }
                    }
                }
                break;
            default:
                console.log(`unrecognized type of worker: ${creep.memory['role']}`);
        }

        // when the creep runs out of energy, it dies. Recharge creeps
        // Turns out renewing creeps is not very cost effective. Let's try to give up and just recreate the creeps.
        // we should only heal selected creeps
        //if (creep.ticksToLive < 400) {
        //    if (creep.pos.isNearTo(spawnObject)) {
        //
        //        if (spawnObject.renewCreep(creep) === OK) {
        //            console.log(creep + ' is renewed to ' + creep.ticksToLive + ' ticks');
        //        }
        //    }
        //}
        //http://support.screeps.com/hc/en-us/community/posts/206398959-request-renewCreep-noobie-guide-

    }
    return null;
};
