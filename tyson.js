
// tyson.js

(function(global) {

var tyson            = { },
    components       = { },
    bindingsById     = { },
    idCounter        = 0;

var trace = function(msg) {
    if (tyson.trace && console && console.log) {
        console.log(msg);
    }
};

var useAMD = function() {
    return typeof global.require === "function";
};

var isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
};

var nextId = function() {
    idCounter += 1;
    return idCounter + "-tyson-id";
};

var cleanBinding = function(binding) {
    var i, childComponent, el, child;
    trace("tyson: cleanBinding start id=" + binding.id);

    if (binding.vm.childComponents) {
        for (i = 0; i < binding.vm.childComponents.length; i += 1) {
            childComponent = binding.vm.childComponents[i];
            el = childComponent.el;
            if (tyson.bound(el)) {
                child = bindingsById[el._tysonId];

                if (binding.vm.preUnbindChild) {
                    binding.vm.preUnbindChild({ component: childComponent, vm: child.vm, el: child.el });
                }

                trace("tyson: cleaningChildBinding parent=" + binding.id + " child=" + child.id);
                cleanBinding(child);

                if (binding.vm.postUnbindChild) {
                    binding.vm.postUnbindChild({ component: childComponent, vm: child.vm, el: child.el });
                }
            }
        }
    }

    if (binding.vm.preUnbind) {
        binding.vm.preUnbind();
    }

    binding.vm.boundToDOM = false;

    tyson.ko.cleanNode(binding.el);
    binding.el.innerHTML = "";
    delete binding.el._tysonId;
    delete bindingsById[binding.id];

    if (binding.vm.postUnbind) {
        binding.vm.postUnbind();
    }
};

var loadComponent = function(componentName, callback) {
    var component = tyson.component(componentName);
    if (component) {
        callback(component);
    }
    else {
        tyson.loader(componentName, function(component) {
            tyson.component(componentName, component);
            callback(component);
        });
    }
};

////////////////////////////

tyson.component = function(componentName, component) {
    if (component) {
        components[componentName] = component;
    }
    return components[componentName];
};

tyson.start = function(opts, callback) {
    tyson.rootEl = opts.rootEl;
    tyson.loader = opts.loader;
    tyson.router = opts.router;
    tyson.trace  = opts.trace || false;
    if (useAMD()) {
        require(["knockout", "director"], function(ko, DirectorRouter) {
            tyson.ko = ko;
            tyson.DirectorRouter = DirectorRouter;
            tyson.router.start();
            if (callback) {
                callback();
            }
        });
    }
    else {
        tyson.ko = global.ko;
        tyson.DirectorRouter = global.Router;
        tyson.router.start();
        if (callback) {
            callback();
        }
    }
};

tyson.bound = function(el) {
    return (el && el._tysonId && bindingsById[el._tysonId]);
};

tyson.clean = function(el) {
    if (el) {
        var binding = bindingsById[el._tysonId];

        if (binding) {
            cleanBinding(binding);
        }
        else if (el._tysonId) {
            trace("tyson: clean no binding found for el: " + el + " el._tysonId=" + el._tysonId);
        }
    }
};

tyson.bind = function(el, componentName, params, onDone) {

    if (!componentName) {
        throw new Error("tyson.bind: componentName is not defined!");
    }

    if (!el) {
        throw new Error("tyson.bind: el is not defined! (componentName=" + componentName + ")");
    }

    trace("tyson: bind start: " + componentName);

    loadComponent(componentName, function(component) {
        var i, childComponent, children, vm, binding, postBindCallback, id = nextId();

        if (!component.viewModel) {
            throw new Error("component name=" + componentName + " does not have a viewModel");
        }
        if (!component.html) {
            throw new Error("component name=" + componentName + " does not have html");
        }

        tyson.clean(el);

        el.innerHTML = component.html;
        el._tysonId  = id;

        vm = component.viewModel.apply(component, params);

        binding = {
            id : id,
            vm : vm,
            el : el
        };
        bindingsById[id] = binding;

        tyson.ko.applyBindings(vm, el);
        vm.boundToDOM = true;

        if (vm.postBind) {
            vm.postBind();
        }

        if (vm.childComponents) {
            children = [ ];

            postBindCallback = function(childBinding) {
                if (vm.postBindChild) {
                    vm.postBindChild({ component: childComponent.component, vm: childBinding.vm, el: childBinding.el });
                }
            };

            for (i = 0; i < vm.childComponents.length; i += 1) {
                childComponent = vm.childComponents[i];
                if (childComponent.component) {
                    trace("tyson: child: " + childComponent.component + " el: " + childComponent.el);
                    tyson.bind(childComponent.el, childComponent.component, [], postBindCallback);
                }
            }
        }

        if (Object && Object.keys && JSON) {
            trace("tyson: bind  done: " + componentName + " id: " + id + " bindingsById.keys: " + JSON.stringify(Object.keys(bindingsById)));
        }

        if (onDone) {
            onDone(binding);
        }
    });
};

tyson.director = function(config) {
    var onStart = function() {
        var routes = {}, path, loadRootComponentFunc, router;

        loadRootComponentFunc = function(componentName) {
            return function() {
                var i, decoded = [];
                for (i = 0; i < arguments.length; i += 1) {
                    if (arguments[i] === null || arguments[i] === undefined) {
                        decoded.push(arguments[i]);
                    }
                    else {
                        decoded.push(decodeURIComponent(arguments[i]));
                    }
                }
                tyson.bind(tyson.rootEl, componentName, decoded);
            };
        };

        for (path in config.routes) {
            if (config.routes.hasOwnProperty(path)) {
                if (isFunction(config.routes[path])) {
                    routes[path] = config.routes[path];
                }
                else {
                    routes[path] = loadRootComponentFunc(config.routes[path]);
                }
            }
        }

        router = tyson.DirectorRouter(routes);
        if (config.options) {
            router.configure(config.options);
        }

        router.init(config.root);
    };

    return {
        start: onStart
    };
};

tyson.requirejsLoader = function(getFn, componentPath) {
    return function(componentName, callback) {
        var url = componentPath + componentName;
        require([url], function(component) {
            // if the component defines its html in the JS file we're done
            if (component.html) {
                callback(component);
            }
            // otherwise we need to load the HTML for the component separately
            else {
                url = componentPath + componentName + ".html";
                getFn(url, function(html) {
                    component.html = html;
                    callback(component);
                });
            }
        });
    };
};

tyson.scriptjsLoader = function(getFn, componentPath) {
    return function(componentName, callback) {
        var url = componentPath + componentName + ".js";
        $script(url, function() {
            // each component will register with the $tyson.components
            // registry when it loads.
            var component = tyson.component(componentName);

            // if the component defines its html in the JS file we're done
            if (component.html) {
                callback(component);
            }
            // otherwise we need to load the HTML for the component separately
            else {
                url = componentPath + componentName + ".html";
                getFn(url, function(html) {
                    component.html = html;
                    callback(component);
                });
            }
        });
    };
};

////////////////////////////

if (useAMD()) {
    define("tyson", function() {
        return tyson;
    });
}
else {
    global.$tyson = tyson;
}

})(window);