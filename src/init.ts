/// <reference path="../typings/tsd.d.ts" />
module.exports = () => {
    if(Memory['initialized']){
        return;
    }
    ////
    //if (!memoryCreeps.workers){
    //    memoryCreeps.workers = {};
    //}


    Memory['initialized'] = true;
};