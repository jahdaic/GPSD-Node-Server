const https = require('https');
const http = require('http');
var fs = require('fs');
const gpsd = require('node-gpsd-client');

let values = {};

const client = new gpsd({
	port: 2947,
	hostname: 'localhost',
	parse: true,
	reconnectThreshold: 15,
	reconnectInterval: 5,
});

client.on('connected', () => {
	console.log('GPSD Connected');

	client.watch({
		class: 'WATCH',
		json: true,
		scaled: true
	});
});

client.on('error', err => {
	console.log(`Error: ${err.message}`);
});

client.on('TPV', data => {
	console.log(`Data: ${JSON.stringify(data)}`);
	values = data;
});

client.connect();

const requestListener = (request, response) => {
	response.writeHead(200, {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
	});

	const json = JSON.stringify(values);

	response.end(json);
};

const options = {
	key: fs.readFileSync('./localhost.key'),
	cert: fs.readFileSync('./localhost.cert')
};

const httpserver = http.createServer(requestListener);
const httpsServer = https.createServer(options, requestListener);

httpserver.listen(8000);
httpsServer.listen(8443);