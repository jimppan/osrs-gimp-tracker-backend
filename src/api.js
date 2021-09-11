const express = require('express')
const cors = require("cors")
const socketio = require('socket.io');
const http = require('http');

const PORT = 5000

const ERROR_RESPONSE = 'GIMP-TRACKER Error response';

var app = null;
var apiServer = null;
var runeliteSocket = null;

var API_INITIALIZED = false;

var initFuncs = [];

async function InitializeAPI()
{
    app = express();
    app.use(cors({
        origin: "xxx",        // allow to server to accept request from different origin
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    }));

    app.get('/', (req, res) => 
    {
        res.send('No')
    })

    apiServer = http.createServer(app);

    apiServer.listen(PORT, () => 
    {
        console.log(`Listening at http://localhost:${PORT}`)
    })

    runeliteSocket = socketio(apiServer,{
        cors: {
            origin: "xxx",
            credentials: true
          }});
}

function OnApiInitialized(fun)
{
    if(API_INITIALIZED)
        return;

    initFuncs.push(fun);
}

function SetInitialized(value)
{
    API_INITIALIZED = value;
    if(value)
    {
        for(var i = 0; i < initFuncs.length; i++)
            initFuncs[i]();
    }
}

module.exports = 
{
    ERROR_RESPONSE,

    SetInitialized,
    IsInitialized: () => API_INITIALIZED,

    InitializeAPI,
    OnApiInitialized,
    
    GetSocket: () => runeliteSocket,
}