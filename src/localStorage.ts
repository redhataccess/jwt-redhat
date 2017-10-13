import { IKeycloakCallback }    from './models';

const KC_CALLBACK_KEY_PREFIX = 'kc-callback';

export default class LocalStorage {

    constructor() {
        localStorage.setItem('kc-test', 'test');
        localStorage.removeItem('kc-test');
    }

    clearExpired() {
        const time = new Date().getTime();
        for (let i = 1; i <= localStorage.length; i++)  {
            const key = localStorage.key(i);
            if (key && key.indexOf(KC_CALLBACK_KEY_PREFIX) === 0) {
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

    get (state: string) {
        if (!state) return;
        const key = `${KC_CALLBACK_KEY_PREFIX}-${state}`;
        let value = localStorage.getItem(key);
        if (value) {
            localStorage.removeItem(key);
            value = JSON.parse(value);
        }

        this.clearExpired();
        return value;
    }

    add (state: IKeycloakCallback) {
        this.clearExpired();
        const key = `${KC_CALLBACK_KEY_PREFIX}-${state.state}`;
        state.expires = new Date().getTime() + (60 * 60 * 1000);
        localStorage.setItem(key, JSON.stringify(state));
    }
}