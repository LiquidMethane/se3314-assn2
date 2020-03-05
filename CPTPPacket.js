
let iptoint = (ip) => {
    arr = ip.split('.');
    //return ((((((+arr[0])*256)+(+arr[1]))*256)+(+arr[2]))*256)+(+arr[3]);
    return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
}

let inttoip = (int) => {
    return ( (int>>>24) +'.' + (int>>16 & 255) +'.' + (int>>8 & 255) +'.' + (int & 255) );
}

module.exports = {

    encode: (version, msgType, dirname, peerNumber, hasPeerInfo, peerPort = null, peerHost = null) => {

        let buffer;

        if (!hasPeerInfo) {
            //no entry in peer table, dont include any in response packet
            buffer = Buffer.alloc(12);

            buffer.writeUIntBE(version, 0, 3);
            buffer.writeUInt8(msgType, 3);
            buffer.write(dirname, 4, 'utf-8');
            buffer.writeUInt32BE(peerNumber, 8);

        } else {
            //has entry in peer table, include the first one in response packet
            buffer = Buffer.allocUnsafe(20);

            buffer.writeUIntBE(version, 0, 3);
            buffer.writeUInt8(msgType, 3);
            buffer.write(dirname, 4);
            buffer.writeUInt32BE(peerNumber, 8);

            buffer.writeUInt16BE(peerPort, 14);
            buffer.writeInt32BE(iptoint(peerHost), 16);
        }
        
        return buffer;
    },

    decode: (data) => {

        let version = data.readUIntBE(0, 3);
        let msgType = data.readUIntBE(3, 1);
        let dirname = data.toString('utf-8', 4, 8);
        let peerNumber = data.readUIntBE(8, 4);
        //determines if peer info is sent back
        let hasPeerInfo = peerNumber > 0;
        let peerPort = null;
        let peerHost = null;
        if (hasPeerInfo) {
            peerPort = data.readUIntBE(14, 2);
            peerHost = inttoip(data.readInt32BE(16));
        }
        return [version, msgType, dirname, hasPeerInfo, peerPort, peerHost];
    }

};