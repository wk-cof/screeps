function defendRoom(roomName:string) {

    var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);

    if(hostiles.length > 0) {
        var username = hostiles[0].owner.username;
        Game.notify('User ' + username + ' spotted in room ' + roomName, 1);
        //var towers = Game.rooms[roomName].find(
        //    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        //towers.forEach(tower => tower.attack(hostiles[0]));
    }
}