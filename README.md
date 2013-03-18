
# Tyson - single page apps for Knockout.js

Knockout is an excellent two-way binding library and elegantly separates code from markup,
but out of the box it provides limited direction on how to structure a single page app.

Single page apps have the following needs:

* URL routing - when the page loads, different code should fire based on the URL, possibly with parameters
* Composable layouts - single page apps typically render layouts composed of smaller views
* Lifecycle support - single page apps must take care to avoid memory leaks.  view code may register event handlers or
  event subscriptions that must be cleaned up when the view is destroyed.
* Lazy loading - large apps contain dozens or hundreds of views, many of which the user will never invoke.  ideally view
  code should be lazily loaded based on user activity.

Tyson attempts to address these needs by bundling support for these concepts:

* Introducing the notion of a "component" as a first class concept.  Components are Javascript objects with two properties:
  * `viewModel` - a function that returns an instance of a Knockout.js ViewModel
  * `html` - a string of HTML containing the markup that the `viewModel` instance should manage
* URL routing - Tyson has built in support for Flatiron Director (https://github.com/flatiron/director) which is small and
  requires no additional dependencies.  Tyson presents a higher level abstraction for defining routes in terms of components.
* Lifecycle hooks - Tyson is responsible for the lifecycle of your ViewModel instances.  Your code should *never* call 
  `ko.applyBindings()` directly.  Tyson provides a set of callback hooks that your ViewModels may optionally implement so 
  you can do pre/post work.  This makes it easy to write ViewModels that acquire and release memory symetrically.
* Lazy loading - Internally Tyson delegates to a loader function that you provide.  Examples that use $script.js and require.js
  are provided.  As components are requested, the component is loaded lazily and cached internally.

## Dependencies

* Knockout.js 
* Flatiron Director - although the router is plugable
* Either require.js or $script.js - the loader is also pluggable, so other loaders could be supported

There are *no* transitive dependencies.  A complete Tyson app only needs 4 .js files:

* a script loader. either:
  * require.js
  * script.js
* knockout.js
* director.js
* tyson.js

jQuery is used in the examples to lazy load external HTML files, but that code is external to tyson.js and
completely optional.

## Example

Here's a subset of the require.js example that shows how simple it is to bootstrap a single page app with Tyson:

```javascript
// app.js
require(["tyson"], function($tyson) {
	$tyson.start({
	    // DOM element (typically a div) to anchor the app to
		rootEl : document.getElementById("root"),

		// provide a function that will load a component by name
		// this lets you implement whatever directory layout you like
		loader : function(componentName, callback) {
			var url = "src/components-requirejs/" + componentName;
			require([url], callback);
		},

		// initializes the router, mapping routes to component names
		// the route keys are passed to Director verbatim, so any 
		// supported rules are fair game (e.g. regex)
		router : $tyson.director({
			"root"   : "/home",
			"routes" : {
				"/home"            : "HomePage",
				"/home/:msg"       : "HomePage",
				"/home/:msg/:msg2" : "HomePage",
				"/login"           : "LoginPage"
			}
		})
	});
});
```

```javascript
// src/components-requirejs/HomePage.js
define(["knockout"], function(ko) {
	return {
	    // HTML markup this component uses
	    // see examples for a way to load this from external .html files
		html : 
			'<h1>home page</h1>' +
			'<h3 data-bind="text: message"></h3>' +
			'<h3 data-bind="text: message2"></h3>' +
			'<a href="#/login">login</a>',

        // Route parameters parsed by Director will be passed to this
        // function and can be used in your ViewModel instances
		viewModel : function(msg, msg2) {
			return { 
				// normal Knockout code here
				message   : ko.observable(msg || "no message"),
				message2  : ko.observable(msg2 || "no message"),

                // example Tyson hook - this is called before the ko.cleanNode()
                // is called on the DOM element this ViewModel is bound to
				preUnbind : function() {
					console.log("   HomePage.preUnbind");
				}
			};
		}
	};
});
```

### Run the examples

    cd example
    python -m SimpleHTTPServer

    Browse to: http://localhost:8000/app-requirejs.html
          and: http://localhost:8000/app-scriptjs.html

## Writing Components

### viewModel

### html

## Nesting Components



## ViewModel Lifecycle

### Callback Hooks

### boundToDOM property

Tyson will set a boolean property `boundToDOM` on your ViewModel instances that indicates whether the ViewModel is bound to the DOM
by Knockout. While callback hooks could be used to track this, I felt that this piece of state was important enough to inject in all
cases.

The rationale is that JS code frequently kicks off AJAX requests that result in DOM updates upon completion.  The callback function
will retain a reference to the view model, but that view model could have been removed from the DOM while the AJAX request was in 
progress.

`boundToDOM` provides a convenient way to verify that the ViewModel is still bound.  For example:

```javascript
    // in a ViewModel:
    me.submit = function() {
    	$.get("/some/url", function(data) {
    		if (me.boundToDOM) {
    			// ok to proceed - do something with data
    		}
		});
    };
```

## Supported loaders

### AMD / requirejs

Tyson supports AMD.  See `examples/app-requirejs.html` 

### $script.js

$script.js is a lightweight script loader.  See `examples/app-scriptjs.html`

## License

MIT.  See LICENSE file for details.

