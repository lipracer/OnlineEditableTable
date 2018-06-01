window.tableView = Backbone.View.extend({


	template: _.template($('#tpl-table').html()),
	events:{
		"click button": "download",
		"click a": "onclickLink"
	},
	tagName: 'div',	
	initialize: function() {
		var locHost = window.location.host;		
		var ip = locHost.substring(0, locHost.indexOf(":"));
		this.server = ip;
		//_.bindAll(this, 'download');
    },
	onclickLink: function()
	{
		document.getElementById("excelOut").text = "Link";	
	},
	download: function()
	{
		function format(s, c) {
			return s.replace(/{(\w+)}/g,
				function (m, p) {
					return c[p];
			});
		}
		function base64(s)
		{
			return window.btoa(unescape(encodeURIComponent(s)));
		}
		function tableToExcel(tableid, sheetName)
		{
			var uri = 'data:application/vnd.ms-excel;base64,';
			var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">' +    
				'<head>'+
				'<meta charset="utf-8">'+
				' <style type="text/css">' +
				".table{border-top:1pt;solid: #C1DAD7;border-left:1pt;solid: #C1DAD7;margin:0 auto;width:100%;word-wrap:break-word;word-break:break-all;}"+
				".table thead tr{background:#0066CC;color:#fff;font-weight:bold;font-size:20px}"+
				"td{padding:5px 10px;text-align:left;border-right:1pt solid #C1DAD7;border-bottom:1pt solid #C1DAD7;}"+
				"tr:nth-of-type(odd){background:#F5FAFA;}"+
				".table tr td:first-child{width:4%;}"+
				".table tr td:nth-child(2){width:4%;}"+
				".table tr td:nth-child(3){width:4%;}"+
				".table tr td:nth-child(4){width:4%;}"+
				".table tr td:nth-child(5){width:40%;}"+
				".table tr td:nth-child(6){width:40%;}"+
				".table tr td:nth-child(7){width:4%;}"+
				'</style>' +
				'</head><body>{table}</body></html>';
			//console.log(window.tableview.tableHtml());
			var ctx = {worksheet: sheetName || 'Worksheet', table: window.tableview.tableHtml()};
			var strHtml = format(template, ctx);
			//console.log(strHtml);
			document.getElementById("excelOut").href = uri + base64(strHtml);	
			document.getElementById("excelOut").text = "点击下载";				
		}
		tableToExcel('tableToExcel', 'Crash Info');
	},
	remove: function(){
		
		if(this.socket)
		{
			this.socket.close();
		}
		
		$("#content").html("");
	},
	tableHtml: function()
	{
		return $("#divtab").html();
	},
	render: function() {

		if($("#content").html!="")
		{
			this.remove();
		}
		this.$el.html(this.template(
		{
			"col0" : "编号",
			"col1" : "负责人",
			"col2" : "崩溃次数",
			"col3" : "来源",
			"col4" : "栈信息",
			"col5" : "修复说明",
			"col6" : "操作"
		}
		));
		//console.log($("#dwn"));
		//document.getElementById("#dwn").click = this.download;
		//this.server = "10.5.179.84";//that should request from server
		this.socket = null;
		this.isopen = false;
		this.socket = new WebSocket("ws://"+this.server+":9000/"+name);
		that = this;
		this.socket.onopen = function() 
		{
			console.log("Connected!");
			that.isopen = true;
		}
		this.socket.onmessage = function(e)
		{
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
							$thisTD = $("#tab tbody").find("tr").eq(i).find("td").eq(j);

							if(array_data[i][j].islock)
							{
								$thisTD.css("background-color","#f0f0f0");
							}
							else
							{
								$thisTD.css("background-color","#ffffff");
							}
							if(array_data[i][j].text != $thisTD.html)
							{
								$thisTD.html(array_data[i][j].text);
							}
						}
					}

				}
				else
				{
					console.log(object_cell);
					if(object_cell.action==4)
					{
						downloadFile("http://"+server_ip+":8080/"+object_cell.html);
						console.log("return");
						return;
					}
					var row = object_cell.row;
					var col = object_cell.col;
					$thisTD = $("#tab tbody").find("tr").eq(row).find("td").eq(col);

					if(object_cell.islock)
					{
						$thisTD.css("background-color","#f0f0f0");
					}
					else
					{
					   $thisTD.css("background-color","#ffffff");
					}
					if(object_cell.text != $thisTD.html())
					{
						$thisTD.html(object_cell.text);
					}
				}	   

			}
		}
		this.socket.onclose = function(e) {
			console.log("Connection closed.");
			this.socket = null;
			this.isopen = false;
		}
		
		$("#content").html(this.el);  
        this.delegateEvents();  
		this.insertTable();
	},
	sendText: function(text) {
		if (this.isopen) {
		   this.socket.send(text);
		   console.log("Text message sent.");               
		} else {
		   console.log("Connection not opened.")
		}
	},
	insertTable: function()
	{
		console.log(this.isopen);
		function format_data()
		{
			this.row = -1;
			this.col = -1;
			this.action = -1;
			this.text = "";
		};
		for(var i=0; i<100; i++)
		{
			tbody=$("#tab tbody");
			trHtml = this.createTRStr();
			tbody.html(tbody.html()+trHtml);		
		}
		tbody=$("#tab tbody");
		for(var i=0; i<100; i++)
		{
			$tr = tbody.find("tr").eq(i);
			for(var j=0; j<7; j++)
			{
				that = this;
				$tr.find("td").eq(j).click(function(){
					console.log("click");
					var row = $(this).parent().index();
					var col = $(this).index();
					fdata = new format_data();
					fdata.row = row;
					fdata.col = col;
					fdata.action = 1;
					var jsonStr = JSON.stringify(fdata);
					that.sendText(jsonStr);
					
				});	
				$tr.find("td").eq(j).blur(function(){
					var row = $(this).parent().index();
					var col = $(this).index();
					console.log("blur:"+row+" "+col);
					fdata = new format_data();
					fdata.row = row;
					fdata.col = col;				
					fdata.text = $(this).html();
					console.log("fdata:"+fdata.text);
					fdata.action = 2;
					var jsonStr = JSON.stringify(fdata);
					that.sendText(jsonStr);
				});	
				$tr.find("td").eq(j).bind("input propertychange", function(){
					console.log("onChange");
					var row = $(this).parent().index();
					var col = $(this).index();
					console.log("blur:"+row+" "+col);
					fdata = new format_data();
					fdata.row = row;
					fdata.col = col;				
					fdata.text = $(this).html();
					console.log("fdata:"+fdata.text);
					fdata.action = 3;
					var jsonStr = JSON.stringify(fdata);
					that.sendText(jsonStr);
				});	
			}
		}

		
	},
	createTRStr: function()
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
});