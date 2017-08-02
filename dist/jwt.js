(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["jwt"] = factory();
	else
		root["jwt"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var jwt_1 = __webpack_require__(4);
	exports.default = jwt_1.default;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jsUri
	 * https://github.com/derek-watson/jsUri
	 *
	 * Copyright 2013, Derek Watson
	 * Released under the MIT license.
	 *
	 * Includes parseUri regular expressions
	 * http://blog.stevenlevithan.com/archives/parseuri
	 * Copyright 2007, Steven Levithan
	 * Released under the MIT license.
	 */

	 /*globals define, module */

	(function(global) {

	  var re = {
	    starts_with_slashes: /^\/+/,
	    ends_with_slashes: /\/+$/,
	    pluses: /\+/g,
	    query_separator: /[&;]/,
	    uri_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*)(?::([^:@]*))?)?@)?(\[[0-9a-fA-F:.]+\]|[^:\/?#]*)(?::(\d+|(?=:)))?(:)?)((((?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	  };

	  /**
	   * Define forEach for older js environments
	   * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach#Compatibility
	   */
	  if (!Array.prototype.forEach) {
	    Array.prototype.forEach = function(callback, thisArg) {
	      var T, k;

	      if (this == null) {
	        throw new TypeError(' this is null or not defined');
	      }

	      var O = Object(this);
	      var len = O.length >>> 0;

	      if (typeof callback !== "function") {
	        throw new TypeError(callback + ' is not a function');
	      }

	      if (arguments.length > 1) {
	        T = thisArg;
	      }

	      k = 0;

	      while (k < len) {
	        var kValue;
	        if (k in O) {
	          kValue = O[k];
	          callback.call(T, kValue, k, O);
	        }
	        k++;
	      }
	    };
	  }

	  /**
	   * unescape a query param value
	   * @param  {string} s encoded value
	   * @return {string}   decoded value
	   */
	  function decode(s) {
	    if (s) {
	        s = s.toString().replace(re.pluses, '%20');
	        s = decodeURIComponent(s);
	    }
	    return s;
	  }

	  /**
	   * Breaks a uri string down into its individual parts
	   * @param  {string} str uri
	   * @return {object}     parts
	   */
	  function parseUri(str) {
	    var parser = re.uri_parser;
	    var parserKeys = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "isColonUri", "relative", "path", "directory", "file", "query", "anchor"];
	    var m = parser.exec(str || '');
	    var parts = {};

	    parserKeys.forEach(function(key, i) {
	      parts[key] = m[i] || '';
	    });

	    return parts;
	  }

	  /**
	   * Breaks a query string down into an array of key/value pairs
	   * @param  {string} str query
	   * @return {array}      array of arrays (key/value pairs)
	   */
	  function parseQuery(str) {
	    var i, ps, p, n, k, v, l;
	    var pairs = [];

	    if (typeof(str) === 'undefined' || str === null || str === '') {
	      return pairs;
	    }

	    if (str.indexOf('?') === 0) {
	      str = str.substring(1);
	    }

	    ps = str.toString().split(re.query_separator);

	    for (i = 0, l = ps.length; i < l; i++) {
	      p = ps[i];
	      n = p.indexOf('=');

	      if (n !== 0) {
	        k = decode(p.substring(0, n));
	        v = decode(p.substring(n + 1));
	        pairs.push(n === -1 ? [p, null] : [k, v]);
	      }

	    }
	    return pairs;
	  }

	  /**
	   * Creates a new Uri object
	   * @constructor
	   * @param {string} str
	   */
	  function Uri(str) {
	    this.uriParts = parseUri(str);
	    this.queryPairs = parseQuery(this.uriParts.query);
	    this.hasAuthorityPrefixUserPref = null;
	  }

	  /**
	   * Define getter/setter methods
	   */
	  ['protocol', 'userInfo', 'host', 'port', 'path', 'anchor'].forEach(function(key) {
	    Uri.prototype[key] = function(val) {
	      if (typeof val !== 'undefined') {
	        this.uriParts[key] = val;
	      }
	      return this.uriParts[key];
	    };
	  });

	  /**
	   * if there is no protocol, the leading // can be enabled or disabled
	   * @param  {Boolean}  val
	   * @return {Boolean}
	   */
	  Uri.prototype.hasAuthorityPrefix = function(val) {
	    if (typeof val !== 'undefined') {
	      this.hasAuthorityPrefixUserPref = val;
	    }

	    if (this.hasAuthorityPrefixUserPref === null) {
	      return (this.uriParts.source.indexOf('//') !== -1);
	    } else {
	      return this.hasAuthorityPrefixUserPref;
	    }
	  };

	  Uri.prototype.isColonUri = function (val) {
	    if (typeof val !== 'undefined') {
	      this.uriParts.isColonUri = !!val;
	    } else {
	      return !!this.uriParts.isColonUri;
	    }
	  };

	  /**
	   * Serializes the internal state of the query pairs
	   * @param  {string} [val]   set a new query string
	   * @return {string}         query string
	   */
	  Uri.prototype.query = function(val) {
	    var s = '', i, param, l;

	    if (typeof val !== 'undefined') {
	      this.queryPairs = parseQuery(val);
	    }

	    for (i = 0, l = this.queryPairs.length; i < l; i++) {
	      param = this.queryPairs[i];
	      if (s.length > 0) {
	        s += '&';
	      }
	      if (param[1] === null) {
	        s += param[0];
	      } else {
	        s += param[0];
	        s += '=';
	        if (typeof param[1] !== 'undefined') {
	          s += encodeURIComponent(param[1]);
	        }
	      }
	    }
	    return s.length > 0 ? '?' + s : s;
	  };

	  /**
	   * returns the first query param value found for the key
	   * @param  {string} key query key
	   * @return {string}     first value found for key
	   */
	  Uri.prototype.getQueryParamValue = function (key) {
	    var param, i, l;
	    for (i = 0, l = this.queryPairs.length; i < l; i++) {
	      param = this.queryPairs[i];
	      if (key === param[0]) {
	        return param[1];
	      }
	    }
	  };

	  /**
	   * returns an array of query param values for the key
	   * @param  {string} key query key
	   * @return {array}      array of values
	   */
	  Uri.prototype.getQueryParamValues = function (key) {
	    var arr = [], i, param, l;
	    for (i = 0, l = this.queryPairs.length; i < l; i++) {
	      param = this.queryPairs[i];
	      if (key === param[0]) {
	        arr.push(param[1]);
	      }
	    }
	    return arr;
	  };

	  /**
	   * removes query parameters
	   * @param  {string} key     remove values for key
	   * @param  {val}    [val]   remove a specific value, otherwise removes all
	   * @return {Uri}            returns self for fluent chaining
	   */
	  Uri.prototype.deleteQueryParam = function (key, val) {
	    var arr = [], i, param, keyMatchesFilter, valMatchesFilter, l;

	    for (i = 0, l = this.queryPairs.length; i < l; i++) {

	      param = this.queryPairs[i];
	      keyMatchesFilter = decode(param[0]) === decode(key);
	      valMatchesFilter = param[1] === val;

	      if ((arguments.length === 1 && !keyMatchesFilter) || (arguments.length === 2 && (!keyMatchesFilter || !valMatchesFilter))) {
	        arr.push(param);
	      }
	    }

	    this.queryPairs = arr;

	    return this;
	  };

	  /**
	   * adds a query parameter
	   * @param  {string}  key        add values for key
	   * @param  {string}  val        value to add
	   * @param  {integer} [index]    specific index to add the value at
	   * @return {Uri}                returns self for fluent chaining
	   */
	  Uri.prototype.addQueryParam = function (key, val, index) {
	    if (arguments.length === 3 && index !== -1) {
	      index = Math.min(index, this.queryPairs.length);
	      this.queryPairs.splice(index, 0, [key, val]);
	    } else if (arguments.length > 0) {
	      this.queryPairs.push([key, val]);
	    }
	    return this;
	  };

	  /**
	   * test for the existence of a query parameter
	   * @param  {string}  key        add values for key
	   * @param  {string}  val        value to add
	   * @param  {integer} [index]    specific index to add the value at
	   * @return {Uri}                returns self for fluent chaining
	   */
	  Uri.prototype.hasQueryParam = function (key) {
	    var i, len = this.queryPairs.length;
	    for (i = 0; i < len; i++) {
	      if (this.queryPairs[i][0] == key)
	        return true;
	    }
	    return false;
	  };

	  /**
	   * replaces query param values
	   * @param  {string} key         key to replace value for
	   * @param  {string} newVal      new value
	   * @param  {string} [oldVal]    replace only one specific value (otherwise replaces all)
	   * @return {Uri}                returns self for fluent chaining
	   */
	  Uri.prototype.replaceQueryParam = function (key, newVal, oldVal) {
	    var index = -1, len = this.queryPairs.length, i, param;

	    if (arguments.length === 3) {
	      for (i = 0; i < len; i++) {
	        param = this.queryPairs[i];
	        if (decode(param[0]) === decode(key) && decodeURIComponent(param[1]) === decode(oldVal)) {
	          index = i;
	          break;
	        }
	      }
	      if (index >= 0) {
	        this.deleteQueryParam(key, decode(oldVal)).addQueryParam(key, newVal, index);
	      }
	    } else {
	      for (i = 0; i < len; i++) {
	        param = this.queryPairs[i];
	        if (decode(param[0]) === decode(key)) {
	          index = i;
	          break;
	        }
	      }
	      this.deleteQueryParam(key);
	      this.addQueryParam(key, newVal, index);
	    }
	    return this;
	  };

	  /**
	   * Define fluent setter methods (setProtocol, setHasAuthorityPrefix, etc)
	   */
	  ['protocol', 'hasAuthorityPrefix', 'isColonUri', 'userInfo', 'host', 'port', 'path', 'query', 'anchor'].forEach(function(key) {
	    var method = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
	    Uri.prototype[method] = function(val) {
	      this[key](val);
	      return this;
	    };
	  });

	  /**
	   * Scheme name, colon and doubleslash, as required
	   * @return {string} http:// or possibly just //
	   */
	  Uri.prototype.scheme = function() {
	    var s = '';

	    if (this.protocol()) {
	      s += this.protocol();
	      if (this.protocol().indexOf(':') !== this.protocol().length - 1) {
	        s += ':';
	      }
	      s += '//';
	    } else {
	      if (this.hasAuthorityPrefix() && this.host()) {
	        s += '//';
	      }
	    }

	    return s;
	  };

	  /**
	   * Same as Mozilla nsIURI.prePath
	   * @return {string} scheme://user:password@host:port
	   * @see  https://developer.mozilla.org/en/nsIURI
	   */
	  Uri.prototype.origin = function() {
	    var s = this.scheme();

	    if (this.userInfo() && this.host()) {
	      s += this.userInfo();
	      if (this.userInfo().indexOf('@') !== this.userInfo().length - 1) {
	        s += '@';
	      }
	    }

	    if (this.host()) {
	      s += this.host();
	      if (this.port() || (this.path() && this.path().substr(0, 1).match(/[0-9]/))) {
	        s += ':' + this.port();
	      }
	    }

	    return s;
	  };

	  /**
	   * Adds a trailing slash to the path
	   */
	  Uri.prototype.addTrailingSlash = function() {
	    var path = this.path() || '';

	    if (path.substr(-1) !== '/') {
	      this.path(path + '/');
	    }

	    return this;
	  };

	  /**
	   * Serializes the internal state of the Uri object
	   * @return {string}
	   */
	  Uri.prototype.toString = function() {
	    var path, s = this.origin();

	    if (this.isColonUri()) {
	      if (this.path()) {
	        s += ':'+this.path();
	      }
	    } else if (this.path()) {
	      path = this.path();
	      if (!(re.ends_with_slashes.test(s) || re.starts_with_slashes.test(path))) {
	        s += '/';
	      } else {
	        if (s) {
	          s.replace(re.ends_with_slashes, '/');
	        }
	        path = path.replace(re.starts_with_slashes, '/');
	      }
	      s += path;
	    } else {
	      if (this.host() && (this.query().toString() || this.anchor())) {
	        s += '/';
	      }
	    }
	    if (this.query().toString()) {
	      s += this.query().toString();
	    }

	    if (this.anchor()) {
	      if (this.anchor().indexOf('#') !== 0) {
	        s += '#';
	      }
	      s += this.anchor();
	    }

	    return s;
	  };

	  /**
	   * Clone a Uri object
	   * @return {Uri} duplicate copy of the Uri
	   */
	  Uri.prototype.clone = function() {
	    return new Uri(this.toString());
	  };

	  /**
	   * export via AMD or CommonJS, otherwise leak a global
	   */
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return Uri;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	    module.exports = Uri;
	  } else {
	    global.Uri = Uri;
	  }
	}(this));


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var CallbackParser = (function () {
	    function CallbackParser(uriToParse, responseMode) {
	        this.uriToParse = uriToParse;
	        this.responseMode = responseMode;
	    }
	    CallbackParser.prototype.initialParse = function () {
	        var baseUri = null;
	        var queryString = null;
	        var fragmentString = null;
	        var questionMarkIndex = this.uriToParse.indexOf('?');
	        var fragmentIndex = this.uriToParse.indexOf('#', questionMarkIndex + 1);
	        if (questionMarkIndex === -1 && fragmentIndex === -1) {
	            baseUri = this.uriToParse;
	        }
	        else if (questionMarkIndex !== -1) {
	            baseUri = this.uriToParse.substring(0, questionMarkIndex);
	            queryString = this.uriToParse.substring(questionMarkIndex + 1);
	            if (fragmentIndex !== -1) {
	                fragmentIndex = queryString.indexOf('#');
	                fragmentString = queryString.substring(fragmentIndex + 1);
	                queryString = queryString.substring(0, fragmentIndex);
	            }
	        }
	        else {
	            baseUri = this.uriToParse.substring(0, fragmentIndex);
	            fragmentString = this.uriToParse.substring(fragmentIndex + 1);
	        }
	        return { baseUri: baseUri, queryString: queryString, fragmentString: fragmentString };
	    };
	    CallbackParser.prototype.parseParams = function (paramString) {
	        var result = {};
	        var params = paramString.split('&');
	        for (var i = 0; i < params.length; i++) {
	            var p = params[i].split('=');
	            var paramName = decodeURIComponent(p[0]);
	            var paramValue = decodeURIComponent(p[1]);
	            result[paramName] = paramValue;
	        }
	        return result;
	    };
	    CallbackParser.prototype.handleQueryParam = function (paramName, paramValue, oauth) {
	        var supportedOAuthParams = ['code', 'state', 'error', 'error_description'];
	        for (var i = 0; i < supportedOAuthParams.length; i++) {
	            if (paramName === supportedOAuthParams[i]) {
	                oauth[paramName] = paramValue;
	                return true;
	            }
	        }
	        return false;
	    };
	    CallbackParser.prototype.parseUri = function () {
	        var parsedUri = this.initialParse();
	        var queryParams = {};
	        if (parsedUri.queryString) {
	            queryParams = this.parseParams(parsedUri.queryString);
	        }
	        var oauth = {
	            newUrl: parsedUri.baseUri,
	        };
	        for (var param in queryParams) {
	            switch (param) {
	                case 'redirect_fragment':
	                    oauth.fragment = queryParams[param];
	                    break;
	                case 'prompt':
	                    oauth.prompt = queryParams[param];
	                    break;
	                default:
	                    if (this.responseMode !== 'query' || !this.handleQueryParam(param, queryParams[param], oauth)) {
	                        oauth.newUrl += (oauth.newUrl.indexOf('?') === -1 ? '?' : '&') + param + '=' + queryParams[param];
	                    }
	                    break;
	            }
	        }
	        if (this.responseMode === 'fragment') {
	            var fragmentParams = {};
	            if (parsedUri.fragmentString) {
	                fragmentParams = this.parseParams(parsedUri.fragmentString);
	            }
	            for (var param in fragmentParams) {
	                oauth[param] = fragmentParams[param];
	            }
	        }
	        return oauth;
	    };
	    return CallbackParser;
	}());
	exports.default = CallbackParser;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var CookieStorage = (function () {
	    function CookieStorage() {
	    }
	    CookieStorage.prototype.get = function (state) {
	        if (!state) {
	            return;
	        }
	        var value = this.getCookie('kc-callback-' + state);
	        this.setCookie('kc-callback-' + state, '', this.cookieExpiration(-100));
	        if (value) {
	            return JSON.parse(value);
	        }
	    };
	    CookieStorage.prototype.add = function (state) {
	        this.setCookie('kc-callback-' + state.state, JSON.stringify(state), this.cookieExpiration(60));
	    };
	    CookieStorage.prototype.removeItem = function (key) {
	        this.setCookie(key, '', this.cookieExpiration(-100));
	    };
	    CookieStorage.prototype.cookieExpiration = function (minutes) {
	        var exp = new Date();
	        exp.setTime(exp.getTime() + (minutes * 60 * 1000));
	        return exp;
	    };
	    CookieStorage.prototype.getCookie = function (key) {
	        var name = key + '=';
	        var ca = document.cookie.split(';');
	        for (var i = 0; i < ca.length; i++) {
	            var c = ca[i];
	            while (c.charAt(0) === ' ') {
	                c = c.substring(1);
	            }
	            if (c.indexOf(name) === 0) {
	                return c.substring(name.length, c.length);
	            }
	        }
	        return '';
	    };
	    CookieStorage.prototype.setCookie = function (key, value, expirationDate) {
	        var cookie = key + '=' + value + '; '
	            + 'expires=' + expirationDate.toUTCString() + '; ';
	        document.cookie = cookie;
	    };
	    return CookieStorage;
	}());
	exports.default = CookieStorage;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var keycloak_1 = __webpack_require__(5);
	var jsUri = __webpack_require__(1);
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
	var private_functions = {
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
	        var store;
	        try {
	            // if DOM Storage is disabled in Chrome, merely referencing
	            // window.localStorage or window.sessionStorage will throw a
	            // DOMException.
	            store = window[type + 'Storage'];
	            // if DOM Storage is disabled in other browsers, it may not
	            // throw an error, but we should still throw one for them.
	            if (!store)
	                throw new Error('DOM Storage is disabled');
	        }
	        catch (e) {
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
	                var value = store.getItem(key);
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
	var lib = {
	    /**
	     * A simple function to get the value of a given cookie
	     * @param {string} cookieName The cookie name/key
	     * @returns {string} The string value of the cookie, "" if there was no cookie
	     */
	    getCookieValue: function (cookieName) {
	        var start, end;
	        if (document.cookie.length > 0) {
	            start = document.cookie.indexOf(cookieName + '=');
	            if (start !== -1 && (start === 0 || (document.cookie.charAt(start - 1) === ' '))) {
	                start += cookieName.length + 1;
	                end = document.cookie.indexOf(';', start);
	                if (end === -1) {
	                    end = document.cookie.length;
	                }
	                return decodeURI(document.cookie.substring(start, end));
	            }
	        }
	        return '';
	    },
	    setCookie: function (name, value, expires, path, domain, secure) {
	        // set time, it's in milliseconds
	        var today = new Date();
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
	        var expires_date = new Date(today.getTime() + (expires));
	        document.cookie = name + '=' + encodeURI(value) +
	            ((expires) ? ';expires=' + expires_date.toUTCString() : '') +
	            ((path) ? ';path=' + path : '') +
	            ((domain) ? ';domain=' + domain : '') +
	            ((secure) ? ';secure' : '');
	    },
	    removeCookie: function removeCookie(cookie_name) {
	        var cookie_date = new Date(); // current date & time
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
	        for (var prop in object) {
	            if (object.hasOwnProperty(prop)) {
	                func(prop, object[prop]);
	            }
	        }
	    },
	    arrayEach: function (array, func) {
	        for (var i = 0, len = array.length; i < len; i = i + 1) {
	            func(array[i], i);
	        }
	    },
	    getEventTarget: function (e) {
	        var trg = e.target || e.srcElement || {};
	        if (trg.nodeType === 3) {
	            trg = trg.parentNode;
	        }
	        return trg;
	    },
	    getTextNodes: function (node, includeWhitespaceNodes) {
	        /* thanks http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery#4399718 */
	        var textNodes = [], whitespace = /^\s*$/;
	        function getTextNodes(node) {
	            if (node.nodeType === 3) {
	                if (includeWhitespaceNodes || !whitespace.test(node.nodeValue)) {
	                    textNodes.push(node.data);
	                }
	            }
	            else {
	                for (var i = 0, len = node.childNodes.length; i < len; i += 1) {
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
	        var url = new jsUri(location.href);
	        // jsuri has no hashstring parsing functions, but if we set the
	        // hashstring to the querystring, we can use the querystring
	        // parsing functions :]
	        return url.setQuery(url.anchor()).getQueryParamValue(name);
	    }
	};
	var SSO_URL = ssoUrl();
	var INTERNAL_ROLE = 'redhat:employees';
	var COOKIE_NAME = 'rh_jwt';
	var REFRESH_TOKEN_NAME = 'rh_refresh_token';
	var REFRESH_INTERVAL = 1 * 60 * 1000; // ms. check token for upcoming expiration every this many milliseconds
	var REFRESH_TTE = 90; // seconds. refresh only token if it would expire this many seconds from now
	var KEYCLOAK_OPTIONS = {
	    realm: 'redhat-external',
	    clientId: 'unifiedui',
	    url: SSO_URL,
	};
	var KEYCLOAK_INIT_OPTIONS = {
	    responseMode: 'query',
	    flow: 'standard',
	    token: null,
	    refreshToken: null
	};
	var origin = location.hostname;
	// const originWithPort = location.hostname + (location.port ? ':' + location.port : '');
	var token = lib.store.local.get(COOKIE_NAME) || lib.getCookieValue(COOKIE_NAME);
	var refreshToken = lib.store.local.get(REFRESH_TOKEN_NAME);
	if (token && token !== 'undefined') {
	    KEYCLOAK_INIT_OPTIONS.token = token;
	}
	if (refreshToken) {
	    KEYCLOAK_INIT_OPTIONS.refreshToken = refreshToken;
	}
	var state = {
	    initialized: false,
	    keycloak: null
	};
	var events = {
	    init: [],
	};
	document.cookie = COOKIE_NAME + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.redhat.com; path=/';
	/**
	 * Log session-related messages to the console, in pre-prod environments.
	 */
	function log(message) {
	    try {
	        if (lib.store.local.get('session_log') === true) {
	            console.log.apply(console, arguments);
	        }
	    }
	    catch (e) { }
	}
	/**
	 * Kicks off all the session-related things.
	 *
	 * @memberof module:session
	 * @private
	 */
	function init(keycloakOptions, keycloakInitOptions) {
	    log('[jwt.js] initializing');
	    state.keycloak = new keycloak_1.default(keycloakOptions ? Object.assign({}, KEYCLOAK_OPTIONS, keycloakOptions) : KEYCLOAK_OPTIONS);
	    // wire up our handlers to keycloak's events
	    state.keycloak.onAuthSuccess = onAuthSuccess;
	    state.keycloak.onAuthError = onAuthError;
	    state.keycloak.onAuthRefreshSuccess = onAuthRefreshSuccess;
	    state.keycloak.onAuthRefreshError = onAuthRefreshError;
	    state.keycloak.onAuthLogout = onAuthLogout;
	    state.keycloak.onTokenExpired = onTokenExpired;
	    state.keycloak
	        .init(keycloakInitOptions ? Object.assign({}, KEYCLOAK_INIT_OPTIONS, keycloakInitOptions) : KEYCLOAK_INIT_OPTIONS)
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
	    log('[jwt.js] initialized (authenticated: ' + authenticated + ')');
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
	        var event_1 = events.init.shift();
	        if (typeof event_1 === 'function') {
	            log('[jwt.js] running an init handler');
	            event_1(Jwt);
	        }
	    }
	}
	/**
	 * Register a function to be called when jwt.js has initialized.  Runs
	 * immediately if already initialized.  When called, the function will be
	 * passed a reference to the jwt.js API.
	 *
	 * @memberof module:session
	 */
	function onInit(func) {
	    log('[jwt.js] registering init handler');
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
	    log('[jwt.js] init error');
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
	            log('[jwt.js] ENV: prod');
	            return 'https://sso.redhat.com/auth';
	        // Valid STAGE URLs
	        case 'access.stage.redhat.com':
	        case 'accessstage.usersys.redhat.com':
	        case 'stage.foo.redhat.com':
	            log('[jwt.js] ENV: stage');
	            return 'https://sso.stage.redhat.com/auth';
	        // Valid QA URLs
	        case 'access.qa.redhat.com':
	        case 'qa.foo.redhat.com':
	        case 'accessqa.usersys.redhat.com':
	        case 'unified-qa.gsslab.pnq2.redhat.com':
	            log('[jwt.js] ENV: qa');
	            return 'https://sso.qa.redhat.com/auth';
	        case 'ui.foo.redhat.com':
	            log('[jwt.js] ENV: qa / dev');
	            return 'https://sso.dev1.redhat.com/auth';
	        // Valid CI URLs
	        case 'access.devgssci.devlab.phx1.redhat.com':
	        case 'accessci.usersys.redhat.com':
	        case 'ci.foo.redhat.com':
	        default:
	            log('[jwt.js] ENV: ci');
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
	    log('[jwt.js] onAuthSuccess');
	}
	function onAuthError() {
	    removeToken();
	    log('[jwt.js] onAuthError');
	}
	function onAuthRefreshSuccess() {
	    log('[jwt.js] onAuthRefreshSuccess');
	}
	function onAuthRefreshError() { log('[jwt.js] onAuthRefreshError'); }
	function onAuthLogout() { log('[jwt.js] onAuthLogout'); }
	function onTokenExpired() { log('[jwt.js] onTokenExpired'); }
	/**
	 * Refreshes the access token.
	 *
	 * @memberof module:session
	 * @private
	 */
	function updateToken() {
	    log('[jwt.js] running updateToken');
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
	    log('[jwt.js] updateTokenSuccess, token was ' + ['not ', ''][~~refreshed] + 'refreshed');
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
	    log('[jwt.js] updateTokenFailure');
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
	    var token = getToken();
	    return token ? {
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
	        internal: isInternal()
	    } : null;
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
	    var roles = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        roles[_i] = arguments[_i];
	    }
	    if (!roles)
	        return false;
	    for (var i = 0; i < roles.length; ++i) {
	        if (!state.keycloak.hasRealmRole(roles[i])) {
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
	function getLoginUrl(options) {
	    if (options === void 0) { options = {}; }
	    var redirectUri = options.redirectUri || location.href;
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
	 * "Decorator" enforcing that jwt.js be initialized before the wrapped
	 * function will be run.
	 *
	 * @memberof module:session
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
	 * @memberof module:session
	 * @param {Object} options See [options](https://keycloak.gitbooks.io/securing-client-applications-guide/content/v/2.2/topics/oidc/javascript-adapter.html#_login_options) for valid options.
	 */
	function login(options) {
	    if (options === void 0) { options = {}; }
	    var redirectUri = options.redirectUri || location.href;
	    options.redirectUri = redirectUri;
	    state.keycloak.login(options);
	}
	/**
	 * Navigate to the logout page, end session, then navigate back.
	 * @memberof module:session
	 */
	function logout(options) {
	    if (options === void 0) { options = {}; }
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
	//         log('[jwt.js] sent user context to Raven');
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
	var Jwt = {
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
	exports.default = Jwt;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var callbackParser_1 = __webpack_require__(2);
	var localStorage_1 = __webpack_require__(6);
	var cookieStorage_1 = __webpack_require__(3);
	var Keycloak = function (config) {
	    var kc = this;
	    var adapter;
	    var refreshQueue = [];
	    var callbackStorage;
	    var loginIframe = {
	        enable: true,
	        callbackMap: [],
	        interval: 5
	    };
	    kc.init = function (initOptions) {
	        kc.authenticated = false;
	        callbackStorage = createCallbackStorage();
	        if (initOptions && initOptions.adapter === 'cordova') {
	            adapter = loadAdapter('cordova');
	        }
	        else if (initOptions && initOptions.adapter === 'default') {
	            adapter = loadAdapter();
	        }
	        else {
	            if (window['Cordova']) {
	                adapter = loadAdapter('cordova');
	            }
	            else {
	                adapter = loadAdapter();
	            }
	        }
	        if (initOptions) {
	            if (typeof initOptions.checkLoginIframe !== 'undefined') {
	                loginIframe.enable = initOptions.checkLoginIframe;
	            }
	            if (initOptions.checkLoginIframeInterval) {
	                loginIframe.interval = initOptions.checkLoginIframeInterval;
	            }
	            if (initOptions.onLoad === 'login-required') {
	                kc.loginRequired = true;
	            }
	            if (initOptions.responseMode) {
	                if (initOptions.responseMode === 'query' || initOptions.responseMode === 'fragment') {
	                    kc.responseMode = initOptions.responseMode;
	                }
	                else {
	                    throw 'Invalid value for responseMode';
	                }
	            }
	            if (initOptions.flow) {
	                switch (initOptions.flow) {
	                    case 'standard':
	                        kc.responseType = 'code';
	                        break;
	                    case 'implicit':
	                        kc.responseType = 'id_token token';
	                        break;
	                    case 'hybrid':
	                        kc.responseType = 'code id_token token';
	                        break;
	                    default:
	                        throw 'Invalid value for flow';
	                }
	                kc.flow = initOptions.flow;
	            }
	        }
	        if (!kc.responseMode) {
	            kc.responseMode = 'fragment';
	        }
	        if (!kc.responseType) {
	            kc.responseType = 'code';
	            kc.flow = 'standard';
	        }
	        var promise = createPromise();
	        var initPromise = createPromise();
	        initPromise.promise.success(function () {
	            kc.onReady && kc.onReady(kc.authenticated);
	            promise.setSuccess(kc.authenticated);
	        }).error(function (errorData) {
	            promise.setError(errorData);
	        });
	        var configPromise = loadConfig(config);
	        function onLoad() {
	            var doLogin = function (prompt) {
	                if (!prompt) {
	                    options.prompt = 'none';
	                }
	                kc.login(options).success(function () {
	                    initPromise.setSuccess();
	                }).error(function () {
	                    initPromise.setError();
	                });
	            };
	            var options = {
	                prompt: null
	            };
	            switch (initOptions.onLoad) {
	                case 'check-sso':
	                    if (loginIframe.enable) {
	                        setupCheckLoginIframe().success(function () {
	                            checkLoginIframe().success(function () {
	                                doLogin(false);
	                            }).error(function () {
	                                initPromise.setSuccess();
	                            });
	                        });
	                    }
	                    else {
	                        doLogin(false);
	                    }
	                    break;
	                case 'login-required':
	                    doLogin(true);
	                    break;
	                default:
	                    throw 'Invalid value for onLoad';
	            }
	        }
	        function processInit() {
	            var callback = parseCallback(window.location.href);
	            if (callback) {
	                return setupCheckLoginIframe().success(function () {
	                    window.history.replaceState({}, null, callback.newUrl);
	                    processCallback(callback, initPromise);
	                }).error(function (e) {
	                    console.error('Could not authenticate: ' + e);
	                });
	            }
	            else if (initOptions) {
	                if (initOptions.token || initOptions.refreshToken) {
	                    setToken(initOptions.token, initOptions.refreshToken, initOptions.idToken, null);
	                    if (loginIframe.enable) {
	                        setupCheckLoginIframe().success(function () {
	                            checkLoginIframe().success(function () {
	                                kc.onAuthSuccess && kc.onAuthSuccess();
	                                initPromise.setSuccess();
	                            }).error(function () {
	                                kc.onAuthError && kc.onAuthError();
	                                if (initOptions.onLoad) {
	                                    onLoad();
	                                }
	                                else {
	                                    initPromise.setError();
	                                }
	                            });
	                        });
	                    }
	                    else {
	                        kc.updateToken(-1).success(function () {
	                            kc.onAuthSuccess && kc.onAuthSuccess();
	                            initPromise.setSuccess();
	                        }).error(function () {
	                            kc.onAuthError && kc.onAuthError();
	                            if (initOptions.onLoad) {
	                                onLoad();
	                            }
	                            else {
	                                initPromise.setError();
	                            }
	                        });
	                    }
	                }
	                else if (initOptions.onLoad) {
	                    onLoad();
	                }
	                else {
	                    initPromise.setSuccess();
	                }
	            }
	            else {
	                initPromise.setSuccess();
	            }
	        }
	        configPromise.success(processInit);
	        configPromise.error(function () {
	            promise.setError();
	        });
	        return promise.promise;
	    };
	    kc.login = function (options) {
	        return adapter.login(options);
	    };
	    kc.createLoginUrl = function (options) {
	        var state = createUUID();
	        var nonce = createUUID();
	        var redirectUri = adapter.redirectUri(options);
	        if (options && options.prompt) {
	            redirectUri += (redirectUri.indexOf('?') === -1 ? '?' : '&') + 'prompt=' + options.prompt;
	        }
	        callbackStorage.add({ state: state, nonce: nonce, redirectUri: encodeURIComponent(redirectUri) });
	        var action = 'auth';
	        if (options && options.action === 'register') {
	            action = 'registrations';
	        }
	        var scope = (options && options.scope) ? 'openid ' + options.scope : 'openid';
	        var url = getRealmUrl()
	            + '/protocol/openid-connect/' + action
	            + '?client_id=' + encodeURIComponent(kc.clientId)
	            + '&redirect_uri=' + encodeURIComponent(redirectUri)
	            + '&state=' + encodeURIComponent(state)
	            + '&nonce=' + encodeURIComponent(nonce)
	            + '&response_mode=' + encodeURIComponent(kc.responseMode)
	            + '&response_type=' + encodeURIComponent(kc.responseType)
	            + '&scope=' + encodeURIComponent(scope);
	        if (options && options.prompt) {
	            url += '&prompt=' + encodeURIComponent(options.prompt);
	        }
	        if (options && options.maxAge) {
	            url += '&max_age=' + encodeURIComponent(options.maxAge);
	        }
	        if (options && options.loginHint) {
	            url += '&login_hint=' + encodeURIComponent(options.loginHint);
	        }
	        if (options && options.idpHint) {
	            url += '&kc_idp_hint=' + encodeURIComponent(options.idpHint);
	        }
	        if (options && options.locale) {
	            url += '&ui_locales=' + encodeURIComponent(options.locale);
	        }
	        return url;
	    };
	    kc.logout = function (options) {
	        return adapter.logout(options);
	    };
	    kc.createLogoutUrl = function (options) {
	        var url = getRealmUrl()
	            + '/protocol/openid-connect/logout'
	            + '?redirect_uri=' + encodeURIComponent(adapter.redirectUri(options, false));
	        return url;
	    };
	    kc.register = function (options) {
	        return adapter.register(options);
	    };
	    kc.createRegisterUrl = function (options) {
	        if (!options) {
	            options = {};
	        }
	        options.action = 'register';
	        return kc.createLoginUrl(options);
	    };
	    kc.createAccountUrl = function (options) {
	        var url = getRealmUrl()
	            + '/account'
	            + '?referrer=' + encodeURIComponent(kc.clientId)
	            + '&referrer_uri=' + encodeURIComponent(adapter.redirectUri(options));
	        return url;
	    };
	    kc.accountManagement = function () {
	        return adapter.accountManagement();
	    };
	    kc.hasRealmRole = function (role) {
	        var access = kc.realmAccess;
	        return !!access && access.roles.indexOf(role) >= 0;
	    };
	    kc.hasResourceRole = function (role, resource) {
	        if (!kc.resourceAccess) {
	            return false;
	        }
	        var access = kc.resourceAccess[resource || kc.clientId];
	        return !!access && access.roles.indexOf(role) >= 0;
	    };
	    kc.loadUserProfile = function () {
	        var url = getRealmUrl() + '/account';
	        var req = new XMLHttpRequest();
	        req.open('GET', url, true);
	        req.setRequestHeader('Accept', 'application/json');
	        req.setRequestHeader('Authorization', 'bearer ' + kc.token);
	        var promise = createPromise();
	        req.onreadystatechange = function () {
	            if (req.readyState === 4) {
	                if (req.status === 200) {
	                    kc.profile = JSON.parse(req.responseText);
	                    promise.setSuccess(kc.profile);
	                }
	                else {
	                    promise.setError();
	                }
	            }
	        };
	        req.send();
	        return promise.promise;
	    };
	    kc.loadUserInfo = function () {
	        var url = getRealmUrl() + '/protocol/openid-connect/userinfo';
	        var req = new XMLHttpRequest();
	        req.open('GET', url, true);
	        req.setRequestHeader('Accept', 'application/json');
	        req.setRequestHeader('Authorization', 'bearer ' + kc.token);
	        var promise = createPromise();
	        req.onreadystatechange = function () {
	            if (req.readyState === 4) {
	                if (req.status === 200) {
	                    kc.userInfo = JSON.parse(req.responseText);
	                    promise.setSuccess(kc.userInfo);
	                }
	                else {
	                    promise.setError();
	                }
	            }
	        };
	        req.send();
	        return promise.promise;
	    };
	    kc.isTokenExpired = function (minValidity) {
	        if (!kc.tokenParsed || (!kc.refreshToken && kc.flow !== 'implicit')) {
	            throw 'Not authenticated';
	        }
	        var expiresIn = kc.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + kc.timeSkew;
	        if (minValidity) {
	            expiresIn -= minValidity;
	        }
	        return expiresIn < 0;
	    };
	    kc.updateToken = function (minValidity) {
	        var promise = createPromise();
	        if (!kc.tokenParsed || !kc.refreshToken) {
	            promise.setError();
	            return promise.promise;
	        }
	        minValidity = minValidity || 5;
	        var exec = function () {
	            var refreshToken = false;
	            if (kc.timeSkew === -1) {
	                refreshToken = true;
	            }
	            else if (minValidity === -1) {
	                refreshToken = true;
	            }
	            else if (kc.isTokenExpired(minValidity)) {
	                refreshToken = true;
	            }
	            if (!refreshToken) {
	                promise.setSuccess(false);
	            }
	            else {
	                var params = 'grant_type=refresh_token&' + 'refresh_token=' + kc.refreshToken;
	                var url = getRealmUrl() + '/protocol/openid-connect/token';
	                refreshQueue.push(promise);
	                if (refreshQueue.length === 1) {
	                    var req_1 = new XMLHttpRequest();
	                    req_1.open('POST', url, true);
	                    req_1.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	                    req_1.withCredentials = true;
	                    if (kc.clientId && kc.clientSecret) {
	                        req_1.setRequestHeader('Authorization', 'Basic ' + btoa(kc.clientId + ':' + kc.clientSecret));
	                    }
	                    else {
	                        params += '&client_id=' + encodeURIComponent(kc.clientId);
	                    }
	                    var timeLocal_1 = new Date().getTime();
	                    req_1.onreadystatechange = function () {
	                        if (req_1.readyState === 4) {
	                            if (req_1.status === 200) {
	                                timeLocal_1 = (timeLocal_1 + new Date().getTime()) / 2;
	                                var tokenResponse = JSON.parse(req_1.responseText);
	                                setToken(tokenResponse['access_token'], tokenResponse['refresh_token'], tokenResponse['id_token'], timeLocal_1);
	                                kc.onAuthRefreshSuccess && kc.onAuthRefreshSuccess();
	                                for (var p = refreshQueue.pop(); p !== null; p = refreshQueue.pop()) {
	                                    p.setSuccess(true);
	                                }
	                            }
	                            else {
	                                kc.onAuthRefreshError && kc.onAuthRefreshError();
	                                for (var p = refreshQueue.pop(); p !== null; p = refreshQueue.pop()) {
	                                    p.setError(true);
	                                }
	                            }
	                        }
	                    };
	                    req_1.send(params);
	                }
	            }
	        };
	        if (loginIframe.enable) {
	            var iframePromise = checkLoginIframe();
	            iframePromise.success(function () {
	                exec();
	            }).error(function () {
	                promise.setError();
	            });
	        }
	        else {
	            exec();
	        }
	        return promise.promise;
	    };
	    kc.clearToken = function () {
	        if (kc.token) {
	            setToken(null, null, null, null);
	            kc.onAuthLogout && kc.onAuthLogout();
	            if (kc.loginRequired) {
	                kc.login();
	            }
	        }
	    };
	    function getRealmUrl() {
	        if (kc.authServerUrl.charAt(kc.authServerUrl.length - 1) === '/') {
	            return kc.authServerUrl + 'realms/' + encodeURIComponent(kc.realm);
	        }
	        else {
	            return kc.authServerUrl + '/realms/' + encodeURIComponent(kc.realm);
	        }
	    }
	    function getOrigin() {
	        if (!window.location.origin) {
	            return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
	        }
	        else {
	            return window.location.origin;
	        }
	    }
	    function processCallback(oauth, promise) {
	        var code = oauth.code;
	        var error = oauth.error;
	        var prompt = oauth.prompt;
	        var timeLocal = new Date().getTime();
	        if (error) {
	            if (prompt !== 'none') {
	                var errorData = { error: error, error_description: oauth.error_description };
	                kc.onAuthError && kc.onAuthError(errorData);
	                promise && promise.setError(errorData);
	            }
	            else {
	                promise && promise.setSuccess();
	            }
	            return;
	        }
	        else if ((kc.flow !== 'standard') && (oauth.access_token || oauth.id_token)) {
	            authSuccess(oauth.access_token, null, oauth.id_token, true);
	        }
	        if ((kc.flow !== 'implicit') && code) {
	            var params = 'code=' + code + '&grant_type=authorization_code';
	            var url = getRealmUrl() + '/protocol/openid-connect/token';
	            var req_2 = new XMLHttpRequest();
	            req_2.open('POST', url, true);
	            req_2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	            if (kc.clientId && kc.clientSecret) {
	                req_2.setRequestHeader('Authorization', 'Basic ' + btoa(kc.clientId + ':' + kc.clientSecret));
	            }
	            else {
	                params += '&client_id=' + encodeURIComponent(kc.clientId);
	            }
	            params += '&redirect_uri=' + oauth.redirectUri;
	            req_2.withCredentials = true;
	            req_2.onreadystatechange = function () {
	                if (req_2.readyState === 4) {
	                    if (req_2.status === 200) {
	                        var tokenResponse = JSON.parse(req_2.responseText);
	                        authSuccess(tokenResponse['access_token'], tokenResponse['refresh_token'], tokenResponse['id_token'], kc.flow === 'standard');
	                    }
	                    else {
	                        kc.onAuthError && kc.onAuthError();
	                        promise && promise.setError();
	                    }
	                }
	            };
	            req_2.send(params);
	        }
	        function authSuccess(accessToken, refreshToken, idToken, fulfillPromise) {
	            timeLocal = (timeLocal + new Date().getTime()) / 2;
	            setToken(accessToken, refreshToken, idToken, timeLocal);
	            if ((kc.tokenParsed && kc.tokenParsed.nonce !== oauth.storedNonce) ||
	                (kc.refreshTokenParsed && kc.refreshTokenParsed.nonce !== oauth.storedNonce) ||
	                (kc.idTokenParsed && kc.idTokenParsed.nonce !== oauth.storedNonce)) {
	                kc.clearToken();
	                promise && promise.setError();
	            }
	            else {
	                if (fulfillPromise) {
	                    kc.onAuthSuccess && kc.onAuthSuccess();
	                    promise && promise.setSuccess();
	                }
	            }
	        }
	    }
	    function loadConfig(url) {
	        var promise = createPromise();
	        var configUrl;
	        if (!config) {
	            configUrl = 'keycloak.json';
	        }
	        else if (typeof config === 'string') {
	            configUrl = config;
	        }
	        if (configUrl) {
	            var req_3 = new XMLHttpRequest();
	            req_3.open('GET', configUrl, true);
	            req_3.setRequestHeader('Accept', 'application/json');
	            req_3.onreadystatechange = function () {
	                if (req_3.readyState === 4) {
	                    if (req_3.status === 200) {
	                        var config_1 = JSON.parse(req_3.responseText);
	                        kc.authServerUrl = config_1['auth-server-url'];
	                        kc.realm = config_1['realm'];
	                        kc.clientId = config_1['resource'];
	                        kc.clientSecret = (config_1['credentials'] || {})['secret'];
	                        promise.setSuccess();
	                    }
	                    else {
	                        promise.setError();
	                    }
	                }
	            };
	            req_3.send();
	        }
	        else {
	            if (!config['url']) {
	                var scripts = document.getElementsByTagName('script');
	                for (var i = 0; i < scripts.length; i++) {
	                    if (scripts[i].src.match(/.*keycloak\.js/)) {
	                        config.url = scripts[i].src.substr(0, scripts[i].src.indexOf('/js/keycloak.js'));
	                        break;
	                    }
	                }
	            }
	            if (!config.realm) {
	                throw 'realm missing';
	            }
	            if (!config.clientId) {
	                throw 'clientId missing';
	            }
	            kc.authServerUrl = config.url;
	            kc.realm = config.realm;
	            kc.clientId = config.clientId;
	            kc.clientSecret = (config.credentials || {}).secret;
	            promise.setSuccess();
	        }
	        return promise.promise;
	    }
	    function setToken(token, refreshToken, idToken, timeLocal) {
	        if (kc.tokenTimeoutHandle) {
	            clearTimeout(kc.tokenTimeoutHandle);
	            kc.tokenTimeoutHandle = null;
	        }
	        if (token) {
	            kc.token = token;
	            kc.tokenParsed = decodeToken(token);
	            var sessionId = kc.realm + '/' + kc.tokenParsed.sub;
	            if (kc.tokenParsed.session_state) {
	                sessionId = sessionId + '/' + kc.tokenParsed.session_state;
	            }
	            kc.sessionId = sessionId;
	            kc.authenticated = true;
	            kc.subject = kc.tokenParsed.sub;
	            kc.realmAccess = kc.tokenParsed.realm_access;
	            kc.resourceAccess = kc.tokenParsed.resource_access;
	            if (timeLocal) {
	                kc.timeSkew = Math.floor(timeLocal / 1000) - kc.tokenParsed.iat;
	            }
	            else {
	                kc.timeSkew = -1;
	            }
	            if (kc.onTokenExpired) {
	                if (kc.timeSkew === -1) {
	                    kc.onTokenExpired();
	                }
	                else {
	                    var expiresIn = (kc.tokenParsed['exp'] - (new Date().getTime() / 1000) + kc.timeSkew) * 1000;
	                    if (expiresIn <= 0) {
	                        kc.onTokenExpired();
	                    }
	                    else {
	                        kc.tokenTimeoutHandle = setTimeout(kc.onTokenExpired, expiresIn);
	                    }
	                }
	            }
	        }
	        else {
	            delete kc.token;
	            delete kc.tokenParsed;
	            delete kc.subject;
	            delete kc.realmAccess;
	            delete kc.resourceAccess;
	            kc.authenticated = false;
	        }
	        if (refreshToken) {
	            kc.refreshToken = refreshToken;
	            kc.refreshTokenParsed = decodeToken(refreshToken);
	        }
	        else {
	            delete kc.refreshToken;
	            delete kc.refreshTokenParsed;
	        }
	        if (idToken) {
	            kc.idToken = idToken;
	            kc.idTokenParsed = decodeToken(idToken);
	        }
	        else {
	            delete kc.idToken;
	            delete kc.idTokenParsed;
	        }
	    }
	    function decodeToken(str) {
	        str = str.split('.')[1];
	        str = str.replace('/-/g', '+');
	        str = str.replace('/_/g', '/');
	        switch (str.length % 4) {
	            case 0:
	                break;
	            case 2:
	                str += '==';
	                break;
	            case 3:
	                str += '=';
	                break;
	            default:
	                throw 'Invalid token';
	        }
	        str = (str + '===').slice(0, str.length + (str.length % 4));
	        str = str.replace(/-/g, '+').replace(/_/g, '/');
	        str = decodeURIComponent(encodeURI(atob(str)));
	        str = JSON.parse(str);
	        return str;
	    }
	    function createUUID() {
	        var s = [];
	        var hexDigits = '0123456789abcdef';
	        for (var i = 0; i < 36; i++) {
	            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	        }
	        s[14] = '4';
	        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
	        s[8] = s[13] = s[18] = s[23] = '-';
	        var uuid = s.join('');
	        return uuid;
	    }
	    kc.callback_id = 0;
	    function createCallbackId() {
	        var id = '<id: ' + (kc.callback_id++) + (Math.random()) + '>';
	        return id;
	    }
	    function parseCallback(url) {
	        var oauth = new callbackParser_1.default(url, kc.responseMode).parseUri();
	        var oauthState = callbackStorage.get(oauth.state);
	        if (oauthState && (oauth.code || oauth.error || oauth.access_token || oauth.id_token)) {
	            oauth.redirectUri = oauthState.redirectUri;
	            oauth.storedNonce = oauthState.nonce;
	            if (oauth.fragment) {
	                oauth.newUrl += '#' + oauth.fragment;
	            }
	            return oauth;
	        }
	    }
	    function createPromise() {
	        var p = {
	            setSuccess: function (result) {
	                p.success = true;
	                p.result = result;
	                if (p.successCallback) {
	                    p.successCallback(result);
	                }
	            },
	            setError: function (result) {
	                p.error = true;
	                p.result = result;
	                if (p.errorCallback) {
	                    p.errorCallback(result);
	                }
	            },
	            promise: {
	                success: function (callback) {
	                    if (p.success) {
	                        callback(p.result);
	                    }
	                    else if (!p.error) {
	                        p.successCallback = callback;
	                    }
	                    return p.promise;
	                },
	                error: function (callback) {
	                    if (p.error) {
	                        callback(p.result);
	                    }
	                    else if (!p.success) {
	                        p.errorCallback = callback;
	                    }
	                    return p.promise;
	                }
	            }
	        };
	        return p;
	    }
	    function setupCheckLoginIframe() {
	        var promise = createPromise();
	        if (!loginIframe.enable) {
	            promise.setSuccess();
	            return promise.promise;
	        }
	        if (loginIframe['iframe']) {
	            promise.setSuccess();
	            return promise.promise;
	        }
	        var iframe = document.createElement('iframe');
	        loginIframe['iframe'] = iframe;
	        iframe.onload = function () {
	            var realmUrl = getRealmUrl();
	            if (realmUrl.charAt(0) === '/') {
	                loginIframe['iframeOrigin'] = getOrigin();
	            }
	            else {
	                loginIframe['iframeOrigin'] = realmUrl.substring(0, realmUrl.indexOf('/', 8));
	            }
	            promise.setSuccess();
	            setTimeout(check, loginIframe.interval * 1000);
	        };
	        var src = getRealmUrl() + '/protocol/openid-connect/login-status-iframe.html?client_id=' + encodeURIComponent(kc.clientId) + '&origin=' + getOrigin();
	        iframe.setAttribute('src', src);
	        iframe.style.display = 'none';
	        document.body.appendChild(iframe);
	        var messageCallback = function (event) {
	            if (event.origin !== loginIframe['iframeOrigin']) {
	                return;
	            }
	            var data = {};
	            try {
	                data = JSON.parse(event.data);
	            }
	            catch (err) {
	                return;
	            }
	            if (!data['callbackId']) {
	                return;
	            }
	            var promise = loginIframe.callbackMap[data['callbackId']];
	            if (!promise) {
	                return;
	            }
	            delete loginIframe.callbackMap[data['callbackId']];
	            if ((!kc.sessionId || kc.sessionId === data['session']) && data['loggedIn']) {
	                promise.setSuccess();
	            }
	            else {
	                kc.clearToken();
	                promise.setError();
	            }
	        };
	        window.addEventListener('message', messageCallback, false);
	        var check = function () {
	            checkLoginIframe();
	            if (kc.token) {
	                setTimeout(check, loginIframe.interval * 1000);
	            }
	        };
	        return promise.promise;
	    }
	    function checkLoginIframe() {
	        var promise = createPromise();
	        if (loginIframe['iframe'] && loginIframe['iframeOrigin']) {
	            var msg = {
	                callbackId: createCallbackId()
	            };
	            loginIframe.callbackMap[msg.callbackId] = promise;
	            var origin = loginIframe['iframeOrigin'];
	            loginIframe['iframe'].contentWindow.postMessage(JSON.stringify(msg), origin);
	        }
	        else {
	            promise.setSuccess();
	        }
	        return promise.promise;
	    }
	    function loadAdapter(type) {
	        if (!type || type === 'default') {
	            return {
	                login: function (options) {
	                    window.location.href = kc.createLoginUrl(options);
	                    return createPromise().promise;
	                },
	                logout: function (options) {
	                    window.location.href = kc.createLogoutUrl(options);
	                    return createPromise().promise;
	                },
	                register: function (options) {
	                    window.location.href = kc.createRegisterUrl(options);
	                    return createPromise().promise;
	                },
	                accountManagement: function () {
	                    window.location.href = kc.createAccountUrl();
	                    return createPromise().promise;
	                },
	                redirectUri: function (options, encodeHash) {
	                    if (arguments.length === 1) {
	                        encodeHash = true;
	                    }
	                    if (options && options.redirectUri) {
	                        return options.redirectUri;
	                    }
	                    else if (kc.redirectUri) {
	                        return kc.redirectUri;
	                    }
	                    else {
	                        var redirectUri = location.href;
	                        if (location.hash && encodeHash) {
	                            redirectUri = redirectUri.substring(0, location.href.indexOf('#'));
	                            redirectUri += (redirectUri.indexOf('?') === -1 ? '?' : '&') + 'redirect_fragment=' + encodeURIComponent(location.hash.substring(1));
	                        }
	                        return redirectUri;
	                    }
	                }
	            };
	        }
	        if (type === 'cordova') {
	            loginIframe.enable = false;
	            return {
	                login: function (options) {
	                    var promise = createPromise();
	                    var o = 'location=no';
	                    if (options && options.prompt === 'none') {
	                        o += ',hidden=yes';
	                    }
	                    var loginUrl = kc.createLoginUrl(options);
	                    var ref = window.open(loginUrl, '_blank', o);
	                    var completed = false;
	                    ref.addEventListener('loadstart', function (event) {
	                        if (event.url.indexOf('http://localhost') === 0) {
	                            var callback = parseCallback(event.url);
	                            processCallback(callback, promise);
	                            ref.close();
	                            completed = true;
	                        }
	                    });
	                    ref.addEventListener('loaderror', function (event) {
	                        if (!completed) {
	                            if (event.url.indexOf('http://localhost') === 0) {
	                                var callback = parseCallback(event.url);
	                                processCallback(callback, promise);
	                                ref.close();
	                                completed = true;
	                            }
	                            else {
	                                promise.setError();
	                                ref.close();
	                            }
	                        }
	                    });
	                    return promise.promise;
	                },
	                logout: function (options) {
	                    var promise = createPromise();
	                    var logoutUrl = kc.createLogoutUrl(options);
	                    var ref = window.open(logoutUrl, '_blank', 'location=no,hidden=yes');
	                    var error;
	                    ref.addEventListener('loadstart', function (event) {
	                        if (event.url.indexOf('http://localhost') === 0) {
	                            ref.close();
	                        }
	                    });
	                    ref.addEventListener('loaderror', function (event) {
	                        if (event.url.indexOf('http://localhost') === 0) {
	                            ref.close();
	                        }
	                        else {
	                            error = true;
	                            ref.close();
	                        }
	                    });
	                    ref.addEventListener('exit', function (event) {
	                        if (error) {
	                            promise.setError();
	                        }
	                        else {
	                            kc.clearToken();
	                            promise.setSuccess();
	                        }
	                    });
	                    return promise.promise;
	                },
	                register: function () {
	                    var registerUrl = kc.createRegisterUrl();
	                    var ref = window.open(registerUrl, '_blank', 'location=no');
	                    ref.addEventListener('loadstart', function (event) {
	                        if (event.url.indexOf('http://localhost') === 0) {
	                            ref.close();
	                        }
	                    });
	                },
	                accountManagement: function () {
	                    var accountUrl = kc.createAccountUrl();
	                    var ref = window.open(accountUrl, '_blank', 'location=no');
	                    ref.addEventListener('loadstart', function (event) {
	                        if (event.url.indexOf('http://localhost') === 0) {
	                            ref.close();
	                        }
	                    });
	                },
	                redirectUri: function (options) {
	                    return 'http://localhost';
	                }
	            };
	        }
	        throw 'invalid adapter type: ' + type;
	    }
	    function createCallbackStorage() {
	        try {
	            return new localStorage_1.default();
	        }
	        catch (err) { }
	        return new cookieStorage_1.default();
	    }
	};
	exports.default = Keycloak;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var LocalStorage = (function () {
	    function LocalStorage() {
	        localStorage.setItem('kc-test', 'test');
	        localStorage.removeItem('kc-test');
	    }
	    LocalStorage.prototype.clearExpired = function () {
	        var time = new Date().getTime();
	        for (var i = 1; i <= localStorage.length; i++) {
	            var key = localStorage.key(i);
	            if (key && key.indexOf('kc-callback-') === 0) {
	                var value = localStorage.getItem(key);
	                if (value) {
	                    try {
	                        var expires = JSON.parse(value).expires;
	                        if (!expires || expires < time) {
	                            localStorage.removeItem(key);
	                        }
	                    }
	                    catch (err) {
	                        localStorage.removeItem(key);
	                    }
	                }
	            }
	        }
	    };
	    LocalStorage.prototype.get = function (state) {
	        if (!state)
	            return;
	        var key = 'kc-callback-' + state;
	        var value = localStorage.getItem(key);
	        if (value) {
	            localStorage.removeItem(key);
	            value = JSON.parse(value);
	        }
	        this.clearExpired();
	        return value;
	    };
	    LocalStorage.prototype.add = function (state) {
	        this.clearExpired();
	        var key = 'kc-callback-' + state.state;
	        state.expires = new Date().getTime() + (60 * 60 * 1000);
	        localStorage.setItem(key, JSON.stringify(state));
	    };
	    return LocalStorage;
	}());
	exports.default = LocalStorage;


/***/ })
/******/ ])
});
;