
var fs = require('fs');
var url = require('url');
//var querystring = require('querystring');
var cp = require('child_process')

function reqHandle(incomingMessage, response)
{
	console.log("new handler");	
	this.req = incomingMessage;
	console.log(JSON.stringify(incomingMessage.headers));
	this.response = response;
	this.msg = new Array();
	this.msg["GET"] = handleGet;
	this.msg["POST"] = handlePost;
	this.pathname = url.parse(incomingMessage.url).pathname;
	this.msg[incomingMessage.method].call(this);
	
	function handleGet()
	{
		var that = this;	
		console.log(this.pathname);	
		
		fs.readFile("./tableSer"+decodeURI(this.pathname), function (err, data)
		{
			
			if (err) 
			{
				console.log(err);
				that.response.writeHead(404, {'Content-Type': 'text/html'});
				that.response.end();	
			}
			else
			{      
				that.response.writeHead(200, {'Content-Type': 'text/html'});			
				that.response.write(data); 				
				that.response.end();				
			}				
		});	
		
	}
	function handlePost()
	{
		
		var body = "";
		console.log("on data");
		this.req.on('data', function (chunk) {
			console.log("on data");
			body += chunk;
		 });
		var that = this;
		this.req.on('end', function () {
			
			console.log("body:"+body);			
			that.response.writeHead(200, {'Content-Type': 'text/html'}); 
			that.response.write(JSON.stringify(tab.data)); 
			that.response.end();
			/*
			this.response.writeHead(200, {'Content-Type': 'text/html'});
			console.log("body");
			this.response.write(JSON.stringify("ssss"));
			console.log("end");
			this.response.end();
			console.log("end");
			*/
		});
		
		
	}
	
}
exports.reqHandle = reqHandle;
