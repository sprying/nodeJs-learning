var dep = require('./dep.js');
var fs = require('fs');
var path = require('path');
var filePath = path.join(__dirname,'writeFile.js');
console.log(new dep.Person('sprying').sayHello());
fs.writeFile(filePath,'{"name":"方正"}',function(err){
    if(err)  throw err;
    console.log("It's saved");
})