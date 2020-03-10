//import all necessary dependencies
let net = require('net'),
    CPTPPacket = require('./CPTPPacket')
singleton = require('./singleton'),
    handler = require('./ClientsHandler'),
    path = require('path'),
    commandLineArgs = require('command-line-args');


net.bytesWritten = 300000;
net.bufferSize = 300000;

singleton.init();


//parse command line arguments
const optionDefinitions = [
    { name: 'peer', alias: 'p', type: String },
    { name: 'maxPeerNumber', alias: 'n', type: Number },
    { name: 'version', alias: 'v', type: Number }
]

//function that returns an random int between min and max
var randomInt = (min, max) => {
    if (min > max)
        return randomInt(max, min);
    return Math.floor(Math.random() * (Math.floor(max) - Math.floor(min)) + Math.floor(min));
}

//construct command line args list
const options = commandLineArgs(optionDefinitions);


//variable declarations
let dirname = path.basename(path.resolve(process.cwd()));
let server_host = '127.0.0.1'; //loopback
let server_port = randomInt(49152, 65535); //ephemeral ports range
let peer_host = '127.0.0.1'; //loopback
let peer_port = null; //not assigned yet
let maxPeerNumber = options.maxPeerNumber || 2;
let version = options.version || 3314;
let isClient = false;

//define peer type that holds host and port
function Peer(host, port) {
    this.host = host;
    this.port = port;
}

//peer table
let peerList = [];


if (options.peer != null) {
    //split server ip address and port number
    let serverInfo = options.peer.split(':');

    peer_host = serverInfo[0]; //assign ip address to be connected
    peer_port = serverInfo[1]; //assign port number to be connected
    isClient = true;
} else {
    isClient = false;
}

let server = net.createServer(); //create a new server
let client = null; //create a holder for client socket




if (isClient) {

    client = new net.Socket(); //create a new socket

    client.connect({
        port: peer_port,
        host: peer_host,
        localAddress: server_host,
        localPort: server_port,
    }); //establish connection to the desired peer

    client.on('data', data => { //wait for peer to send back information
        //parse data
        let response = CPTPPacket.decode(data);
        if (response[0] != 3314) return; //ignore packet if version is not 3314

        console.log(`Connected to peer on ${response[2]}:${peer_port} at timestamp: ${singleton.getTimestamp()}\n`); 
        console.log(`This peer address is ${server_host}:${server_port} located at ${dirname}\n`);
        console.log(`Received ACK from ${response[2]}:${peer_port}\n`);

        if (response[3]) {
            console.log(`\tWhich is peered with ${response[5]}:${response[4]}\n`);
        }

        if (response[1] == 2) {
            console.log(`Join redirected, try to connnect to the peer above.\n`);
        }
    });

    client.on('error', error => {
        console.log(`Client Error has Occoured: ${error.message}`);
    });

    client.on('close', () => {
        server.listen(server_port, server_host); //server listens on the desired port

        
    })

} else {

    server.listen(server_port, server_host); //server listens on the desired port

    console.log(`This peer address is ${server_host}:${server_port} located at ${dirname}\n`);

}

server.on('connection', function (sock) {

    handler.handleClientJoining(version, sock, dirname, maxPeerNumber, peerList); //array passed by reference so it's good

});




