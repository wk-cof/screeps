/**
	* A site of a structure which is currently under construction.
	*/
interface ConstructionSite {
	/**
		* A unique object identificator. You can use Game.getObjectById method to retrieve an object instance by its id.
		*/
	id: string;
	/**
		* Whether this is your own construction site.
		*/
	my: boolean;
	/**
		* An object with the structure’s owner info
		*/
	owner: Owner;
	/**
		* An object representing the position of this structure in the room.
		*/
	pos: RoomPosition;
	/**
		* The current construction progress.
		*/
	progress: number;
	/**
		* The total construction progress needed for the structure to be built.
		*/
	progressTotal: number;
	/**
		* The link to the Room object of this structure.
		*/
	room: Room;
	/**
		* One of the following constants: STRUCTURE_EXTENSION, STRUCTURE_RAMPART, STRUCTURE_ROAD, STRUCTURE_SPAWN, STRUCTURE_WALL, STRUCTURE_LINK
		*/
	structureType: string;
	/**
		* Remove the construction site.
		* @returns Result Code: OK, ERR_NOT_OWNER
		*/
	remove(): number;
}
/**
	* Creeps are your units. Creeps can move, harvest energy, construct structures, attack another creeps, and perform other actions.
	*/
interface Creep {
	/**
		* An array describing the creep’s body. Each element contains the following properties:
		* type: string
		* body part constant
		* hits: number
		* The remaining amount of hit points of this body part.
		*/
	body: BodyPartDefinition[];
	/**
		* An object with the creep's cargo contents:
		* energy: number
		* The current amount of energy the creep is carrying.
		*/
	carry: { energy: number };
	/**
		* The total amount of resources the creep can carry.
		*/
	carryCapacity: number;
	/**
		* The movement fatigue indicator. If it is greater than zero, the creep cannot move.
		*/
	fatigue: number;
	/**
		* The current amount of hit points of the creep.
		*/
	hits: number;
	/**
		* The maximum amount of hit points of the creep.
		*/
	hitsMax: number;
	/**
		* A unique object identificator. You can use Game.getObjectById method to retrieve an object instance by its id.
		*/
	id: string;
	/**
		* A shorthand to Memory.creeps[creep.name]. You can use it for quick access the creep’s specific memory data object.
		*/
	memory: CreepMemory;
	/**
		* Whether it is your creep or foe.
		*/
	my: boolean;
	/**
		* Creep’s name. You can choose the name while creating a new creep, and it cannot be changed later. This name is a hash key to access the creep via the Game.creeps object.
		*/
	name: string;
	/**
		* An object with the creep’s owner info
		*/
	owner: Owner;
	/**
		* An object representing the position of this creep in a room.
		*/
	pos: RoomPosition;
	/**
		* The link to the Room object of this creep.
		*/
	room: Room;
	/**
		* Whether this creep is still being spawned.
		*/
	spawning: boolean;
	/**
		* The remaining amount of game ticks after which the creep will die.
		*/
	ticksToLive: number;
	/**
		* Attack another creep or structure in a short-ranged attack. Needs the ATTACK body part. If the target is inside a rampart, then the rampart is attacked instead. The target has to be at adjacent square to the creep.
		* @returns Result Code: OK, ERR_NOT_OWNER, ERR_BUSY, ERR_INVALID_TARGET, ERR_NOT_IN_RANGE, ERR_NO_BODYPART
		*/
	attack(target: Creep|Spawn|Structure): number;
	/**
		* Build a structure at the target construction site using carried energy. Needs WORK and CARRY body parts. The target has to be at adjacent square to the creep.
		* @param target The target object to be attacked.
		* @returns Result Code: OK, ERR_NOT_OWNER, ERR_BUSY, ERR_INVALID_TARGET, ERR_NOT_IN_RANGE, ERR_NO_BODYPART
		*/
	build(target: ConstructionSite): number;
	/**
		* Cancel the order given during the current game tick.
		* @param methodName The name of a creep's method to be cancelled.
		* @returns Result Code: OK, ERR_NOT_FOUND
		*/
	cancelOrder(methodName: string): number;
	/**
		* Claim a neutral controller under your control. The target has to be at adjacent square to the creep.
		* @param target The target controller object.
		* @returns Result Code: OK, ERR_NOT_OWNER, ERR_BUSY, ERR_INVALID_TARGET, ERR_NOT_IN_RANGE, ERR_GCL_NOT_ENOUGH
		*/
	claimController(target: Structure): number;
	dropEnergy(amount?: number): number
	getActiveBodyparts(type: string): number;
	harvest(target: Source): number;
	heal(target: Creep): number;
	move(direction: Direction) : number;
	moveByPath(path: PathStep[]): number;
	moveTo(x: number, y: number, opts?: MoveToOpts): number;
	moveTo(target: RoomPosition|{pos: RoomPosition}, opts?: MoveToOpts): number;
	notifyWhenAttacked(enabled: boolean): number;
	pickup(target: Energy): number;
	rangedAttack(target: Creep|Spawn|Structure): number;
	rangedHeal(target: Creep): number;
	rangedMassAttack(): number;
	repair(target: Spawn|Structure): number;
	say(message: string): number;
	suicide(): number;
	transferEnergy(target: Creep|Spawn|Structure, amount?: number): number;
	unclaimController(target: Structure): number;
	upgradeController(target: Structure): number;
}
/**
	* A dropped piece of energy. It will decay after a while if not picked up.
	*/
interface Energy {
	/**
		* The amount of energy containing.
		*/
	energy: number;
	/**
		* A unique object identificator. You can use Game.getObjectById method to retrieve an object instance by its id.
		*/
	id: string;
	/**
		* An object representing the position in the room.
		*/
	pos: RoomPosition;
	/**
		* The link to the Room object of this structure.
		*/
	room: Room;
}
/**
	* A flag. Flags can be used to mark particular spots in a room. Flags are visible to their owners only.
	*/
interface Flag {
	/**
		* A unique object identificator. You can use Game.getObjectById method to retrieve an object instance by its id.
		*/
	id: string;
	/**
		* Flag color. One of the following constants: COLOR_WHITE, COLOR_GREY, COLOR_RED, COLOR_PURPLE, COLOR_BLUE, COLOR_CYAN, COLOR_GREEN, COLOR_YELLOW, COLOR_ORANGE, COLOR_BROWN
		*/
	color: string;
	/**
		* A shorthand to Memory.flags[flag.name]. You can use it for quick access the flag's specific memory data object.
		*/
	memory: FlagMemory;
	/**
		* Flag’s name. You can choose the name while creating a new flag, and it cannot be changed later. This name is a hash key to access the spawn via the Game.flags object.
		*/
	name: string;
	/**
		* An object representing the position of this structure in the room.
		*/
	pos: RoomPosition;
	/**
		* The link to the Room object. May not be available in case a flag is placed in a room which you do not have access to.
		*/
	room: Room;
	/**
		* The name of the room in which this flag is in. This property is deprecated and will be removed soon. Use pos.roomName instead.
		*/
	roomName: string;
	/**
		* Remove the flag.
		* @returns Result Code: OK
		*/
	remove(): void;
	/**
		* Set new color of the flag.
		* @param color One of the following constants: COLOR_WHITE, COLOR_GREY, COLOR_RED, COLOR_PURPLE, COLOR_BLUE, COLOR_CYAN, COLOR_GREEN, COLOR_YELLOW, COLOR_ORANGE, COLOR_BROWN
		* @returns Result Code: OK, ERR_INVALID_ARGS
		*/
	setColor(color: string): number;
	/**
		* Set new position of the flag.
		* @param x The X position in the room.
		* @param y The Y position in the room.
		* @returns Result Code: OK, ERR_INVALID_TARGET
		*/
	setPosition(x: number,y: number): number;
	/**
		* Set new position of the flag.
		* @param pos Can be a RoomPosition object or any object containing RoomPosition.
		* @returns Result Code: OK, ERR_INVALID_TARGET
		*/
	setPosition(pos: RoomPosition|{pos: RoomPosition}): number;
}
/**
	* The main global game object containing all the gameplay information.
	*/
interface Game {
	/**
		* An amount of available CPU time at the current game tick.
		*/
	cpuLimit: number;
	/**
		* A hash containing all your creeps with creep names as hash keys.
		*/
	creeps: HashTable<Creep>;
	/**
		* A hash containing all your flags with flag names as hash keys.
		*/
	flags: HashTable<Flag>;
	/**
		* A global object representing world GameMap.
		*/
	Map: GameMap;
	/**
		* A hash containing all the rooms available to you with room names as hash keys.
		*/
	rooms: HashTable<Room>;
	/**
		* A hash containing all your spawns with spawn names as hash keys.
		*/
	spawns: HashTable<Spawn>;
	/**
		* A hash containing all your structures with structure id as hash keys.
		*/
	structures: HashTable<Structure>;
	/**
		* System game tick counter. It is automatically incremented on every tick.
		*/
	time: number;
	/**
		* Get an object with the specified unique ID. It may be a game object of any type. Only objects from the rooms which are visible to you can be accessed.
		* @param id The unique identificator.
		* @returns an object instance or null if it cannot be found.
		*/
	getObjectById<T>(id: string): T;
	/**
		* Get amount of CPU time used from the beginning of the current game tick. Note: In the Simulation mode it depends on your local machine performance and cannot be used to estimate server-side scripts execution.
		* @returns currently used CPU time as a float number.
		*/
	getUsedCpu(): number;
	/**
		* Send a custom message at your profile email. This way, you can set up notifications to yourself on any occasion within the game. You can schedule up to 20 notifications during one game tick. Not available in the Simulation Room.
		* @param message Custom text which will be sent in the message. Maximum length is 1000 characters.
		* @param groupInterval If set to 0 (default), the notification will be scheduled immediately. Otherwise, it will be grouped with other notifications and mailed out later using the specified time in minutes.
		*/
	notify(message: string, groupInterval: number): void;
}
/**
	* A global object representing world GameMap. Use it to navigate between rooms. The object is accessible via Game.GameMap property.
	*/
interface GameMap {
	/**
		* List all exits available from the room with the given name.
		* @param roomName The room name.
		* @returns The exits information or null if the room not found.
		*/
	describeExits(roomName: string): {"1": string, "3": string, "5": string, "7": string};
	/**
		* Find the exit direction from the given room en route to another room.
		* @param fromRoom Start room name or room object.
		* @param toRoom Finish room name or room object.
		* @return The room direction constant, one of the following:
		* FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT
		* Or one of the following Result codes:
		* ERR_NO_PATH, ERR_INVALID_ARGS
		*/
	findExit(fromRoom: string|Room, toRoom: string|Room): string|number;
	/**
		* Find route from the given room to another room.
		* @param fromRoom Start room name or room object.
		* @param toRoom Finish room name or room object.
		* @returns the route array or ERR_NO_PATH code
		*/
	findRoute(fromRoom: string|Room, toRoom: string|Room): [{exit: string, room: string}]|number;
	/**
		* Check if the room with the given name is protected by temporary "newbie" walls.
		* @param roomName The room name.
		*/
	isRoomProtected(roomName: string): boolean
}
/**
	* An object representing the room in which your units and structures are in. It can be used to look around, find paths, etc. Every object in the room contains its linked Room instance in the room property.
	*/
interface Room {
	/**
		* The Controller structure of this room, if present, otherwise undefined.
		*/
	controller: Structure;
	/**
		* Total amount of energy available in all spawns and extensions in the room.
		*/
	energyAvailable: number;
	/**
		* Total amount of energyCapacity of all spawns and extensions in the room.
		*/
	energyCapacityAvailable: number;
	/**
		* A shorthand to Memory.rooms[room.name]. You can use it for quick access the room’s specific memory data object.
		*/
	memory: RoomMemory;
	/**
		* One of the following constants:
		* MODE_SIMULATION, MODE_SURVIVAL, MODE_WORLD, MODE_ARENA
		*/
	mode: string;
	/**
		* The name of the room.
		*/
	name: string;
	/**
		* The Storage structure of this room, if present, otherwise undefined.
		*/
	storage: Structure;
	/**
		* An object with survival game info if available
		*/
	survivalInfo: SurvivalGameInfo;
	/**
		* Create new ConstructionSite at the specified location.
		* @param x The X position.
		* @param y The Y position.
		* @param structureType One of the following constants: STRUCTURE_EXTENSION, STRUCTURE_RAMPART, STRUCTURE_ROAD, STRUCTURE_SPAWN, STRUCTURE_WALL, STRUCTURE_LINK
		* @returns Result Code: OK, ERR_INVALID_TARGET, ERR_INVALID_ARGS, ERR_RCL_NOT_ENOUGH
		*/
	createConstructionSite(x: number, y: number, structureType: string) : number;
	/**
		* Create new ConstructionSite at the specified location.
		* @param pos Can be a RoomPosition object or any object containing RoomPosition.
		* @param structureType One of the following constants: STRUCTURE_EXTENSION, STRUCTURE_RAMPART, STRUCTURE_ROAD, STRUCTURE_SPAWN, STRUCTURE_WALL, STRUCTURE_LINK
		* @returns Result Code: OK, ERR_INVALID_TARGET, ERR_INVALID_ARGS, ERR_RCL_NOT_ENOUGH
		*/
	createConstructionSite(pos: RoomPosition|{pos: RoomPosition}, structureType: string): number;
	/**
		* Create new Flag at the specified location.
		* @param x The X position.
		* @param y The Y position.
		* @param name (optional) The name of a new flag. It should be unique, i.e. the Game.flags object should not contain another flag with the same name (hash key). If not defined, a random name will be generated.
		*/
	createFlag(x: number, y:number, name: string, color: string): number;
	/**
		* Create new Flag at the specified location.
		* @param pos Can be a RoomPosition object or any object containing RoomPosition.
		* @param name (optional) The name of a new flag. It should be unique, i.e. the Game.flags object should not contain another flag with the same name (hash key). If not defined, a random name will be generated.
		*/
	createFlag(pos: RoomPosition|{pos: RoomPosition}, name: string, color: string): number;
	/**
		* Find all objects of the specified type in the room.
		* @param type One of the following constants:FIND_CREEPS, FIND_MY_CREEPS, FIND_HOSTILE_CREEPS, FIND_MY_SPAWNS, FIND_HOSTILE_SPAWNS, FIND_SOURCES, FIND_SOURCES_ACTIVE, FIND_DROPPED_ENERGY, FIND_STRUCTURES, FIND_MY_STRUCTURES, FIND_HOSTILE_STRUCTURES, FIND_FLAGS, FIND_CONSTRUCTION_SITES, FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT, FIND_EXIT
		* @param opts An object with additional options
		* @returns An array with the objects found.
		*/
	find<T>(type: number, opts?: {filter: any|string}): T[];
	/**
		* Find the exit direction en route to another room.
		* @param room Another room name or room object.
		* @returns The room direction constant, one of the following: FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT
		* Or one of the following error codes: ERR_NO_PATH, ERR_INVALID_ARGS
		*/
	findExitTo(room: string|Room): string|number;
	/**
		* Find an optimal path inside the room between fromPos and toPos using A* search algorithm.
		* @param fromPos The start position.
		* @param toPos The end position.
		* @param opts (optional) An object containing additonal pathfinding flags
		* @returns An array with path steps
		*/
	findPath(fromPos: RoomPosition, toPos: RoomPosition, opts?: FindPathOpts) : PathStep;
	/**
		* Creates a RoomPosition object at the specified location.
		* @param x The X position.
		* @param y The Y position.
		* @returns A RoomPosition object or null if it cannot be obtained.
		*/
	getPositionAt(x: number, y: number): RoomPosition;
	/**
		* Get the list of objects at the specified room position.
		* @param x The X position.
		* @param y The Y position.
		* @returns An array with objects at the specified position
		*/
	lookAt(x: number, y: number): LookAtResult;
	/**
		* Get the list of objects at the specified room position.
		* @param target Can be a RoomPosition object or any object containing RoomPosition.
		* @returns An array with objects at the specified position
		*/
	lookAt(target: RoomPosition|{pos: RoomPosition}) : LookAtResult;
	/**
		* Get the list of objects at the specified room area. This method is more CPU efficient in comparison to multiple lookAt calls.
		* @param top The top Y boundary of the area.
		* @param left The left X boundary of the area.
		* @param bottom The bottom Y boundary of the area.
		* @param right The right X boundary of the area.
		* @returns An object with all the objects in the specified area
		*/
	lookAtArea(top: number, left: number, bottom: number, right: number): LookAtResultMatrix;
	/**
		* Get an object with the given type at the specified room position.
		* @param type One of the following string constants: constructionSite, creep, energy, exit, flag, source, structure, terrain
		* @param x The X position.
		* @param y The Y position.
		* @returns An array of objects of the given type at the specified position if found. 
		*/
	lookForAt<T>(type: string, x: number, y: number) : T[];
	/**
		* Get an object with the given type at the specified room position.
		* @param type One of the following string constants: constructionSite, creep, energy, exit, flag, source, structure, terrain
		* @param target Can be a RoomPosition object or any object containing RoomPosition.
		* @returns An array of objects of the given type at the specified position if found. 
		*/
	lookForAt<T>(type: string, target: RoomPosition|{pos: RoomPosition}): T[];
	/**
		* Get the list of objects with the given type at the specified room area. This method is more CPU efficient in comparison to multiple lookForAt calls.
		* @param type One of the following string constants: constructionSite, creep, energy, exit, flag, source, structure, terrain
		* @param top The top Y boundary of the area.
		* @param left The left X boundary of the area.
		* @param bottom The bottom Y boundary of the area.
		* @param right The right X boundary of the area.
		* @returns An object with all the objects of the given type in the specified area
		*/
	lookForAtArea(type: string, top: number, left: number, bottom: number, right: number): LookAtResultMatrix;
}
/**
	* An object representing the specified position in the room. Every object in the room contains RoomPosition as the pos property. The position object of a custom location can be obtained using the Room.getPositionAt() method or using the constructor.
	*/
interface RoomPosition {
	new(x: number, y: number, roomName: string): RoomPosition;
	roomName: string;
	x: number;
	y: number;
	createConstructionSite(structureType: string): number;
	createFlag(name: string, color: string): number;
	findClosest<T>(type: number, opts?: {filter: any|string, algorithm: string}): T;
	findClosest<T>(objects: [T|RoomPosition], opts?: {filter: any|string, algorithm: string}): T;
	findClosestByRange<T>(type: number, opts?: {filter: any|string }): T;
	findClosestByRange<T>(objects: [T|RoomPosition], opts?: {filter: any|string }): T;
	findInRange<T>(type: number, range: number, opts?: {filter: any|string, algorithm: string}): T[];
	findInRange<T>(objects: [T|RoomPosition], range: number, opts?: {filter: any|string, algorithm: string}): T[];
	findPathTo(x: number, y: number, opts?: FindPathOpts): PathStep[];
	findPathTo(target: RoomPosition|{pos: RoomPosition}, opts?: FindPathOpts): PathStep[];
	getDirectionTo(x: number, y: number): number;
	getDirectionTo(target: RoomPosition|{pos: RoomPosition}): number;
	getRangeTo(x: number, y: number): number;
	getRangeTo(target: RoomPosition|{pos: RoomPosition}): number;
	inRangeTo(toPos: RoomPosition, range: number): boolean;
	isEqualTo(x: number, y: number): boolean;
	isEqualTo(target: RoomPosition|{pos: RoomPosition}): boolean;
	isNearTo(x: number, y: number): boolean;
	isNearTo(target: RoomPosition|{pos: RoomPosition}): boolean;
	look(): LookAtResult;
	lookFor<T>(type: string): T[];
}
interface Source {
	energy: number;
	energyCapacity: number;
	id: string;
	pos: RoomPosition;
	room: Room;
	ticksToRegeneration: number;
}
interface Spawn {
	energy: number;
	energyCapacity: number;
	hits: number;
	hitsMax: number;
	id: string;
	memory: SpawnMemory;
	my: boolean;
	name: string;
	owner: Owner;
	pos: RoomPosition;
	room: Room;
	structureType: string;
	spawning: {name: string, needTime: number, remainingTime: number};
	canCreateCreep(body: string[], name?: string): number;
	createCreep(body: string[], name?: string, memory?: any): string|number;
	destroy(): number;
	notifyWhenAttacked(enabled: boolean): number;
	transferEnergy(target: Creep, amount?: number): number;
}
interface Structure {
	hits: number;
	hitsMax: number;
	id: string;
	my: boolean;
	owner: Owner;
	pos: RoomPosition;
	room: Room;
	structureType: string;
	destroy(): number;
	notifyWhenAttacked(enabled: boolean): number;
}
interface Extension extends Structure {
	energy: number;
	energyCapacity: number;
	transferEnergy(target: Creep, amount: number): number;
}
interface Link extends Structure {
	cooldown: number;
	energy: number;
	energyCapacity: number;
	transferEnergy(target: Creep|Link, amount: number): number;
}
interface KeeperLair extends Structure {
	ticksToSpawn: number;
}
interface Controller extends Structure {
	level: number;
	progress: number;
	progressTotal: number;
	ticksToDowngrade: number;
}
interface Rampart extends Structure {
	ticksToDecay: number;
}
interface Road extends Structure {
	ticksToDecay: number;
}
interface Wall extends Structure {
	ticksToLive: number;
}
interface Storage extends Structure {
	store: {energy: number };
	storeCapacity: number;
	transferEnergy(target: Creep, amount: number): number;
}
interface BodyPartDefinition {
	type: string;
	hits: number;
}
interface Owner {
	username: string;
}
/**
	* An object with survival game info
	*/
interface SurvivalGameInfo {
	/**
		* Current score.
		*/
	score: number;
	/**
		* Time to the next wave of invaders.
		*/
	timeToWave: number;
	/**
		* The number of the next wave.
		*/
	wave: number;
}
interface LookAtResult {
	type: string;
	constructionSite?: ConstructionSite;
	creep?: Creep;
	energy?: Energy;
	exit?: any;
	flag?: Flag;
	source?: Source;
	structure?: Structure;
	terrain?: string;
}
interface LookAtResultMatrix {
	[coord: number]: LookAtResultMatrix|[LookAtResult]
}
interface FindPathOpts {
	ignoreCreeps?: boolean;
	ignoreDestructibleStructures?: boolean;
	ignore?: [any|RoomPosition];
	avoid?: any[]|RoomPosition[];
	maxOps?: number;
	heuristicWeight?: number;
}
interface MoveToOpts {
	reusePath?: number;
	noPathFinding?: boolean;
}
interface HashTable<T> {
	[key: string]: T
}
interface PathStep {
	x: number;
	dx: number;
	y: number;
	dy: number;
	direction: string;
}
interface Memory {
	creeps: {[name: string]: CreepMemory};
	flags: {[name: string]: FlagMemory};
	rooms: {[name: string]: RoomMemory};
	spawns: {[name: string]: SpawnMemory};
}
interface CreepMemory { }
interface FlagMemory { }
interface RoomMemory { }
interface SpawnMemory { }
declare enum Direction {
	TOP = 1,
	TOP_RIGHT = 2,
	RIGHT = 3,
	BOTTOM_RIGHT = 4,
	BOTTOM = 5,
	BOTTOM_LEFT = 6,
	LEFT = 7,
	TOP_LEFT = 8
}
/**
	* need 8,11,13
	*/

declare var Game: Game;
declare var Memory: Memory;