var net = require('net');
var client = net.connect({port:'1337'},function(){
    console.log('client connected');
    client.write('world\r\n');
});

client.on('data',function(){
    console.log(data.toString());
    client.end();
});
client.on('end',function(){
    console.log('client disconnected');
});