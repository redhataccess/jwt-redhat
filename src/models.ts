export interface IKeycloakOptions {
    realm: string;
    clientId: string;
    url: string;
    credentials?: any;
}

export interface IKeycloakInitOptions {
    responseMode?: 'query' | 'fragment';
    flow: 'standard' | 'implicit' | 'hybrid';
    token: ITokenResponse; // Or IToken, unsure
    refreshToken: string;
    adapter?: any; // appears to be string which is then set to an object
    checkLoginIframe?: any;
    checkLoginIframeInterval?: number;
    onLoad?: string;
    idToken?: string;
}

export interface ILoginOptions {
    redirectUri?: string;
}

export interface IJwtUser {
    user_id: string;
    username: string;
    account_id: string;
    account_number: string;
    email: string;
    firstName: string;
    lastName: string;
    lang: string;
    region: string;
    login: string;
    internal: boolean;
}

export interface IToken {
    REDHAT_LOGIN: string; // "rhn-support-smendenh"
    RHAT_LOGIN: string; // "rhn-support-smendenh"
    account_id: string; // "1979710"
    account_number: string; // "540155"
    acr: string; //"1"
    'allowed-origins': string[]; // ["*"]
    aud: string; // "customer-portal"
    auth_time: number; //1501857720
    azp: string; // "customer-portal"
    client_session: string; 
    country: string; // "US"; 
    email: string; // "smendenh+qa@redhat.com<200b>"
    employeeId: string; // "rhn-support-smendenh"
    exp: number; // 1501873015
    firstName: string; // "Samuel"
    iat: number; // 1501872715
    iss: string; // "https://sso.qa.redhat.com/auth/realms/redhat-external"
    jti: string;
    lang: string; // "en_US"
    lastName: string; // "Mendenhall"
    nbf: number; // 0
    nonce: string;
    organization_id: string; // "00Dm0000000116C"
    portal_id: string; // "06060000000D0af"
    realm_access: {roles: string[]} // {roles: ["authenticated", "redhat:employees", ect..]}
    region: string; // "US"
    resource_access: {
        'realm-management': {
            'roles': string[]; // ["impersonation", "view-users"]                
        }
    };
    session_state: string;
    siteID: string; // "redhat"
    siteId: string; // "redhat"
    sub: string; // "f:d61f8ab9-1f78-4fae-88f3-12cd2e576da7:rhn-support-smendenh"
    typ: string; // "Bearer"
    user_id: string; // "4677944"
    username: string; // "rhn-support-smendenh"
}

export interface IState {
    initialized: boolean;
    keycloak: any;
}

export interface ITokenResponse {
    access_token: string;
    expires_in: number; // default 300
    id_token: string;
    'not-before-policy': number;
    refresh_expires_in: number; // default 36000
    refresh_token: string;
    session_state: string;
    token_type: string; // default 'bearer'
}