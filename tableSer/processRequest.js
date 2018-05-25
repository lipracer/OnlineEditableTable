
var fs = require('fs');
var url = require('url');
//var querystring = require('querystring');
var cp = require('child_process')

function reqHandle(incomingMessage, response)
{
	console.log("new handler");
	this.req = incomingMessage;
	this.response = response;
	this.msg = new Array();
	this.msg["GET"] = handleGet;
	this.msg["POST"] = handlePost;
	this.pathname = url.parse(incomingMessage.url).pathname;
	this.msg[incomingMessage.method].call(this);
	
	function handleGet()
	{
			
		//alert(JSON.stringify(this.req.headers));	
		this.contentType = {'Content-Type': 'text/html'};
		if(this.req.headers.accept.indexOf("text/css")!=-1)
		{
			this.contentType = {'Content-Type': 'text/css'};
		}
		var that = this;
		var filePath = decodeURI(this.pathname)
		if(filePath=="/")
		{
			filePath+="index.html";
		}
		fs.readFile("./tableSer"+filePath, function (err, data)
		{
			
			if (err) 
			{
				console.log(err);
				that.response.writeHead(404, that.contentType);
				that.response.end();	
			}
			else
			{      
				that.response.writeHead(200, that.contentType);			
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
			console.log("./tableSer"+that.pathname+".html");
			fs.writeFile("./tableSer"+that.pathname+".html", body, (err) => {
				if (err){;
					console.log('The file has been saved!');
				}
			});		
			that.response.writeHead(200, {'Content-Type': 'text/html'}); 
			//that.response.write(JSON.stringify(tab.data)); 
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
