import 'isomorphic-fetch';
import * as querystring from 'querystring';
import * as pkg from '../package.json';
import {
    isEmpty,
    mixin,
} from './helper';


export interface Options {
    url?: string;
    method?: string;
    headers?: object;
    mode?: string;
    cache?: string;
    redirect?: string;
    credentials?: string;
    timeout?: number;
    type?: string;
    json?: object;
    form?: object;
    body?: any;
    query?: object;
    params?: object;
    before?: (options: object) => object;
    after?: (response: object, resolve: () => void, reject: () => void) => void;
    error?: (error: object) => void,
}

const version = (<any>pkg).version;
const methods: string[] = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const defaultConfig: Options = {
    url: '',
    method: 'GET',
    headers: {
        'User-Agent': `Lite-Fetch:${version}`,
    },
    mode: 'cors',  // same-origin, no-cors, cors
    cache: 'default',  // default, no-store, reload, no-cache, force-cache, only-if-cached
    redirect: 'follow',  // follow, error, manual
    credentials: 'include',  // omit, same-origin, include
    type: 'raw',  // raw, json, text, blob, formData, arrayBuffer
    timeout: 0,  // disabled
    before(options) { return options; },
    after(response, resolve, reject) {},
    error(error) {},
};

export class LiteFetch {
    public config: Options = defaultConfig;
    public version: string = version;

    constructor(options: Options = {}) {
        this.set(options);
        this.init();
    }

    private init() {
        methods.forEach((method) => {
            this[method.toLocaleLowerCase()] = (url: string, options: Options = {}) => {
                options.url = url;
                options.method = method;
                return this.request(options);
            };
        });
    }

    private transform(options: Options) {
        const config: any = mixin({}, this.config, options);

        if (config.params && !isEmpty(config.params)) {
            config.url = config.url.replace(/:([a-z][\w-_]*)/g, (match, key) => {
                return options.params[key];
            });
        }

        if (config.query && !isEmpty(config.query)) {
            const query: string = querystring.stringify(options.query);
            config.url += (config.url.indexOf('?') >= 0 ? '&' : '?') + query;
        }

        if (config.form && !isEmpty(config.form)) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
            config.body = querystring.stringify(config.form);
        }

        if (config.json && !isEmpty(config.json)) {
            config.headers['Content-Type'] = 'application/json; charset=UTF-8';
            config.body = JSON.stringify(options.json);
        }

        return config;
    }

    private parseBody(type, response) {
        if (type === 'json') {
            return response.json();
        } else if (type === 'text') {
            return response.text();
        } else if (type === 'blob') {
            return response.blob();
        } else if (type === 'formData') {
            return response.formData();
        } else if (type === 'arrayBuffer') {
            return response.arrayBuffer();
        } else {
            return Promise.resolve(response);
        }
    }

    public set(options: Options = {}) {
        this.config = mixin({}, this.config, options);
    }

    public request(options: Options = {}) {
        const beforeConfig = this.config.before(options) || options;
        const config = this.transform(beforeConfig);
        let timer = null;

        return new Promise((resolve, reject) => {
            if (config.timeout > 0) {
                timer = setTimeout(() => {
                    reject(new Error(`request timeout: ${config.timeout}ms`));
                }, config.timeout);
            }
    
            fetch(config.url, {
                method: config.method,
                headers: config.headers,
                body: config.body,
                mode: config.mode,
                cache: config.cache,
                redirect: config.redirect,
                credentials: config.credentials,
            }).then(response => {
                clearTimeout(timer);
                const next = this.parseBody(config.type, response);

                next.then(body => {
                    const res = {
                        url: response.url,
                        method: config.method,
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                        body: body,
                    };

                    this.config.after(res, resolve, reject);

                    if (response.ok) {
                        resolve(res);
                    } else {
                        this.config.error(res);
                        reject(res);
                    }
                }).catch(error => {
                    this.config.error(error);
                    reject(error);
                });

                return response;
            }).catch(error => {
                clearTimeout(timer);
                this.config.error(error);
                reject(error);
            });
        });
    }
}

export default LiteFetch;
