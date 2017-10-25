# lite-fetch
A http client base on Fetch API, make it easy to use.

### Install
```bash
npm install lite-fetch --save
```

### Import
* CommonJS
```javascript
const { LiteFetch } = require('lite-fetch');
```

* ES6
```javascript
import LiteFetch from 'lite-fetch';
```

### Usage
```javascript
import LiteFetch from 'lite-fetch';

const liteFetch = new LiteFetch({
    headers: {
        Accept: 'application/json',
    },
    type: 'json',
    timeout: 3000,
    before(options) {
        return options;
    },
    after(response, resolve, reject) {

    }
});

// GET
liteFetch.get('/news', {
    query: {
        page: 1,
        pageSize: 10
    },
}).then((response) => {
    console.log('response', response);
}).catch((error) => {
    console.log('error', error);
});

// POST
liteFetch.post('/news', {
    json: {
        title: 'Hello world!',
        content: 'Good day',
    },
}).then((response) => {
    console.log('response', response);
}).catch((error) => {
    console.log('error', error);
});

// PUT
liteFetch.put('/news/:id', {
    params: {
        id: 1,
    },
    json: {
        title: 'Hello world!',
        content: 'Lucky day',
    },
}).then((response) => {
    console.log('response', response);
}).catch((error) => {
    console.log('error', error);
});

// PATCH
liteFetch.patch('/news/:id', {
    params: {
        id: 1,
    },
    json: {
        content: 'Tomorrow',
    },
}).then((response) => {
    console.log('response', response);
}).catch((error) => {
    console.log('error', error);
});

// DELETE
liteFetch.delete('/news/:id', {
    params: {
        id: 1,
    },
}).then((response) => {
    console.log('response', response);
}).catch((error) => {
    console.log('error', error);
});
```

### API
```javascript
liteFetch.set(options);
liteFetch.request(options);
liteFetch.head(url[, options]);
liteFetch.options(url[, options]);
liteFetch.get(url[, options]);
liteFetch.post(url[, options]]);
liteFetch.put(url[, options]]);
liteFetch.patch(url[, options]]);
liteFetch.delete(url[, options]);
```

### Options
```ts
{
    url?: string;  // default: ''
    method?: string;  // value: [HEAD, OPTIONS, GET, POST, PUT, PATCH, DELETE]. default: GET
    headers?: object;  // A key-value object. default: { 'User-Agent': `Lite-Fetch:${version}` }
    mode?: string;  // value: [same-origin, no-cors, cors]. default: cors
    cache?: string;  // value: [default, no-store, reload, no-cache, force-cache, only-if-cached]. default: default
    redirect?: string;  // value: [follow, error, manual]. default: follow
    credentials?: string;  // value: [omit, same-origin, include]. default: include
    timeout?: number;  // timeout in ms, 0 to disable. default: 0
    type?: string;  // response body type, value: [json, text, blob, formData, arrayBuffer]. default: json
    json?: object;  // request body, will call `JSON.stringify()` and set to body
    form?: object;  // request body, will call `querystring.stringify()` and set to body
    body?: any;  // request body, Fetch's raw body
    query?: object;  // request query, will call `querystring.stringify()` and concat to url
    params?: object;  // resquest params, will replace url params by regexp `/:([a-z][\w-_]*)/gi`
    before?: Before;  // request before hook, need return `options`
    after?: After;  // request after hook, need call `resolve()` or `reject()` if change
}
```
> Note:
>   * If `options.json` are set, `Content-Type: application/json; charset=UTF-8` will be set to headers.
>   * If `options.form` are set, `Content-Type: application/x-www-form-urlencoded; charset=UTF-8` will be set to headers.
>   * If both `options.json` and `options.form` are set, `options.json` will be used.


### License
MIT