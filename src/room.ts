import {CreepAssembler} from "creep-assembler";
import {Queue} from "misc";
import {CreepTypes} from "./creep-assembler";
import {MyHarvester} from "./harvester";
import {Builder} from "./builder";
import {MyCarrier} from "./carrier";
import {Fighter} from "./fighter";
import {FlagMiner} from "./harvester";

export class Room {
    //------ Private data ----------------------------------------------------------------------------------------------
    private spawns:Spawn[];
    private creeps:Creep[];
    private sources:Source[];

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
        this.roomMemory = Memory.rooms[roomName] || this.constructEmptyRoom();
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

    /**
     * Deserializes data from memory
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
            let spawn:Spawn = Game.getObjectById(this.roomMemory.spawnIDs[idx].id);
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
        let buildQueue = Queue<CreepMemory>(this.roomMemory.buildQueue);
        let creepToConstruct = buildQueue.peek();

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
            buildQueue.dequeue();
            console.log(`the name matches? ${status === creepName}`);

            // insert the creep into memory
            creepMemory.id = Game.creeps[creepName].id;
            this.addActiveCreepToMemory(creepMemory);

            // update the room build queue
            this.roomMemory.buildQueue = buildQueue.getQueue();
        }
        return status;
    }

    private enqueueCreep(type:CreepTypes) {

    }

    //------ Public Methods --------------------------------------------------------------------------------------------
    public runRoutine() {
        // order creeps around
        for (let idx in this.creeps) {
            let creep:Creep = this.creeps[idx];
            switch (creep.memory['role']) {
                case CreepTypes.worker:
                    let harvester = new MyHarvester(creep);
                    //harvester.mine(linkTransfer.fromLink);
                    break;
                case CreepTypes.upgrader:
                    let upgrader = new Builder(creep);
                    //upgrader.upgradeController(linkTransfer.toLink);
                    break;
                case CreepTypes.builder:
                    let builder = new Builder(creep);
                    //builder.buildOnNearestConstructionSite(<Spawn>roomStorage);
                    break;
                case CreepTypes.carrier:
                    let carrier = new MyCarrier(creep);
                    //carrier.runRoutine(roomStorage);
                    break;
                case CreepTypes.zealot:
                    let zealot = new Fighter(creep);
                    //zealot.runRoutine(spawnObject);
                    //heal(creep, spawnObject, 1400);
                    break;
                case CreepTypes.flagMiner:
                    let miner = new FlagMiner(creep, Game.flags['room2Resource1']);
                    //miner.mine(roomStorage);
                    break;
                default:
                    break;
            }

        }
    }

    public  toSerial() {

    }

    public fromSerial() {

    }
}