import {CreepAssembler} from "creep-assembler";
import {Queue} from "misc";
import {CreepTypes} from "creep-assembler";
import {MyHarvester} from "harvester";
import {Builder} from "builder";
import {MyCarrier} from "carrier";
import {Fighter} from "fighter";
import {FlagMiner} from "harvester";
import {Config} from "config";
import {MyFlag} from "flag";
import {ControllerUpgrader} from "builder";
import {LinkTransfer} from "link";

export class MyRoom {
    //------ Private data ----------------------------------------------------------------------------------------------
    private spawns:Spawn[] = [];
    private creeps:Creep[] = [];
    private sources:Source[] = [];
    private flags:MyFlag[] = [];

    private room:Room;
    private roomMemory:RoomMemory;

    private roomStorage:Storage;
    private roomConfig:Config;

    //------ Constructors ----------------------------------------------------------------------------------------------
    public constructor(private roomName:string) {
        this.room = Game.rooms[roomName];
        this.roomStorage = this.room.storage || {};
        if (!this.room) {
            console.log(`Room ${roomName} not found.`);
            return;
        }
        this.roomConfig = Config.rooms[roomName];
        if (!this.roomConfig) {
            console.log(`${roomName} doesn't have a config.`);
            return;
        }
        //// parse the room object from memory;
        if (!Memory.rooms[roomName]) {
            //if (true) {
            console.log('Creating new room data');
            this.roomMemory = this.constructEmptyRoom();
            this.findObjectsInRoom();
            this.roomMemory.active = this.findRoomCreeps();
        }
        else {
            //console.log('getting data from memory');
            this.roomMemory = Memory.rooms[roomName];
        }
        this.getDataFromMemory();
    }

    //------ Public Methods --------------------------------------------------------------------------------------------
    public runRoutine() {
        try {
            this.checkBuildingCreeps();

            // rebuild creeps if necessary
            _.each(this.roomConfig, (creepCount, creepName) => {
                if (this.needsRebuilding(CreepTypes[creepName])) {
                    this.enqueueCreep(CreepTypes[creepName]);
                }
            });
        }
        catch (err) {
            console.log('encountered error while checking up on creeps');
            console.log(err);
        }

        console.log(this.room.name);
        let linkTransfer = new LinkTransfer(this.room.name);
        linkTransfer.transfer();

        let status = this.buildFromPriorityQueue(this.spawns[0]);
        console.log('attempting to build from priority queue, ' + status);
        if (status === ERR_NOT_FOUND) {
            this.buildFromQueue(this.spawns[0]);
        }
        // order creeps around
        for (let idx in this.creeps) {
            let creep:Creep = this.creeps[idx];
            switch (creep.memory['role']) {
                case CreepTypes.worker:
                    let harvester = new MyHarvester(creep);
                    console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    //harvester.mine(linkTransfer.fromLink);
                    break;
                case CreepTypes.upgrader:
                    //console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    let upgrader = new ControllerUpgrader(creep, [this.roomStorage.id]);
                    upgrader.runRoutine();
                    break;
                case CreepTypes.builder:
                    let builder = new Builder(creep, [this.roomStorage.id]);
                    builder.runRoutine();
                    break;
                case CreepTypes.carrier:
                    let carrier = new MyCarrier(creep, [this.roomStorage.id]);
                    carrier.runRoutine();
                    break;
                case CreepTypes.zealot:
                    //let zealot = new Fighter(creep);
                    //console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    //zealot.runRoutine(spawnObject);
                    //heal(creep, spawnObject, 1400);
                    break;
                case CreepTypes.flagMiner:
                    //console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    let miner = new FlagMiner((<FlagMinerCreep>creep));
                    miner.mine(this.flags, this.room.storage);//spawns[0]);
                    break;
                default:
                    break;
            }
        }
        if (!Memory.rooms) {
            Memory.rooms = {};
        }
        this.saveActiveCreepMemory();
        Memory.rooms[this.roomName] = this.roomMemory;//this.toSerial();
    }

    public setRoomFlags(flags) {
        this.flags = flags;
    }

    public  toSerial() {
        return <RoomMemory>JSON.stringify(this.roomMemory);
    }

    public fromSerial() {

    }

    //------ Private methods -------------------------------------------------------------------------------------------
    /**
     * Creates an empty instance of room memory
     * @returns {RoomMemory}
     */
    private constructEmptyRoom():RoomMemory {
        return {
            active: [],
            building: [],
            queue: [],
            priorityQueue: [],
            links: [],
            sources: [],
            spawns: [],
            towers: []
        };
    }

    private findObjectsInRoom() {
        let spawns = this.room.find(FIND_MY_SPAWNS);
        this.roomMemory.spawns = _.pluck(spawns, 'id');

        let towers = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        this.roomMemory.towers = _.pluck(towers, 'id');

        let links = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}});
        this.roomMemory.links = _.pluck(links, 'id');
    }

    private findRoomCreeps():CreepMemory[] {
        return _.filter<CreepMemory>(Memory.creeps, (creepMemory:CreepMemory) => {
            return creepMemory.parentRoom === this.room.name;
        });
    }

    /**
     * Deserialize data from memory
     */
    private getDataFromMemory() {
        // creeps: if the creep that's supposed to be there doesn't exist, add it to construction queued
        for (let idx in this.roomMemory.active) {
            let creep = <Creep>Game.getObjectById(this.roomMemory.active[idx].id);
            if (!creep) {
                // remove the creep from active
                delete Memory.creeps[this.roomMemory.active[idx].name];
                this.roomMemory.active.splice(idx, 1);
            }
            else {
                this.creeps.push(creep);
                //creep.memory = this.roomMemory.active[idx];
            }
        }

        // spawns
        for (let idx in this.roomMemory.spawns) {
            let spawn = <Spawn>Game.getObjectById(this.roomMemory.spawns[idx]);
            this.spawns.push(spawn);
        }

        // sources
        for (let idx in this.roomMemory.sources) {
            let source = <Source>Game.getObjectById(this.roomMemory.sources[idx]);
            this.sources.push(source);
        }

        // towers
        for (let idx in this.roomMemory.towers) {
            let tower = <Tower>Game.getObjectById(this.roomMemory.towers[idx]);
            // TODO: if tower that's supposed to be there doesn't exist, rebuild it
        }
    }

    /**
     * Checks if spawn can construct a creep on top of the queued. If it can, construct it and return status.
     *
     * return {number} Status of construction.
     */
    private canCreateCreep(spawn:Spawn, creepMemory:CreepMemory):number {
        if (creepMemory) {
            return spawn.canCreateCreep(CreepAssembler.getBodyParts(creepMemory.role));
        }
        return ERR_INVALID_ARGS;
    }

    private checkBuildingCreeps() {
        for (let idx in this.roomMemory.building) {
            let creepMemory = this.roomMemory.building[idx];
            if (!creepMemory.id) {
                let id = Game.creeps[creepMemory.name].id;
                console.log(`creep ${creepMemory.name} is missing an id. Creep's new id is: ${id}.`);
                creepMemory.id = id;
            }
            let creep:Creep = Game.getObjectById(creepMemory.id);
            if (creep && !creep.spawning) {
                // time for baby creep to leave the nest
                this.roomMemory.building.splice(idx, 1);
                this.roomMemory.active.push(creepMemory);
                Memory.creeps[creep.name] = creepMemory;
            }
        }
    }

    private buildFromPriorityQueue(spawn:Spawn):number {
        return this.build(spawn, 'priorityQueue');
    }

    private buildFromQueue(spawn:Spawn):number {
        return this.build(spawn, 'queue');
    }

    private build(spawn:Spawn, buildQueueName:string):number {
        let creepToConstruct = this.roomMemory[buildQueueName][0] || null;
        if (!creepToConstruct || !spawn) {
            return ERR_NOT_FOUND;
        }
        let canConstruct = this.canCreateCreep(spawn, creepToConstruct);
        if (canConstruct !== OK) {
            return canConstruct;
        }

        let creepName = CreepAssembler.findLegalCreepName(creepToConstruct.role);
        let creepMemory:CreepMemory = {
            id: null,
            name: creepName,
            parentSpawn: spawn.name,
            parentRoom: spawn.room.name,
            role: creepToConstruct.role
        };
        let status = spawn.createCreep(CreepAssembler.getBodyParts(creepToConstruct.role), creepName, creepMemory);

        // if creep is created, the return is it's name
        if (_.isString(status)) {
            // remove the creep from the queued
            this.roomMemory[buildQueueName] = this.roomMemory[buildQueueName].slice(1);

            // insert the creep into building memory
            this.roomMemory.building.push(creepMemory);
        }
        return status;
    }

    private enqueueCreep(type:CreepTypes) {
        let newCreepMemory:CreepMemory = {
            id: null,
            name: null,
            parentSpawn: null,
            parentRoom: null,
            role: type
        };

        // if creep is a priority creep, put it in the priority queue
        if (this.roomConfig['priorityList'] && this.roomConfig['priorityList'].indexOf(type) !== -1) {
            this.roomMemory.priorityQueue.push(newCreepMemory);
        }
        else {
            this.roomMemory.queue.push(newCreepMemory);
        }
    }

    private getBuildingCreepsCount(type:CreepTypes) {
        let creepTypes = _.filter(this.roomMemory.building, {role: type});
        return creepTypes.length || 0;
    }

    private getActiveCreepsCount(type:CreepTypes) {
        let creepTypes = _.filter(this.roomMemory.active, {role: type});
        return creepTypes.length || 0;
    }

    private getQueuedCreepsCount(type:CreepTypes) {
        let normalCreepTypes = _.filter(this.roomMemory.queue, {role: type}) || [];
        let priorityCreepTypes = _.filter(this.roomMemory.priorityQueue, {role: type}) || [];
        return (normalCreepTypes.length + priorityCreepTypes.length);
    }

    private needsRebuilding(type:CreepTypes) {
        let totalCreeps = this.getBuildingCreepsCount(type) +
            this.getActiveCreepsCount(type) +
            this.getQueuedCreepsCount(type);
        return totalCreeps < this.roomConfig[CreepAssembler.getCreepStringName(type)];
    }

    /**
     * Add data from creep's memory to the room's memory
     */
    private saveActiveCreepMemory() {
        for (let idx in this.roomMemory.active) {
            let creep = <Creep>Game.getObjectById(this.roomMemory.active[idx].id);
            if (creep) {
                _.defaults(this.roomMemory.active[idx], creep.memory);
            }
        }
    }

    //private getSources(type:CreepTypes) {
    //
    //    switch (type) {
    //        case CreepTypes.upgrader: // TODO: implement upgrader mining to a link
    //            return
    //        case CreepTypes.worker:
    //            break;
    //        default:
    //
    //    }
    //}
}