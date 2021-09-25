const socketio = require('socket.io');
const http = require('http');
const CONFIG = require('../config');

const ERROR_RESPONSE = 'GIMP-TRACKER Error response';

var httpServer = null;
var serverSocket = null;

var API_INITIALIZED = false;

var initFuncs = [];

async function InitializeAPI()
{
    httpServer = http.createServer();
    serverSocket = socketio(httpServer, {cors:{origins:'*:*'}});

    httpServer.listen(CONFIG.PORT, () => 
    {
        console.log(`Listening at http://localhost:${CONFIG.PORT}`)
    })
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

function AutorizationMiddleware(socket, next)
{
    console.log(socket.handshake.auth);

    if(socket.handshake.auth.token && socket.handshake.auth.token == CONFIG.PASSWORD)
    {
        next();
    }
    else
    {
        socket.disconnect();
    }
}

function IsAuthorized(socket)
{
    return socket.handshake.auth.token != null && socket.handshake.auth.token == CONFIG.PASSWORD;
}

module.exports = 
{
    ERROR_RESPONSE,

    SetInitialized,
    IsInitialized: () => API_INITIALIZED,

    InitializeAPI,
    OnApiInitialized,
    
    GetSocket: () => serverSocket,

    AutorizationMiddleware,
    IsAuthorized,
}