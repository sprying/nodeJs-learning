var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');
var crypto = require('crypto');
var routes = {all:[]};
var app = {};
var pathRegexp =function(path){
    var keys = [];
    // /profile/:username =>
    // /user.:ext =>
    path = path.concat('')
        .replace(/\/\(/g,'(?:/')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g,function(_,slash,format,key,capture,optional,star){
            keys.push(key);
            slash = slash || '';
            return ''
            + (optional ? '' :slash)
            + '(?:'
            + (optional? slash: '')
            + (format || '')
            + (capture || (format && '([^/.]+?)') || '([^/]+?)')
            + (optional || '')
            + (star ? '(/*)?' : '');
        })
        .replace(/([\/.])/g,'\\$1')
        .replace(/\*/g,'(.*)');

    return {
        regexp:new RegExp('^' + path + '$'),
        keys:keys
    }
};
app.use = function(path,action){
    var handle;
    if(typeof path === 'string'){
        handle = {
            path:pathRegexp(path),
            stack:Array.prototype.slice.call(arguments,1)
        };
    }else {
        handle = {
            path:pathRegexp('/'),
            stack:Array.prototype.slice.call(arguments,0)
        }
    }
    routes.all.push(handle);
};
['put','post','get','delete'].forEach(function(method){
        routes[method] = [];
        app[method] = function(path,action){
            var handle;
            if(typeof path === 'string'){
                handle = {
                    path:pathRegexp(path),
                    stack:Array.prototype.slice.call(arguments,1)
                };
            }else {
                handle = {
                    path:pathRegexp('/'),
                    stack:Array.prototype.slice.call(arguments,0)
                }
            }
            routes[method].push(handle);
        }
    });
app.get('*.js',function(req,res){
    var filePath = path.join(__dirname,req.pathname);
    fs.stat(filePath,function(err,stat){
        if(err){
            res.writeHeader(404, {'Content-Type': 'text/plain;charset=utf-8'});
            res.end('找不到相关文件。- -');
            return;
        }
        var lastModified = stat.mtime.toUTCString();
        if(lastModified === req.headers['if-modified-since']){
            res.writeHeader(304,"Not Modified");
            res.end();
        }else{
            fs.readFile(filePath,function(err,file){
                shasum = crypto.createHash('sha1');
                var hash = shasum.update(file).digest('base64');
                var noneMatch = req.headers['if-none-match'];
                if(hash === noneMatch){
                    res.setHeader('Last-Modified',lastModified);
                    res.writeHeader(304,'Not Modified');
                    res.end();
                    return;
                }else{
                    res.setHeader('ETag',hash);
                }
                res.setHeader('Content-Type','application/x-javascript;charset=utf-8');
                res.setHeader('Last-Modified',lastModified);
                res.writeHeader(200,'OK');
                res.end(file);
            })
        }
    })
});
var handle = function(req,res,stacks){
    var next = function(err){
        if(err){

        }
        var middleware = stacks.shift();
        if(middleware){
            try{
                req.params = middleware.params;
                middleware(req,res,next);
                delete req.params;
            }catch (ex){
                next(err);
            }
        }
    }
    next();
}
http.createServer(function(req,res){
    var match = function(pathname,routes){
        var stacks =[];
        for(var i= 0,l= routes.length;i<l;i++){
            var route = routes[i];
            var regexp = route.path.regexp;
            var keys = route.path.keys;
            var matched =  regexp.exec(pathname);
            if(matched){
                var params = {};
                for(var j = 0,len = keys.length;j<len;j++){
                    var value = matched[j+1];
                    if(value){
                        params[keys[j]] = value;
                    }
                }
                route.stack.forEach(function(item){
                    item.params = params;
                })
                stacks = stacks.concat(route.stack)
            }
        }
        return stacks;
    };
    var pathname =req.pathname = url.parse(req.url).pathname;
    var stacks = match(pathname,routes.all);
    var method = req.method.toLowerCase();
    if(routes.hasOwnProperty(method)){
        stacks = stacks.concat(match(pathname,routes[method]));
    }
    if(stacks.length){
        handle(req,res,stacks);
    }
}).listen(1338, "127.0.0.1");