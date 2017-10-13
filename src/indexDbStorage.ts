const IDBKeyVal =               require('idb-keyval');
import { IKeycloakCallback }    from './models';

const KC_CALLBACK_KEY_PREFIX = 'kc-callback';

function makeKcCallbackKey (state: string) {
    return `${KC_CALLBACK_KEY_PREFIX}-${state}`;
}

export default class LocalStorage {

    constructor() {
        IDBKeyVal.set('kc-test', 'test');
        IDBKeyVal.delete('kc-test');
    }

    clearExpired() {
        return new Promise((resolve, reject) => {
            try {
                return IDBKeyVal.keys().then((keys: string[]) => {
                    if (keys) {
                        const kcCallbackKeys = keys.filter(k => k.indexOf(KC_CALLBACK_KEY_PREFIX) !== -1);
                        const time = new Date().getTime();
                        if (kcCallbackKeys) {
                            Promise.all(kcCallbackKeys.map(kcCallbackKey => IDBKeyVal.get(kcCallbackKey))).then((kcCallbacks: IKeycloakCallback[]) => {
                                if (kcCallbacks) {
                                    const expirePromises = [];
                                    kcCallbacks.forEach((kcCallback) => {
                                        const expires = kcCallback.expires;
                                        if (!expires || expires < time) {
                                            expirePromises.push(IDBKeyVal.delete(makeKcCallbackKey(kcCallback.state)));
                                        }
                                    });
                                    Promise.all(expirePromises).then(() => {
                                        resolve();
                                    });
                                }
                            });
                        }
                    }
                });
            } catch (e) {
                console.warn(`TODO; Remove, couldn't clearExpired`);
                reject(e);
            }
        });
    }

    get (state: string) {
        if (!state) return;
        IDBKeyVal.get(makeKcCallbackKey(state)).then((kcCallback: IKeycloakCallback) => {
            if (kcCallback) {
                IDBKeyVal.delete(makeKcCallbackKey(state));
                return kcCallback;
            }
            this.clearExpired();
            return kcCallback;
        });
    }

    add (state: IKeycloakCallback) {
        this.clearExpired().then(() => {
            state.expires = new Date().getTime() + (60 * 60 * 1000);
            IDBKeyVal.set(makeKcCallbackKey(state.state), state);
        });
    }
}