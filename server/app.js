const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);
const ws_server = new WebSocket.Server({ server });

const MASTER_KEY = '$2a$10$5UxXpa6pS7Ex2qI6FCehBuE8.L5TdZcEQRgRoc.os0yw6DCEI/bNu';
const API_KEY = '$2a$10$lH5F5xG4RiKK9ji.kcXu4ONjFEAUlyXLvBGTjA77miX0Ao.mpUOJu';
const BIN_ID = '665fb59dacd3cb34a852ce21';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname, '../frontend')));

ws_server.on('connection', (socket) => {
    console.log('Client connected');
    
    // Create operation
    socket.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            if (data.action === 'create') {
                getData().then(response => {
                    return response.record;
                }).then((rdata) => {
                    const list = Object.assign({}, rdata);
                    if (list[data.id]) {
                        return list;
                    }
                    list[data.id] = data.payload;
                    return list;
                }).then(async list => {
                    const response = await axios.put(JSONBIN_URL, JSON.stringify(list), {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Access-Key': API_KEY,
                            'X-Master-Key': MASTER_KEY
                        }
                    });
                    socket.send(JSON.stringify(response.data.record));
                });
            } else if (data.action === 'read') {
                const response = await axios.get(JSONBIN_URL, {
                    headers: {
                        'X-Master-key': API_KEY
                    }
                });
                socket.send(JSON.stringify(response.data.record));
            } else if (data.action === 'update') {
                getData().then(response => {
                    return response.record;
                }).then((rdata) => {
                    const list = Object.assign({}, rdata);
                    list[data.id] = data.payload;
                    return list;
                }).then(async list => {
                    const response = await axios.put(JSONBIN_URL, JSON.stringify(list), {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Access-Key': API_KEY,
                            'X-Master-Key': MASTER_KEY
                        }
                    });
                    socket.send(JSON.stringify(response.data.record));
                });
                socket.send(JSON.stringify(response.data));
            } else if (data.action === 'delete') {
                getData().then(response => {
                    return response.record;
                }).then((rdata) => {
                    const list = Object.assign({}, rdata);
                    delete list[data.id];
                    return list;
                }).then(async list => {
                    const response = await axios.put(JSONBIN_URL, JSON.stringify(list), {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Access-Key': API_KEY,
                            'X-Master-Key': MASTER_KEY
                        }
                    });
                    socket.send(JSON.stringify(response.data.record));
                });
            }
        } catch (error) {
            console.error('Error:', error.message);
            socket.send(JSON.stringify({ error: error.message }));
        }
    });
});

async function getData() {
    return (await axios.get(JSONBIN_URL, {
        headers: {
            'X-Master-key': API_KEY
        }
    })).data;
}


// Start the server
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
