function log(msg){
document.write(msg+"</br>");}

var http = require('http');
var url = require('url');
// 创建服务器

var exec = require('child_process').exec;

exec('python ./tableSer/server_webSocket.py ./ 12',function(error,stdout,stderr){
    if(stdout.length >1){
        log('you offer args:',stdout);
    } else {
        log('you don\'t offer args');
    }
    if(error) {
        info('stderr : '+stderr);
    }
});


log("start server");
http.createServer( function (incomingMessage, response) {  
   // 解析请求，包括文件名
   	//this.pathname = url.parse(incomingMessage.url).pathname;
	//log("./tableSer"+this.pathname);
    new reqHandle(incomingMessage, response);

}).listen(8080);

