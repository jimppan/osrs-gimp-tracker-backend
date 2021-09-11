const Api = require('./src/api')
const Connection = require('./src/connection')

async function Main()
{
    await Api.InitializeAPI();
    
    Api.SetInitialized(true);

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (text) => {

        var command = text.trim();
        // test on command
    });
}

Main();