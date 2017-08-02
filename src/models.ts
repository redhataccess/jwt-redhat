export interface IKeycloakOptions {
    realm: string;
    clientId: string;
    url: string;
    credentials?: any;
}

export interface IKeycloakInitOptions {
    responseMode?: 'query' | 'fragment';
    flow: 'standard' | 'implicit' | 'hybrid';
    token: string; // Or IToken, unsure
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

export interface IState {
    initialized: boolean;
    keycloak: any;
}