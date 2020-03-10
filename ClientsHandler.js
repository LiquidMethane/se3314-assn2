var CPTPPacket = require('./CPTPPacket');

//define peer type that holds host and port
function Peer(host, port) {
    this.host = host;
    this.port = port;
}

module.exports = {

    handleClientJoining: function (version, sock, dirname, maxPeerNumber, peerList) {

        let buffer;


        if (peerList.length == maxPeerNumber) { //peer table full
            //request is received 
            //send back redirect packet

            console.log(`Peer table full: ${sock.remoteAddress}:${sock.remotePort} redirected\n`);

            buffer = CPTPPacket.encode(version, 2, dirname, 1, true, peerList[0].port, peerList[0].host);

        } else { //peer table not full
            //accept connection
            //send back message packet with message type set to 1
            //add new peer's address information to peer table

            console.log(`Connected from peer ${sock.remoteAddress}:${sock.remotePort}\n`);

            let hasPeerInfo = (peerList.length > 0);
            let peerNumber = (hasPeerInfo) ? 1 : 0;

            if (hasPeerInfo)
                buffer = CPTPPacket.encode(version, 1, dirname, peerNumber, true, peerList[0].port, peerList[0].host);
            else
                buffer = CPTPPacket.encode(version, 1, dirname, peerNumber, false);

            peerList.push(new Peer(sock.remoteAddress, sock.remotePort));

        }

        sock.end(buffer);

        sock.on('error', error => {
            console.log(`Server Error has Occoured: ${error.message}`);
        });

    }
};


