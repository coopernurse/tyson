
(function() {

	$tyson.component("LoginPage", {
		html : 
			'<h1>login page</h1>' +
			'<a href="#/home">home with no params</a> | ' +
			'<a href="#/home/hi%20there">home with 1 param</a> | ' +
			'<a href="#/home/msg1/msg2">home with 2 params</a>' +
			'<div class="loginForm"></div>',

		viewModel : function() {
			// example of using an object based ViewModel
			return {
				childComponents : {
					"partial/LoginForm" : $("div.loginForm").get(0)
				},

				postBind : function() {
					console.log("   LoginPage.postBind");
				},
				postBindChild : function(child) {
					console.log("   LoginPage.postBindChild component=" + child.component);
				},

				preUnbindChild : function(child) {
					console.log("   LoginPage.preUnbindChild component=" + child.component);
				},
				postUnbindChild : function(child) {
					console.log("   LoginPage.postUnbindChild component=" + child.component);
				},

				preUnbind : function() {
					console.log("   LoginPage.preUnbind");
				},
				postUnbind : function() {
					console.log("   LoginPage.postUnbind");
				}

			};
		}

	});

})();