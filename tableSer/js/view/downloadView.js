window.downloadView = Backbone.View.extend({
	initialize: function() {
		
    },
	render: function()
	{
		//Backbone.sync("create", {"data":"xxx"}, this.callback);
		$.ajax({
			"type": "POST",
			"url": "download",
			"data": window.tableview.tableHtml
		});
	},
	callback: function(){
		
	}
});