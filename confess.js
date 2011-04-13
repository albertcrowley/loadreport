var confess = {

    run: function () {

        this.settings = {};
        if (!phantom.utils.processArgs(this.settings, [
            {name:'url', def:"http://google.com", req:true, desc:"the URL of the app to cache"},
            {name:'ua', def:phantom.userAgent, req:false, desc:"the user-agent used to request the app"},
            {name:'task', def:'manifest', req:false, desc:"the task to be performed (currently only 'manifest')"}
        ])) {
            console.log('what?');
            phantom.exit();
            return;
        }

        var task = this[this.settings.task];

        phantom.utils.load(this.settings.url, this.settings.ua,
            task.pre,
            task.post,
            this
        );
    },

    manifest: {
        pre: function () {
            console.log('CACHE MANIFEST\n');
            console.log('# This manifest was created by confess.js, http://github.com/jamesgpearce/confess');
            console.log('#');
            console.log('# Time: ' + new Date());
            console.log('#  URL: ' + this.settings.url);
            console.log('#   UA: ' + this.settings.ua);
            console.log('#');
            console.log('# Any console output generated by this page or app is shown immediately below. You\'ll need to remove this to create a valid manifest syntax.');
            console.log('# [Start of console output]');
        },
        post: function () {
            console.log('# [End of console output]');
            console.log('\nCACHE:');
            for (url in this.extractResources(this.settings.url)) {
                console.log(url);
            };
            console.log('\nNETWORK:\n*');
        }
    },

    extractResources: function (url) {
        var
            // resources referenced in DOM
            // notable exceptions: iframes, rss, links
            selectors = [
                ['script', 'src'],
                ['img', 'src'],
                ['link[rel="stylesheet"]', 'href']
            ],

            // resources referenced in CSS
            properties = [
                'background-image',
                'list-style-image',
            ],

            resources = {},
            foreach = phantom.utils.foreach,
            baseScheme = url.split("//")[0];

        foreach(selectors, function (selectorPair) {
            var selector = selectorPair[0];
            var attribute = selectorPair[1];
            var elements = document.querySelectorAll(selector);
            foreach(elements, function(element) {
                this.tallyResource(resources, element.getAttribute(attribute), baseScheme);
            }, this);
        }, this);

        foreach (document.styleSheets, function (stylesheet) {
            foreach (stylesheet.rules, function(rule) {
                if (!rule['style']) { return; }
                foreach (properties, function(property) {
                    var value = rule.style.getPropertyCSSValue(property);
                    if (value && value.primitiveType == CSSPrimitiveValue.CSS_URI) {
                        var url = value.getStringValue();
                        if (url.substr(0,5)!='data:') {
                            this.tallyResource(resources, url, baseScheme);
                        }
                    }
                }, this);
            }, this);
        }, this);

        return resources;

    },

    tallyResource: function (resources, url, baseScheme) {
        if (url) {
            if (url.substr(0, 2)=='//') {
                url = baseScheme + url;
            }
            if (!resources[url]) {
                resources[url] = 0;
            }
            resources[url]++;
        }
    }

};

phantom.utils = {

    load: function (url, ua, pre, post, scope) {
        if (!phantom.state) {
            if (ua) {
                phantom.userAgent = ua;
            }
            phantom.state = true;
            pre.apply(scope);
            phantom.open(url);
        } else {
            post.apply(scope);
            phantom.exit();
        }
    },

    processArgs: function (settings, contract) {
        var a = 0;
        this.foreach(contract, function(argument) {
            if (a < phantom.args.length) {
                settings[argument.name] = phantom.args[a];
            } else {
                if (argument.req) {
                    console.log('"' + argument.name + '" argument is required. This ' + argument.desc + '.');
                    return false;
                }
                settings[argument.name] = argument.def;
            }
            a++;
            return true;
        });
        return (a > phantom.args.length);
    },

    foreach: function (collection, callback, scope) {
        if (collection) {
            for (var i = 0; i < collection.length; i++) {
                if (callback.apply(scope, [collection[i]])===false) {
                    break;
                };
            };
        }
    }

}

confess.run();