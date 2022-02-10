const http = require('http');
const gpsd = require('node-gpsd-client');

const values = {};

const client = new gpsd({
	port: 2947,
	hostname: 'localhost',
	parse: true
});

client.onClose('connected', () => {
	console.log('GPSD Connected');

	client.watch({
		class: 'WATCH',
		json: true,
		scaled: true
	});
});

client.onClose('error', err => {
	console.log(`Error: ${err.message}`);
});

client.onClose('TPV', data => {
	console.log(`Data: ${data}`);
});

client.connect();

const requestListener = (request, response) => {
	response.writeHead(200);

	const json = JSON.stringify(values);

	response.end(json);
};

const server = http.createServer(requestListener);

server.listen(8080);