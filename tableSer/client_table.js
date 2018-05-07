var name;
name = localStorage.getItem("name!@#$%^&*");
console.log(typeof(name));
if('null'==name)
{
	name=prompt("请输入您的名字","大侠");
	localStorage.setItem("name!@#$%^&*",name);
}
console.log(name);
insertTable();
var server_ip = "10.5.179.84"
var socket = null;
var isopen = false;
$("#down").click(function(){
	fdata = new format_data();
	fdata.action = 4;
	var jsonStr = JSON.stringify(fdata);
	sendText(jsonStr);
});
window.onload = function() {
	console.log(name);
	socket = new WebSocket("ws://"+server_ip+":9000/"+name);
	socket.onopen = function() {
	   console.log("Connected!");
	   isopen = true;
	}
	socket.onmessage = function(e) {
	   if (typeof e.data == "string") 
	   {
		   object_cell = JSON.parse(e.data);

		   if(object_cell instanceof Array)
		   {
				var array_data = object_cell;
			   for(var i=0; i<array_data.length; i++)
			   {
				   for(var j=0; j<array_data[0].length; j++)
				   {
					   $thisTD = $("#tab").find("tr").eq(i+1).find("td").eq(j);

					   if(array_data[i][j].islock)
					   {
						   $thisTD.css("background-color","#f0f0f0");
					   }
					   else
					   {
						   $thisTD.css("background-color","#ffffff");
					   }
					   if(array_data[i][j].text != $thisTD.text())
					   {
						   $thisTD.text(array_data[i][j].text);
					   }
					   
				   }
			   }

		   }
		   else
		   {
			   console.log(object_cell);
			   	if(object_cell.action==4)
			    {
					downloadFile("http://"+server_ip+":8080/"+object_cell.text);
				   console.log("return");
				   return;
			    }
				var row = object_cell.row;
				var col = object_cell.col;
				$thisTD = $("#tab").find("tr").eq(row+1).find("td").eq(col);

				if(object_cell.islock)
				{
				   $thisTD.css("background-color","#f0f0f0");
				}
				else
				{
				   $thisTD.css("background-color","#ffffff");
				}
				if(object_cell.text != $thisTD.text())
				{
				   $thisTD.text(object_cell.text);
				}
		   }	   

	   }
	}
	socket.onclose = function(e) {
	   console.log("Connection closed.");
	   socket = null;
	   isopen = false;
	}
};
function format_data()
{
	this.row = -1;
	this.col = -1;
	this.action = -1;
	this.text = "";
}
function sendText(text) {
	if (isopen) {
	   socket.send(text);
	   console.log("Text message sent.");               
	} else {
	   console.log("Connection not opened.")
	}
 };
function insertTable()
{
	
	for(var i=0; i<100; i++)
	{
		$tr=$("#tab tr:last");
		trHtml = createTRStr();
		$tr.after(trHtml);
		$tr=$("#tab tr:last");		
		for(var j=0; j<$tr.find("td").length; j++)
		{

			$tr.find("td").eq(j).click(function(){
				var row = $(this).parent().index()-1;
				var col = $(this).index();
				fdata = new format_data();
				fdata.row = row;
				fdata.col = col;
				fdata.action = 1;
				var jsonStr = JSON.stringify(fdata);
				sendText(jsonStr);
				
			});	
			$tr.find("td").eq(j).blur(function(){
				var row = $(this).parent().index()-1;
				var col = $(this).index();
				console.log("blur:"+row+" "+col);
				fdata = new format_data();
				fdata.row = row;
				fdata.col = col;				
				fdata.text = $(this).text();
				console.log("fdata:"+fdata.text);
				fdata.action = 2;
				var jsonStr = JSON.stringify(fdata);
				sendText(jsonStr);
			});	
			$tr.find("td").eq(j).bind("input propertychange", function(){
				console.log("onChange");
				var row = $(this).parent().index()-1;
				var col = $(this).index();
				console.log("blur:"+row+" "+col);
				fdata = new format_data();
				fdata.row = row;
				fdata.col = col;				
				fdata.text = $(this).text();
				console.log("fdata:"+fdata.text);
				fdata.action = 3;
				var jsonStr = JSON.stringify(fdata);
				sendText(jsonStr);
			});	
			//console.log("i:"+i+" j:"+j+":"+$tr.find("td").eq(i).text());
		}
		
	}

	
}
function createTRStr()
{
	trHtml = "<tr>"+
	"<td contenteditable='true'></td>"+
	"<td contenteditable='true'></td>"+
	"<td contenteditable='true'></td>"+
	"<td contenteditable='true'></td>"+
	"<td contenteditable='true'></td>"+
	"<td contenteditable='true'></td>"+
	"<td contenteditable='true'></td>"+
	"</tr>";	
	return trHtml;
}
function downloadFile(sUrl) 
{
	console.log("download");
	//iOS devices do not support downloading. We have to inform user about this.
	if (/(iP)/g.test(navigator.userAgent)) 
	{
		alert('Your device does not support files downloading. Please try again in desktop browser.');
		return false;
	}
 
	//If in Chrome or Safari - download via virtual link click
	if (window.downloadFile.isChrome || window.downloadFile.isSafari) 
	{
		//Creating new link node.
		var link = document.createElement('a');
		link.href = sUrl;
	 
		if (link.download !== undefined) 
		{
			//Set HTML5 download attribute. This will prevent file from opening if supported.
			var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
			link.download = fileName;
		}
	 
		//Dispatching click event.
		if (document.createEvent)
		{
			console.log("createEvent");
			var e = document.createEvent('MouseEvents');
			e.initEvent('click', true, true);
			link.dispatchEvent(e);
			return true;
		}
	}
 
	// Force file download (whether supported by server).
	if (sUrl.indexOf('?') === -1) {
		sUrl += '?download';
	} 
	window.open(sUrl, '_self');
	return true;
}
window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;