
//class RoomMemory {
//    public activeCreeps;
//    public spawnIDs;
//    public sourceIDs;
//    public buildQueue;
//    public towers;
//
//    constructor(jsonInMemory: string) {
//        let roomObject = JSON.parse(jsonInMemory);
//        if (!roomObject) {
//            roomObject = {}
//        }
//        this.activeCreeps = roomObject.activeCreeps || null;
//        this.spawnIDs = roomObject.spawnIDs || null;
//        this.sourceIDs = roomObject.sourceIDs || null;
//        this.buildQueue = roomObject.buildQueue || null;
//        this.towers = roomObject.towers || null;
//    }
//}

export class Room {
    private spawns:Spawn[];
    private creeps:Creep[];
    private sources:Source[];

    private room: Room;
    private roomMemory: RoomMemory;

    private constructEmptyRoom() {
        let newRoomMemory:RoomMemory = {
            activeCreeps: [],
            buildQueue: [],
            links: [],
            sourceIDs: [],
            spawnIDs: [],
            towers: [],

        };
        return newRoomMemory;

    }

    private getDataFromMemory() {
        // creeps: if the creep that's supposed to be there doesn't exist, add it to construction queue
        for(let idx in this.roomMemory.activeCreeps) {
            let creep:Creep = Game.getObjectById(this.roomMemory.activeCreeps[idx].id);
            if (!creep) {
                this.roomMemory.buildQueue.push(this.roomMemory.activeCreeps[idx]);
            }
            else {
                this.creeps.push(creep);
            }
        }

        // spawns
        for(let idx in this.roomMemory.spawnIDs) {
            let spawn:Spawn = Game.getObjectById(this.roomMemory.spawnIDs[idx].id);
            this.spawns.push(spawn);
        }

        // sources
        for(let idx in this.roomMemory.sourceIDs) {
            let source:Source = Game.getObjectById(this.roomMemory.sourceIDs[idx]);
            this.sources.push(source);
        }

        // towers
        for(let idx in this.roomMemory.towers) {
            let tower:Tower = Game.getObjectById(this.roomMemory.towers[idx]);
            // TODO: if tower that's supposed to be there doesn't exist, rebuild it
        }
    }

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

    public spawnRoutine() {
        this.spawns[0]
    }
}