### Notice

This library is not suitable for enterprise use. Repository will be made private. Thank you for understanding.

## Recommendation for other library

- [oauth4webapi](https://github.com/panva/oauth4webapi)
- [oidc-client-ts](https://github.com/authts/oidc-client-ts)
- [Libraries for Token Signing/Verification](https://jwt.io/libraries)
- [client libraries](https://source.redhat.com/groups/public/ciams/docs/client_integration_faq#what-client-libraries2)


### Installation

npm install jwt-redhat

### Authentication examples

// Typescript 
```
import Jwt                            from 'jwt'
import { IKeycloakOptions }           from 'jwt/src/models'

declare global {
    interface Window {
        sessionjs: any;
    }
}
window.sessionjs = Jwt; // this is optional if you want to invoke the same instance elsewhere
const keycloakOptions: Partial<IKeycloakOptions> = {
    clientId: 'unifiedui'
}

Jwt.init(keycloakOptions); // validate session and start the refresh timer

// once the session has initialized, ask session.js some questions
Jwt.onInit(async function () {
    // print user's authentication status, internal status, and their user info
    if(!Jwt.isAuthenticated()) {
        Jwt.login();
    }
});

// When this event is triggered we know we have a guaranteed non-expired JWT token
Jwt.onInitialUpdateToken(async function () {
    const loggedInUser = Jwt.getUserInfo();
    // Any other application specific code can go here.
})
```

// Javascript 
```
const Jwt = require('jwt');
window.sessionjs = Jwt; // this is optional if you want to invoke the same instance elsewhere

const keycloakOptions = {
    clientId: 'unifiedui'
}

// the responseMode defaults to fragment, which works fine in ascension, but query was required for UnifiedUI
const keycloakInitOptions = {
    responseMode: 'query'
}

Jwt.init(keycloakOptions, keycloakInitOptions); // validate session and start the refresh timer
// once the session has initialized, ask session.js some questions
Jwt.onInit(() => {
    // print user's authentication status, internal status, and their user info
    // if the user isn't authenticated, log them in
    if(!Jwt.isAuthenticated()) {
        Jwt.login();
    }
});

// When this event is triggered we know we have a guaranteed non-expired JWT token
Jwt.onInitialUpdateToken(async function () {
    const loggedInUser = Jwt.getUserInfo();
    // Any other application specific code can go here.
})
```

### Selecting SSO Environment

There are two ways for determining SSO Environment:

* Using Hostname: Depending upon the location hostname, the SSO Env will be selected based on a preexisting list of                       hostnames. 
* Pass Env: You can also pass environment names such as QA, STAGE, PROD etc during initialization. For e.x. :
```
import Jwt, { SsoEnv } from 'jwt-redhat';
...
Jwt.init({
    ...
    ssoEnv: SsoEnv.PROD
})
```

### Requesting JWT auth for a new internal webapp

Create a new servicenow ticket and provide them the information from https://mojo.redhat.com/docs/DOC-1142936

* clientid (Ex. 'unifiedui')
* Flows used (Typically standard)
* Valid redirect URI's (Ex. https://unified.gsslab.rdu2.redhat.com/*)
* Web Origins (Ex. https://unified.gsslab.rdu2.redhat.com)
* User information required (With Unifiedui we needed the username populated which was the sso and UDS used that as part of the request)

After IAM has created the client profile in their systems, JWT is ready to use.

### Important notes on configurating your env and project for JWT

Note that for testing purposes, you'll probably want to request that your local dev be whitelisted.  You'll need to specifically tell IAM that.  For example UnifiedUI dev is https://ui.foo.redhat.com which binds to localhost.  By default that won't work without some fancy /etc/hosts and/or DNS configuration.  So if they whitelist just dev, it will work easy for testing.  

Note as well that we *highly* recommend you use the accessproxy: https://github.com/redhataccess/accessproxy and add the following /etc/hosts config:

```
127.0.0.1 localhost foo.redhat.com fte.foo.redhat.com ci.foo.redhat.com qa.foo.redhat.com stage.foo.redhat.com prod.foo.redhat.com ui.foo.redhat.com uds.foo.redhat.com qa.foo.access.redhat.com stage.foo.access.redhat.com prod.foo.access.redhat.com
```

By default we resolve each <env>.foo.redhat.com to the respective JWT login url.  For example qa.foo.redhat.com resolves to https://sso.qa.redhat.com/auth.

It may be the case that we'll need to update this project to accomodate your specific url.  I would communicate the following to IAM when opening the ticket.  Communicate the exact url you will be logging in with, and ask if it can be whitelisted.  If they say they will only for dev1/dev2, then we'll need to update this project to include your env specific dev url for dev1 or dev2.  We may be able to parameterize that in the future if needed.

### Debugging

Open the javascript console and run `localStorage.session_log = true`
