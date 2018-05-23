
var http = require('http');
var url = require('url');
// 创建服务器

var exec = require('child_process').exec;
console.log("start server1");
var reqHandle = require('./processRequest.js');

exec('python ./tableSer/server_webSocket.py ./ 12',function(error,stdout,stderr){

    if(error) {
        console.log('stderr : '+stderr);
		return;
    }
	console.log(stdout);
});


console.log("start server1");
http.createServer( function (incomingMessage, response) {  
   // 解析请求，包括文件名
   	//this.pathname = url.parse(incomingMessage.url).pathname;
	//console.log("./tableSer"+this.pathname);
    new reqHandle.reqHandle(incomingMessage, response);

}).listen(8080);

