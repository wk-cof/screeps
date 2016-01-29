# Useful Links

#### [Globals](http://screeps.wikia.com/wiki/Globals)

#### [Public REST API](http://support.screeps.com/hc/en-us/articles/203022612-Committing-scripts-using-direct-API-access)

#### [Screeps Profiler](https://github.com/gdborton/screeps-profiler)

## ToDo

### Pending
* Build fighting units.
* Automate road building from the spawn to the resources.
* Separation between harvesters and carriers.
* Move constants to a separate file.


### Done
* Figure out how to use extensions to store more energy.
    *  The exact location of extensions within a room does not matter,
    but they should be in the same room with the spawn (one extension can be used by several spawns).
    All the necessary energy should be in the spawn and extensions in the beginning of the creep creation.
* Make harvesters deposit energy in extensions.
* Build a network of roads around the spawn.
    
## Notes

### src/config.ts
config.ts is not checked in to avoid unnecessary checkins due to the count adjustments to the number of various units.
Current config.ts structure:
```javascript
module.exports = {
    workerCount:    x,
    builderCount:   x,
    upgraderCount:  x
}
```