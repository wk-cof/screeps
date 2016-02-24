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

export class MyRoom {
    //------ Private data ----------------------------------------------------------------------------------------------
    private spawns:Spawn[] = [];
    private creeps:Creep[] = [];
    private sources:Source[] = [];
    private flags:MyFlag[] = [];

    private room:Room;
    private roomMemory:RoomMemory;

    //------ Constructors ----------------------------------------------------------------------------------------------
    public constructor(private roomName:string) {
        this.room = Game.rooms[roomName];
        if (!this.room) {
            console.log(`Room ${roomName} not found.`);
            return;
        }
        //// parse the room object from memory;
        if (!Memory.rooms[roomName]) {
            //if (true) {
            console.log('Creating new room data');
            this.roomMemory = this.constructEmptyRoom();
            this.findObjectsInRoom();
        }
        else {
            //console.log('getting data from memory');
            this.roomMemory = Memory.rooms[roomName];
        }
        this.getDataFromMemory();
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
            queued: [],
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

    /**
     * Deserialize data from memory
     */
    private getDataFromMemory() {
        // creeps: if the creep that's supposed to be there doesn't exist, add it to construction queued
        for (let idx in this.roomMemory.active) {
            let creep = <Creep>Game.getObjectById(this.roomMemory.active[idx].id);
            if (!creep) {
                // remove the creep from active
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
            }
        }
    }

    private buildFromQueue(spawn:Spawn) {
        let buildQueue = this.roomMemory.queued;
        let creepToConstruct = buildQueue[0] || null;
        if (!creepToConstruct || !spawn) {
            return ERR_INVALID_TARGET;
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
            role: creepToConstruct.role
        };
        let status = spawn.createCreep(CreepAssembler.getBodyParts(creepToConstruct.role), creepName, creepMemory);

        // if creep is created, the return is it's name
        if (_.isString(status)) {
            // remove the creep from the queued
            this.roomMemory.queued = this.roomMemory.queued.slice(1);

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
            role: type
        };

        this.roomMemory.queued.push(newCreepMemory);
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
        let creepTypes = _.filter(this.roomMemory.queued, {role: type});
        return creepTypes.length || 0;
    }

    private needsRebuilding(type:CreepTypes) {
        let totalCreeps = this.getBuildingCreepsCount(type) +
            this.getActiveCreepsCount(type) +
            this.getQueuedCreepsCount(type);
        return totalCreeps < Config.activeWorkers[CreepAssembler.getCreepStringName(type)];
    }

    private saveActiveCreepMemory() {
        for (let idx in this.roomMemory.active) {
            let creep = <Creep>Game.getObjectById(this.roomMemory.active[idx].id);
            if (creep) {
                _.defaults(this.roomMemory.active[idx], creep.memory);
            }
        }
    }

    //------ Public Methods --------------------------------------------------------------------------------------------
    public runRoutine() {
        this.checkBuildingCreeps();

        // rebuild creeps if necessary
        _.each(Config.activeWorkers, (creepCount, creepName) => {
            if (this.needsRebuilding(CreepTypes[creepName])) {
                this.enqueueCreep(CreepTypes[creepName]);
            }
        });

        this.buildFromQueue(this.spawns[0]);
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
                    let upgrader = new Builder(creep);
                    console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    //upgrader.upgradeController(linkTransfer.toLink);
                    break;
                case CreepTypes.builder:
                    let builder = new Builder(creep);
                    console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    //builder.buildOnNearestConstructionSite(<Spawn>roomStorage);
                    break;
                case CreepTypes.carrier:
                    let carrier = new MyCarrier(creep);
                    console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    //carrier.runRoutine(roomStorage);
                    break;
                case CreepTypes.zealot:
                    let zealot = new Fighter(creep);
                    console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    //zealot.runRoutine(spawnObject);
                    //heal(creep, spawnObject, 1400);
                    console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    break;
                case CreepTypes.flagMiner:
                    if (!this.flags) {
                        break;
                    }
                    let miner = new FlagMiner((<FlagMinerCreep>creep));
                    console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    miner.mine(this.flags, this.spawns[0]);
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
}