
var http = require('http');
var url = require('url');
// 创建服务器

var exec = require('child_process').exec;
console.log("start server1");
var reqHandle = require('./processRequest.js');

exec('python ./tableSer/server_webSocket.py ./ 12',function(error,stdout,stderr){
    if(stdout.length >1){
        console.log('you offer args:',stdout);
    } else {
        console.log('you don\'t offer args');
    }
    if(error) {
        console.log('stderr : '+stderr);
    }
});


console.log("start server1");
http.createServer( function (incomingMessage, response) {  
   // 解析请求，包括文件名
   	//this.pathname = url.parse(incomingMessage.url).pathname;
	//console.log("./tableSer"+this.pathname);
    new reqHandle.reqHandle(incomingMessage, response);

}).listen(8080);

