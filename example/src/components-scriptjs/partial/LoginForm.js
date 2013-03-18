
(function() {

    // this component does not have a 'html' slot
    // our loader impl defined in index.html will automatically
    // load LoginForm.html and attach it
	$tyson.component("partial/LoginForm", {
		viewModel : function() {
			// example of using a prototype based ViewModel
			return new LoginForm();
		}
	});

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

})();