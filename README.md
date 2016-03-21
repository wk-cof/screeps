# Useful Links

#### [Globals](http://screeps.wikia.com/wiki/Globals)

#### [Public REST API](http://support.screeps.com/hc/en-us/articles/203022612-Committing-scripts-using-direct-API-access)

#### [Screeps Profiler](https://github.com/gdborton/screeps-profiler)

#### [npm typescript definitions](https://www.npmjs.com/package/screeps-typescript-declarations)

#### [Healing Creeps](http://support.screeps.com/hc/en-us/community/posts/206398959-request-renewCreep-noobie-guide-)
Turns out renewing creeps is not very cost effective. Better to just recreate the creeps in most situations.
        
## ToDo

### Pending
* Automate road building from the spawn to the resources
* Increase reusePath option in the Creep.moveTo method to help save CPU.
* implement mining in the same room
* implement logic for finding sources and destinations in the room.

### Done
* Figure out how to use extensions to store more energy.
    *  The exact location of extensions within a room does not matter,
    but they should be in the same room with the spawn (one extension can be used by several spawns).
    All the necessary energy should be in the spawn and extensions in the beginning of the creep creation.
* Make harvesters deposit energy in extensions.
* Build a network of roads around the spawn.
* Heal creeps.
* Move constants to a separate file.
* Road maintenance
* Create a parent Creep class with useful shortcuts.
* Charge cannons.
* Separation between harvesters and carriers.
* Use links to mine faster.
* Build fighting units.
* Use creep memory to store locations/paths.
* Pick up dropped resources
* customize config: Store different room setups on separate objects.
* write creep memory to room memory and if it's not available, get creep memory.
* implement priority queue
* implement mining sources and destinations on room-based level.
* build different creeps based on how many extensions I have.

## Notes

### src/config.ts
config.ts is not checked in to avoid unnecessary checkins due to the count adjustments to the number of various units.
Current config.ts structure:
```javascript
export class Config {
    public static activeWorkers = {
        worker: 1,
        builder: 0,
        upgrader: 1,
        carrier: 1,
        zealot: 0,
        flagMiner: 2
    };
    public static healThreshold = 500;
};
```


### Attacking units
Put you ```TOUGH``` parts first. Under attack, the first parts to take hits are those specified first. 
Full damage to a part leads to complete disabling of it – the creep can no longer perform this function.

### Random facts
* Cannons can heal/reinforce structures
* 