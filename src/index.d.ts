import { ISimplePromise } from './simulatedPromise';

import { 
    ILoginOptions,
    IToken,
    IJwtUser,
    IKeycloakOptions,
    IState,
    IKeycloakInitOptions
} from './models';

declare namespace Jwt {
    export function isAuthenticated(): boolean;
    export function login(options?: ILoginOptions): void;
    export function logout(options?: ILoginOptions): void;
    export function register(options: any): void;
    export function hasRole(...roles: string[]): boolean;
    export function isInternal(): boolean;
    export function getRegisterUrl(): string;
    export function getLoginUrl(options?: ILoginOptions): string;
    export function getLogoutUrl(): string;
    export function getAccountUrl(): string;
    export function getToken(): IToken;
    export function getEncodedToken(): string;
    export function getUserInfo(): IJwtUser;
    export function updateToken(force?: boolean): ISimplePromise;
    export function cancelRefreshLoop(shouldStopTokenUpdates?: boolean);
    export function startRefreshLoop(): void;
    export function onInit(func: Function): void;
    export function init(keycloakOptions: Partial<IKeycloakOptions>, keycloakInitOptions?: Partial<IKeycloakInitOptions>): void;
    export const _state: IState;
}

export default Jwt;