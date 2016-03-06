import {MyRoom} from 'room';
import {MyFlag} from "flag";
//var config = require('config');

module.exports.loop = function () {
    Memory.turnNumber = (Memory.turnNumber + 1) % 100;
    if (!Memory.rooms) {
        Memory.rooms = {};
    }
    // parse flags
    let sourceFlags:MyFlag[] = [];
    try {
        _.each<Flag>(Game.flags, (value) => {
            let flag = new MyFlag(value);
            if (flag.isSourceFlag()) {
                sourceFlags.push(flag);
            }
        });
        // sort flags by order (order will preserve after filtering
        sourceFlags = _.sortBy(sourceFlags, (sourceFlag) => {
            return sourceFlag.order;
        });
    }
    catch(err) {
        console.log(JSON.stringify(err));
    }


    _.each<Room>(Game.rooms, (roomObject) => {
        let roomFlags = _.filter(sourceFlags, (flag:MyFlag) => {
            return flag.isSourceFlag() && flag.getParentRoomName() === roomObject.name;
        });
        // filter flags by order
        let room = new MyRoom(roomObject.name);
        room.setRoomFlags(roomFlags);
        room.runRoutine();
    });

};

//
//function oldLoop() {
//    try {
//        room2setup();
//    }
//    catch (error) {
//        console.log(error);
//    }
//    // ============================== Game Maintenance =================================================================
//
//    // Declarations
//    let spawnNames:string[] = _.keys(Game.spawns);
//    let spawn1 = spawnNames[0];
//    let roomName = 'E19S13';
//
//    // link transfers
//    let linkTransfer;
//    try {
//        linkTransfer = new LinkTransfer.LinkTransfer(roomName);
//        linkTransfer.transfer();
//    }
//    catch (error) {
//    }
//
//// ============================== Creep rebuilding =====================================================================
//    // Find existing creeps
//    let existingCreepNames = _.keys(Game.creeps);
//    _.each(config.Config.activeWorkers, (value, key) => {
//        //console.log(key, value);
//        let currentCreeps = _.filter(existingCreepNames, (creepName) => creepName.match(key));
//        if (currentCreeps.length < config.Config.activeWorkers[key]) {
//            CreepAssembler.CreepAssembler.buildCreepAutoName(CreepAssembler.CreepTypes[key], spawn1);
//        }
//    });
//
//// ============================== Creep functions ======================================================================
//    // find the spawn
//    let spawnObject:Spawn = Game.spawns[spawn1];
//    let roomStorage:Storage = <Storage>Game.spawns[spawn1].room.storage;
//
//    let towers = spawnObject.room.find<Tower>(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
//    _.each(towers, (tower) => {
//        let myTower:TowerModule.IMyTower = new TowerModule.MyTower(tower);
//        myTower.runRoutine();
//    });
//
//    let heal = (creep:Creep, spawn:Spawn, minHp:number) => {
//        if (creep.ticksToLive < minHp) {
//            if (creep.pos.isNearTo(spawnObject)) {
//                if (spawnObject.renewCreep(creep) === OK) {
//                    console.log(creep + ' is renewed to ' + creep.ticksToLive + ' ticks');
//                }
//            }
//        }
//    }
//    return null;
//};
//
//function room2setup() {
//    if (Game.creeps['room2Builder1']) {
//        //Game.creeps['room2Builder1'].moveTo(Game.flags['Flag1']);
//        let builder = new BM.Builder(Game.creeps['room2Builder1']);
//        builder.buildOnNearestConstructionSite(Game.spawns['Spawn2']);
//    }
//    else {
//        Game.spawns['Spawn2'].createCreep([WORK, CARRY, MOVE, MOVE], 'room2Builder1');
//    }
//    if (Game.creeps['room2Worker1']) {
//        //Game.creeps['room2Worker1'].moveTo(Game.flags['Flag1']);
//        let worker = new HM.MyHarvester(Game.creeps['room2Worker1']);
//        worker.mine(Game.spawns['Spawn2']);
//    }
//    else {
//        Game.spawns['Spawn2'].createCreep([WORK, CARRY, MOVE], 'room2Worker1');
//    }
//}