const localStorageFieldName = 'token-update-scheduler';

export interface IUpdateTokenEvent {
    token: string;
    refreshToken: string;
    idToken: string;
    timeLocal: number;
}

// https://blog.fastmail.com/2012/11/26/inter-tab-communication-using-local-storage/
export function TokenUpdateScheduler () {
    const now = Date.now();
    let ping = 0;
    try {
        ping = +localStorage.getItem(localStorageFieldName) || 0;
    } catch ( error ) {}
    if ( now - ping > 45000 ) {
        this.becomeMaster();
    } else {
        this.loseMaster();
    }
    window.addEventListener('storage', this, false );
    window.addEventListener('unload', this, false );
}

TokenUpdateScheduler.prototype.isMaster = false;
TokenUpdateScheduler.prototype.destroy = function () {
    if ( this.isMaster ) {
        try {
            localStorage.setItem(localStorageFieldName, '0');
        } catch ( error ) {}
    }
    window.removeEventListener('storage', this, false );
    window.removeEventListener('unload', this, false );
};

TokenUpdateScheduler.prototype.handleEvent = function ( event ) {
    if ( event.type === 'unload' ) {
        this.destroy();
    } else {
        const type = event.key;
        let ping = 0;
        let data;
        if ( type === localStorageFieldName) {
            try {
                ping = +localStorage.getItem(localStorageFieldName) || 0;
            } catch ( error ) {}
            if ( ping ) {
                this.loseMaster();
            } else {
                // We add a random delay to try avoid the race condition in
                // Chrome, which doesn't take out a mutex on local storage. It's
                // imperfect, but will eventually work out.
                clearTimeout( this._ping );
                this._ping = setTimeout(
                    this.becomeMaster.bind( this ),
                    ~~( Math.random() * 1000 )
                );
            }
        } else if ( type === 'broadcast' ) {
            try {
                data = JSON.parse(
                    localStorage.getItem( 'broadcast' )
                );
                this[ data.type ]( data.event );
            } catch ( error ) {}
        }
    }
};

TokenUpdateScheduler.prototype.becomeMaster = function () {
    try {
        localStorage.setItem(localStorageFieldName, `${Date.now()}`);
    } catch ( error ) {}

    clearTimeout( this._ping );
    this._ping = setTimeout( this.becomeMaster.bind( this ),
        20000 + ~~( Math.random() * 10000 ) );

    const wasMaster = this.isMaster;
    this.isMaster = true;
    if (!wasMaster) {
        this.masterDidChange();
    }
};

TokenUpdateScheduler.prototype.loseMaster = function () {
    clearTimeout( this._ping );
    this._ping = setTimeout( this.becomeMaster.bind( this ),
        35000 + ~~( Math.random() * 20000 ) );

    const wasMaster = this.isMaster;
    this.isMaster = false;
    if (wasMaster) {
        this.masterDidChange();
    }
};

TokenUpdateScheduler.prototype.masterDidChange = function () {};

TokenUpdateScheduler.prototype.broadcast = function ( type, event ) {
    try {
        localStorage.setItem('broadcast',
            JSON.stringify({
                type: type,
                event: event
            })
        );
    } catch ( error ) {}
};