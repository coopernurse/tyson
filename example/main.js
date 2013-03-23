// standard RequireJS config
require.config({
    paths: {
        "jquery"   : "vendor/jquery-1.9.1.min",
        "knockout" : "vendor/knockout-2.2.1",
        "director" : "vendor/director.min",
        "tyson"    : "vendor/tyson"
    },
    shim : {
        "director" : {
            exports : "Router"
        }
    }
});

require(["jquery", "tyson"], function($, $tyson) {

    // relative path to our components
    var componentPath = "src/components-requirejs/";

    // start tyson app
    $tyson.start({
        // element to anchor the app to
        rootEl : document.getElementById("root"),

        // trace is off by default, but if you set to true, then 
        // verbose debug logging will go to console
        trace : true,

        // use the built-in RequireJS loader
        // first param is a function to use to GET files on demand.
        //    jQuery.get is typically what you'd pass in, but if you
        //    don't use jQuery, any function that has the same semantics
        //    is ok.
        // second param is the relative path to your component js/html files
        loader : $tyson.requirejsLoader($.get, componentPath),

        //
        // use the built-in Flatiron Director router
        router : $tyson.director({
            // default route to use
            "root"   : "/login",
            // mapping of routes to component names
            "routes" : {
                "/home/?([^/]+)?/?([^/]+)?/?.*" : "HomePage",
                "/login"  : "LoginPage",
            }
        })
    });

});