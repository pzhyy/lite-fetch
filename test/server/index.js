const http = require('http');
const https = require('https');

exports.createServer = () => {
    const server = http.createServer(function(req, res) {
        this.emit(`${req.method} ${req.url}`, req, res);
    });

    server.start = (port, hostname) => {
        return new Promise((resolve, reject) => {
            server.listen(port, hostname, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }

    return server;
};
