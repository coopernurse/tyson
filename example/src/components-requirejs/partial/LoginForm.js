
define(["knockout"], function(ko) {

	function LoginForm() {
		this.username = ko.observable("bob");
		this.password = ko.observable();
	}

	LoginForm.prototype.submit = function(form) {
		console.log("login submit username=" + this.username() + " password=" + this.password());
	};

	LoginForm.prototype.preUnbind = function() {
		console.log("   LoginForm.preUnbind");
	};

	LoginForm.prototype.postUnbind = function() {
		console.log("   LoginForm.postUnbind");
	};

	return {
		viewModel : function() {
			// example of using a prototype based ViewModel
			// prototypes should be forward declared in this file
			return new LoginForm();
		}
	};

});
