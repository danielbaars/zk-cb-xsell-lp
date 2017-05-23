/**
 * Get the GET parameters from URL
 *    
 * @return paramstring string
 **/
function getSearchParameters() {
  var prmstr = window.location.search.substr(1);
  return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}


/**
 * Transform the paramstring to array object
 *  
 * @return params array object
 **/
function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}


/**
 * Returns ? if none in string else return &
 *  
 * @return string
 **/
function questionOrAmpersand(string) {
	if (string.indexOf('?') === -1) {
		return '?';
	} 
	if ( string.slice(-1) != '?') {
		return '&';
	} else {
		return '';
	}
}


/**
 * Generate the complete URL
 *  
 * @return paramstring string
 **/
function generateURL(url, CID, PLA, CRE, TYPE, werkgever, extra) {
	var params = getSearchParameters();
	var getString = questionOrAmpersand(url);

	// overrule default employer ID is EmployerID is set by 'auto widget webservice'.
	var employerID = $('body').data('EmployerID');
	if($('body').data('EmployerID')) {
		werkgever = employerID;
	}
	
	if ( werkgever !== '' ) {

        getString = getString.replace('werkgevernr=' + werkgever, '');
        getString = getString.replace('wgid=' + werkgever, '');

		getString += questionOrAmpersand(getString);
		getString += 'wgid=' + werkgever;
		getString += questionOrAmpersand(getString);
		getString += 'werkgevernr=' + werkgever;

        if (typeof extra !== 'undefined' && extra != '') {
            // werkgever not in extra or error serverside
            extra = extra.replace('werkgevernr=' + werkgever, '');
        }

	}

	if (typeof params.CID !== 'undefined') {
		getString += questionOrAmpersand(getString);
		getString += 'CID=' + params.CID;
	} else {
		if (CID !== '') {
			getString += questionOrAmpersand(getString);
			getString += 'CID=' + CID;
		}
	}

	if (typeof params.PLA !== 'undefined') {
		getString += questionOrAmpersand(getString);
		getString += 'PLA=' + params.PLA;
	} else {
		if (PLA !== '') {
			getString += questionOrAmpersand(getString);
			getString += 'PLA=' + PLA;
		}
	}

	if (typeof params.CRE !== 'undefined') {
		getString += questionOrAmpersand(getString);
		getString += 'CRE=' + params.CRE;
	} else {
		if (CRE !== '') {
			getString += questionOrAmpersand(getString);
			getString += 'CRE=' + CRE;
		}
	}

	if (typeof params.TYPE !== 'undefined') {
		getString += questionOrAmpersand(getString);
		getString += 'TYPE=' + params.TYPE;
	}  else {
		if (TYPE !== '') {
			getString += questionOrAmpersand(getString);
			getString += 'TYPE=' + TYPE;
		}
	}

	if (typeof extra !== 'undefined'  && extra != '') {
		getString += questionOrAmpersand(getString);
		getString += extra;
	}

	var utmDefaults = {utm_source:null, utm_medium:null, utm_content:null, utm_campaign:null};
	$.each(utmDefaults, function (key) {
		//First apply the speedtrap defaults:
		if (typeof speedtrapDefaults !== 'undefined') {
			utmDefaults[key] = speedtrapDefaults[key];
		}

		//Then overwrite them with the URL params:
		if (typeof params[key] !== "undefined") {
			utmDefaults[key] = params[key];
		}

		value = utmDefaults[key];

		//If a key ended up with a value, continue:
		if(value) {
			//console.log('self.appendUrlParams: KEY=' + key);
			var re = new RegExp("[?&]" + key + "=");
			//Check the parameter we want to set, does not exist in the url yet.
			if (value !== "" && !re.test(url) && !re.test(getString) ) {
				getString += questionOrAmpersand(getString);
				getString += encodeURIComponent(key) + "=" + encodeURIComponent(value);
			}
		}
	});

	return url + getString;
}


/**
 * Create a Link Url and redirect the user to it
 *  
 * @return baseurl string
 **/
function Link(url, CID, PLA, CRE, TYPE, werkgever, extra) {
    window.location.href = generateURL(url, CID, PLA, CRE, TYPE, werkgever, extra);            
}