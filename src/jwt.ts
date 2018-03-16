const Keycloak          = require('./keycloak');
import { Keycloak }     from '../@types/keycloak';

import {
    CacheUtils,
    IBooleanCache,
    INumberCache
} from './cacheUtils';

import {
    // TokenUpdateScheduler,
    IUpdateTokenEvent
} from './tokenUpdateScheduler';

import {
    IKeycloakOptions,
    IState,
    IJwtUser,
    ILoginOptions,
    IToken,
    ITokenUpdateFailure,
    IJwtOptions
} from './models';

declare global {
    interface Window {
        Raven: any;
    }
}

declare const Raven: {
    setUserContext: any;
    captureException: any;
    setTagsContext: any;
};

/*
 * Copyright 2016 Red Hat, Inc. and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global JSON, define, console, document, window, chrometwo_require*/
/*jslint browser: true*/

const private_functions = {
    /**
     * Store things in local- or sessionStorage.  Because *Storage only
     * accepts string values, the store will automatically serialize
     * objects into JSON strings when you store them (set), and deserialize
     * them back into objects when you retrieve them (get).
     *
     * @param {string} type Either "local" or "session", depending on
     * whether you want localStorage or sessionStorage.
     * @return {object} An object-friendly interface to localStorage or
     * sessionStorage.
     */
    make_store: function (type) {
        let store;
        try {
            // if DOM Storage is disabled in Chrome, merely referencing
            // window.localStorage or window.sessionStorage will throw a
            // DOMException.
            store = window[type + 'Storage'];

            // if DOM Storage is disabled in other browsers, it may not
            // throw an error, but we should still throw one for them.
            if (!store) throw new Error('DOM Storage is disabled');
        } catch (e) {
            // this means DOM storage is disabled in the users' browser, so
            // we'll create an in-memory object that simulates the DOM
            // Storage API.
            store = {
                getItem: function mem_store_get_item(key) {
                    return store[key];
                },
                setItem: function mem_store_set_item(key, value) {
                    return (store[key] = value);
                },
                removeItem: function mem_store_remove_item(key) {
                    return delete store[key];
                }
            };
        }
        // The get and set here are used exclusively for getting and setting the token and refreshToken which are strings.
        return {
            get: function get(key) {
                const value = store.getItem(key);
                return value && JSON.parse(value);
            },
            set: function set(key, val) {
                if (typeof val !== 'undefined') {
                    return store.setItem(key, JSON.stringify(val));
                }
            },
            remove: function remove(key) {
                return store.removeItem(key);
            }
        };
    }
};

const lib = {

    /**
     * A simple function to get the value of a given cookie
     * @param {string} cookieName The cookie name/key
     * @returns {string} The string value of the cookie, "" if there was no cookie
     */
    getCookieValue: function (cookieName) {
        let start, end;
        if (document.cookie.length > 0) {
            start = document.cookie.indexOf(cookieName + '=');
            if (start !== -1 && (start === 0 || (document.cookie.charAt(start - 1) === ' '))) {
                start += cookieName.length + 1;
                end = document.cookie.indexOf(';', start);
                if (end === -1) { end = document.cookie.length; }
                return decodeURI(document.cookie.substring(start, end));
            }
        }
        return '';
    },
    setCookie: function (name, value, expires, path, domain, secure) {
        // set time, it's in milliseconds
        const today = new Date();
        today.setTime(today.getTime());

        /*
        if the expires variable is set, make the correct
        expires time, the current script below will set
        it for x number of days, to make it for hours,
        delete * 24, for minutes, delete * 60 * 24
        */
        if (expires) {
            expires = expires * 1000 * 60 * 60;
        }

        const expires_date = new Date(today.getTime() + (expires));

        document.cookie = name + '=' + encodeURI(value) +
            ((expires) ? ';expires=' + expires_date.toUTCString() : '') +
            ((path) ? ';path=' + path : '') +
            ((domain) ? ';domain=' + domain : '') +
            ((secure) ? ';secure' : '');
    },
    removeCookie: function removeCookie(cookie_name) {
        const cookie_date = new Date();  // current date & time
        cookie_date.setTime(cookie_date.getTime() - 1);
        document.cookie = cookie_name += '=; expires=' + cookie_date.toUTCString();
    },
    log: function (message) {
        if (typeof console !== 'undefined') {
            console.log(message);
        }
    },
    store: {
        local: private_functions.make_store('local'),
        session: private_functions.make_store('session')
    }
};
const INTERNAL_ROLE = 'redhat:employees';
const TOKEN_NAME = 'rh_jwt';
const REFRESH_TOKEN_NAME = 'rh_refresh_token';
const TOKEN_EXP_TTE = 58; // Seconds to check forward if the token will expire
const REFRESH_INTERVAL = 1 * TOKEN_EXP_TTE * 1000; // ms. check token for upcoming expiration every this many milliseconds
const REFRESH_TTE = 90; // seconds. refresh only token if it would expire this many seconds from now
const FAIL_COUNT_NAME = 'refresh_fail_count';
const FAIL_COUNT_THRESHOLD = 5; // how many times in a row token refresh can fail before we give up trying
let userInfo: IJwtUser;  // To be used to set the user context in Raven
let disablePolling = false;

// This is explicitly to track when the first successfull updateToken happens.
let timeSkew = null;

const DEFAULT_KEYCLOAK_OPTIONS: IKeycloakOptions = {
    realm: 'redhat-external',
    // realm: 'short-session',
    clientId: 'changeme'
};

const DEFAULT_KEYCLOAK_INIT_OPTIONS: Keycloak.KeycloakInitOptions = {
    responseMode: 'query', // was previously fragment and doesn't work with fragment.
    flow: 'standard',
    token: null,
    refreshToken: null
};

const origin = location.hostname;
// const originWithPort = location.hostname + (location.port ? ':' + location.port : '');

const token = lib.store.local.get(TOKEN_NAME) || lib.getCookieValue(TOKEN_NAME);
const refreshToken = lib.store.local.get(REFRESH_TOKEN_NAME);

if (token && token !== 'undefined') { DEFAULT_KEYCLOAK_INIT_OPTIONS.token = token; }
if (refreshToken) { DEFAULT_KEYCLOAK_INIT_OPTIONS.refreshToken = refreshToken; }

const state: IState = {
    initialized: false,
    keycloak: null
};

const events = {
    init: [],
    token: [],
    tokenMismatch: [],
    refreshError: [],
    refreshSuccess: [],
    logout: [],
    tokenExpired: []
};

document.cookie = TOKEN_NAME + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.redhat.com; path=/; secure;';

/**
 * Log session-related messages to the console, in pre-prod environments.
 */
function log(message: string) {
    const args = arguments;
    try {
        CacheUtils.get<IBooleanCache>('debug-logging').then((debugLoggingCache) => {
            if (debugLoggingCache && debugLoggingCache.value === true) {
                console.log.apply(console, args);
            }
        });
    } catch (e) {}
}

function isLocalStorageAvailable() {
    const test = 'test-local-storage';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Disabling master/slave token updates until further testing.  One major issue is that
// slave tabs are unaware if the master tab fails to update the token leading to the slave tabs
// sending requests with expired tokens even since the isTokenExpired always returns false on
// slave tabs since the master is in control.
// when it is technically true.
// const tokenUpdateScheduler = isLocalStorageAvailable() ? new TokenUpdateScheduler() : null;
const tokenUpdateScheduler = null;
if (tokenUpdateScheduler) {
    tokenUpdateScheduler.logMessage = function (data) {
        log(`[jwt.js] [Token Update Scheduler] ${data.text}`);
    };

    tokenUpdateScheduler.masterDidChange = function () {
        log(`[jwt.js] [Token Update Scheduler] This tab became ${this.isMaster ? 'master' : 'slave'}`);
    };

    // Call this to log out if the current tab is master or slave
    tokenUpdateScheduler.masterDidChange();

    tokenUpdateScheduler.updateTokenEvent = function (data: IUpdateTokenEvent) {
        if (!tokenUpdateScheduler.isMaster && data) {
            log(`[jwt.js] [Token Update Scheduler] calling keycloak setToken on this slave instance to update with the refreshed master token.`);
            state.keycloak.setToken(data.token as any, data.refreshToken, data.idToken, data.timeLocal);
            timeSkew = state.keycloak.timeSkew;
        }
    };
}

// Keep track of the setInterval for the refresh token so we can cancel it and restart it if need be
let refreshIntervalId;

/**
 * Kicks off all the session-related things.
 *
 * @memberof module:jwt
 * @private
 */
function init(jwtOptions: IJwtOptions): Keycloak.KeycloakPromise<boolean, Keycloak.KeycloakError> {
    log('[jwt.js] initializing');

    const options = jwtOptions.keycloakOptions ? Object.assign({}, DEFAULT_KEYCLOAK_OPTIONS, jwtOptions.keycloakOptions) : DEFAULT_KEYCLOAK_OPTIONS;
    options.url = !options.url ? ssoUrl(options.internalAuth) : options.url;
    disablePolling = jwtOptions.disablePolling;

    state.keycloak = Keycloak(options);

    // wire up our handlers to keycloak's events
    state.keycloak.onAuthSuccess = onAuthSuccess;
    state.keycloak.onAuthError = onAuthError;
    state.keycloak.onAuthRefreshSuccess = onAuthRefreshSuccessCallback;
    state.keycloak.onAuthRefreshError = onAuthRefreshErrorCallback;
    state.keycloak.onAuthLogout = onAuthLogoutCallback;
    state.keycloak.onTokenExpired = onTokenExpiredCallback;

    return state.keycloak
        .init(jwtOptions.keycloakInitOptions ? Object.assign({}, DEFAULT_KEYCLOAK_INIT_OPTIONS, jwtOptions.keycloakInitOptions) : DEFAULT_KEYCLOAK_INIT_OPTIONS)
        .success(keycloakInitSuccess)
        .error(keycloakInitError);
}

/**
 * Keycloak init success handler.
 * @memberof module:jwt
 * @param {Boolean} authenticated whether the user is authenticated or not
 * @private
 */
function keycloakInitSuccess(authenticated: boolean) {
    log('[jwt.js] initialized (authenticated: ' + authenticated + ')');
    if (authenticated) {
        setToken(state.keycloak.token);
        setRefreshToken(state.keycloak.refreshToken);
        resetFailCount().then(() => {
            startRefreshLoop();
        }).catch(() => {
            log('[jwt.js] unable to reset the fail count');
            startRefreshLoop();
        });
    }
    keycloakInitHandler();
}

/**
 * Call any init event handlers that have are registered.  One time call then removed.
 *
 * @memberof module:jwt
 * @private
 */
function handleInitEvents() {
    while (events.init.length) {
        const event = events.init.shift();
        if (typeof event === 'function') {
            event(Jwt);
        }
    }
}

/**
 * Call refresh error events
 *
 * @memberof module:jwt
 * @private
 */
function handleRefreshErrorEvents() {
    if (events.refreshError.length > 0) {
        events.refreshError.forEach((event) => {
            if (typeof event === 'function') {
                event(Jwt);
            }
        });
    }
}

/**
 * Call refresh success events
 *
 * @memberof module:jwt
 * @private
 */
function handleRefreshSuccessEvents() {
    if (events.refreshSuccess.length > 0) {
        events.refreshSuccess.forEach((event) => {
            if (typeof event === 'function') {
                event(Jwt);
            }
        });
    }
}

/**
 * Call logout events
 *
 * @memberof module:jwt
 * @private
 */
function handleLogoutEvents() {
    if (events.logout.length > 0) {
        events.logout.forEach((event) => {
            if (typeof event === 'function') {
                event(Jwt);
            }
        });
    }
}

/**
 * Call Token expired events
 *
 * @memberof module:jwt
 * @private
 */
function handleTokenExpiredEvents() {
    if (events.tokenExpired.length > 0) {
        events.tokenExpired.forEach((event) => {
            if (typeof event === 'function') {
                event(Jwt);
            }
        });
    }
}

/**
 * Call any token event handlers that have are registered.  One time call then removed.
 *
 * @memberof module:jwt
 * @private
 */
function handleTokenEvents() {
    while (events.token.length) {
        const event = events.token.shift();
        if (typeof event === 'function') {
            event(Jwt);
        }
    }
}

/**
 * Call any token mismatch event handlers that have are registered.  One time call then removed.
 *
 * @memberof module:jwt
 * @private
 */
function handleTokenMismatchEvents() {
    while (events.tokenMismatch.length) {
        const event = events.tokenMismatch.shift();
        if (typeof event === 'function') {
            event(Jwt);
        }
    }
}

/**
 * Register a function to be called when jwt.js has initialized.  Runs
 * immediately if already initialized.  When called, the function will be
 * passed a reference to the jwt.js API.
 *
 * @memberof module:jwt
 */
function onInit(func: Function) {
    log('[jwt.js] registering init handler');
    if (state.initialized) {
        log(`[jwt.js] running event handler: onInit`);
        func(Jwt);
    }
    else {
        events.init.push(func);
    }
}

/**
 * Register a function to be called when jwt.js has initialized and
 * the first token update has successful run
 * @memberof module:jwt
 */
function onInitialUpdateToken(func: Function) {
    log(`[jwt.js] registering the onInitialUpdateToken handler`);
    // We know the setToken has happened at least once when the timeLocal is properly set
    if (state.initialized && state.keycloak.timeSkew !== null) {
        log(`[jwt.js] running event handler: onInitialUpdateToken`);
        func(Jwt);
    } else {
        events.token.push(func);
    }
}

/**
 * Register a function to be called when the tokens mismatch.  This is a hard
 * error caused when mixing sso envs/tokens and requires a logout/log back in
 * @memberof module:jwt
 */
function onTokenMismatch(func: Function) {
    log(`[jwt.js] registering the onTokenMismatch handler`);
    if (state.initialized) {
        log(`[jwt.js] running event handler: onTokenMismatch`);
        func(Jwt);
    } else {
        events.tokenMismatch.push(func);
    }
}

/**
 * Enable debug logging
 * @memberof module:jwt
 */
async function enableDebugLogging() {
    const booleanCache = await CacheUtils.get<IBooleanCache>('debug-logging');
    if (booleanCache && booleanCache.value === true) {
        log(`[jwt.js] Debug logging already enabled`);
    } else {
        const newBooleanCache: IBooleanCache = { value: true };
        await CacheUtils.set('debug-logging', newBooleanCache);
        log(`[jwt.js] Enabled debug logging`);
    }
}

/**
 * Disable debug logging
 * @memberof module:jwt
 */
function disableDebugLogging() {
    log(`[jwt.js] Disabling debug logging`);
    const newBooleanCache: IBooleanCache = { value: false };
    CacheUtils.set('debug-logging', newBooleanCache);
}

function isMaster(): boolean {
    if (tokenUpdateScheduler) {
        return tokenUpdateScheduler.isMaster;
    } else {
        return true;
    }
}

/**
 * Keycloak init error handler.
 * @memberof module:jwt
 * @private
 */
function keycloakInitError() {
    log('[jwt.js] init error');
    keycloakInitHandler();
    removeToken();
    removeRefreshToken();
}

/**
 * Does some things after keycloak initializes, whether or not
 * initialization was successful.
 *
 * @memberof module:jwt
 * @private
 */
function keycloakInitHandler() {
    state.initialized = true;
    handleInitEvents();
}

/**
 * Call events after keycloak auth refresh error.
 *
 * @memberof module:jwt
 * @private
 */
function keycloakRefreshErrorHandler() {
    handleRefreshErrorEvents();
}

/**
 * Call events after keycloak auth refresh success.
 *
 * @memberof module:jwt
 * @private
 */
function keycloakRefreshSuccessHandler() {
    handleRefreshSuccessEvents();
}

/**
 * Call events after keycloak auth logout.
 *
 * @memberof module:jwt
 * @private
 */
function keycloakLogoutHandler() {
    handleLogoutEvents();
}

/**
 * Call events after keycloak token expired
 *
 * @memberof module:jwt
 * @private
 */
function keycloakTokenExpiredHandler() {
    handleTokenExpiredEvents();
}

/**
 * Creates a URL to the SSO service based on an old IDP URL.
 *
 * @memberof module:jwt
 * @returns {String} a URL to the SSO service
 * @private
 */
function ssoUrl(isInternal?: boolean) {
    const subDomain = isInternal === true ? 'auth' : 'sso'; // defaults to sso
    switch (location.hostname) {
        // Valid PROD URLs
        case 'access.redhat.com':
        case 'prod.foo.redhat.com':
        case 'rhn.redhat.com':
        case 'hardware.redhat.com':
        case 'unified.gsslab.rdu2.redhat.com':
            log('[jwt.js] ENV: prod');
            return `https://${subDomain}.redhat.com/auth`;

        // Valid STAGE URLs
        case 'access.stage.redhat.com':
        case 'accessstage.usersys.redhat.com':
        case 'stage.foo.redhat.com':
            log('[jwt.js] ENV: stage');
            return `https://${subDomain}.stage.redhat.com/auth`;

        // Valid QA URLs
        case 'access.qa.redhat.com':
        case 'qa.foo.redhat.com':
        case 'accessqa.usersys.redhat.com':
        case 'unified-qa.gsslab.pnq2.redhat.com':
            log('[jwt.js] ENV: qa');
            return `https://${subDomain}.qa.redhat.com/auth`;

        case 'ui.foo.redhat.com':
            log('[jwt.js] ENV: qa / dev');
            return `https://${subDomain}.dev1.redhat.com/auth`;

        case 'fte.foo.redhat.com':
            log('[jwt.js] ENV: fte');
            return `https://${subDomain}.dev.redhat.com/auth`;

        // Valid CI URLs
        case 'access.devgssci.devlab.phx1.redhat.com':
        case 'accessci.usersys.redhat.com':
        case 'ci.foo.redhat.com':
        default:
            log('[jwt.js] ENV: ci');
            return `https://${subDomain}.dev2.redhat.com/auth`;
        }
}

/**
 * A handler for when authentication is successfully established.
 *
 * @memberof module:jwt
 * @private
 */
function onAuthSuccess() {
    log('[jwt.js] onAuthSuccess');
}

function onAuthError() {
    removeToken();
    removeRefreshToken();
    log('[jwt.js] onAuthError');
}

function onAuthRefreshSuccessCallback() {
    log('[jwt.js] onAuthRefreshSuccess');
    keycloakRefreshSuccessHandler();
}

function onAuthRefreshErrorCallback() {
    log('[jwt.js] onAuthRefreshError');
    keycloakRefreshErrorHandler();
}

function onAuthLogoutCallback() {
    log('[jwt.js] onAuthLogout');
    keycloakLogoutHandler();
}

/**
 * Register a function to be called when keycloak has failed to refresh the session.  Runs
 * immediately if already initialized.  When called, the function will be
 * passed a reference to the jwt.js API.
 *
 * @memberof module:jwt
 */
function onAuthRefreshError(func: Function) {
    log('[jwt.js] registering auth refresh error handler');
    events.refreshError.push(func);
}

/**
 * Register a function to be called when keycloak has successfully to refresh the session.
 *
 * @memberof module:jwt
 */
function onAuthRefreshSuccess(func: Function) {
    log('[jwt.js] registering auth refresh success handler');
    events.refreshSuccess.push(func);
}

/**
 * Register a function to be called when keycloak has logged out.
 *
 * @memberof module:jwt
 */
function onAuthLogout(func: Function) {
    log('[jwt.js] registering auth logout handler');
    events.logout.push(func);
}

function onTokenExpiredCallback() {
    log('[jwt.js] onTokenExpired');
    keycloakTokenExpiredHandler();
}

/**
 * Register a function to be called when keycloak as expired the token.  Runs
 * immediately if already initialized.  When called, the function will be
 * passed a reference to the jwt.js API.
 *
 * @memberof module:jwt
 */
function onTokenExpired(func: Function) {
    log('[jwt.js] registering token expired handler');
    events.tokenExpired.push(func);
}

/**
 * Checks if the token is expired
 *
 * @memberof module:jwt
 * @private
 */
function isTokenExpired(tte: number = REFRESH_TTE): boolean {
    if (isLocalStorageAvailable && tokenUpdateScheduler) {
        if (tokenUpdateScheduler.isMaster) {
            return state.keycloak.isTokenExpired(tte) === true;
        } else {
            // If the instance is a slave, then the getToken exp will always be out of date
            // most likely resulting in a -1 timeSkew so we should just return false here
            // as the master is responsible for keeping the token in check
            return false;
        }
    } else {
        return state.keycloak.isTokenExpired(tte) === true;
    }
}
/**
 * Refreshes the access token.  Recursively can be called with an iteration count
 * where the function will retry x number of times.
 *
 * @memberof module:jwt
 * @private
 */
async function updateToken(force: boolean = false): Promise<boolean> {
    const isFailCountPassed = await failCountPassed();
    return new Promise<boolean>((resolve, reject) => {
        try {
            if (isFailCountPassed && force !== true) {
                const msg = `Not updating token because updating failed more than ${FAIL_COUNT_THRESHOLD} times in a row`;
                log(`[jwt.js] ${msg}`);
                reject(msg);
            } else if (isLocalStorageAvailable && tokenUpdateScheduler) {
                if (tokenUpdateScheduler.isMaster) {
                    log(`[jwt.js] running updateToken as this tab is master${force === true ? ', forcing the token update' : ', updating if within ' + REFRESH_TTE + ' seconds'}`);
                    return state.keycloak
                        .updateToken(force === true ? -1 : REFRESH_TTE)
                        .success((refreshed: boolean) => {
                            updateTokenSuccess(refreshed);
                            resolve(refreshed);
                        })
                        .error((e: any) => {
                            updateTokenFailure(e);
                            reject(e);
                        });
                } else {
                    log('[jwt.js] skipping updateToken call as this tab is a slave, see master tab');
                    // TODO -- consider broadcasting a message to the master to update.
                    // Also consider the implications of default returning a setSuccess here
                    resolve(false);
                }
            } else {
                log('[jwt.js] running updateToken (without cross-tab communcation)');
                state.keycloak
                    .updateToken(force === true ? -1 : REFRESH_TTE)
                    .success((refreshed: boolean) => {
                        updateTokenSuccess(refreshed);
                        resolve(refreshed);
                    })
                    // ITokenUpdateFailure
                    .error((e: any) => {
                        updateTokenFailure(e);
                        reject(e);
                    });
            }
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Start the {@link module:jwt.refreshLoop refreshLoop}, which
 * periodically updates the authentication token.  This should only ever
 * be called manually if manually first cancelling the refresh loop
 *
 * @memberof module:jwt
 * @private
 */
function startRefreshLoop() {
    refreshLoop();
    if (disablePolling === true) {
        log('[jwt.js] Not starting the refresh loop as disablePolling is true.');
    } else {
        if (!refreshIntervalId) {
            refreshIntervalId = setInterval(refreshLoop, REFRESH_INTERVAL);
        } else {
            log('[jwt.js] Cannot start refresh loop as it is already started.');
        }
    }
}

/**
 * Cancel the {@link module:jwt.refreshLoop refreshLoop}
 * @memberof module:jwt
 * @private
 */
function cancelRefreshLoop(shouldStopTokenUpdates?: boolean) {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        log('[jwt.js] token refresh interval cancelled');
    }
}

/**
 * This is run periodically by {@link module:jwt.startRefreshLoop
 * startRefreshLoop}.
 *
 * @memberof module:jwt
 * @private
 */
function refreshLoop(): Promise<boolean> {
    return updateToken().then((refreshed) => {
        log('[jwt.js] The refresh loop ' + ['did not refresh', 'refreshed'][~~refreshed] + ' the token');
        return refreshed;
    }).catch((e) => {
        log(`[jwt.js] The refresh loop failed to update the token due to: ${e}`);
        if (e.message.indexOf('not match') !== -1) {
            handleTokenMismatchEvents();
        }
        return false;
    });
}

/**
 * Handler run when a token is successfully updated.
 *
 * @memberof module:jwt
 * @private
 */
function updateTokenSuccess(refreshed: boolean) {
    log('[jwt.js] updateTokenSuccess, token was ' + ['not ', ''][~~refreshed] + 'refreshed');
    if (refreshed) {
        resetFailCount(); // token update worked, so reset number of consecutive failures
    }

    setToken(state.keycloak.token);
    setRefreshToken(state.keycloak.refreshToken);

    if (timeSkew === null && state.keycloak.timeSkew != null) {
        timeSkew = state.keycloak.timeSkew;
        handleTokenEvents();
    }

    try {
        if ((refreshed && !userInfo) || (refreshed && userInfo && (userInfo.username !== getUserInfo().username))) {
            setRavenUserContext();
        }
    } catch (e) {
        log(`[jwt.js] Could not set Raven user context due to: ${e.message}`);
    }
}

/**
 * Handler run when a token update fails.
 *
 * @memberof module:jwt
 * @private
 */
function updateTokenFailure(e: ITokenUpdateFailure) {
    log('[jwt.js] updateTokenFailure');
    incFailCount();
    sendToSentry(new Error('Update token failure'), e);
}

/**
 * Save the refresh token value in a semi-persistent place (sessionStorage).
 *
 * @memberof module:jwt
 * @private
 */
function setRefreshToken(refresh_token: string) {
    log('[jwt.js] setting refresh token');
    lib.store.local.set(REFRESH_TOKEN_NAME, refresh_token);
    broadcastUpdatedToken();
}

/**
 * Remove the token value from its a semi-persistent place.
 *
 * @memberof module:jwt
 * @private
 */
function removeRefreshToken() {
    log('[jwt.js] removing refresh token');
    lib.store.local.remove(REFRESH_TOKEN_NAME);
}

function broadcastUpdatedToken() {
    if (tokenUpdateScheduler) {
        const tokenUpdateData: IUpdateTokenEvent = {
            token: state.keycloak.token,
            refreshToken: state.keycloak.refreshToken,
            idToken: state.keycloak.idToken,
            timeLocal: state.keycloak.timeLocal
        };
        tokenUpdateScheduler.broadcast('updateTokenEvent', tokenUpdateData);
    }
}

/**
 * Save the token value in a semi-persistent place (cookie).
 *
 * @memberof module:jwt
 * @private
 */
function setToken(token) {
    // make sure token is defined
    if (token) {
        // save the token in localStorage AND in a cookie.  the cookie
        // exists so it'll be sent along with AJAX requests.  the
        // localStorage value exists so the token can be refreshed even if
        // it's been expired for a long time.
        log('[jwt.js] setting access token');
        lib.store.local.set(TOKEN_NAME, token);
        document.cookie = TOKEN_NAME + '=' + token + ';path=/;max-age=' + 15 * 60 + ';domain=.' + origin + ';secure;';
        broadcastUpdatedToken();
    }
}

/**
 * Remove the token value from its a semi-persistent place.
 *
 * @memberof module:jwt
 * @private
 */
function removeToken() {
    log('[jwt.js] removing access token');
    lib.store.local.remove(TOKEN_NAME);
    document.cookie = TOKEN_NAME + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.' + origin + '; path=/;secure;';
}

// init
// login
// createLoginUrl
// logout
// createLogoutUrl
// register
// createRegisterUrl
// createAccountUrl
// accountManagement
// hasRealmRole
// hasResourceRole
// loadUserProfile
// loadUserInfo
// isTokenExpired
// updateToken
// clearToken
// callback_id
// authenticated
// responseMode
// responseType
// flow
// authServerUrl
// realm
// clientId
// clientSecret

/**
 * Get an object containing the parsed JSON Web Token.  Contains user and session metadata.
 *
 * @memberof module:jwt
 * @return {Object} the parsed JSON Web Token
 */
function getToken(): IToken {
    // any here as actual RH tokens have more information than this, which we will customize with IToken above
    return state.keycloak.tokenParsed as any;
}

/**
 * Get the token value stored in the lib.  This method should always be used to get the token value
 * when constructing ajax calls in apps depending on jwt.js.  This ensures that the token is being
 * fetched from localStorage which is cross tab vs. on the keycloak instance which is per tab.
 *
 * If this method falls back to the getCookieValue, which I believe is per tab, then it still may succumb
 * to token expired errors to due to stale
 *
 * Note that the token is technically kept in sync across tabs, but this is the safest function to access
 * the latest token with
 *
 * @memberof module:jwt
 * @return {Object} the parsed JSON Web Token
 */
function getStoredTokenValue(): string {
    return lib.store.local.get(TOKEN_NAME) || lib.getCookieValue(TOKEN_NAME);
}

/* Get a string containing the unparsed, base64-encoded JSON Web Token.
*
* @memberof module:jwt
* @return {Object} the parsed JSON Web Token
*/
function getEncodedToken(): string {
    return state.keycloak.token;
}

/**
 * Get the user info from the JSON Web Token.  Contains user information
 * similar to what the old userStatus REST service returned.
 *
 * @memberof module:jwt
 * @return {Object} the user information
 */
function getUserInfo(): IJwtUser {
    // the properties to return
    const token = getToken();
    return token ? {
        user_id: token.user_id,
        id: token.user_id,
        username: token.username,
        account_id: token.account_id,
        account_number: token.account_number,
        email: token.email,
        firstName: token.firstName,
        lastName: token.lastName,
        lang: token.lang,
        region: token.region,
        login: token.username,
        internal: isInternal()
    } : null;
}

/**
 * Is the user authenticated?
 *
 * @memberof module:jwt
 * @returns {Boolean} true if the user is authenticated, false otherwise
 */
function isAuthenticated(): boolean {
    return state.keycloak.authenticated;
}

/**
 * Is the user is a Red Hat employee?
 *
 * @memberof module:jwt
 * @returns {Boolean} true if the user is a Red Hat employee, otherwise false
 */
function isInternal(): boolean {
    return state.keycloak.hasRealmRole(INTERNAL_ROLE);
}

/**
 * Returns true if the user has all the given role(s).  You may provide any
 * number of roles.
 *
 * @param {...String} roles All the roles you wish to test for.  See
 * examples.
 * @returns {Boolean} whether the user is a member of ALL given roles
 * @example session.hasRole('portal_manage_cases');
 * session.hasRole('role1', 'role2', 'role3');
 * @memberof module:jwt
 */
function hasRole(...roles: string[]): boolean {
    if (!roles) return false;
    for (let i = 0; i < roles.length; ++i) {
        if (!state.keycloak.hasRealmRole(roles[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Get the URL to the registration page.
 * @return {String} the URL to the registration page
 * @memberof module:jwt
 */
function getRegisterUrl() {
    return state.keycloak.createRegisterUrl();
}

/**
 * Get the URL to the login page.
 * @return {String} the URL to the login page
 * @memberof module:jwt
 */
function getLoginUrl(options: ILoginOptions = {}): string {
    const redirectUri = options.redirectUri || location.href;
    options.redirectUri = redirectUri;
    return state.keycloak.createLoginUrl(options);
}

/**
 * Get the URL to the logout page.
 * @return {String} the URL to the logout page
 * @memberof module:jwt
 */
function getLogoutUrl(): string {
    return state.keycloak.createLogoutUrl();
}

/**
 * Get the URL to the account management page.
 * @return {String} the URL to the account management page
 * @memberof module:jwt
 */
function getAccountUrl(): string {
    return state.keycloak.createAccountUrl();
}

/**
 * "Decorator" enforcing that jwt.js be initialized before the wrapped
 * function will be run.
 *
 * @memberof module:jwt
 * @private
 * @param {Function} func a function which shouldn't be run before jwt.js is
 * initialized.
 * @return {Function}
 */
function initialized(func) {
    return function () {
        if (state.initialized) {
            return func.apply({}, arguments);
        }
        else {
            console.warn('[jwt.js] couldn\'t call function, session not initialized');
            return;
        }
    };
}

/**
 * Logs the user in.  An unauthenticated user will be sent to the
 * credentials form and then back to the current page.  An authenticated
 * user will be sent to the Keycloak server but bounced back to the current
 * page right away.
 *
 * @memberof module:jwt
 * @param {Object} options See [options](https://keycloak.gitbooks.io/securing-client-applications-guide/content/v/2.2/topics/oidc/javascript-adapter.html#_login_options) for valid options.
 */
function login(options: ILoginOptions = {}): void {
    const redirectUri = options.redirectUri || location.href;
    options.redirectUri = redirectUri;
    state.keycloak.login(options);
}

/**
 * Navigate to the logout page, end session, then navigate back.
 * @memberof module:jwt
 */
function logout(options: ILoginOptions = {}): void {
    removeToken();
    removeRefreshToken();
    state.keycloak.logout(options);
}

/**
 * Navigate to the account registration page.
 * @memberof module:jwt
 */
function register(options): void {
    state.keycloak.register(options);
}

/**
 * Send current user context to Raven (JS error logging library).
 * @memberof module:jwt
 * @private
 */
function setRavenUserContext() {
    // once the user info service has returned, use its data to add user
    // context to RavenJS, for inclusion in Sentry error reports.
    userInfo = getUserInfo();
    if (typeof window.Raven !== 'undefined' && typeof window.Raven.setUserContext === 'function') {
        log('[jwt.js] sent user context to Raven');
        Raven.setUserContext(userInfo);
    }
}

/**
 * When the token expires
 * @memberof module:jwt
 * @private
 */
function expiresIn(): number {
    try {
        return state.keycloak.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + state.keycloak.timeSkew;
    } catch (e) {
        return null;
    }
}

/**
 * Send current user context to Raven (JS error logging library).
 * @memberof module:jwt
 * @private
 */
function sendToSentry(error: Error, extra: Object) {
    // once the user info service has returned, use its data to add user
    // context to RavenJS, for inclusion in Sentry error reports.
    userInfo = getUserInfo();
    if (typeof window.Raven !== 'undefined' && typeof window.Raven.captureException === 'function') {
        Raven.setTagsContext({
            is_authenticated: isAuthenticated(),
            is_token_expired: state.keycloak.authenticated ? state.keycloak.isTokenExpired(0) : null,
            token_expires_in: expiresIn(),
            // TODO -- if ever upgrading keycloak to upstream see https://github.com/keycloak/keycloak/pull/5008 to ensure this error message stays inline
            state_changed: extra && (extra as Error).message && (extra as Error).message.toLowerCase().indexOf('Cookie sessionId and keycloak sessionId do not match') !== -1
        });
        Raven.captureException(error, {extra: extra});
    }
}

/**
  * Get the number of times in a row that token refresh has failed.
  * @return {Number} the number of times that token refresh has failed
  * @memberof module:jwt
  */
function getFailCount(): Promise<number> {
    try {
        return CacheUtils.get<INumberCache>(FAIL_COUNT_NAME).then((failCountCache) => {
            return failCountCache.value;
        }).catch((e) => {
            return 0;
        });
    } catch (e) {
        return Promise.resolve(0);
    }
}


/**
 * Return whether or not the consecutive failure count has been exceeded.
 * @memberof module:jwt
 * @return {Boolean} has the consecutive failure count been exceeded
 */
function failCountPassed(): Promise<boolean> {
    return getFailCount().then((count) => {
        return count > FAIL_COUNT_THRESHOLD;
    });
}

/**
 * Increment the number of times in a row that token refresh has failed.
 * @return {Number} the new, incremented number of times that token refresh has failed
 */
function incFailCount(): Promise<number> {
    return getFailCount().then((failCount) => {
        const newFailCount = failCount + 1;
        const newFailCountCache: INumberCache = {
            value: newFailCount
        };
        CacheUtils.set<INumberCache, number>(FAIL_COUNT_NAME, newFailCountCache);
        return newFailCount;
    });
}

/**
 * Reset the number of times in a row that token refresh has failed.
 */
function resetFailCount(): Promise<INumberCache> {
    const newFailCountCache: INumberCache = {
        value: 0
    };
    return CacheUtils.set<INumberCache, number>(FAIL_COUNT_NAME, newFailCountCache);
}

const Jwt = {
    login: initialized(login),
    logout: initialized(logout),
    register: initialized(register),
    hasRole: initialized(hasRole),
    isInternal: initialized(isInternal),
    isAuthenticated: initialized(isAuthenticated),
    getRegisterUrl: initialized(getRegisterUrl),
    getLoginUrl: initialized(getLoginUrl),
    getLogoutUrl: initialized(getLogoutUrl),
    getAccountUrl: initialized(getAccountUrl),
    getToken: initialized(getToken),
    getStoredTokenValue: initialized(getStoredTokenValue),
    getEncodedToken: initialized(getEncodedToken),
    getUserInfo: initialized(getUserInfo),
    updateToken: initialized(updateToken),
    cancelRefreshLoop: initialized(cancelRefreshLoop),
    startRefreshLoop: initialized(startRefreshLoop),
    isTokenExpired: initialized(isTokenExpired),
    onInit: onInit,
    onAuthRefreshError: onAuthRefreshError,
    onAuthRefreshSuccess: onAuthRefreshSuccess,
    onAuthLogout: onAuthLogout,
    onTokenExpired: onTokenExpired,
    onInitialUpdateToken: onInitialUpdateToken,
    onTokenMismatch: onTokenMismatch,
    onAuthError: onAuthError,
    enableDebugLogging: enableDebugLogging,
    disableDebugLogging: disableDebugLogging,
    isMaster: isMaster,
    init: init,
    _state: state,
    getFailCount: getFailCount,
    failCountPassed: failCountPassed,
    expiresIn: expiresIn
};

export default Jwt;