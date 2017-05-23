if(typeof Neo !== "undefined") {

    (function($) {

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


    })(new Neo({ enable_history: false }));

}