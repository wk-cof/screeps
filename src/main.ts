import {MyRoom} from 'room';
import {MyFlag} from "flag";
//var config = require('config');

module.exports.loop = function () {
    Memory.turnNumber = (Memory.turnNumber + 1) % 100;
    if (!Memory.rooms) {
        Memory.rooms = {};
    }
    // parse flags
    let myFlags:MyFlag[] = [];

    try {
        _.each<Flag>(Game.flags, (value) => {
            let flag = new MyFlag(value);
            myFlags.push(flag);
        });
        // sort flags by order (order will preserve after filtering
        myFlags = _.sortBy(myFlags, (sourceFlag) => {
            return sourceFlag.order;
        });
    }
    catch (err) {
        console.log(JSON.stringify(err));
    }

    let groupedFlags = _.groupBy(myFlags, (flag:MyFlag) => {
        return flag.getParentRoomName();
    });

    _.each<Room>(Game.rooms, (roomObject) => {
        // filter flags by order
        try {
            let room = new MyRoom(roomObject.name);
            room.setRoomFlags(groupedFlags[roomObject.name]);
            room.runRoutine();
        }
        catch (e) {
            console.log(`room ${roomObject.name} encountered a problem. Error: ${JSON.stringify(e)}`);
        }
    });

};
