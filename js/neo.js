/**
 * NeoJS framework V2.9.
 * @author Nick Hartskeerl <apachenick@hotmail.com>
 */

/**
 * A class representing the NeoJS framework.
 * @param _arguments The given argument properties.
 * @constructor
 */
var Neo = function(_arguments) {

    /**
     * The most outer reference in our scope.
     * @type {Neo}
     */
    var global = this;

    /**
     * The reference to itself.
     * @type {Neo}
     */
    var self = this;

    /**
     * The registered plug-ins.
     * @type {Array}
     */
    var plugins = [];

    /**
     * The created selectors.
     * @type {Array}
     */
    var selectors = [];

    /**
     * Select all selector matching the given {HTMLElement} node.
     * @param selector The given {HTMLElement} node(s).
     * @param identifier {*=} The selection identifier.
     * @param parent {*=} The parent node we're matching inside.
     * @returns {*}
     */
    this.select = function(selector, identifier, parent) {

        if(!self.isDefined(parent)) {
            parent = document;
        }

        if(!self.isDefined(identifier)) {
            identifier = "query";
        }

        if(self.isString(selector)) {
            switch(identifier) {
                case "id":
                    selector = parent.getElementById(selector);
                    break;
                case "class":
                    selector = parent.getElementsByClassName(selector);
                    break;
                case "tag":
                    selector = parent.getElementsByTagName(selector);
                    break;
                case "name":
                    selector = parent.getElementsByName(selector);
                    break;
                case "query":
                    selector = parent.querySelector(selector);
                    break;
                case "query_all":
                    selector = parent.querySelectorAll(selector);
                    break;
                case "css_rule":
                    selector = global.selectCSSRule(selector, parent);
                    break;
            }
        }

        var _node = undefined;

        if(!self.isDefined(selector) || self.isNull(selector)) {
            return _node;
        }

        if(self.isElement(selector) || self.isElementCollection(selector)) {
            for(var i = 0; i < selectors.length; i++) {
                if(self.isElement(selector) && selector === selectors[i].selector) {
                    return selectors[i].node;
                }
            }
        }

        if(self.isArray(selector) || self.isElementCollection(selector)) {
           _node = new nodeList(self.toNodes(selector));
        } else {
           _node = self.isNode(selector) ? selector : new node(selector);
        }

        selectors.push({ selector: selector, node: _node });

        return _node;

    };

    /**
     * Create a new element node to be placed in the DOM.
     * @param tag The tag name.
     * @param attributes {*=} The attributes for this element.
     * @returns {node}
     */
    this.create = function(tag, attributes) {

        var node = global.select(document.createElement(tag));

        if(global.isObject(attributes)) {
            for(var key in attributes) {
                var value = attributes[key];
                if(key == "inner") {
                    node.inner(value);
                } else {
                    node.attribute(key, value);
                }
            }
        } else if(global.isDefined(attributes)) {
            node.inner(attributes);
        }

        return node;

    };

    /**
     * Check if cookies are enabled in the user's browser.
     * @returns {boolean}
     */
    this.cookiesEnabled = function() {
        if(self.isDefined(navigator.cookieEnabled) && !navigator.cookieEnabled) {
            document.cookie = "$test";
            return document.cookie.indexOf("$test") != -1;
        }
        return navigator.cookieEnabled;
    };

    /**
     * Check if java is enabled in the user's browser.
     * @returns {boolean}
     */
    this.javaEnabled = function() {
        if(self.isDefined(navigator.javaEnabled) && !navigator.javaEnabled()) {
            if(document.applets.length == 0) {
                document.body.appendChild(document.createElement("applet"));
            }
            return document.applets[0].isActive();
        }
        return navigator.javaEnabled();
    };

    /**
     * Check if the browser contains a given mime type.
     * @param type The mime type substring.
     * @param equal {*=} If the mime type must equal.
     * @returns {*}
     */
    this.hasMimeType = function(type, equal) {
        var mimeType = null;
        for(var i = 0; i < navigator.mimeTypes.length; i++) {
            mimeType = navigator.mimeTypes[i];
            if(equal ? mimeType['type'].toLowerCase().indexOf(type) !== 0 : mimeType['type'] == type) {
                return mimeType;
            }
        }
        return null;
    };

    /**
     * Get the user media cross-browser compatible.
     * @returns {*}
     */
    this.userMedia = function() {
        if(global.isChrome()) {
            return "webkitGetUserMedia";
        } else if(global.isFirefox()) {
            return "mozGetUserMedia";
        } else if(global.isIE()) {
            return "msGetUserMedia";
        }
        return "getUserMedia";
    };

    /**
     * Get the user's browser language preference.
     * @returns {string}
     */
    this.language = function() {
        return navigator.userLanguage || navigator.language;
    };

    /**
     * Get the page or frame title.
     * @param frame {*=} The page/frame title.
     * @returns {string}
     */
    this.title = function(frame) {
        if(global.isDefined(frame) && (global.isDefined(frame.contentDocument) || global.isDefined(frame.contentWindow.document))) {
            return (frame.contentDocument || frame.contentWindow.document).title;
        }
        return document.title;
    };

    /**
     * Include a JavaScript file on the web page.
     * @param src The source path.
     * @param _function {*=} The callback function.
     * @returns {Neo.node|*}
     */
    this.include = function(src, _function) {

        var script = self.create("script");
        script.attribute("src", src);
        script.attribute("type", "text/javascript");
        script.attribute("rel", "script");

        if(self.isDefined(_function)) {
            script.bind("load", _function);
        }

        document.body.appendChild(script.origin);

        return script;

    };

    /**
     * Register a new plug-in for the NeoJS framework.
     * @param plugin The plug-in name.
     * @param __arguments {*=} The arguments to pass on.
     * @param _function {*=} The callback function.
     * @returns {*}
     */
    this.plugin = function(plugin, __arguments, _function) {

        if(global.isDefined(plugins[plugin])) {
            return plugins[plugin];
        }

        if(!global.isDefined(_arguments['plugin_folder'])) {
            _arguments['plugin_folder'] = "plugins";
        }

        if(global.isFunction(__arguments)) {
            _function = __arguments;
        }

        this.include(_arguments['plugin_folder']+"/"+plugin+"/"+plugin+".js", function() {
            plugins[plugin] = (plugin = new window["$_" + plugin](global, __arguments));
            if(global.isDefined(_function)) {
                _function(plugin);
            }
        });

        return self;

    };

    /**
     * Check if a plug-in exists in the framework.
     * @param plugin The plug-in name.
     * @returns {boolean}
     */
    this.hasPlugin = function(plugin) {
        return global.isDefined(plugins[plugin]);
    };

    /**
     * Implement a linked resource file on the web page.
     * @param href The hyper link reference.
     * @param rel The relation.
     * @param type The type.
     * @param _function {*=} The callback function.
     * @returns {node}
     */
    this.resource = function(href, rel, type,_function) {

        var link = self.create("link");
        link.attribute("href", href);
        link.attribute("rel", rel);
        link.attribute("type", type);

        if(self.isDefined(_function)) {
            link.bind("load", _function);
        }

        document.body.appendChild(link.origin);

        return link;

    };

    /**
     * Implement a stylesheet resource on the web page.
     * @param href The hyper link reference.
     * @param _function {*=} The callback function.
     * @returns {*}
     */
    this.style = function(href, _function) {
        return this.resource(href, "stylesheet", "text/css", _function);
    };

    /**
     * Get or set the scroll positions for a given element.
     * @param element {*=} The element node.
     * @param horizontal {*=} The horizontal position.
     * @param vertical {*=} The vertical position.
     * @returns {{horizontal: number, vertical: number}}
     */
    this.scroll = function(element, horizontal, vertical) {

        if(!global.isDefined(element)) {
            element = document.body;
        }

        if(global.isNode(element)) {
            element = element.origin;
        }

        if(global.isDefined(horizontal) && global.isDefined(vertical)) {
            element.scrollLeft = horizontal;
            element.scrollTop = vertical;
        }

        return { horizontal: element.scrollLeft, vertical: element.scrollTop };

    };

    /**
     * Get the browser vendor.
     * @returns {{dom: *, lowerCase: (string|*), css: string, js: string}}
     */
    this.vendor = function() {

        var style = window.getComputedStyle(document.documentElement, '');
        var pre = (Array.prototype.slice.call(style).join("").match(/-(moz|webkit|ms)-/) || (style.OLink === "" && [ "", "o" ]))[1];
        var dom = ("WebKit|Moz|MS|O").match(new RegExp("(" + pre + ")", "i"))[1];

        return { dom: dom, lowerCase: pre, css: '-' + pre + '-', js: pre[0].toUpperCase() + pre.substr(1) };

    };

    /**
     * Get the scale ratio per pixel the device.
     * @returns {number} The scale ratio.
     */
    this.scaleRatio = function() {

        var ratio = 1;

        if(window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
            ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
        } else if(window.devicePixelRatio !== undefined) {
            ratio = window.devicePixelRatio;
        }

        return ratio;

    };

    /**
     * Get the parameter of the search URL.
     * @param name The parameter name.
     * @returns {string} The parameter value.
     */
    this.getURLParameter = function(name, url) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(url || location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    /**
     * Match a browser media query.
     * @param query The media query.
     * @returns {boolean}
     */
    this.matchMedia = function(query) {
        if(global.isDefined(window.matchMedia)) {
            return window.matchMedia(query).matches;
        }
        return false;
    };

    /**
     * Convert an array of HTML elements to nodes.
     * @param elements The array of HTML elements.
     * @returns {Array} The array of nodes.
     */
    this.toNodes = function(elements) {

        var nodes = [];

        for(var i = 0; i < elements.length; i++) {
            if(global.isElement(elements[i])) {
                nodes[i] = self.select(elements[i]);
            }
        }

        return nodes;

    };

    /**
     * Concatenate multiple strings into one.
     * @param object The object.
     * @returns {string} The output string.
     */
    this.concat = function(object) {

        var string = "";

        (global.isArray(object) ? object : arguments).forEach(function(_string) {
            string += _string;
        });

        return string;

    };

    /**
     * Select elements by a CSS rule.
     * @param selector The selector.
     * @param parent The parent element.
     * @returns {Array}
     */
    this.selectCSSRule = function(selector, parent) {

        if(!global.isNode(parent)) {
            parent = global.select(parent);
        }

        var elements = parent.select("*", "tag");
        var selected = [];

        elements.each(function(element) {

            var rule = element.css(selector);

            if(global.isDefined(rule) && !global.isNull(rule)) {
                selected.push(element);
            }

        });

        return selected;

    };

    /**
     * Check of an array contains the given object.
     * @param array The array.
     * @param object The object.
     * @returns {boolean}
     */
    this.arrayContains = function(array, object) {
        var i = array.length;
        while(i--) {
            if(array[i] === object) {
                return true;
            }
        }
        return false;
    };

    /**
     * Pluck values from an array by key.
     * @param array The array to pluck from.
     * @param key The key to look for.
     */
    this.pluck = function(array, key) {
        var found = [];
        for(var i in array) {
            if(i == key) {
                found.push(array[i]);
            }
        }
    };

    /**
     * Get the smallest number found in an array.
     * @param array The array.
     * @returns {T}
     */
    this.smallest = function(array) {
        var clone = array;
        return clone.sort(function(x, y) {
            return x - y;
        })[0];
    };

    /**
     * Get the smallest number found in an array.
     * @param array The array.
     * @returns {T}
     */
    this.biggest = function(array) {
        var clone = array;
        return clone.sort(function(x, y) {
            return x + y;
        })[0];
    };

    /**
     * Shuffle an array.
     * @param array The array.
     */
    this.shuffle = function(array){
        var count = array.length, random, i;
        while(count) {
            random = Math.random() * count-- | 0;
            i = array[count];
            array[count] = array[random];
            array[random] = i
        }
        return array;
    };

    /**
     * Check if an object contains the given needle.
     * @param object The object.
     * @param needle The needle.
     * @returns {boolean}
     */
    this.contains = function(object, needle) {
        if(global.isArray(object)) {
            return global.arrayContains(object, needle);
        } else if(global.isString(object)) {
            return object.indexOf(needle) !== -1;
        }
        return false;
    };

    /**
     * Convert an array string to an array.
     * @param string The array string.
     * @returns {Object}
     */
    this.stringToArray = function(string) {
        return eval("("+string+")");
    };

    /**
     * Call a function repeatedly for a specified duration.
     * @param _function the function to call
     * @param timeout The time to count down towards.
     * @param _complete The function to call when finished (optional)
     */
    this.repeatCall = function(_function, timeout, _complete) {

        var interval = 10;
        var time = 0;
        var finish = timeout - (timeout % interval);
        var _callback = function() {
            var percentage = (time++ * interval) / finish;
            _function(percentage);
            if(percentage >= 1) {
                if(_complete) {
                    _complete();
                }
                return;
            }
            setTimeout(_callback, interval);
        };

        _callback();

    };

    /**
     * Scroll to the given vertical scroll top.
     * @param top The vertical top.
     * @param time The time in milliseconds.
     * @param easing The easing equation method.
     * @param complete The function called once completed.
     * @param node The DOM node we're going to scroll.
     */
    this.scrollTop = function(top, time, easing, complete, node) {

        if(!global.isDefined(node)) {
            node = window;
        }

        if(global.isNode(node)) {
            node = node.origin;
        }

        if(!global.isDefined(easing)) {
            easing = "linearTween";
        }

        var currentTop = global.scroll().vertical;
        var difference = top - currentTop;

        global.repeatCall(function(percentage) {
            node.scrollTo(0, global[easing](time * percentage, currentTop, difference * percentage, time));
        }, time || 600, complete);

    };

    /**
     * Scroll to the given horizontal scroll left.
     * @param left The horizontal left.
     * @param time The time in milliseconds.
     * @param easing The easing equation method.
     * @param complete The function called once completed.
     * @param node The DOM node we're going to scroll.
     */
    this.scrollLeft = function(left, time, easing, complete, node) {

        if(!global.isDefined(node)) {
            node = window;
        }

        if(global.isNode(node)) {
            node = node.origin;
        }

        if(!global.isDefined(easing)) {
            easing = "linearTween";
        }

        var currentLeft = global.scroll().horizontal;
        var difference = left - currentLeft;

        global.repeatCall(function(percentage) {
            node.scrollTo(global[easing](time * percentage, currentLeft, difference * percentage, time), 0);
        }, time || 600, complete);

    };

    /**
     * Check if the browser is full screen.
     * @returns {*|boolean}
     */
    this.isFullscreen = function() {
        return (window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height);
    };

    /**
     * Enter the browser's full screen mode.
     * @param node The given node to open full screen.
     */
    this.enterFullscreen = function(node) {

        if(global.isNode(node)) {
            node = node.origin;
        }

        with(node) {
            if(global.isDefined(webkitRequestFullscreen)) {
                webkitRequestFullscreen();
            } else if(global.isDefined(mozRequestFullScreen)) {
                mozRequestFullScreen();
            } else if(global.isDefined(oRequestFullScreen)) {
                oRequestFullScreen();
            } else if(global.isDefined(msRequestFullScreen)) {
                msRequestFullScreen();
            } else if(global.isDefined(requestFullscreen)) {
                requestFullscreen();
            }
        }

    };

    /**
     * Exit the browser's full screen mode.
     */
    this.exitFullscreen = function() {
        if(global.isDefined(webkitExitFullScreen)) {
            webkitExitFullScreen();
        } else if(global.isDefined(mozExitFullScreen)) {
            mozExitFullScreen();
        } else if(global.isDefined(oExitFullScreen)) {
            oExitFullScreen();
        } else if(global.isDefined(msExitFullScreen)) {
            msExitFullScreen();
        } else if(global.isDefined(exitFullScreen)) {
            exitFullScreen();
        }
    };

    /**
     * Check a node element matches a query.
     * @param query The query.
     * @param element The element.
     * @returns {*}
     */
    this.matchQuery = function(query, element) {

        if(element.isNode()) {
            element = element.origin;
        }

        if(global.isChrome()) {
            return element.webkitMatchesSelector(query);
        } else if(global.isFirefox()) {
            return element.mozMatchesSelector(query);
        } else if(global.isIE()) {
            return element.msMatchesSelector(query);
        } else {
            return element.matchesSelector(query);
        }

    };

    /**
     * Make a hash from a function instance.
     * @param object The object instance.
     */
    this.hashCode = function(object) {

        var _hash = function(object) {
            var string = object.toString(),
                sum = 0,
                offset;
            for (offset = 0; offset < string.length; offset++) {
                sum = (((sum << 5) - sum) + string.charCodeAt(offset)) & 4294967295
            }
            return sum
        };

        var _hash2 = function(object) {
            var sum = 0;
            for (var key in object) {
                if(object.hasOwnProperty(key)) {
                    sum += _hash(key + hash(object[key]))
                }
            }
            return sum
        };

        var hash = function(object) {

            var types = {
                string: _hash,
                number: _hash,
                "boolean": _hash,
                object: _hash2
            }, _type = typeof object;

            return object != null && types[_type] ? types[_type](object) + _hash(_type) : 0

        };

        return hash(object);

    };

    /**
     * Simulate a POST/GET form submission.
     * @param action The action path.
     * @param parameters The parameters object.
     * @param method The form method (default=GET).
     */
    this.form = function(action, parameters, method) {

        var form = global.create("form");

        form.attribute("action", action)
            .attribute("method", method || "GET");

        for(var key in parameters) {

            var value = parameters[key];
            var field = global.create("input");

            field.attribute("type", "hidden")
                 .attribute("name", key)
                 .value(value);

            form.append(field);

        }

        global.select("body").append(form);

        form.origin.submit();

    };

    /**
     * Clone a given object.
     * @param object The object.
     * @returns {*}
     */
    this.clone = function(object) {

        if(object == null || self.isObject(object)) {
            return object;
        }

        var _clone = object.constructor();

        for(var key in object) {
            if(object.hasOwnProperty(key)) {
                _clone[key] = self.clone(object[key]);
            }
        }

        return _clone;

    };

    /**
     * Get a reference to the AJAX class function.
     * @returns {{factories: Function, call: Function}}
     */
    this.ajax = function() {
        return ajax;
    };

    /**
     * Get a reference to the timestamp class function.
     * @returns {{milliseconds: Function}}
     */
    this.timestamp = function() {
        return timestamp;
    };

    /**
     * Get a reference to the cookies class function.
     * @returns {{get: Function, set: Function, remove: Function}}
     */
    this.cookies = function() {
        return cookies;
    };

    /**
     * Get a reference to the format class function.
     * @returns {{ellipses: Function}}
     */
    this.format = function() {
        return format;
    };

    /**
     * Get a reference to the arithmetic class function.
     * @returns {{between: Function}}
     */
    this.arithmetic = function() {
        return arithmetic;
    };

    /**
     * Get a reference to the color class function.
     * @param string The color string.
     * @returns {Neo.color|*}
     */
    this.color = function(string) {
        return new color(string);
    };

    /**
     * Get the arguments passed to the framework.
     * @returns {*}
     */
    this.arguments = function() {
        return _arguments;
    };

    /**
     * Check if a given link is external.
     * @param link
     * @returns {boolean}
     */
    this.isExternal = function(link) {
        return new RegExp("^((f|ht)tps?:)?//(?!"+location.host+")").test(link);
    };

    /**
     * Check if the given object is a {window}.
     * @param object The given object.
     * @returns {boolean}
     */
    this.isWindow = function(object) {
        return object == window;
    };

    /**
     * Check if the given object is a numeric.
     * @param object The given object.
     * @returns {boolean}
     */
    this.isNumber = function(object) {
        return !isNaN(parseFloat(object)) && isFinite(object);
    };

    /**
     * Check if the given object is a node.
     * @param object The given object.
     * @returns {boolean}
     */
    this.isNode = function(object) {
        return object instanceof node;
    };

    /**
     * Check if the given object is a node list.
     * @param object The given object.
     * @returns {boolean}
     */
    this.isNodeList = function(object) {
        return object instanceof nodeList;
    };

    /**
     * Check if the given object is a {HTMLElement}.
     * @param object The given object.
     * @returns {boolean}
     */
    this.isElement = function(object) {
        return object == "[object HTMLDivElement]" || this.isDefined(object.tagName);
    };

    /**
     * Check if the given object is a {HTMLCollection}.
     * @param object The given object.
     * @returns {boolean}
     */
    this.isElementCollection = function(object) {
        return object == "[object HTMLCollection]" || object == '[object NodeList]';
    };

    /**
     * Check if the given object is a {string}.
     * @param object The given object.
     * @returns {boolean}
     */
    this.isString = function(object) {
        return typeof object === "string" || object instanceof String;
    };

    /**
     * Check if the given object is an {Array}.
     * @param object The given object.
     * @returns {boolean}
     */
    this.isArray = function(object) {
        return Array.isArray(object);
    };

    /**
     * Check if the given object is a {Function}.
     * @param object
     * @returns {boolean}
     */
    this.isFunction = function(object) {
        return !!(object && object.constructor && object.call && object.apply);
    };

    /**
     * Check if an object is an object.
     * @param object The object.
     * @returns {boolean}
     */
    this.isObject = function(object) {
        return typeof object == "object";
    };

    /**
     * Check if an object equals null.
     * @param object The object.
     * @returns {boolean}
     */
    this.isNull = function(object) {
        return object == null;
    };

    /**
     * Check if an object does not equal null.
     * @param object The object.
     * @returns {boolean}
     */
    this.isNotNull = function(object) {
        return !global.isNull(object);
    };

    /**
     * check if an object has a positive length.
     * @param object The object.
     * @returns {boolean}
     */
    this.isPositiveLength = function(object) {
        return global.isDefined(object) && global.isNotNull(object) && object.length > 0;
    };

    /**
     * Check if an object is defined.
     * @param object The object.
     * @returns {boolean}
     */
    this.isDefined = function(object) {
        return typeof object !== "undefined";
    };

    /**
     * Check if jQuery is added as resource.
     */
    this.hasJquery = function() {
        return global.isDefined(window.jQuery);
    };

    /**
     * Check if we'regex dealing with a retina screen.
     * @returns {boolean}
     */
    this.isRetina = function() {

        if(global.scaleRatio() > 1 || global.matchMedia("(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)")) {
            return true;
        }

        return false;

    };

    /**
     * Check if the user is on a desktop device.
     * @returns {boolean}
     */
    this.isDesktop = function() {
        return !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);
    };

    /**
     * Check if the user's browser is an IE version.
     * @returns {boolean}
     */
    this.isIE = function() {
        return '\v' == 'v' || /msie/i.test(navigator.userAgent) || /trident/i.test(navigator.userAgent);
    };

    /**
     * Check if the user's browser is a Chrome version.
     * @returns {boolean}
     */
    this.isChrome = function() {
        return /chrome/i.test(navigator.userAgent);
    };

    /**
     * Check if the user's browser is a Safari version.
     * @returns {boolean}
     */
    this.isSafari = function() {
        return /safari/i.test(navigator.userAgent);
    };

    /**
     * Check if the user's browser is a Firefox version.
     * @returns {boolean}
     */
    this.isFirefox = function() {
        return /firefox/i.test(navigator.userAgent);
    };

    /**
     * Check if the user's browser is an Opera version.
     * @returns {boolean}
     */
    this.isOpera = function() {
        return /opera/i.test(navigator.userAgent);
    };

    /**
     * A class function representing a single node in the game.
     * @param _origin The given origin for this node.
     */
    var node = function(_origin) {

        /**
         * The reference to itself.
         * @type {node}
         */
        var self = this;

        /**
         * The history of this node.
         * @type {history}
         */
        var _history = new history(self);

        /**
         * The events bound to this node.
         * @type {Array}
         */
        this.events = [];

        /**
         * The cached values for this node.
         * @type {Array}
         */
        this.cache = [];

        /**
         * The given origin for this node.
         * @type {HTMLElement}
         */
        this.origin = _origin;

        /**
         * Select all elements matching the given {HTMLElement} node.
         * @param elements The given {HTMLElement} node(s).
         * @param identifier {*=} The selection identifier.
         * @returns {*}
         */
        this.select = function(elements, identifier) {
            return global.select(elements, identifier, self.origin);
        };

        /**
         * Bind an interaction event to the node.
         * @param _events The interaction events.
         * @param _callback The callback function.
         * @param save {*=} If we're saving history.
         * @returns {node}
         */
        this.bind = function(_events, _callback, save) {

            var _bind = function(_event) {

                if(!(_event in self.events)) {
                    self.events[_event] = [];
                }

                var callback = function(e) {

                    e = e || window.event;
                    var event = e;

                    event.node = self;

                    return _callback(event);

                };

                self.events[_event].push(callback);
                if(self.origin.addEventListener) {
                    self.origin.addEventListener(_event, callback);
                } else if(self.origin.attachEvent) {
                    self.origin.attachEvent(_event, callback);
                }

            };

            if(global.isArray(_events)) {
                for(var i = 0; i < _events.length; i++) {
                    _bind(_events[i]);
                }
            } else {
                _bind(_events);
            }

            if(!global.isDefined(save)) {
                save = true;
            }

            if(_arguments['history'] && save) {
                self.history().save();
            }

            return self;

        };

        /**
         * Unbind an interaction event from the node.
         * @param _events The interaction events.
         * @param _function The callback function.
         * @param save {*=} If we're saving history.
         * @returns {node}
         */
        this.unbind = function(_events, _function, save) {

            var _unbind = function(_event) {
                if(_event in self.events) {
                    if(self.origin.removeEventListener) {
                        self.origin.removeEventListener(_event, _function);
                    }
                    if(self.origin.detachEvent) {
                        self.origin.detachEvent(_event, _function);
                    }
                    self.events[_event].splice(self.events[_event].indexOf(_function), 1);
                }
            };

            if(global.isArray(_events)) {
                for(var i = 0; i < _events.length; i++) {
                    _unbind(_events[i]);
                }
            } else {
                _unbind(_events);
            }

            if(!global.isDefined(save)) {
                save = true;
            }

            if(_arguments['history'] && save) {
                self.history().save();
            }

            return self;

        };

        /**
         * Clear all active event listening.
         * @returns {node}
         */
        this.clearEvents = function() {

            var keys = Object.keys(self.events);

            for(var i = 0; i < keys.length; i++) {
                for(var j = 0; j < self.events[keys[i]].length; j++) {
                    self.unbind(keys[i], self.events[keys[i]][j]);
                }
            }

            return self;

        };

        /**
         * Add a new class to the node's class list.
         * @param classes The class name(s).
         * @returns {node}
         */
        this.addClass = function(classes) {

            var _function = function(_className) {

                var classList = self.origin.classList;
                var className = self.origin.getAttribute("class");

                if(global.isDefined(className) || global.isNull(className)) {
                    className = "";
                }

                if(global.isDefined(classList)) {
                    if(!classList.contains(_className)) {
                        classList.add(_className);
                    }
                } else {
                    if(className.length == 0) {
                        self.origin.setAttribute("class", _className);
                    } else {
                        if(className.toString().indexOf(" ") != -1) {
                            if(className.toString().indexOf(className + " ")) {
                                return self;
                            }
                        } else if(className.toString().indexOf(className)) {
                            return self;
                        }
                        self.origin.setAttribute("class", className+" " + _className);
                    }
                }

            };

            if(global.isArray(classes)) {
                classes.forEach(function(classz) {
                    _function(classz);
                });
            } else {
                _function(classes);
            }

            return self;

        };

        /**
         * Check if the element node contains the class name.
         * @param _className The class name.
         * @returns {*}
         */
        this.hasClass = function(_className) {

            var classList = self.origin.classList;

            if(global.isDefined(classList)) {
                return classList.contains(_className);
            } else if(global.isDefined(self.origin.className)) {
                return (-1 < self.origin.className.toString().indexOf(_className));
            }

        };

        /**
         * Remove a class from the node's class list.
         * @param classes The class name(s).
         * @returns {node}
         */
        this.removeClass = function(classes) {

            var _function = function(_className) {

                var classList = self.origin.classList;

                if(global.isDefined(classList)) {
                    if(classList.contains(_className)) {
                        classList.remove(_className);
                    }
                } else {
                    var className = self.origin.getAttribute("class");
                    if(global.isDefined(className) || global.isNull(className)) {
                        className = "";
                    }
                    var classes = className.split(" ");
                    classes.splice(classes.indexOf(_className), 1);
                    self.origin.setAttribute("class", classes.join(" "));
                }

            };

            if(global.isArray(classes)) {
                classes.forEach(function(classz) {
                    _function(classz);
                });
            } else {
                _function(classes);
            }

            return self;

        };

        /**
         * Toggle a class in the node's class list.
         * @param classes The class name.
         * @returns {node}
         */
        this.toggleClass = function(classes) {

            var _function = function(_className) {
                if(self.hasClass(_className)) {
                    self.removeClass(_className);
                } else {
                    self.addClass(_className);
                }
            };

            if(global.isArray(classes)) {
                classes.forEach(function(classz) {
                    _function(classz);
                });
            } else {
                _function(classes);
            }

            return self;
        };

        /**
         * Replace an existing class with a new class.
         * @param classes The old and new class names.
         */
        this.replaceClass = function(classes) {

            var _function = function(old, _new) {
                self.removeClass(old).addClass(_new)
            };

            if(global.isArray(classes)) {
                classes.forEach(function(_classes) {
                    _function(_classes[0], _classes[1]);
                });
            } else {
                _function(classes[0], classes[1]);
            }

            return self;

        };

        /**
         * Get the tag name of this element node.
         * @returns {string}
         */
        this.tagName = function() {
            if(!global.isDefined(self.origin.tagName)) {
                return null;
            }
            return self.origin.tagName.toLowerCase();
        };

        /**
         * Get or set a new attribute value for this node.
         * @param key The attribute key.
         * @param value {*=} The attribute value.
         * @param save {*=} If we're saving history.
         * @returns {string|*}
         */
        this.attribute = function(key, value, save) {

            if(global.isDefined(value)) {

                self.origin.setAttribute(key, value);

                if(!global.isDefined(save)) {
                    save = true;
                }

                if(_arguments['history'] && save) {
                    self.history().save();
                }

                return self;

            }

            return self.origin.getAttribute(key);

        };

        /**
         * Check if an element node contains the given attribute.
         * @param key The attribute key.
         * @returns {boolean}
         */
        this.hasAttribute = function(key) {
            return self.origin.hasAttribute(key);
        };

        /**
         * Remove an attribute from this element node.
         * @param key The attribute key.
         * @param save {*=} If we're saving history.
         * @returns {node}
         */
        this.removeAttribute = function(key, save) {

            self.origin.removeAttribute(key);

            if(!global.isDefined(save)) {
                save = true;
            }

            if(_arguments['history'] && save) {
                self.history().save();
            }

            return self;

        };

        /**
         * Get or set a new data attribute.
         * @param key The data attribute key.
         * @param value The data attribute value.
         * @param save If the attribute should be saved.
         * @returns {string|*}
         */
        this.data = function(key, value, save) {
            return self.attribute("data-"+key, value, save);
        };

        /**
         * Change the unique identifier for this node.
         * @param id The unique identifier.
         * @returns {string|*}
         */
        this.id = function(id) {
            if(global.isDefined(id)) {
                return self.attribute("id", id);
            }
            return self.attribute("id");
        };

        /**
         * Get or set a style rule for a selector.
         * @param selector The selector.
         * @param rule {*=} The rule.
         * @returns {string|*}
         */
        this.css = function(selector, rule) {

            if(global.isFunction(rule)) {
                rule = rule(self);
            }

            var _css = function(_selector, _rule) {

                var vendor = global.vendor().css;

                if(global.isFirefox()) {

                    if(vendor) {
                        self.origin.style.setProperty(vendor + _selector, _rule, "");
                    }

                    self.origin.style.setProperty(_selector, _rule, "");

                } else {

                    selector = selector.replace(/-([a-z0-9_])/g, function(string, letter) {
                        return letter.toUpperCase();
                    }).replace("-", "");

                    if(vendor) {
                        self.origin.style[vendor + selector.slice(0, 1).toUpperCase() + selector.slice(1)] = rule;
                    }

                    self.origin.style[selector] = rule;

                }

            };

            if(!global.isDefined(rule)) {

                var value = window.getComputedStyle(self.origin).getPropertyValue(selector);

                if(!global.isNull(value) && value.length > 0 && global.format().startsWith(value, "rgb(")) {
                    return global.color(value).toHex();
                }

                return value;

            } else {

                if(selector === "z-index") {
                    self.origin.style[selector] = isNaN(rule) ? rule : "" + (rule | 0);
                } else if(selector === "float") {
                    self.origin.style.styleFloat = self.origin.style.cssFloat = rule;
                } else {
                    if(selector == "opacity") {
                        self.origin.filter = "alpha(opacity=" + (parseInt(rule) * 100) + ")";
                    }
                    _css(selector, rule);
                }

            }

            return self;

        };

        /**
         * Get the width of this element node.
         * @returns {number}
         */
        this.width = function() {
            return self.origin.clientWidth || self.origin.innerWidth;
        };

        /**
         * Get the height of this element node.
         * @returns {number}
         */
        this.height = function() {
            return self.origin.clientHeight || self.origin.innerHeight;
        };

        /**
         * Check if the node element is checked.
         * @returns {boolean|Function}
         */
        this.checked = function() {
            return self.origin.checked == true;
        };

        /**
         * Set a checkbox element as unchecked.
         * @returns {node}
         */
        this.uncheck = function() {
            self.origin.checked = false;
            return self;
        };

        /**
         * Set a checkbox element as checked.
         * @returns {node}
         */
        this.check = function() {
            self.origin.checked = true;
            return self;
        };

        /**
         * Get or set new HTML inside the element node.
         * @param html {*=} The html code.
         * @param _function {*=} The callback function.
         * @returns {string|*}
         */
        this.inner = function(html, _function) {

            var _html = self.origin.innerHTML;

            if(global.isDefined(html)) {
                self.origin.innerHTML = html;
            }

            if(global.isDefined(_function)) {
                _function(html, _html);
            }

            return _html;

        };

        /**
         * Get or set new HTML outside the element node.
         * @param html {*=} The html code.
         * @param _function {*=} The callback function.
         * @returns {string|*}
         */
        this.outer = function(html, _function) {

            var _html = self.origin.outerHTML;

            if(global.isDefined(html)) {
                self.origin.outerHTML = html;
            }

            if(global.isDefined(_function)) {
                _function(html, _html);
            }

            return _html;

        };

        /**
         * Apply a CSS3 transition to the element node.
         * @param rules The transition rules.
         * @returns {node}
         */
        this.transition = function(rules) {

            var _transition = function(rule) {

                var current = self.css("transition");
                var hasTransition = current != "all 0s ease 0s" && current.length > 0;
                var ruleText = hasTransition ? "none" : current;
                var duration = rule.duration || 0;
                var delay = rule.delay || 0;
                var timing = rule.timing || "ease";

                if(global.isArray(rule.properties)) {

                    ruleText = "";

                    rule.properties.forEach(function(property, index) {
                        if(index != 0 || hasTransition) {
                            ruleText += ", ";
                        }
                        ruleText += property + " " + duration + " " + delay + " " + timing;
                    });

                } else {
                    ruleText = (hasTransition ? ", " : "") + rule.properties + " " + duration + " " + delay + " " + timing;
                }

                self.css("transition", ruleText);

            };

            if(global.isArray(rules)) {
                rules.forEach(function(rule) {
                    _transition(rule);
                });
            } else {
                _transition(rules);
            }

            return self;

        };

        /**
         * Resume the paused transition.
         */
        this.resumeTransition = function() {
            if(global.isDefined(self.cache['transition'])) {
                self.css("transition", self.cache['transition']);
            }
        };

        /**
         * Pause the ongoing transition.
         */
        this.pauseTransition = function() {
            self.cache['transition'] = self.css("transition");
            self.clearTransition();
        };

        /**
         * Clear all current transitions.
         */
        this.clearTransition = function() {
            self.css("transition", "none");
        };

        /**
         * Get the parent element node of this node.
         * @returns {*}
         */
        this.parent = function() {
            return global.select(self.origin.parentNode);
        };

        /**
         * Get the child element nodes of this node.
         * @returns {*}
         */
        this.children = function() {
            if(global.isDefined(self.origin.childNodes)) {
                return new nodeList(global.toNodes(self.origin.childNodes));
            }
            return null;
        };

        /**
         * Get the first next sibling.
         * @returns {*}
         */
        this.next = function() {
            return global.select(self.origin.nextElementSibling);
        };

        /**
         * Get the siblings of this element on the same scope level.
         * @returns {nodeList}
         */
        this.siblings = function() {

            var parent = self.parent();
            var children = parent.children();
            var siblings = [];

            children.each(function(node) {
                if(node.tagName() == self.tagName) {
                    siblings.push(node);
                }
            });

            delete parent;
            delete children;

            return new nodeList(siblings);

        };

        /**
         * Check if the element node is within the browser's view port.
         * @returns {boolean}
         */
        this.withinViewPort = function() {

            var bounds, html;

            if(!self.origin || 1 !== self.origin.nodeType) {
                return false;
            }

            html = document.documentElement;
            bounds = self.origin.getBoundingClientRect();

            return (!!bounds && bounds.bottom >= 0 && bounds.right >= 0 && bounds.top <= html.clientHeight && bounds.left <= html.clientWidth);

        };

        /**
         * Insert a node inside the this node.
         * @param _node The node reference.
         * @param index The index we're regex inserting after.
         * @returns {node}
         */
        this.insert = function(_node, index) {
            self.children().array()[index].origin.appendChild(_node instanceof node ? _node.origin : _node);
            return self;
        };

        /**
         * Prepend a node before this node's first child.
         * @param _node The node reference.
         * @returns {node}
         */
        this.prepend = function(_node) {

            if(global.isNode(_node)) {
                _node = _node.origin;
            }

            var children = self.children();

            if(children.size() == 0) {
                self.append(_node);
            } else {
                self.origin.insertBefore(children.first().origin, _node);
            }

            delete children;

            return self;

        };

        /**
         * Append a node to the of this node.
         * @param _node The node reference.
         * @returns {node}
         */
        this.append = function(_node) {

            if(global.isNode(_node)) {
                _node = _node.origin;
            }

            self.origin.appendChild(_node);

            return self;

        };

        /**
         * Append a node after this node.
         * @param _node The node reference.
         * @returns {node}
         */
        this.after = function(_node) {

            if(global.isNode(_node)) {
                _node = _node.origin;
            }

            self.origin.parentNode.insertBefore(_node, self.origin.nextSibling);

            return self;

        };

        /**
         * Hide the element node from the browser.
         * @returns {node}
         */
        this.hide = function() {
            if(self.attribute("style") != null && self.attribute("style").length > 0) {
                self.attribute("data-tip", self.attribute("style"));
            }
            self.attribute("style", "display: none;");
            return self;
        };

        /**
         * Show a hidden element to the browser.
         * @returns {node}
         */
        this.show = function() {
            if(self.attribute("data-tip") != null && self.attribute("data-tip").length > 0) {
                self.attribute("style", self.attribute("data-tip"));
            } else {
                self.css("display", "block");
            }
            return self;
        };

        /**
         * Get the offset of this element.
         * @returns {{top: number, left: number}}
         */
        this.offset = function() {

            var element = self.origin;
            var x = 0;
            var y = 0;

            while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
                x += element.offsetLeft - element.scrollLeft;
                y += element.offsetTop - element.scrollTop;
                element = element.offsetParent;
            }

            return {
                top: y + ( window.pageYOffset || document.documentElement.scrollTop ) - ( document.documentElement.clientTop || 0 ),
                left: x + ( window.pageXOffset || document.documentElement.scrollLeft ) - ( document.documentElement.clientLeft || 0 )
            };

        };

        /**
         * Get the absolute position of this element.
         * @param parent {*=} The relative parent.
         * @returns {{x: number, y: number}}
         */
        this.position = function(parent) {

            var bounds = self.offset();

            if(global.isNode(parent)) {
                var relative = parent.origin.getBoundingClientRect();
                return { x: relative.left - bounds.left, y: relative.top - bounds.top };
            }

            return { x: bounds.left, y: bounds.top };

        };

        /**
         * Get the coordinates of this node relative to the document.
         * @param parent {*=} The relative parent.
         * @returns {{x: number, y: number}}
         */
        this.coordinates = function(parent) {

            var box = self.origin.getBoundingClientRect();

            var body = document.body;
            var documentElement = document.documentElement;

            var scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;

            var clientTop = documentElement.clientTop || body.clientTop || 0;
            var clientLeft = documentElement.clientLeft || body.clientLeft || 0;

            var top = box.top + scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            if(global.isDefined(parent)) {
                var relative = global.isNode(parent) ? parent.coordinates() : global.select(parent);
                return { x: relative.x - Math.round(left), y: relative.y - Math.round(top) };
            }

            return { x: Math.round(left), y: Math.round(top) };

        };

        /**
         * Scroll to the given vertical scroll top.
         * @param top The vertical top.
         * @param time The time in milliseconds.
         * @param easing The easing equation method.
         * @param complete The function called once completed.
         */
        this.scrollTop = function(top, time, easing, complete) {
            global.scrollTop(top, time, easing, complete, self.origin);
        };

        /**
         * Scroll to the given horizontal scroll left.
         * @param left The horizontal left.
         * @param time The time in milliseconds.
         * @param easing The easing equation method.
         * @param complete The function called once completed.
         */
        this.scrollLeft = function(left, time, easing, complete) {
            global.scrollLeft(left, time, easing, complete, self.origin);
        };

        /**
         * Get the rotation of this element.
         * @returns {number}
         */
        this.rotation = function() {

            var transform = self.css("-webkit-transform") ||
                self.css("-moz-transform") ||
                self.css("-ms-transform") ||
                self.css("-o-transform") ||
                self.css("transform"),
                angle = 0;

            if(global.isDefined(transform) && transform != "none") {

                var values = transform.split('(')[1];
                values = values.split(')')[0];
                values = values.split(',');
                var a = values[0];
                var b = values[1];

                var radians = Math.atan2(b, a);
                if(radians < 0) {
                    radians += (2 * Math.PI);
                }

                angle = Math.round(radians * (180 / Math.PI));

            }

            return angle;

        };

        /**
         * Get the options for a select element node.
         * @returns {HTMLOptionsCollection|Function}
         */
        this.options = function() {
            return self.origin.options;
        };

        /**
         * Get the selected option for a select element node.
         * @returns {{value: string, text: string}}
         */
        this.selectedOption = function() {
            return self.options()[self.origin.selectedIndex];
        };

        /**
         * Get the input value.
         * @returns {string|Number|Function}
         */
        this.value = function(value) {
            if(global.isDefined(value)) {
                self.origin.value = value;
            }
            return self.origin.value;
        };

        /**
         * Get the scroll positions for this element node.
         * @param horizontal The horizontal position.
         * @param vertical The vertical position.
         * @returns {{horizontal: number, vertical: number}}
         */
        this.scroll = function(horizontal, vertical) {
            return global.scroll(self, vertical, horizontal);
        };

        /**
         * Get the frame window document.
         * @returns {*}
         */
        this.frameDocument = function() {
            return global.select(self.origin.contentDocument || self.origin.contentWindow.document);
        };

        /**
         * Remove the element node from the DOM.
         */
        this.remove = function() {
            self.origin.parentNode.removeChild(self.origin);
        };

        /**
         * Clear the cached data for this element node.
         */
        this.clear = function() {
            self.clearEvents();
            self.cache = [];
        };

        /**
         * Get a reference to the node's history.
         * @returns {history}
         */
        this.history = function() {
            return _history;
        };

        /**
         * Make a clone with prototype inheritance.
         * @returns {node}
         */
        this.clone = function() {
            return global.clone(self);
        };

        /**
         * Call a function on this node element.
         * @param name The function name.
         * @param _arguments The arguments.
         * @returns {node}
         */
        this.call = function(name, _arguments) {
            self[name].apply(this, _arguments);
            return self;
        };

        if(_arguments['history']) {
            self.history().save();
        }

        delete _origin;

    };

    /**
     * A class function representing a list of nodes.
     * @param _nodes The given nodes for this list.
     */
    var nodeList = function(_nodes) {

        /**
         * The reference to itself.
         * @type {nodeList}
         */
        var self = this;

        /**
         * The list of nodes.
         * @type {Array}
         */
        var nodes = _nodes;

        /**
         * Select all selector matching the given {HTMLElement} node.
         * @param selector The given {HTMLElement} node(s).
         * @param identifier {*=} The selection identifier.
         * @returns {*}
         */
        this.select = function(selector, identifier) {

            if(global.isString(selector)) {
                switch(identifier) {
                    case "id":
                        identifier = function(node) {
                            return node.attribute("id") == selector;
                        };
                        break;
                    case "class":
                        identifier = function(node) {
                            return node.hasClass(selector);
                        };
                        break;
                    case "tag":
                        identifier = function(node) {
                            return node.tagName() == selector.toLowerCase;
                        };
                        break;
                    case "name":
                        identifier = function(node) {
                            return node.attribute("name") == selector;
                        };
                        break;
                    case "query":
                    case "query_all":
                        identifier = function(node) {
                            return global.matchQuery(selector, node);
                        };
                        break;
                    case "css_rule":
                        identifier = function(node) {
                            global.selectCSSRule(selector, node);
                        };
                        break;
                }
            }

            if(global.isFunction(identifier)) {

                var selection = self.filter(identifier);

                if(selection.size() == 1) {
                    return selection.first();
                } else {
                    return selection;
                }

            }

            return null;

        };

        /**
         * A basic iteration function to apply given properties
         * to each selected tagged {@code node} {@code object}.
         * @param _function The function called each iteration.
         * @returns {nodeList}
         */
        this.each = function(_function) {
            for(var i = 0; i < nodes.length; i++) {
                if(_function(nodes[i], i)) {
                    break;
                }
            }
            return self;
        };

        /**
         * Exclude given nodes from the node list.
         * @param nodes The nodes that must be excluded.
         * @returns {nodeList}
         */
        this.exclude = function(nodes) {

            var _nodes = [];
            var _function = null;

            if(global.isArray(nodes)) {

                var origins = [];

                nodes.forEach(function(node) {
                    origins.push(node.origin);
                });

                _function = function(_node) {
                    if(!global.arrayContains(origins, _node.origin)) {
                        _nodes.push(_node);
                    }
                };

            } else {
                _function = function(_node) {
                    if(nodes.origin != _node.origin) {
                        _nodes.push(_node);
                    }
                };
            }

            self.each(_function);

            return new nodeList(_nodes);

        };

        /**
         * Filter the node list from unwanted nodes.
         * @param _function The filter function.
         * @returns {nodeList}
         */
        this.filter = function(_function) {

            var _nodes = [];

            this.each(function(node) {
                if(_function(node)) {
                    _nodes.push(node);
                }
            });

            return new nodeList(_nodes);

        };

        /**
         * Get the first node in the list.
         * @returns {*}
         */
        this.first = function() {
            return nodes[0];
        };

        /**
         * Get the last node in the list.
         * @returns {*}
         */
        this.last = function() {
            return nodes[nodes.length - 1];
        };

        /**
         * Get a node by given index from the list.
         * @param index The given index.
         * @returns {*}
         */
        this.get = function(index) {
            return nodes[index];
        };

        /**
         * Call a function on every node in the list.
         * @param name The function name.
         * @param _arguments The arguments.
         * @returns {Neo.nodeList}
         */
        this.call = function(name, _arguments) {
            this.each(function(node) {
                node[name].apply(this, _arguments)
            });
            return self;
        };

        /**
         * Get the node list as an array.
         * @returns {Array}
         */
        this.array = function() {
            return nodes;
        };

        /**
         * Get the total size of the {nodeList}.
         * @returns {Number}
         */
        this.size = function() {
            return nodes.length;
        };

    };

    /**
     * A class function representing a node's history.
     * @param _node The originating node.
     */
    var history = function(_node) {

        if(!_arguments['history']) {
            return;
        }

        /**
         * The originating node.
         */
        var node = _node;

        /**
         * The node's revisions.
         * @type {Array}
         */
        var revisions = [];

        /**
         * The index offset.
         * @type {number}
         */
        var offset = 0;

        /**
         * Save a current state of the element node.
         * @returns {history}
         */
        this.save = function() {
            revisions.push(new revision(node));
            offset++;
            return this;
        };

        /**
         * Revert an element to its previous state.
         * @param indices The amount of indices back.
         * @returns {history}
         */
        this.revert = function(indices) {

            "use strict";

            if(indices <= 0) {
                throw "The amount of indices you're going back can't equal null or less.";
            }

            var revision = revisions[offset - indices - 1];

            if(!global.isDefined(revision)) {
                throw "There was no revision found in the history.";
            }

            node.clearEvents();

            for(var i = 0, size = node.origin.attributes.length; i < size; i++) {
                node.removeAttribute(node.origin.attributes[0].nodeName, false);
            }

            for(var keys = Object.keys(revision.events), i = 0; i < keys.length; i++) {
                for(var j = 0; j < revision.events[keys[i]].length; j++) {
                    node.bind(keys[i], revision.events[keys[i]][j], false);
                }
            }

            for(var i = 0; i < revision.attributes.length; i++) {
                node.attribute(revision.attributes[i][0], revision.attributes[i][1], false);

            }

            return this;

        };

        /**
         * Get a revision from the element node history.
         * @param index The revision index.
         * @returns {*}
         */
        this.get = function(index) {
            if(!global.isDefined(revisions) || index >= revisions.length) {
                throw "There was no revision found in the history.";
            }
            return revisions[index];
        };

        /**
         * Get the history revision size.
         * @returns {Number}
         */
        this.size = function() {
            return revisions.length;
        };

        /**
         * Clear the kept element node history.
         * @returns {history}
         */
        this.clear = function() {
            revisions = [];
            offset = 0;
            this.save();
            return this;
        };

        delete _node;

    };

    /**
     * A class function serving as a repository for cloned node objects.
     * @param node The originating node.
     */
    var revision = function(node) {

        /**
         * The node's events.
         * @type {Array}
         */
        this.events = [];

        /**
         * The node's attributes.
         * @type {Array}
         */
        this.attributes = [];

        if(global.isDefined(node.events)) {
            for(var keys = Object.keys(node.events), i = 0; i < keys.length; i++) {
                for(var j = 0; j < node.events[keys[i]].length; j++) {
                    this.events[keys[i]] = [];
                    this.events[keys[i]][j] = node.events[keys[i]][j];
                }
            }
        }

        if(!global.isNull(node.origin) && global.isDefined(node.origin.attributes)) {
            for(var i = 0; i < node.origin.attributes.length; i++) {
                var attribute = node.origin.attributes[i];
                this.attributes[i] = [attribute.nodeName, global.isDefined(attribute.value) ? attribute.value : attribute.nodeValue];
                delete attribute;
            }
        }

        delete node;

    };

    /**
     * A class function serving as a utility for AJAX calls.
     * @type {{factories: Function, call: Function}}
     */
    var ajax = {

        /**
         * The factories to try for each browser.
         * @returns {*[]}
         */
        factories: function() {

            "use strict";

            return [
                function() { return new XMLHttpRequest() },
                function() { return new ActiveXObject("Msxml2.XMLHTTP") },
                function() { return new ActiveXObject("Msxml2.XMLHTTP.3.0") },
                function() { return new ActiveXObject("Msxml2.XMLHTTP.6.0") },
                function() { return new ActiveXObject("Msxml3.XMLHTTP") },
                function() { return new ActiveXObject("Microsoft.XMLHTTP") }
            ];

        },

        /**
         * Make an AJAX call request.
         * @param url The uniform resource locator.
         * @param callback The callback function.
         * @param postType If we must use the post type {@code true}.
         */
        call: function(url, callback, postType) {

            var method = postType ? "POST" : "GET";
            var factories = ajax.factories();
            var request = false;

            for(var i= 0; i < factories.length; i++) {
                try {
                    request = factories[i]();
                } catch(e) {
                    continue;
                }
                break;
            }

            if(!request) {
                return;
            }

            request.open(method, url, true);

            if(postType) {
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }

            request.onreadystatechange = function() {
                if(request.readyState != 4) {
                    return;
                }
                callback(request, request.responseText);
            };

            if(request.readyState == 4) {
                return;
            }

            request.send(postType);

        }

    };

    /**
     * A class function serving as a utility to manage cookies.
     * @type {{get: Function, set: Function, remove: Function}}
     */
    var cookies = {

        /**
         * Get a cookie from the browser.
         * @param name The cookie's name.
         * @returns {*}
         */
        get: function(name) {

            var start = document.cookie.indexOf(name + "=" );
            var length = start + name.length + 1;

            if((!start) && (name != document.cookie.substring(0, name.length))) {
                return null;
            }

            if(start == -1) {
                return null;
            }

            var end = document.cookie.indexOf(';', length);

            if(end == -1) {
                end = document.cookie.length;
            }

            return unescape(document.cookie.substring(length, end));

        },

        /**
         * Set a new cookie.
         * @param name The cookie name.
         * @param value The cookie value.
         * @param expires The cookie's expiring time in years.
         * @param path The path.
         * @param domain The domain.
         * @param secure If it must be secure.
         */
        set: function(name, value, expires, path, domain, secure) {

            var today = new Date();

            today.setTime(today.getTime());

            if(expires) {
                expires = expires * 1000 * 60 * 60 * 24;
            }

            var expires_date = new Date(today.getTime() + (expires));

            document.cookie = name+'='+escape(value) +
            ((expires ) ? ';expires='+expires_date.toGMTString() : '') +
            ((path ) ? ';path=' + path : '') +
            ((domain ) ? ';domain=' + domain : '') +
            ((secure ) ? ';secure' : '');

        },

        /**
         * Remove a cookie.
         * @param name The cookie name.
         * @param path The path.
         * @param domain The domain.
         */
        remove: function(name, path, domain) {

            if(cookies.get(name)) {
                document.cookie = name +'=' +
                ((path) ? ';path=' + path : '') +
                ((domain) ? ';domain=' + domain : '') +
                ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
            }

        }

    };

    /**
     * A class function serving as a utility for timestamps.
     * @type {{milliseconds: Function}}
     */
    var timestamp = {

        /**
         * Get the current timestamp in milliseconds.
         * @returns {number}
         */
        milliseconds: function() {
            if(!Date.now) {
                Date.now = function() {
                    return new Date().getTime();
                };
            }
            return Date.now();
        },

        /**
         * Get the current timestamp in seconds.
         * @returns {number}
         */
        seconds: function() {
            return Math.ceil(this.milliseconds() / 1000);
        },

        /**
         * Get the current timestamp in minutes.
         * @returns {number}
         */
        minutes: function() {
            return Math.ceil(this.milliseconds() / (1000 * 60));
        },

        /**
         * Get the current timestamp in hours.
         * @returns {number}
         */
        hours: function() {
            return Math.ceil(this.milliseconds() / (1000 * 60 * 60));
        },

        /**
         * Get the current timestamp in days.
         * @returns {number}
         */
        days: function() {
            return Math.ceil(this.milliseconds() / (1000 * 60 * 60 * 24));
        }

    };

    /**
     * A class function serving as a utility for formatting text.
     * @type {{ellipses: Function}}
     */
    var format = {

        /**
         * Format a string using an ellipses.
         * @param string The string.
         * @param length The maximum length.
         * @returns {string}
         */
        ellipses: function(string, length) {
            return (string.length > length) ? string.substr(0, length) + "..." : string;
        },

        /**
         * Replace all the matching text in a given string.
         * @param string The string.
         * @param subject The subject.
         * @param replacement The replacement.
         * @returns {XML|string|void}
         */
        replaceAll: function(string, subject, replacement) {
            return string.replace(new RegExp(subject, "g"), replacement);
        },

        /**
         * Check if the string starts with the given subject.
         * @param string The string.
         * @param subject The subject.
         * @returns {boolean}
         */
        startsWith: function(string, subject) {
            return string.indexOf(subject) == 0;
        },

        /**
         * Check if the string ends with the given subject.
         * @param string The string.
         * @param subject The subject.
         * @returns {boolean}
         */
        endsWith: function(string, subject) {
            return string.indexOf(subject, string.length - subject.length) !== -1;
        },

        /**
         * Format the string start with an uppercase character.
         * @param string The string.
         * @returns {string}
         */
        uppercaseFirst: function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        /**
         * Highlight given words in a given text.
         * @param text The text we'regex highlighting in.
         * @param words The words to highlight.
         * @param tag {*=} The tag to highlight with.
         * @returns {*}
         */
        highlight: function(text, words, tag) {

            tag = tag || "span";
            var i, len = words.length, replace;

            for(i = 0; i < len; i++) {
                replace = new RegExp(words[i], "g");
                if(replace.test(text)) {
                    text = text.replace(replace, '<'+tag+' class="highlight">$&</'+tag+'>');
                }
            }

            return text;

        },

        /**
         * Un-highlight a given text.
         * @param text The text we'regex un-highlighting.
         * @param tag {*=} The tag used to highlight with.
         * @returns {XML|string|void}
         */
        unhighlight: function(text, tag) {

            tag = tag || "span";
            var replace = new RegExp('(<'+tag+'.+?>|<\/'+tag+'>)', "g");

            return text.replace(replace, "");

        },

        /**
         * Strip a CSS formatted URL.
         * @param text The text.
         * @returns {string}
         */
        stripURL: function(text) {
            return text.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
        },

        /**
         * Convert a text to camel case format.
         * @param text The text.
         * @returns {string}
         */
        camelCase: function(text) {
            text = text.replace(/[^a-zA-Z0-9 ]/g, " ").
                text.replace(/([a-z](?=[A-Z]))/g, '$1 ').
                text.replace(/([^a-zA-Z0-9 ])|^[0-9]+/g, '').trim().toLowerCase().
                text.replace(/([ 0-9]+)([a-zA-Z])/g, function(a,b,c) {
                    return b.trim()+c.toUpperCase();
                });
            return text;
        }

    };

    /**
     * A class function serving as a utility arithmetic functions.
     * @type {{between: Function}}
     */
    var arithmetic = {

        /**
         * Check if a number is between the given length.
         * @param minimum The minimum.
         * @param number The number.
         * @param maximum The maximum.
         * @returns {boolean}
         */
        between: function(minimum, number, maximum) {
            return number > minimum && number < maximum;
        }

    };

    /**
     * A class function utility to convert RGB, RGBA and HEX colors.
     * @param string The color string.
     */
    var color = function(string) {

        "use strict";

        if(string.charAt(0) == "#") {
            string = string.substr(1, 6);
        }

        string = string.replace(/ /g,'').toLowerCase();

        /**
         * The color names with the according color formatted in HEX.
         * @type {{aliceblue: string, antiquewhite: string, aqua: string, aquamarine: string, azure: string, beige: string, bisque: string, black: string, blanchedalmond: string, blue: string, blueviolet: string, brown: string, burlywood: string, cadetblue: string, chartreuse: string, chocolate: string, coral: string, cornflowerblue: string, cornsilk: string, crimson: string, cyan: string, darkblue: string, darkcyan: string, darkgoldenrod: string, darkgray: string, darkgreen: string, darkkhaki: string, darkmagenta: string, darkolivegreen: string, darkorange: string, darkorchid: string, darkred: string, darksalmon: string, darkseagreen: string, darkslateblue: string, darkslategray: string, darkturquoise: string, darkviolet: string, deeppink: string, deepskyblue: string, dimgray: string, dodgerblue: string, feldspar: string, firebrick: string, floralwhite: string, forestgreen: string, fuchsia: string, gainsboro: string, ghostwhite: string, gold: string, goldenrod: string, gray: string, green: string, greenyellow: string, honeydew: string, hotpink: string, indianred: string, indigo: string, ivory: string, khaki: string, lavender: string, lavenderblush: string, lawngreen: string, lemonchiffon: string, lightblue: string, lightcoral: string, lightcyan: string, lightgoldenrodyellow: string, lightgrey: string, lightgreen: string, lightpink: string, lightsalmon: string, lightseagreen: string, lightskyblue: string, lightslateblue: string, lightslategray: string, lightsteelblue: string, lightyellow: string, lime: string, limegreen: string, linen: string, magenta: string, maroon: string, mediumaquamarine: string, mediumblue: string, mediumorchid: string, mediumpurple: string, mediumseagreen: string, mediumslateblue: string, mediumspringgreen: string, mediumturquoise: string, mediumvioletred: string, midnightblue: string, mintcream: string, mistyrose: string, moccasin: string, navajowhite: string, navy: string, oldlace: string, olive: string, olivedrab: string, orange: string, orangered: string, orchid: string, palegoldenrod: string, palegreen: string, paleturquoise: string, palevioletred: string, papayawhip: string, peachpuff: string, peru: string, pink: string, plum: string, powderblue: string, purple: string, red: string, rosybrown: string, royalblue: string, saddlebrown: string, salmon: string, sandybrown: string, seagreen: string, seashell: string, sienna: string, silver: string, skyblue: string, slateblue: string, slategray: string, snow: string, springgreen: string, steelblue: string, tan: string, teal: string, thistle: string, tomato: string, turquoise: string, violet: string, violetred: string, wheat: string, white: string, whitesmoke: string, yellow: string, yellowgreen: string}}
         */
        var color_names = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "00ffff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000000",
            blanchedalmond: "ffebcd",
            blue: "0000ff",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "00ffff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dodgerblue: "1e90ff",
            feldspar: "d19275",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "ff00ff",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred : "cd5c5c",
            indigo : "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgrey: "d3d3d3",
            lightgreen: "90ee90",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslateblue: "8470ff",
            lightslategray: "778899",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "00ff00",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "ff00ff",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370d8",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "d87093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            red: "ff0000",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            violetred: "d02090",
            wheat: "f5deb3",
            white: "ffffff",
            whitesmoke: "f5f5f5",
            yellow: "ffff00",
            yellowgreen: "9acd32"
        };

        for(var key in color_names) {
            if(string == key) {
                string = color_names[key];
            }
        }

        /**
         * The color definitions (for each type).
         * @type {{regex: RegExp, example: string[], process: Function}[]}
         */
        var color_definitions = [

            {
                regex: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
                process: function(bits){
                    return [
                        parseInt(bits[1]),
                        parseInt(bits[2]),
                        parseInt(bits[3])
                    ];
                }
            },

            {
                regex: /^(\w{2})(\w{2})(\w{2})$/,
                example: ['#00ff00', '336699'],
                process: function(bits){
                    return [
                        parseInt(bits[1], 16),
                        parseInt(bits[2], 16),
                        parseInt(bits[3], 16)
                    ];
                }
            },

            {
                regex: /^(\w{1})(\w{1})(\w{1})$/,
                example: ['#fb0', 'f0f'],
                process: function(bits){
                    return [
                        parseInt(bits[1] + bits[1], 16),
                        parseInt(bits[2] + bits[2], 16),
                        parseInt(bits[3] + bits[3], 16)
                    ];
                }
            }

        ];

        /**
         * The RGB color channels.
         */
        var channels;

        for(var i = 0; i < color_definitions.length; i++) {

            var definition = color_definitions[i];
            var regex = definition.regex;
            var processor = definition.process;
            var bits = regex.exec(string);

            if(bits) {

                channels = processor(bits);

                this.red = channels[0];
                this.green = channels[1];
                this.blue = channels[2];

            }

        }

        this.red = (this.red < 0 || isNaN(this.red)) ? 0 : ((this.red > 255) ? 255 : this.red);
        this.green = (this.green < 0 || isNaN(this.green)) ? 0 : ((this.green > 255) ? 255 : this.green);
        this.blue = (this.blue < 0 || isNaN(this.blue)) ? 0 : ((this.blue > 255) ? 255 : this.blue);

        /**
         * Convert the color to RGB syntax.
         * @returns {string}
         */
        this.toRGB = function() {
            return "rgb("+this.red+", "+this.green+", "+this.blue+")";
        };

        /**
         * Convert the color to a hexadecimal.
         * @returns {string}
         */
        this.toHex = function() {

            var red = this.red.toString(16);
            var green = this.green.toString(16);
            var blue = this.blue.toString(16);

            if(red.length == 1) {
                red = "0"+red;
            }

            if(green.length == 1) {
                green = "0"+green;
            }

            if(blue.length == 1) {
                blue = "0"+blue;
            }

            return ("#"+red+green+blue).toUpperCase();

        };

    };

    /**
     * A class function representing a deferred object.
     */
    var deferred = function() {

        /**
         * A reference of the deferred instance.
         * @type {deferred}
         */
        var self = this;

        /**
         * The registered deferred events.
         * @type {Array}
         */
        this.events = [];

        /**
         * Bind a given event to the deferred instance.
         * @param event The event name.
         * @param _function The callback function.
         */
        this.bind = function(event, _function) {
            if(!(event in self.events)) {
                self.events[event] = [];
            }
            self.events[event].push(_function);
        };

        /**
         * Release a success event.
         */
        this.release = function() {
            self.dispatch("success");
        };

        /**
         * Dispatch the fail event.
         */
        this.reject = function() {
            self.dispatch("fail");
        };

        /**
         * Dispatch a deferred related event.
         * @param event The event name.
         */
        this.dispatch = function(event) {
            var events = self.events[event];
            for(var i = 0; i < events.length; i++) {
                events[i]();
            }
        }

    };

    /**
     * The simple linear tween easing equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.linearTween = function(time, start, change, duration) {
        return change * time / duration + start;
    };

    /**
     * The quadratic easing in equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInQuad = function(time, start, change, duration) {
        time /= duration;
        return change * time * time + start;
    };

    /**
     * The quadratic easing out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeOutQuad = function(time, start, change, duration) {
        time /= duration;
        return -change * time * (time - 2) + start;
    };

    /**
     * The quadratic easing in and out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInOutQuad = function(time, start, change, duration) {
        time /= duration / 2;
        if(time < 1) {
            return change /2 * time * time + start;
        }
        time--;
        return -change/2 * (time * (time - 2) - 1) + start;
    };

    /**
     * The ease in in cubic equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInCubic = function(time, start, change, duration) {
        time /= duration;
        return change * time * time * time + start;
    };

    /**
     * The ease out cubic equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeOutCubic = function(time, start, change, duration) {
        time /= duration;
        time--;
        return change * (time * time * time + 1) + start;
    };

    /**
     * The ease in and out cubic equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInOutCubic = function(time, start, change, duration) {
        time /= duration/2;
        if(time < 1) {
            return change / 2 * time * time * time + start;
        }
        time -= 2;
        return change / 2 * (time * time * time + 2) + start;
    };

    /**
     * The quartic easing in equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInQuart = function(time, start, change, duration) {
        time /= duration;
        return change * time * time * time * time + start;
    };

    /**
     * The quartic easing out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeOutQuart = function(time, start, change, duration) {
        time /= duration;
        time--;
        return -change * (time * time * time * time - 1) + start;
    };

    /**
     * The quartic easing in and out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInOutQuart = function(time, start, change, duration) {
        time /= duration / 2;
        if(time < 1) {
            return change / 2 * time * time * time * time + start;
        }
        time -= 2;
        return -change / 2 * (time * time * time * time - 2) + start;
    };

    /**
     * The quintic easing in equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInQuint = function(time, start, change, duration) {
        time /= duration;
        return change * time * time * time * time * time + start;
    };

    /**
     * The quintic easing out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeOutQuint = function(time, start, change, duration) {
        time /= duration;
        time--;
        return change * (time * time * time * time * time + 1) + start;
    };

    /**
     * The quintic easing in out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInOutQuint = function(time, start, change, duration) {
        time /= duration / 2;
        if(time < 1) {
            return change / 2 * time * time * time * time * time + start;
        }
        time -= 2;
        return change / 2 * (time * time * time * time * time + 2) + start;
    };

    /**
     * The sinusoidal easing in equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInSine = function(time, start, change, duration) {
        return -change * Math.cos(time / duration * (Math.PI / 2)) + change + start;
    };

    /**
     * The sinusoidal easing out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeOutSine = function(time, start, change, duration) {
        return change * Math.sin(time / duration * (Math.PI / 2)) + start;
    };

    /**
     * The sinusoidal easing in and out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInOutSine = function(time, start, change, duration) {
        return -change / 2 * (Math.cos(Math.PI * time / duration) - 1) + start;
    };

    /**
     * The exponential easing in equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInExpo = function(time, start, change, duration) {
        return change * Math.pow( 2, 10 * (time / duration - 1)) + start;
    };

    /**
     * The exponential easing out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeOutExpo = function(time, start, change, duration) {
        return change * (-Math.pow( 2, -10 * time / duration) + 1) + start;
    };

    /**
     * The exponential easing in and out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInOutExpo = function(time, start, change, duration) {
        time /= duration / 2;
        if(time < 1) {
            return change / 2 * Math.pow(2, 10 * (time - 1)) + start;
        }
        time--;
        return change / 2 * (-Math.pow(2, -10 * time) + 2) + start;
    };

    /**
     * The circular easing in equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInCirc = function(time, start, change, duration) {
        time /= duration;
        return -change * (Math.sqrt(1 - time * time) - 1) + start;
    };

    /**
     * The circular easing out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeOutCirc = function(time, start, change, duration) {
        time /= duration;
        time--;
        return change * Math.sqrt(1 - time * time) + start;
    };

    /**
     * The circular easing in and out equation.
     * @param time The start time.
     * @param start The start value.
     * @param change The change value.
     * @param duration The duration in time.
     * @returns {*}
     */
    this.easeInOutCirc = function(time, start, change, duration) {
        time /= duration / 2;
        if(time < 1) {
            return -change / 2 * (Math.sqrt(1 - time * time) - 1) + start;
        }
        time -= 2;
        return change / 2 * (Math.sqrt(1 - time * time) + 1) + start;
    };

    if(_arguments['prototypes'] == true) {

        /**
         * Check if an string contains the given needle.
         * @param needle The needle.
         * @returns {boolean}
         */
        String.prototype.contains = function(needle) {
            return global.contains(this, needle);
        };

        /**
         * Format a string using an ellipses.
         * @param length The maximum length.
         * @returns {string}
         */
        String.prototype.ellipses = function(length) {
            return global.format().ellipses(this, length);
        };

        /**
         * Replace all the matching text in a given string.
         * @param subject The subject.
         * @param replacement The replacement.
         * @returns {XML|string|void}
         */
        String.prototype.replaceAll = function(subject, replacement) {
            return global.format().replaceAll(this, subject, replacement);
        };

        /**
         * Check if the string starts with the given subject.
         * @param subject The subject.
         * @returns {boolean}
         */
        String.prototype.startsWith = function(subject) {
            return global.format().startsWith(this, subject);
        };

        /**
         * Check if the string ends with the given subject.
         * @param subject The subject.
         * @returns {boolean}
         */
        String.prototype.endsWith = function(subject) {
            return global.format().endsWith(this, subject);
        };

        /**
         * Format the string start with an uppercase character.
         * @returns {string}
         */
        String.prototype.uppercaseFirst = function() {
            return global.format().uppercaseFirst(this);
        };

        /**
         * Highlight given words in a given text.
         * @param words The words to highlight.
         * @param tag {*=} The tag to highlight with.
         * @returns {*}
         */
        String.prototype.highlight = function(words, tag) {
            return global.format.highlight(this, words, tag);
        };

        /**
         * Un-highlight a given text.
         * @param tag {*=} The tag used to highlight with.
         * @returns {XML|string|void}
         */
        String.prototype.unhighlight = function(tag) {
            return global.format().unhighlight(this, tag);
        };

        /**
         * Strip a CSS formatted URL.
         * @param text The text.
         * @returns {string}
         */
        String.prototype.stripURL = function() {
            return global.format().stripURL(this);
        };

        /**
         * Convert a text to camel case format.
         * @returns {string}
         */
        String.prototype.camelCase = function() {
            return global.format().camelCase(this);
        };

        /**
         * Convert the current string to an array.
         * @returns {Object}
         */
        String.prototype.toArray = function() {
            return global.stringToArray(this);
        }

    }

    window.NeoJS = this;

};