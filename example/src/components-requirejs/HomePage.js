define(["knockout"], function(ko) {

	return {
		html : 
			'<h1>home page</h1>' +
			'<h3 data-bind="text: message"></h3>' +
			'<h3 data-bind="text: message2"></h3>' +
			'<a href="#/login">login</a>',

		viewModel : function(msg, msg2) {
			console.log("home viewmodel msg=" + msg);

			return { 
				message   : ko.observable(msg || "no message"),
				message2  : ko.observable(msg2 || "no message"),
				preUnbind : function() {
					console.log("   HomePage.preUnbind");
				}
			};
		}
	};

});	
