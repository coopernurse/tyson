
(function() {

	$tyson.component("LoginPage", {
		html : 
			'<h1>login page</h1>' +
			'<a href="#/home">home with no params</a> | ' +
			'<a href="#/home/hi%20there">home with 1 param</a> | ' +
			'<a href="#/home/msg1/msg2">home with 2 params</a>' +
			'<div class="loginForm"></div>' +
			'<a href="#" data-bind="click: toggleFooter">toggle footer</a>' +
			'<div class="footer"></div>',

		viewModel : function() {
			// example of using an object based ViewModel

			// component attrib is set so this comopnent will be filled into
			// this element immediately
			var login = { 
				el: $("div.loginForm").get(0),
				component: "partial/LoginForm" 
			},
			// has no component attrib, so when ViewModel is bound, 
			// this div will remain empty
			footer = { 
				el: $("div.footer").get(0)
			};

			return {
				
				childComponents : [ login, footer ],

				toggleFooter : function() {
					if ($tyson.bound(footer.el)) {
						$tyson.unbind(footer.el);
					}
					else {
						$tyson.bind(footer.el, "partial/Footer");
					}
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