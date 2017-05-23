(function() {
    'use strict';

    var zk = window.zk = {};
}());

(function() {
    'use strict';

    var ns = window.zk.auto = (window.zk.auto || {}),
        kentekenREG = [
	    /^[a-zA-Z]{2}[\d]{2}[\d]{2}$/,//XX-99-99
    	    /^[\d]{2}[\d]{2}[a-zA-Z]{2}$/,//99-99-XX
    	    /^[\d]{2}[a-zA-Z]{2}[\d]{2}$/,//99-XX-99
    	    /^[a-zA-Z]{2}[\d]{2}[a-zA-Z]{2}$"/,//XX-99-XX
    	    /^[a-zA-Z]{2}[a-zA-Z]{2}[\d]{2}$/,//XX-XX-99
    	    /^[\d]{2}[a-zA-Z]{2}[a-zA-Z]{2}$/,//99-XX-XX
    	    /^[\d]{2}[a-zA-Z]{3}[\d]{1}$/,//99-XXX-9
    	    /^[\d]{1}[a-zA-Z]{3}[\d]{2}$/,//9-XXX-99
    	    /^[a-zA-Z]{2}[\d]{3}[a-zA-Z]{1}$/,//XX-999-X
    	    /^[a-zA-Z]{1}[\d]{3}[a-zA-Z]{2}$///X-999-XX
    	],
    	diplomatREG = /^CD[ABFJNST][0-9]{1,3}$/, // except diplomats, for example: CDB1 of CDJ45
        version = 1,
	    lp_input = null,
	    formUrl = "&licensePlateInput=%kenteken%",
	    noLPformUrl = "";

	function buildUrl(kenteken, version) {
		if (kenteken)
	    	return formUrl.replace("%kenteken%", kenteken);
		else
			return noLPformUrl;
	}

	function checkKenteken(input) {
		for (var i=0;i<kentekenREG.length;i++) {
	        var arr = input.match(kentekenREG[i]);
            if (arr) {
                return (i + 1).toString();
            }
	    }
        if (input.match(diplomatREG)) {
            return 'CD';
        }
		return false;
	}

	function formatKenteken(ind, input) {
	    var format = "";
	    switch (ind) {
	        case "1":case "2":case "3":case "4":case "5":case "6":
	            format = input.substr(0,2) + "-" + input.substr(2,2) + "-" + input.substr(4,2);
	            break;
            case "7":case "9":
	            format = input.substr(0,2) + "-" + input.substr(2,3) + "-" + input.substr(5,1);
	            break;
            case "8":case "10":
	            format = input.substr(0,1) + "-" + input.substr(1,3) + "-" + input.substr(4,2);
	            break;
	    }
	    return format;
	}

	ns.init = function() {

	    lp_input = $("input[name='licensePlateInput']");

	    $(".autoform").submit(function(e) {
            e.preventDefault();

    		var value = lp_input.val().replace(/\-|\ /g,"").toUpperCase();

            var add =  buildUrl(value, version);
                       
            window.open(generateURL('https://autopremie.centraalbeheer.nl/AutoVerzekering/Stap1/','cross','zka','lp-auto','referrer','49545') + add);
    	    
    		return false;
    	});
    	    	

    	lp_input.keydown(function(evt) {
    	    var len = $(this).val().length;
            if(len > 8) {
                $(this).val($(this).val().substring(0,8));
            }
    	}).keyup(function() {
    		var value = lp_input.val().replace(/\-|\ /g,"").toUpperCase();
    		var format = formatKenteken(checkKenteken(value), value);
    		if (format)
    			$(this).val(format);
    	});
    }
}());

(function() {
    'use strict';

    var ns = window.zk.wonen = (window.zk.wonen || {}),
        version = 1,
	    huisnummer = null,
	    postal = null,
	    toevoeging = null,
	    geboortedatum = null,
	    kostbaarheden = null,
	    allrisks = null,
	    aansprakelijkheid = null,
	    formUrl = "&pg_pstcd=%1%&pg_hsnr=%2%&pg_hsnrtv=%3%&werkgevernr=49545",
	    studentUrl = "https://www.centraalbeheer.nl/verzekeringen/woonverzekering/premie-berekenen/Paginas/Stap-1.aspx?pg_pstcd=%1%&pg_hsnr=%2%&pg_hsnrtv=%3%&pg_aankam=1&pg_huueig=1&pg_riedak=2&pg_typwon=Kamerbewoning&pg_gebdtm=%4%&werkgevernr=49545&pg_premieper=Maand&inboedel=1&inbdl_dek=35000&inbdl_bvl=Geen&opstal=0&opstl_dek=0&eigenaarsbelang=0&eigbl_dek=0&aansprakelijkheid=%5%&aanspr_dek=1000000&aanspr_gzn=TweeVolwassenenMetKinderen&allrisk=%6%&tuin=0&tuin_dek=0&pechhulp=0&ongevallen=0&ongvl_dek=0&ongvl_gzn=TweeVolwassenenMetKinderen&kostbaarheden=%7%&kstbr_dek=1000&glas=0&actiecode=&stap=Stap-2";

	function buildUrl(obj) {
		return formUrl.replace("%1%", obj.postal).replace("%2%", obj.number).replace("%3%", obj.toevoeging);
	}
	
	function buildStudentUrl(obj) {
		return studentUrl.replace("%1%", obj.postal).replace("%2%", obj.number).replace("%3%", obj.toevoeging).replace("%4%", obj.gebdatum).replace("%5%", obj.aansprakelijkheid).replace("%6%", obj.allrisks).replace("%7%", obj.kostbaarheden);
	}

	ns.init = function() {
    	huisnummer = $('input[name="huisnummer"]');
	    postal = $('input[name="postcode"]');
	    toevoeging = $('input[name="toevoeging"]');
	    geboortedatum = $('input[name="geboortedatum"]');
	    kostbaarheden = $('input[name="kostbaarheden"]');
	    allrisks = $('input[name="allrisks"]');
	    aansprakelijkheid = $('input[name="aansprakelijkheid"]');

    	$(".woonform, .jsWoonForm").submit(function(e) {
            e.preventDefault();
            
    		var add = buildUrl({
    		    postal:postal.val().replace(/\-|\ /g,""),
    		    number:huisnummer.val(),
    		    toevoeging:toevoeging.val()
    		});

    		var _dataCre = "lp-woon";

    		if(typeof dataCre !== "undefined") {
    			_dataCre = dataCre;
    		}

            window.location.href = generateURL('https://www.centraalbeheer.nl/verzekeringen/woonverzekering/premie-berekenen/Paginas/stap-1.aspx','cross','zka', _dataCre,'referrer','49545') + add;

    		return false;
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

    	$('input[name="huisnummer"]').keyup(function() {
            var returnString = "",
                regex = /[0-9]|\./,
                anArray = $(this).val().split('');

            for(var i=0; i<anArray.length; i++) {
                if(!regex.test(anArray[i]))
                {
                    anArray[i] = '';
                }
            }
            for(var i=0; i<anArray.length; i++) {
                returnString += anArray[i];
            }
            $(this).val(returnString);
    	});
	}
}());



(function() {
    'use strict';

    var ns = window.zk.recht = (window.zk.recht || {}),
        version = 1,
        formUrl = "https://www.centraalbeheer.nl/rechtsbijstandverzekering/premie-berekenen";

    ns.init = function() {
        
        $(".rechtform").submit(function(e) {
    		e.preventDefault();
    		 window.location.href = generateURL(formUrl,'cross','zka','new-lp-mp-rbv','referrer','49545', 'werkgevernr=49545');

    		return false;
    	});
    }
}());

$(document).ready(function() {
    
	zk.auto.init();
	zk.wonen.init();
	zk.recht.init();
	
});

$(function(){

    $(".external").click(function(e) {
        e.preventDefault();
        window.open(this.href);
    });
});


