/**
 *
 * Custom widget for ZKA
 *
 * @author 		Ken van den Broek
 * @copyright 	All intellectual property rights are reserved.
 * @category  	JavaScript
 *
 */

(function($) {
    'use strict';

    var woonWidget;

    woonWidget = function(element, options){
        options = $.extend($.fn.customWoonWidget.defaults, options);

        var ns = ns || {},
            version = 1,
            zc_input = null,
            housenumber = null,
            zipcode = null,
            extension = null,
            birthdate = null,
            houseType = null,
            roofTopType = null,
            nrOfRooms = null,
            isOwner = null,
            containerWidth = $('.container').width(),
            formUrl = "&pg_pstcd=%1%&pg_hsnr=%2%&pg_hsnrtv=%3%&werkgevernr=49545",
            studentUrl = "https://www.centraalbeheer.nl/verzekeringen/woonverzekering/premie-berekenen/Paginas/Stap-1.aspx?pg_pstcd=%1%&pg_hsnr=%2%&pg_hsnrtv=%3%&pg_aankam=1&pg_huueig=1&pg_riedak=2&pg_typwon=Kamerbewoning&pg_gebdtm=%4%&werkgevernr=49545&pg_premieper=Maand&inboedel=1&inbdl_dek=35000&inbdl_bvl=Geen&opstal=0&opstl_dek=0&eigenaarsbelang=0&eigbl_dek=0&aansprakelijkheid=%5%&aanspr_dek=1000000&aanspr_gzn=TweeVolwassenenMetKinderen&allrisk=%6%&tuin=0&tuin_dek=0&pechhulp=0&ongevallen=0&ongvl_dek=0&ongvl_gzn=TweeVolwassenenMetKinderen&kostbaarheden=%7%&kstbr_dek=1000&glas=0&actiecode=&stap=Stap-2";

        function buildWoonUrl() {

            var queryString = buildWoonQueryString();
            var woonurl = generateURL(options.url, options.CID, options.PLA, options.CRE, options.TYPE, options.werkgever, options.extra) + queryString;
			window.location.href = woonurl;
            return woonurl;
        }

        function buildStudentUrl(obj) {
            return studentUrl.replace("%1%", obj.postal).replace("%2%", obj.number).replace("%3%", obj.toevoeging).replace("%4%", obj.gebdatum).replace("%5%", obj.aansprakelijkheid).replace("%6%", obj.allrisks).replace("%7%", obj.kostbaarheden);
        }

        ns.init = function() {

            zc_input = $(".widget-opener input[name='postcode']");
			
            zc_input.unbind('focus').bind('focus', function() {
				ns.initWidget('.widget-postcode');
			});
			
            $(".widget-opener input[name='huisnummer']").unbind('focus').bind('focus', function() {
				ns.initWidget('.widget-huisnummber');
			});
            $(".widget-opener input[name='toevoeging']").unbind('focus').bind('focus', function() {
				ns.initWidget('.widget-toevoeging');
			});
			
			
            $(".widget-toevoeging").unbind('keyup').bind('keyup', function() {
				$(".widget-opener input[name='toevoeging']").val($(this).val());
			});
			
            $(".widget-huisnummer").unbind('keyup').bind('keyup', function() {
				$(".widget-opener input[name='huisnummer']").val($(this).val());
			});			
	        
			$(".widget-postcode").unbind('keyup').bind('keyup', function() {
				$(".widget-opener input[name='postcode']").val($(this).val());
			});		
			


            $('.tooltip-housetype').tooltipster({
                content: $(".tooltip-housetype").attr('data-tooltip'),
                // setting a same value to minWidth and maxWidth will result in a fixed width
                minWidth: 250,
                maxWidth: 250
            });

            $('.tooltip-houserooms').tooltipster({
                content: $(".tooltip-houserooms").attr('data-tooltip'),
                minWidth: 250,
                maxWidth: 250
            });

            $(".studentform").submit(function(e) {
                e.preventDefault();

                window.location.href = buildStudentUrl({
                    postal:postal.val().replace(/\-|\ /g,""),
                    number:huisnummer.val(),
                    toevoeging:toevoeging.val(),
                    gebdatum:geboortedatum.val(),
                    aansprakelijkheid:String((aansprakelijkheid.is(':checked'))?1:0),
                    allrisks:String((allrisks.is(':checked'))?1:0),
                    kostbaarheden:String((kostbaarheden.is(':checked'))?1:0)
                });

                return false;
            });

            $(window).unbind('resize').on('resize',function(evt){
                if (containerWidth >= 750) {
                    ns.closeWidget();
                }
            });
        }


        ns.initWidget = function (focusTarget) {
            var layer = $('<div class="semi-layer">');
            var innerWidget = $('.pop-out-widget .inner-widget-container');
            var innerWidgetPostalInput = $('.pop-out-widget .inner-widget-container input[name=innerWidgetPostalCode]');
            var innerMainWidget = $('.pop-out-widget .inner-widget-container .main-widget');
            var damageFreeYearsPopup = $('.inner-widget-container-damage');
            var originalHeight = innerMainWidget.height();

            if (!$('body > .semi-layer').length) {
                $('body').prepend(layer);
                innerWidget.addClass('open').show();
                innerMainWidget.animate({ height: 'auto' }, 500);
                innerMainWidget.css('height', 'auto');

                if (!$('.semi-layer').is(':visible')) {
                    innerMainWidget.height(originalHeight);
                }
                $('.jsWoonForm ' + focusTarget).focus();
				$('.jsWoonForm ' + focusTarget).select();
            }

            $('body').off('click.layer').on('click.layer', '.semi-layer', function () {
                innerWidget.removeClass('open').hide();
                damageFreeYearsPopup.hide();
                innerMainWidget.height(originalHeight);
                $('body .semi-layer').remove();
            });

            $(".jsSubmitWoonForm").click(function(e) {
                $('.jsWoonForm .error').removeClass('error');
                $('.error-message-list').empty();
                var errorMessages = ns.validateWoonForm();
                if ($.isEmptyObject(errorMessages)) {
                    $('.widget-error-container').hide();
                } else {
                    innerMainWidget.animate({ height: 'auto' }, 500);
                    $(".widget-error-container").show();
                    var errorListElement = $(".error-message-list");
                    $.each(errorMessages, function(errorMessageKey, errorMessage) {
                        //error message key represents the id of the field where the errormessage is specified for
                        $('.jsWoonForm ' + '#' + errorMessageKey).addClass('error');
                        errorListElement.append($("<li></li>").html(errorMessage));
                    });
                }

                e.preventDefault();
                if ($.isEmptyObject(errorMessages)) {
                    var woonurl = buildWoonUrl();
                    window.location.href = woonurl;
                }
            });
        }

        ns.closeWidget = function(){
            $('.inner-widget-container').parent().attr('style','');
            if ($('.inner-widget-container').hasClass('open')) {
                $('.inner-widget-container').removeClass('open').hide();
                $('.semi-layer').remove();
            }
        }

        function buildWoonQueryString() {
            var queryString = '';

            isOwner = (isOwner == 'Ja') ? "Eigenaar" : "Huurder";
            queryString = queryString.concat('&pg_pstcd=' + zipcode);
            queryString = queryString.concat('&pg_hsnr=' + housenumber);
            queryString = queryString.concat('&pg_hsnrtv=' + extension);
            queryString = queryString.concat('&pg_typwon=' + houseType);
            queryString = queryString.concat('&pg_aankam=' + nrOfRooms);
			queryString = queryString.concat('&pg_riedak=' + (roofTopType == 'rietenDak' ? 1 :0));
            queryString = queryString.concat('&pg_huueig=' + isOwner);
            queryString = queryString.concat('&pg_gebdtm=' + birthdate);
			
            queryString += "&pg_premieper=maand&inboedel=true&opstal=true&eigenaarsbelang=false&aansprakelijkheid=false&glas=false&tuin=false&pechhulp=false&ongevallen=false&kostbaarheden=false&allrisk=true&inbdl_bvl=4&inbdl_dek=100000.00&eigbl_dek=null&opstl_dek=350000.00&aanspr_dek=1000000.00&aanspr_gzn=4&tuin_dek=10000.00&ongvl_gzn=4&ongvl_dek=1&kstbr_dek=1000.00&stap=Stap-2";

            return queryString;
        }

        ns.validateWoonForm = function() {
		
            var queryString = buildWoonQueryString();

            var _element = $($(element).children().get(0));
			
            housenumber = _element.find('.widget-huisnummer').val();
            zipcode = _element.find('.widget-postcode').val();
            extension = _element.find('.widget-toevoeging').val();
            birthdate = _element.find('.widget-geboortedatum').val();
            houseType = _element.find('select[name=housetype]').val();
            roofTopType = _element.find('input:radio[name=rooftype]:checked').val();
            nrOfRooms = _element.find('.widget-kamers').val();
            isOwner = _element.find('input:radio[name=houseowner]:checked').val();

            console.log(housenumber+" - "+zipcode+" - "+extension+" - "+birthdate+" - "+houseType+" - "+roofTopType+" - "+nrOfRooms+" - "+isOwner);

            var errorMessages = {};

            if (zipcode == "") {
                errorMessages['postcode'] = errorMessageCollectionHouse['zipcode_missing'];
            } else if (!isValidZipcode(zipcode)) {
                errorMessages['postcode'] = errorMessageCollectionHouse['zipcode_not_valid'];
            }
            else{
                var zipcodeFormated = zipcode.slice(0,4) + "%20" + zipcode.slice(4,6);
                zipcode = zipcodeFormated;
            }

            if (housenumber == "") {
                errorMessages['huisnummer'] = errorMessageCollectionHouse['housenumber_missing'];
            } else if (!isValidHousenumber(housenumber)) {
                errorMessages['huisnummer'] = errorMessageCollectionHouse['housenumber_not_valid'];
            }
			
			/*
            if (extension != "" && !isValidHousenumberExtension(extension)) {
                errorMessages['toevoeging'] = errorMessageCollectionHouse['extension_not_valid'];
            }*/

            if (houseType == "" || houseType == undefined) {
                errorMessages['housetype'] = errorMessageCollectionHouse['housetype_missing'];
            }

            if (nrOfRooms == "") {
                errorMessages['houserooms'] = errorMessageCollectionHouse['houserooms_missing'];
            } else if (!isValidHouseroomValue(nrOfRooms)) {
                errorMessages['houserooms'] = errorMessageCollectionHouse['houserooms_not_valid'];
            }

            if (roofTopType == undefined || roofTopType == "") {
                errorMessages['rooftype'] = errorMessageCollectionHouse['rooftype_missing'];
            }

            if (isOwner == undefined || isOwner == "") {
                errorMessages['houseowner'] = errorMessageCollectionHouse['houseowner_missing'];
            }

            if (birthdate == "" || birthdate == undefined) {
                errorMessages['birthdate'] = errorMessageCollectionHouse['birthdate_missing'];
            } else if (!isValidBirthdate(birthdate)) {
                errorMessages['birthdate'] = errorMessageCollectionHouse['birthdate_not_valid'];
            }

            return errorMessages;
        }

        var errorMessageCollectionHouse = $.parseJSON('{"zipcode_missing":"Postcode is een verplicht veld","zipcode_not_valid":"Postcode heeft niet het juiste formaat","housenumber_missing":"Huisnummer is een verplicht veld","housenumber_not_valid":"Huisnummer heeft niet het juiste formaat","extension_not_valid":"Toevoeging heeft niet het juiste formaat","housetype_missing":"Type woning is een verplicht veld","houserooms_missing":"Vul het aantal kamers in","rooftype_missing":"Type dakbedekking is een verplicht veld","houseowner_missing":"Geef aan of u de eigenaar bent van het huis","birthdate_missing":"Geboortedatum mist","birthdate_not_valid":"Geboortedatum is niet valide"}');
        var errorMessageCollectionAuto = $.parseJSON('{"zipcode_missing":"Postcode is een verplicht veld","zipcode_not_valid":"Postcode heeft niet het juiste formaat","licenseplate_missing":"Kenteken is een verplicht veld","licenseplate_not_valid":"Kenteken heeft niet het juiste formaat","birthdate_missing":"Geboortedatum mist","birthdate_not_valid":"Geboortedatum is niet valide","damagefreeyears_not_valid": "Schadevrije jaren heeft geen geldige waarde"}');

        var isValidZipcode = function (zipcode) {
            var regex = /^[1-9][0-9]{3} ?[a-z]{2}$/i;
            return regex.test(zipcode);
        }

        var isValidHousenumber = function (housenumber) {
            var regex = /^[0-9]+$/i;
            return regex.test(housenumber);
        }

        var isValidHousenumberExtension = function(extension) {
            var regex = /^[0-9A-z]{1,4}$]/i;
            return regex.test(extension);
        }

        var isValidHouseroomValue = function(nrOfRooms) {
            var regex = /^[0-9]+$/;
            return regex.test(nrOfRooms);
        }

        var isValidBirthdate = function(birthdate) {
            var regex = /^[0-3]?[0-9]-[01]?[0-9]-[1-9][0-9]{3}$/;
			if(regex.test(birthdate)) {
				var tmp = birthdate.split('-');
				if(tmp[0] > 0 && tmp[0] < 32 && tmp[1] > 0 && tmp[1] < 13) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}	
        }

        var isValidDamageFreeYearsValue = function(damagefreeyears) {
            var regex = /^[0-9]+/i;
            return regex.test(damagefreeyears);
        }

        var someFunction = function(someVar) {
            var regex = /^[0-9a-z]{2}-?[0-9a-z]{2,3}-?[0-9a-z]{1,2}$/i;
            return regex.test(someVar);
        }

        var isValidLicensePlate = function(licensePlate) {
            var regex = /^[0-9a-z]{2}-?[0-9a-z]{2,3}-?[0-9a-z]{1,2}$/i;
            return regex.test(licensePlate);

        }

        ns.init();
    }

    $.fn.customWoonWidget = function(options) {
        return this.each(function(){
            var element, widget;

            element = $(this);

            if (element.data('customWidget')) {
                return element.data('customWidget');
            }

            widget = new woonWidget(this, options);

            element.data('customWidget', widget);
        });
    };

    var theCRE = $(".jsSubmitWoonForm").closest('form').attr('data-cre');
    if (typeof theCRE == 'undefined' || theCRE==''){
        theCRE = 'lp-woon';
    }

    $.fn.customWoonWidget.defaults= {
        url: 'https://www.centraalbeheer.nl/verzekeringen/woonverzekering/premie-berekenen/Paginas/stap-1.aspx',
        CID: 'cross',
        PLA: 'zka',
        CRE: theCRE,
        TYPE: 'referrer',
        werkgever: '49545',
        extra: ''
    };

    $(function() {

        $('.zka-tooltip').tooltip({});

    });

})(jQuery);

if(typeof Neo !== "undefined") {

    (function($) {

        var widgets = $.select("[data-widget=\"woonWidget\"]", "query_all");
        var body = $.select("body");

        widgets.each(function(widget) {

            var inputs = widget.select(".widget-opener input", "query_all");
            var container = widget.select(".inner-widget-container");

            inputs.call("bind", [ "focus", function(e) {

                var target = e.node;
                var name = target.attribute("name");

                body.append($.create("div").addClass("semi-layer"));
                container.addClass("open").css("display", "block").select("input[name=\""+name+"\"]").origin.focus();

            } ]);

        });

    })(new Neo({ enable_history: false }));

}