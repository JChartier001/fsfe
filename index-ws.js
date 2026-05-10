const express = require('express');
const server = require('http').createServer();

const app = express();

app.get('/', (req, res) => {
	res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);

server.listen(3000, () => {
	console.log('Server started on port 3000');
});

process.on('SIGINT', () => {
	console.log('Shutting down server...');
	wss.clients.forEach(client => {
		if (client.readyState === client.OPEN) {
			client.send('Server is shutting down. Goodbye!');
			client.close();
		}
	});

	server.close(() => {
		shutdownDB();
		console.log('Server closed');
	});
});

/** Begin websocket */
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
	const numClients = wss.clients.size;
	console.log(`Number of connected clients: ${numClients}`);

	wss.broadcast(`Current visitors: ${numClients}`);

	if (ws.readyState === ws.OPEN) {
		ws.send('Welcome to the WebSocket server!');
	}

	db.run(
		'INSERT INTO visitors (count, time) VALUES (?, ?)',
		[numClients, new Date().toISOString()],
		function (err) {
			if (err) {
				return console.error('Error inserting visitor count:', err);
			}
			console.log(`Visitor count inserted with ID: ${this.lastID}`);
		},
	);

	ws.on('close', function close() {
		console.log('Client disconnected');
	});
});
wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};

/** End websocket   */
/** Begin DB */
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
	db.run(`
        CREATE TABLE visitors (
	count INTEGER,
	time TEXT
        
        ) `);
});

function getCounts() {
	db.each('SELECT * FROM visitors', (err, row) => {
		if (err) {
			console.error('Error fetching counts:', err);
			return;
		}
		console.log(row);
	});
}

function shutdownDB() {
	getCounts();
	db.close();
}
