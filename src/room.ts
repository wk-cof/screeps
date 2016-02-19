import {CreepAssembler} from "creep-assembler";
import {Queue} from "misc";
import {CreepTypes} from "creep-assembler";
import {MyHarvester} from "harvester";
import {Builder} from "builder";
import {MyCarrier} from "carrier";
import {Fighter} from "fighter";
import {FlagMiner} from "harvester";

export class MyRoom {
    //------ Private data ----------------------------------------------------------------------------------------------
    private spawns:Spawn[] = [];
    private creeps:Creep[] = [];
    private sources:Source[] = [];

    private room:Room;
    private roomMemory:RoomMemory;

    //------ Constructors ----------------------------------------------------------------------------------------------
    public constructor(private roomName:string) {
        this.room = Game.rooms[roomName];
        if (!this.room) {
            console.log(`Room ${roomName} not found.`);
            return;
        }
        // parse the room object from memory;
        if (!Memory.rooms[roomName]) {
            console.log('Creating new room data');
            this.roomMemory = this.constructEmptyRoom();
            this.findObjectsInRoom();
        }
        else {
            console.log('getting data from memory');
            this.roomMemory = Memory.rooms[roomName];
        }
        this.getDataFromMemory();
    }

    //------ Private methods -------------------------------------------------------------------------------------------
    /**
     * Creates an empty instance of room memory
     * @returns {RoomMemory}
     */
    private constructEmptyRoom() {
        return {
            activeCreeps: [],
            buildQueue: [],
            links: [],
            sourceIDs: [],
            spawnIDs: [],
            towers: []
        };
    }

    private findObjectsInRoom() {
        let spawns = this.room.find(FIND_MY_SPAWNS);
        this.roomMemory.spawnIDs = _.pluck(spawns, 'id');

        let towers = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        this.roomMemory.towers = _.pluck(towers, 'id');

        let links = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}});
        this.roomMemory.links = _.pluck(links, 'id');

    }

    /**
     * Deserialize data from memory
     */
    private getDataFromMemory() {
        // creeps: if the creep that's supposed to be there doesn't exist, add it to construction queue
        for (let idx in this.roomMemory.activeCreeps) {
            let creep:Creep = Game.getObjectById(this.roomMemory.activeCreeps[idx].id);
            if (!creep) {
                this.roomMemory.buildQueue.push(this.roomMemory.activeCreeps[idx]);
            }
            else {
                this.creeps.push(creep);
            }
        }

        // spawns
        for (let idx in this.roomMemory.spawnIDs) {
            let spawn:Spawn = Game.getObjectById(this.roomMemory.spawnIDs[idx]);
            this.spawns.push(spawn);
        }

        // sources
        for (let idx in this.roomMemory.sourceIDs) {
            let source:Source = Game.getObjectById(this.roomMemory.sourceIDs[idx]);
            this.sources.push(source);
        }

        // towers
        for (let idx in this.roomMemory.towers) {
            let tower:Tower = Game.getObjectById(this.roomMemory.towers[idx]);
            // TODO: if tower that's supposed to be there doesn't exist, rebuild it
        }
    }

    /**
     * Checks if spawn can construct a creep on top of the buildQueue. If it can, construct it and return status.
     *
     * return {number} Status of construction.
     */
    private canCreateCreep(spawn:Spawn, creepMemory:CreepMemory):number {
        if (creepMemory) {
            return spawn.canCreateCreep(CreepAssembler.getBodyParts(creepMemory.role));
        }
        return ERR_INVALID_ARGS;
    }

    private addActiveCreepToMemory(creepMemory:CreepMemory) {
        this.roomMemory.activeCreeps.push(creepMemory);
    }

    private buildFromQueue(spawn:Spawn) {
        let buildQueue = this.roomMemory.buildQueue;
        let creepToConstruct = buildQueue[0] || null;
        console.log(JSON.stringify(spawn));
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
            role: creepToConstruct.role,
            parentSpawn: spawn.name
        };
        let status = spawn.createCreep(CreepAssembler.getBodyParts(creepToConstruct.role), creepName, creepMemory);

        // if creep is created, the return is it's name
        if (_.isString(status)) {
            // remove the creep from the queue
            this.roomMemory.buildQueue = this.roomMemory.buildQueue.slice(1);
            console.log(`the name matches? ${status === creepName}`);

            // insert the creep into memory
            creepMemory.id = Game.creeps[creepName].id; // I don't think creep has an id immediately, it will get it the next tick when it's building
            this.addActiveCreepToMemory(creepMemory);
        }
        return status;
    }

    private enqueueCreep(type:CreepTypes) {
        let newCreepMemory:CreepMemory = {
            id: 'temp_id',
            parentSpawn: null,
            role: type
        };

        this.roomMemory.buildQueue.push(newCreepMemory);
    }

    private getBuildingCreepsCount(type:CreepTypes) {
        let creepTypes = _.filter(this.roomMemory.buildQueue, {role: type});
        return creepTypes.length || 0;
    }

    //------ Public Methods --------------------------------------------------------------------------------------------
    public runRoutine() {
        if (this.getBuildingCreepsCount(CreepTypes.scout) === 0) {
            this.enqueueCreep(CreepTypes.scout);
        }
        console.log('building', JSON.stringify(this.roomMemory.buildQueue));
        console.log('active', JSON.stringify(this.roomMemory.activeCreeps));
        //this.buildFromQueue(this.spawns[0]);
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
                    let miner = new FlagMiner(creep, Game.flags['room2Resource1']);
                    console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                    //miner.mine(roomStorage);
                    break;
                default:
                    break;
            }
        }
        Memory.rooms[this.roomName] = this.roomMemory;//this.toSerial();
    }

    public  toSerial() {
        return <RoomMemory>JSON.stringify(this.roomMemory);
    }

    public fromSerial() {

    }
}