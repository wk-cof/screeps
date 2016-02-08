import * as HM from 'harvester';
import * as BM from 'builder';
import * as CM from 'carrier';
import * as CreepAssembler from 'creep-assembler';
import * as TowerModule from 'tower';
import * as LinkTransfer from 'link';
import * as config from 'config';
import * as FM from 'fighter';
//var config = require('config');

module.exports.loop = function () {
    if (!Game.creeps['room2Upgrader']) {
        Game.spawns['Spawn2'].createCreep([WORK, CARRY, MOVE], 'room2Upgrader');
    }
    else {
        let foo = new BM.Builder(Game.creeps['room2Upgrader']);
        foo.upgradeController(Game.spawns['Spawn2']);
    }
    if (!Game.creeps['room2Miner']) {
        Game.spawns['Spawn2'].createCreep([WORK, CARRY, MOVE], 'room2Miner');
    }
    else {
        let foo = new HM.MyHarvester(Game.creeps['room2Miner']);
        foo.mine(Game.spawns['Spawn2']);
    }
    //if (Game.creeps['scout1']) {
    //    //Game.creeps['scout1'].moveTo(Game.flags['Flag1']);
    //    let miner = new HM.FlagMiner(Game.creeps['scout1'], Game.flags['room2Resource1']);
    //    //console.log(JSON.stringify(fighter.findHostileCreepsInRange(5)));
    //    miner.mine(Game.spawns['Spawn1']);
    //}
    // ============================== Game Maintenance =================================================================

    // Declarations
    let spawnNames:string[] = _.keys(Game.spawns);
    let spawn1 = spawnNames[0];
    let roomName = 'E19S13';



    // Find creeps that we have in memory
    if (!Memory.creeps) {
        Memory.creeps = {};
    }

    // link transfers
    let linkTransfer = new LinkTransfer.LinkTransfer(roomName);
    linkTransfer.transfer();

// ============================== Creep rebuilding =====================================================================
    // Find existing creeps
    let existingCreepNames = _.keys(Game.creeps);
    _.each(config.Config.activeWorkers, (value, key) => {
        //console.log(key, value);
        let currentCreeps =  _.filter(existingCreepNames, (creepName) => creepName.match(key));
        if (currentCreeps.length < config.Config.activeWorkers[key]) {
            CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes[key], spawn1);
        }
    });

// ============================== Creep functions ======================================================================
    // find the spawn
    let spawnObject:Spawn = Game.spawns[spawn1];
    let roomStorage:Storage = <Storage>Game.spawns[spawn1].room.storage;

    let towers = spawnObject.room.find<Tower>(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
    _.each(towers, (tower) => {
        let myTower:TowerModule.IMyTower = new TowerModule.MyTower(tower);
        myTower.runRoutine();
    });

    let heal = (creep:Creep, spawn: Spawn, minHp:number) => {
        if (creep.ticksToLive < minHp) {
            if (creep.pos.isNearTo(spawnObject)) {
                if (spawnObject.renewCreep(creep) === OK) {
                    console.log(creep + ' is renewed to ' + creep.ticksToLive + ' ticks');
                }
            }
        }
    }


    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName];

        switch (creep.memory['role']) {
            case CreepAssembler.CreepTypes.worker:
                //console.log('workers: ' + creep);
                let harvester = new HM.MyHarvester(creep);
                harvester.mine(linkTransfer.fromLink);
                //harvester.mineToClosestLink();
                break;
            case CreepAssembler.CreepTypes.upgrader:
                let upgrader = new BM.Builder(creep);
                upgrader.upgradeController(linkTransfer.toLink);
                break;
            case CreepAssembler.CreepTypes.builder:
                let builder = new BM.Builder(creep);
                //builder.reinforce(roomStorage, STRUCTURE_WALL);
                builder.buildOnNearestConstructionSite(<Spawn>roomStorage);
                break;
            case CreepAssembler.CreepTypes.carrier:
                let carrier = new CM.MyCarrier(creep);
                //carrier.runRoutine(spawnObject);
                carrier.runRoutine(roomStorage);
                //carrier.getEnergyFromClosestLink();
                break;
            case CreepAssembler.CreepTypes.zealot:
                let zealot = new FM.Fighter(creep);
                zealot.runRoutine(spawnObject);
                heal(creep, spawnObject, 1400);
                break;
            case CreepAssembler.CreepTypes.flagMiner:
                let miner = new HM.FlagMiner(creep,Game.flags['room2Resource1']);
                miner.mine(roomStorage);
                break;
            default:
                //console.log(`unrecognized type of worker: ${creep.memory['role']}`);
        }

        // when the creep runs out of energy, it dies. Recharge creeps
    }
    return null;
};
