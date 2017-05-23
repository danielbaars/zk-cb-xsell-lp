if(typeof Neo !== "undefined") {

    (function($) {

        var widgets = $.select(".widget--house", "query_all");
        var body = $.select("body");

        widgets.each(function(widget) {

            var address_inputs = widget.select(".form__address-inputs input:not([type=\"submit\"])", "query_all");
            var form = widget.select("form");

            address_inputs.call("bind", [ "focus", function() {

                if(!widget.hasClass("open")) {

                    body.append($.create("div").addClass("semi-layer").bind("click", function(e) {
                        e.node.remove();
                        widget.removeClass("open");
                        widget.select("[data-required=\"open\"]", "query_all").call("removeAttribute", [ "required" ]);
                    }));
                    widget.addClass("open");
                    widget.select("[data-required=\"open\"]", "query_all").call("attribute", [ "required", "required" ]);

                }

            } ]);

            form.bind("submit", function(e) {

                var error = false;
                var inputs = form.select("input[required][pattern]", "query_all");

                inputs.each(function(input) {

                    var pattern = new RegExp(input.attribute("pattern"));

                    if(!pattern.test(input.value())) {

                        error = true;

                        var message = $.create("div").addClass("error-dialog");
                        message.css("background", "#FFF")
                        .css("position", "absolute")
                        .css("box-shadow", "0 0 5px rgba(0, 0, 0, 0.5)")
                        .css("color", "#000")
                        .css("font", "normal normal 14px sans-serif")
                        .css("border-radius", "3px")
                        .css("padding", "10px")
                        .css("margin-top", "10px")
                        .css("z-index", 300);
                        var triangle = $.create("div");
                        triangle.css("width", 0)
                        .css("height", 0)
                        .css("border-style", "solid")
                        .css("border-width", "0 7.5px 8px 7.5px")
                        .css("border-color", "transparent transparent #FFF transparent")
                        .css("line-height", 0)
                        .css("_border-color", "#000 #000 #FFF #000")
                        .css("_filter", "progid:DXImageTransform.Microsoft.Chroma(color='#000')")
                        .css("position", "absolute")
                        .css("top", "-8px")
                        .css("left", "10px");   
                        message.append(triangle);
                        var title = $.create("h3");
                        title.css("font", "normal normal 16px sans-serif");
                        title.inner("Vul alstublieft dit veld in.");
                        message.append(title);
                        var text = $.create("span");
                        text.inner(input.attribute("title"));
                        message.append(text);
                        
                        input.after(message);
                        input.origin.focus();

                        return true;

                    }

                    return false;

                });

                if(error) {
                    e.preventDefault();
                }

            });

        });

        body.bind([ "click", "keydown", "webkitvisibilitychange", "msvisibilitychange" ], function() {

            var dialogs = $.select(".error-dialog", "query_all");

            if($.isDefined(dialogs) && dialogs.size() > 0) {
                dialogs.call("remove");
            }

        });

        var keys = [ "wgid", "werkgevernr", "CID", "PLA", "CRE", "TYPE", "PRO", "extra", "utm_source", "utm_medium", "utm_content", "utm_campaign", "kostbaarheden", "inboedel", "allrisk", "schadeverzekering_inzittenden" ];

        $.select("a:not([data-ignore])", "query_all").each(function(link) {

            var apply = function(key) {

                var value = $.getURLParameter(key).length == 0 ? (link.hasAttribute("data-"+key.toLowerCase()) ? link.attribute("data-"+key.toLowerCase()) : window["data_"+key.toLowerCase()]) : $.getURLParameter(key);

                if($.isDefined(value) && value.length > 0) {
                    if(link.attribute("href") != null && link.attribute("href").toString().indexOf("?") === -1) {
                        link.attribute("href", link.attribute("href")+"?"+key+"="+value);
                    } else {
                        link.attribute("href", link.attribute("href")+"&"+key+"="+value);
                    }
                }

            }

            for(var i = 0; i < keys.length; i++) {
                apply(keys[i]);
            }

        });

        $.select("form", "query_all").each(function(form) {

            var apply = function(key) {

                var value = $.getURLParameter(key).length == 0 ? (form.hasAttribute("data-"+key.toLowerCase()) ? form.attribute("data-"+key.toLowerCase()) : window["data_"+key.toLowerCase()]) : $.getURLParameter(key);

                if($.isDefined(value) && value.length > 0) {

                    var input = $.create("input");

                    input.attribute("type", "hidden");
                    input.attribute("name", key);
                    input.value(value);

                    form.append(input);

                }

            };

            for(var i = 0; i < keys.length; i++) {
                apply(keys[i]);
            }

        });

        var names = [ [ "postcode", "pg_pstcd" ], [ "huisnummer", "pg_hsnr" ], [ "toevoeging", "pg_hsnrtv" ] ];

        for(var i = 0; i < names.length; i++) {

            var key = $.getURLParameter(names[i][0]);

            if(key.length > 0) {
                $.select("input[name=\""+names[i][1]+"\"]", "query_all").call("value", [ encodeURI(key) ]);
            }

        }

        $.select("form__tip", "class").call("bind", [ "click", function(e) {

            e.preventDefault();

        } ]);

    })(new Neo({ enable_history: false }));

}

if(typeof jQuery !== "undefined") {

    $('.widget--house .form__tip[title]').tooltipster({
        minWidth: 250,
        maxWidth: 250
    });

}