require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const connectDB = require('./db');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

connectDB();

app.use(express.static('public'));

wss.on('connection', (ws) => {
    console.log('New client Connected');

    Message.find()
        .sort({timestamp : 1})
        .then(messages => {
            ws.send(JSON.stringify({type: 'history', data: messages}))
        })
    
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if(parsedMessage.type === 'message') {
            const newMessage = new Message({
                sender: parsedMessage.sender,
                content: parsedMessage.content
            });

            newMessage.save()
                .then(() => {
                    wss.clients.forEach(client => {
                        if(client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'message',
                                data: newMessage
                            }));
                        }
                    });
                })
                .catch(error => console.error('Error saving message: ', error));
        }
    })

    ws.on('close', () => {
        console.log('Client Disconnected!');
    })
})


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
})