$(function(){
    // nav收缩展开
	
    $('.nav-item>a').on('click',function(){
        if (!$('.nav').hasClass('nav-mini')) {
            if ($(this).next().css('display') == "none") {
                //展开未展开
                $('.nav-item').children('ul').slideUp(300);
                $(this).next('ul').slideDown(300);
                $(this).parent('li').addClass('nav-show').siblings('li').removeClass('nav-show');
				console.log($(this).id);
            }else{
                //收缩已展开
				console.log($(this).text());
                $(this).next('ul').slideUp(300);
                $('.nav-item.nav-show').removeClass('nav-show');
            }
        }
    });
	
    //nav-mini切换
    $('#mini').on('click',function(){
        if (!$('.nav').hasClass('nav-mini')) {
            $('.nav-item.nav-show').removeClass('nav-show');
            $('.nav-item').children('ul').removeAttr('style');
            //$('.nav').addClass('nav-mini');
        }else{
            $('.nav').removeClass('nav-mini');
        }
    });
	var AppRouter = Backbone.Router.extend({  
		routes: {  
			'': 'renderTable',  
			'EditTable': 'renderTable',
			'*error': 'renderError'  
		},  
		main: function() {  
			console.log('应用入口方法');  
		},  
		renderTable: function() {  
			console.log("renderTable");
			window.tableview.render();			
		},   
		renderError: function(error) {  
			console.log('URL错误, 错误信息: ' + error);  
		}  
	});  
    window.tableview = new window.tableView();
	window.downloadview = new window.downloadView();
	var router = new AppRouter();  
	Backbone.history.start();  
	
});
