import Keycloak from './keycloak';
const jsUri = require('jsuri');

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
    getAuthorizationValue: function () {
        return (lib.getCookieValue('rh_user') !== '');
    },
    log: function (message) {
        if (typeof console !== 'undefined') {
            console.log(message);
        }
    },
    objectEach: function (object, func) {
        for (let prop in object) {
            if (object.hasOwnProperty(prop)) {
                func(prop, object[prop]);
            }
        }
    },
    arrayEach: function (array, func) {
        for (let i = 0, len = array.length; i < len; i = i + 1) {
            func(array[i], i);
        }
    },
    getEventTarget: function (e) {
        let trg = e.target || e.srcElement || {};
        if (trg.nodeType === 3) { // defeat Safari bug
            trg = trg.parentNode;
        }
        return trg;
    },
    getTextNodes: function (node, includeWhitespaceNodes) {
        /* thanks http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery#4399718 */
        const textNodes = [], whitespace = /^\s*$/;

        function getTextNodes(node) {
            if (node.nodeType === 3) {
                if (includeWhitespaceNodes || !whitespace.test(node.nodeValue)) {
                    textNodes.push(node.data);
                }
            } else {
                for (let i = 0, len = node.childNodes.length; i < len; i += 1) {
                    getTextNodes(node.childNodes[i]);
                }
            }
        }

        if (typeof node !== 'undefined') {
            getTextNodes(node);
        }
        return textNodes;
    },
    store: {
        local: private_functions.make_store('local'),
        session: private_functions.make_store('session')
    },
    /**
     * Get hash (aka anchor) string parameters as though they were querystring params.
     */
    getHashParam: function (name) {
        // create a jsuri object from the current url
        const url = new jsUri(location.href);
        // jsuri has no hashstring parsing functions, but if we set the
        // hashstring to the querystring, we can use the querystring
        // parsing functions :]
        return url.setQuery(url.anchor()).getQueryParamValue(name);
    }

};

const SSO_URL = ssoUrl();
const INTERNAL_ROLE = 'redhat:employees';
const COOKIE_NAME = 'rh_jwt';
const REFRESH_TOKEN_NAME = 'rh_refresh_token';
const REFRESH_INTERVAL = 1 * 60 * 1000; // ms. check token for upcoming expiration every this many milliseconds
const REFRESH_TTE = 90; // seconds. refresh only token if it would expire this many seconds from now

const KEYCLOAK_OPTIONS = {
    realm: 'redhat-external',
    clientId: 'unifiedui',
    url: SSO_URL,
};

const KEYCLOAK_INIT_OPTIONS = {
    responseMode: 'query', // was previously fragment and doesn't work with fragment.
    flow: 'standard',
    token: null,
    refreshToken: null
};

const origin = location.hostname;
// const originWithPort = location.hostname + (location.port ? ':' + location.port : '');

const token = lib.store.local.get(COOKIE_NAME) || lib.getCookieValue(COOKIE_NAME);
const refreshToken = lib.store.local.get(REFRESH_TOKEN_NAME);

if (token && token !== 'undefined') { KEYCLOAK_INIT_OPTIONS.token = token; }
if (refreshToken) { KEYCLOAK_INIT_OPTIONS.refreshToken = refreshToken; }

interface IState {
    initialized: boolean;
    keycloak: any;
}

const state: IState = {
    initialized: false,
    keycloak: null
};

const events = {
    init: [],
};

document.cookie = COOKIE_NAME + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.redhat.com; path=/';

/**
 * Log session-related messages to the console, in pre-prod environments.
 */
function log(message: string) {
    try {
        if (lib.store.local.get('session_log') === true) {
            console.log.apply(console, arguments);
        }
    } catch (e) { }
}

/**
 * Kicks off all the session-related things.
 *
 * @memberof module:session
 * @private
 */
function init(settings) {
    log('[session.js] initializing');
    state.keycloak = Keycloak(KEYCLOAK_OPTIONS);

    // wire up our handlers to keycloak's events
    state.keycloak.onAuthSuccess = onAuthSuccess;
    state.keycloak.onAuthError = onAuthError;
    state.keycloak.onAuthRefreshSuccess = onAuthRefreshSuccess;
    state.keycloak.onAuthRefreshError = onAuthRefreshError;
    state.keycloak.onAuthLogout = onAuthLogout;
    state.keycloak.onTokenExpired = onTokenExpired;

    state.keycloak
        .init(KEYCLOAK_INIT_OPTIONS)
        .success(keycloakInitSuccess)
        .error(keycloakInitError);
}

/**
 * Keycloak init success handler.
 * @memberof module:session
 * @param {Boolean} authenticated whether the user is authenticated or not
 * @private
 */
function keycloakInitSuccess(authenticated) {
    log('[session.js] initialized (authenticated: ' + authenticated + ')');
    if (authenticated) {
        setToken(state.keycloak.token);
        setRefreshToken(state.keycloak.refreshToken);
        startRefreshLoop();
    }

    keycloakInitHandler();
}

/**
 * Call any init event handlers that have are registered.
 *
 * @memberof module:session
 * @private
 */
function handleInitEvents() {
    while (events.init.length) {
        const event = events.init.shift();
        if (typeof event === 'function') {
            log('[session.js] running an init handler');
            event(Jwt);
        }
    }
}

/**
 * Register a function to be called when session.js has initialized.  Runs
 * immediately if already initialized.  When called, the function will be
 * passed a reference to the session.js API.
 *
 * @memberof module:session
 */
function onInit(func) {
    log('[session.js] registering init handler');
    if (state.initialized) {
        func(Jwt);
    }
    else {
        events.init.push(func);
    }
}


/**
 * Keycloak init error handler.
 * @memberof module:session
 * @private
 */
function keycloakInitError() {
    log('[session.js] init error');

    keycloakInitHandler();

    removeToken();
}

/**
 * Does some things after keycloak initializes, whether or not
 * initialization was successful.
 *
 * @memberof module:session
 * @private
 */
function keycloakInitHandler() {
    state.initialized = true;
    handleInitEvents();
}

/**
 * Creates a URL to the SSO service based on an old IDP URL.
 *
 * @memberof module:session
 * @returns {String} a URL to the SSO service
 * @private
 */
function ssoUrl() {
    switch (location.hostname) {
        // Valid PROD URLs
        case 'access.redhat.com':
        case 'prod.foo.redhat.com':
        case 'rhn.redhat.com':
        case 'hardware.redhat.com':
        case 'unified.gsslab.rdu2.redhat.com':
            log('[session.js] ENV: prod');
            return 'https://sso.redhat.com/auth';

        // Valid STAGE URLs
        case 'access.stage.redhat.com':
        case 'accessstage.usersys.redhat.com':
        case 'stage.foo.redhat.com':
            log('[session.js] ENV: stage');
            return 'https://sso.stage.redhat.com/auth';

        // Valid QA URLs
        case 'access.qa.redhat.com':
        case 'qa.foo.redhat.com':
        case 'accessqa.usersys.redhat.com':
        case 'unified-qa.gsslab.pnq2.redhat.com':
            log('[session.js] ENV: qa');
            return 'https://sso.qa.redhat.com/auth';

        case 'ui.foo.redhat.com':
            log('[session.js] ENV: qa / dev');
            return 'https://sso.dev1.redhat.com/auth';

        // Valid CI URLs
        case 'access.devgssci.devlab.phx1.redhat.com':
        case 'accessci.usersys.redhat.com':
        case 'ci.foo.redhat.com':
        default:
                log('[session.js] ENV: ci');
                return 'https://sso.dev2.redhat.com/auth';
        }
}

/**
 * A handler for when authentication is successfully established.
 *
 * @memberof module:session
 * @private
 */
function onAuthSuccess() {
    log('[session.js] onAuthSuccess');
}

function onAuthError() {
    removeToken();
    log('[session.js] onAuthError');
}

function onAuthRefreshSuccess() {
    log('[session.js] onAuthRefreshSuccess');
}
function onAuthRefreshError() { log('[session.js] onAuthRefreshError'); }
function onAuthLogout() { log('[session.js] onAuthLogout'); }
function onTokenExpired() { log('[session.js] onTokenExpired'); }

/**
 * Refreshes the access token.
 *
 * @memberof module:session
 * @private
 */
function updateToken() {
    log('[session.js] running updateToken');
    return state.keycloak
        .updateToken(REFRESH_TTE)
        .success(updateTokenSuccess)
        .error(updateTokenFailure);
}

/**
 * Start the {@link module:session.refreshLoop refreshLoop}, which
 * periodically updates the authentication token.
 *
 * @memberof module:session
 * @private
 */
function startRefreshLoop() {
    refreshLoop();
    setInterval(refreshLoop, REFRESH_INTERVAL);
}

/**
 * This is run periodically by {@link module:session.startRefreshLoop
 * startRefreshLoop}.
 *
 * @memberof module:session
 * @private
 */
function refreshLoop() {
    updateToken();
}

/**
 * Handler run when a token is successfully updated.
 *
 * @memberof module:session
 * @private
 */
function updateTokenSuccess(refreshed) {
    log('[session.js] updateTokenSuccess, token was ' + ['not ', ''][~~refreshed] + 'refreshed');
    setToken(state.keycloak.token);
    setRefreshToken(state.keycloak.refreshToken);
    // setRavenUserContext();
}

/**
 * Handler run when a token update fails.
 *
 * @memberof module:session
 * @private
 */
function updateTokenFailure(load_failure) {
    log('[session.js] updateTokenFailure');
}

/**
 * Save the refresh token value in a semi-persistent place (sessionStorage).
 *
 * @memberof module:session
 * @private
 */
function setRefreshToken(refresh_token) {
    lib.store.local.set(REFRESH_TOKEN_NAME, refresh_token);
}

/**
 * Remove the token value from its a semi-persistent place.
 *
 * @memberof module:session
 * @private
 */
function removeRefreshToken() {
    lib.store.local.remove(REFRESH_TOKEN_NAME);
}

/**
 * Save the token value in a semi-persistent place (cookie).
 *
 * @memberof module:session
 * @private
 */
function setToken(token) {
    // make sure token is defined
    if (token) {
        // save the token in localStorage AND in a cookie.  the cookie
        // exists so it'll be sent along with AJAX requests.  the
        // localStorage value exists so the token can be refreshed even if
        // it's been expired for a long time.
        lib.store.local.set(COOKIE_NAME, token);
        document.cookie = COOKIE_NAME + '=' + token + ';path=/;max-age=' + 5 * 60 + ';domain=.' + origin + ';';
    }
}

/**
 * Remove the token value from its a semi-persistent place.
 *
 * @memberof module:session
 * @private
 */
function removeToken() {
    lib.store.local.remove(COOKIE_NAME);
    document.cookie = COOKIE_NAME + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.' + origin + '; path=/';
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
 * @memberof module:session
 * @return {Object} the parsed JSON Web Token
 */
function getToken() {
    return state.keycloak.tokenParsed;
}

/**
 * Get the user info from the JSON Web Token.  Contains user information
 * similar to what the old userStatus REST service returned.
 *
 * @memberof module:session
 * @return {Object} the user information
 */
function getUserInfo() {
    // the properties to return
    const token = getToken();
    let user = {};
    if (token) {
        user = {
            user_id: token.user_id,
            username: token.username,
            account_id: token.account_id,
            account_number: token.account_number,
            email: token.email,
            firstName: token.firstName,
            lastName: token.lastName,
            lang: token.lang,
            region: token.region,
            login: token.username,
            internal: isInternal(),
        };
    }
    return user;
}

/**
 * Is the user authenticated?
 *
 * @memberof module:session
 * @returns {Boolean} true if the user is authenticated, false otherwise
 */
function isAuthenticated() {
    return state.keycloak.authenticated;
}

/**
 * Is the user is a Red Hat employee?
 *
 * @memberof module:session
 * @returns {Boolean} true if the user is a Red Hat employee, otherwise false
 */
function isInternal() {
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
 * @memberof module:session
 */
function hasRole() {
    for (let i = 0; i < arguments.length; ++i) {
        if (!state.keycloak.hasRealmRole(arguments[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Get the URL to the registration page.
 * @return {String} the URL to the registration page
 * @memberof module:session
 */
function getRegisterUrl() {
    return state.keycloak.createRegisterUrl();
}

/**
 * Get the URL to the login page.
 * @return {String} the URL to the login page
 * @memberof module:session
 */
function getLoginUrl(optionsIn) {
    const options = optionsIn || {};

    const redirectUri = options.redirectUri || location.href;
    options.redirectUri = redirectUri;
    return state.keycloak.createLoginUrl(options);
}

/**
 * Get the URL to the logout page.
 * @return {String} the URL to the logout page
 * @memberof module:session
 */
function getLogoutUrl() {
    return state.keycloak.createLogoutUrl();
}

/**
 * Get the URL to the account management page.
 * @return {String} the URL to the account management page
 * @memberof module:session
 */
function getAccountUrl() {
    return state.keycloak.createAccountUrl();
}

/**
 * "Decorator" enforcing that session.js be initialized before the wrapped
 * function will be run.
 *
 * @memberof module:session
 * @private
 * @param {Function} func a function which shouldn't be run before session.js is
 * initialized.
 * @return {Function}
 */
function initialized(func) {
    return function () {
        if (state.initialized) {
            return func.apply({}, arguments);
        }
        else {
            console.warn('[session.js] couldn\'t call function, session not initialized');
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
 * @memberof module:session
 * @param {Object} options See [options](https://keycloak.gitbooks.io/securing-client-applications-guide/content/v/2.2/topics/oidc/javascript-adapter.html#_login_options) for valid options.
 */
function login(optionsIn) {
    const options = optionsIn || {};

    const redirectUri = options.redirectUri || location.href;
    options.redirectUri = redirectUri;
    state.keycloak.login(options);
}

/**
 * Navigate to the logout page, end session, then navigate back.
 * @memberof module:session
 */
function logout(options) {
    removeToken();
    removeRefreshToken();
    state.keycloak.logout(options);
}

/**
 * Navigate to the account registration page.
 * @memberof module:session
 */
function register(options) {
    state.keycloak.register(options);
}

// /**
//  * Send current user context to Raven (JS error logging library).
//  * @memberof module:session
//  * @private
//  */
// function setRavenUserContext() {
//     // once the user info service has returned, use its data to add user
//     // context to RavenJS, for inclusion in Sentry error reports.
//     var data = getUserInfo();
//     if (typeof window.Raven !== 'undefined' && typeof window.Raven.setUserContext === 'function') {
//         log('[session.js] sent user context to Raven');
//         Raven.setUserContext({
//             account_id: data.account_id,
//             account_number: data.account_number,
//             email: data.email,
//             internal: data.internal,
//             lang: data.lang,
//             login: data.login,
//             name: data.name,
//             id: data.user_id
//         });
//     }
// }

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
    getUserInfo: initialized(getUserInfo),
    updateToken: initialized(updateToken),
    onInit: onInit,
    init: init,
    _state: state,
};

export default Jwt;