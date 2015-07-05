var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var num = 0;
var parseCookie = function(cookie){
    var cookies = {};
    if(!cookie){
        return cookies;
    }
    var arr = cookie.split('&');
    arr.forEach(function(item){
        var pair = item.split('=');
        cookies[pair[0]] = pair[1];
    })
    return cookies;
};

var buildId = function(){
    return (new Date()).getTime();
};
var sessions = {};
var parseSession = function(req,res){
    var id;
    if(id = req.cookies.session_id){
         if(sessions[id]){
             req.session = sessions[id];
         }else{
             req.session = {};
         }
    }else{
        id = buildId();
         sessions[id] = {};
    }
    var _write = res.writeHead;
    res.writeHead = function(){
        res.setHeader('Set-Cookie',serialize('sessionId',id));
        _write.apply(this,Array.prototype.slice.call(arguments));
    }
};

var serialize = function(name,value,opt){
    var pairs = [ name + '=' + value];
    opt = opt || [];
    if(opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
    if(opt.domain) pairs.push('Domain=' + opt.domain);
    if(opt.path) pairs.push('Path=' + opt.path);
    if(opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
    if(opt.httpOnly) pairs.push('HttpOnly');
    if(opt.secure) pairs.push('Secure');
    return pairs.join('; ');
};
var handle = function(req,res){
    var jsonObj = querystring.parse(url.parse(req.url).query);
    console.log(num++);
    if(!req.cookies.isVisited) {
        res.setHeader('Set-Cookie',serialize('isVisited','1'))
        res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
        res.end('欢迎首次访问\n');
    }else{
        res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
        var rs = fs.createReadStream('diary.txt', { flags: 'r',
            fd: null,
            mode: 0666,
            autoClose: true
        });
        var data = '';
        rs.on('data',function(flow){
            data +=flow;
        });
        rs.on('end',function(){
            res.write(data+'\n');
            res.end('欢迎回来哦\n');
        })
    }
};
var httpServer = http.createServer(function (req, res) {
    req.cookies = parseCookie(req.headers.cookie);
    parseSession(req,res);
    handle(req,res);
}).listen(1338, "127.0.0.1");

console.log('Server running at http://127.0.0.1:1338/');

