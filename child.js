/**
 * Created by sprying on 15/3/29.
 */

process.on('message',function(m,server){
    if(m === 'server'){
        server.on('connection',function(socket){
            socket.end('handled by child, pid is ' + process.pid + '\n');
        });
    }
});
