
window.downloadView = Backbone.View.extend({
	initialize: function() {
		
    },
	render: function()
	{
		//Backbone.sync("create", {"data":"xxx"}, this.callback);
		/*
		$.ajax({
			"type": "POST",
			"url": "download",
			"data": window.tableview.tableHtml
		});
		*/
		this.tableToExcel('tableToExcel', 'Crash Info')
	},
	callback: function(){
		
	},
    format: function (s, c) {
        return s.replace(/{(\w+)}/g,
            function (m, p) {
                return c[p];
            });
    },
    base64: function (s)
	{
        return window.btoa(unescape(encodeURIComponent(s)));
    },
	tableToExcel: function(tableid, sheetName)
	{
        var uri = 'data:application/vnd.ms-excel;base64,';
        var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">' +    
			'<head>'+
			'<meta charset="utf-8">'+
            ' <style type="text/css">' +
			".table{border-top:1pt;solid: #C1DAD7;border-left:1pt;solid: #C1DAD7;margin:0 auto;width:100%;word-wrap:break-word;word-break:break-all;}"+
			".table thead tr{background:#0066CC;color:#fff;font-weight:bold;font-size:10px}"+
			"td{padding:5px 10px;text-align:left;border-right:1pt solid #C1DAD7;border-bottom:1pt solid #C1DAD7;}"+
			"tr:nth-of-type(odd){background:#F5FAFA;}"+
			"table tr td:first-child,table tr td:first-child{width:4%;}"+
			"table tr td:first-child,table tr td:nth-child(2){width:4%;}"+
			"table tr td:first-child,table tr td:nth-child(3){width:4%;}"+
			"table tr td:first-child,table tr td:nth-child(4){width:4%;}"+
			"table tr td:first-child,table tr td:nth-child(5){width:40%;}"+
			"table tr td:first-child,table tr td:nth-child(6){width:40%;}"+
			"table tr td:first-child,table tr td:nth-child(7){width:4%;}"+
            '</style>' +
            '</head><body>{table}</body></html>';
		//console.log(window.tableview.tableHtml());
        var ctx = {worksheet: sheetName || 'Worksheet', table: window.tableview.tableHtml()};
		var strHtml = this.format(template, ctx);
		//console.log(strHtml);
        document.getElementById("excelOut").href = uri + this.base64(strHtml);		
	}
});