/**
 * Created by sprying on 15/3/29.
 */
var cp = require('child_process');
var child1 = cp.fork('child.js');
var child2 = cp.fork('child.js');

var server = require('net').createServer();
server.on('connection',function(socket){
    socket.end('handled by parent\n');
});
server.listen(1337,function(){
    console.log('启动成功');
    child1.send('server',server);
    child2.send('server',server);
});
