export default class LocalStorage {

    constructor() {
        localStorage.setItem('kc-test', 'test');
        localStorage.removeItem('kc-test');
    }

    clearExpired() {
        const time = new Date().getTime();
        for (let i = 1; i <= localStorage.length; i++)  {
            const key = localStorage.key(i);
            if (key && key.indexOf('kc-callback-') === 0) {
                const value = localStorage.getItem(key);
                if (value) {
                    try {
                        const expires = JSON.parse(value).expires;
                        if (!expires || expires < time) {
                            localStorage.removeItem(key);
                        }
                    } catch (err) {
                        localStorage.removeItem(key);
                    }
                }
            }
        }
    }

    get (state) {
        if (!state) return;

        const key = 'kc-callback-' + state;
        let value = localStorage.getItem(key);
        if (value) {
            localStorage.removeItem(key);
            value = JSON.parse(value);
        }

        this.clearExpired();
        return value;
    }

    add (state) {
        this.clearExpired();
        const key = 'kc-callback-' + state.state;
        state.expires = new Date().getTime() + (60 * 60 * 1000);
        localStorage.setItem(key, JSON.stringify(state));
    }
}