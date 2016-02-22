enum FlagTypes {
    unknown = 1,
    source
}

export class MyFlag {
    //------ Private data ----------------------------------------------------------------------------------------------
    private sourceFlag:boolean = false;

    //------ Constructors ----------------------------------------------------------------------------------------------
    constructor(private flag:Flag) {
        if (!this.flag) {
            throw 'flag doesn\'t exist';
        }

        // flags have memory by default. check if it was filled by me
        if (!this.flag.memory || !this.flag.memory.flagType) {
            this.parseName();
        }
        else {
            this.sourceFlag = this.flag.memory.flagType === FlagTypes.source;
        }
    }

    //------ Private methods -------------------------------------------------------------------------------------------
    /**
     * Source flag structure: src-$roomName-$mineToRoomName-$workerCap-$index
     */
    private parseName() {
        let flagNameTokens = this.flag.name.split('-');
        if (flagNameTokens[0] === 'src') {
            this.sourceFlag = true;
            let source = <Source>this.flag.pos.lookFor('source')[0];
            let sourceFlagMemory:SourceFlagMemory = {
                flagType: FlagTypes.source,
                roomName: flagNameTokens[1] || null,
                parentRoom: flagNameTokens[2] || null,
                workerCap: flagNameTokens[3] || 0,
                sourceID: _.isObject(source) ? source.id : null
            };
            this.flag.memory = sourceFlagMemory;
        }
        else {
            // this.sourceFlag = false; // implied
            this.flag.memory = {
                flagType: FlagTypes.unknown
            };
        }
    }

    //------ Public methods --------------------------------------------------------------------------------------------
    public isSourceFlag() {
        return this.sourceFlag;
    }

    public getParentRoomName():string {
        return (<SourceFlagMemory>this.flag.memory).parentRoom || '';
    }
}
