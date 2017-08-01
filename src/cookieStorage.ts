
export default class CookieStorage {

    get (state) {
        if (!state) {
            return;
        }

        const value = this.getCookie('kc-callback-' + state);
        this.setCookie('kc-callback-' + state, '', this.cookieExpiration(-100));
        if (value) {
            return JSON.parse(value);
        }
    }

    add (state) {
        this.setCookie('kc-callback-' + state.state, JSON.stringify(state), this.cookieExpiration(60));
    }

    removeItem (key) {
        this.setCookie(key, '', this.cookieExpiration(-100));
    }

    cookieExpiration (minutes: number) {
        const exp = new Date();
        exp.setTime(exp.getTime() + (minutes * 60 * 1000));
        return exp;
    }

    getCookie (key) {
        const name = key + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    setCookie (key, value, expirationDate) {
        const cookie = key + '=' + value + '; '
            + 'expires=' + expirationDate.toUTCString() + '; ';
        document.cookie = cookie;
    }
}