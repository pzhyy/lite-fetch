// TODO
import fs from 'fs';
import test from 'ava';
import LiteFetch from '../lib/lite-fetch';
import { createServer } from './server/';

const port = 3000;
const hostname = '127.0.0.1';
const host = `http://${hostname}:${port}`;

test.before('before', async (t) => {
    const server = createServer();

    server.on('GET /', (req, res) => {
        res.end('Hello world!');
    });

    server.on('GET /headers', (req, res) => {
        res.end(req.headers['user-agent']);
    });

    server.on('GET /query?page=1&pageSize=10', (req, res) => {
        res.end(req.url);
    });

    server.on('GET /params/1', (req, res) => {
        res.end(req.url);
    });

    server.on('GET /query/params/1?q=hello', (req, res) => {
        res.end(req.url);
    });

    server.on('GET /parse/text', (req, res) => {
        res.end('parse text');
    });

    server.on('GET /parse/json', (req, res) => {
        res.end(JSON.stringify({ message: 'parse json' }));
    });

    server.on('GET /parse/blob', (req, res) => {
        const dataStream = fs.createReadStream(`${__dirname}/server/test-blob.png`);

        res.writeHead(200, { 'Content-Type': 'image/png' });
        dataStream.pipe(res);
    });

    server.on('GET /hook/before?hook=before', (req, res) => {
        res.end(req.url);
    });

    server.on('GET /hook/error', (req, res) => {
        res.writeHead(500);
        res.end(req.url);
    });

    await server.start(port, hostname);
});

test('no options', async (t) => {
    const liteFetch = new LiteFetch();
    const res = await liteFetch.get(`${host}/`);
    const body = await res.body.text();

    t.is(body, 'Hello world!');
});

test('set headers', async (t) => {
    const liteFetch = new LiteFetch();
    const res = await liteFetch.get(`${host}/headers`, {
        headers: {
            'User-Agent': 'lite-fetch',
        },
    });
    const body = await res.body.text();

    t.is(body, 'lite-fetch');
});

test('set query', async (t) => {
    const liteFetch = new LiteFetch();
    const res = await liteFetch.get(`${host}/query`, {
        query: {
            page: 1,
            pageSize: 10,
        },
    });
    const body = await res.body.text();

    t.is(body, '/query?page=1&pageSize=10');
});

test('set params', async (t) => {
    const liteFetch = new LiteFetch();
    const res = await liteFetch.get(`${host}/params/:id`, {
        params: {
            id: 1,
        },
    });
    const body = await res.body.text();

    t.is(body, '/params/1');
});

test('also set query and params', async (t) => {
    const liteFetch = new LiteFetch();
    const res = await liteFetch.get(`${host}/query/params/:id`, {
        query: {
            q: 'hello'
        },
        params: {
            id: 1,
        },
    });
    const body = await res.body.text();

    t.is(body, '/query/params/1?q=hello');
});

test('set timeout', async (t) => {
    const liteFetch = new LiteFetch();
    const error = await t.throws(liteFetch.get(`${host}/timeout`, {
        timeout: 3000,
    }));

    t.is(error.message, 'request timeout: 3000ms');
});

test('parse text', async (t) => {
    const liteFetch = new LiteFetch();
    const res = await liteFetch.get(`${host}/parse/text`, {
        type: 'text',
    });

    t.is(res.body, 'parse text');
});

test('parse json', async (t) => {
    const liteFetch = new LiteFetch();
    const res = await liteFetch.get(`${host}/parse/json`, {
        type: 'json',
    });

    t.deepEqual(res.body, { message: 'parse json' });
});

test('parse blob', async (t) => {
    const liteFetch = new LiteFetch();
    const res = await liteFetch.get(`${host}/parse/blob`, {
        type: 'raw',
    });
    const dest = fs.createWriteStream(`${__dirname}/test-blob.png`);

    res.body.body.pipe(dest);
    t.pass();
});

test('hook before', async (t) => {
    const liteFetch = new LiteFetch();
    liteFetch.set({
        before(options) {
            options.query = options.query || {
                hook: 'before',
            };

            return options;
        }
    });

    const res = await liteFetch.get(`${host}/hook/before`, {
        type: 'text',
    });
    
    t.is(res.body, '/hook/before?hook=before');
});

test('hook after', async (t) => {
    const liteFetch = new LiteFetch();
    liteFetch.set({
        after(res, resolve, reject) {
            res.body = 'hook after';
            resolve(res);
        }
    });

    const res = await liteFetch.get(`${host}/`, {
        type: 'text',
    });
    
    t.is(res.body, 'hook after');
});

test('hook error', async (t) => {
    const liteFetch = new LiteFetch();
    liteFetch.set({
        error(error) {
            t.is(error.body, '/hook/error');
        }
    });

    const error = await t.throws(liteFetch.get(`${host}/hook/error`, {
        type: 'text',
    }));

    t.is(error.body, '/hook/error');
});
