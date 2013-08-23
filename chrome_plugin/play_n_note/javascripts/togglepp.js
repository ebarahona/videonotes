function injectScript(source)
{
    var isFunction = function (arg) { 
        return (Object.prototype.toString.call(arg) == "[object Function]"); 
    };
     
    var jsEscape = function (str) { 
        if (!str || !str.length) return str;
        // use \W in the square brackets if you have trouble with any values.
        var r = /['"<>\/]/g, result = "", l = 0, c; 
        do{    c = r.exec(str);
            result += (c ? (str.substring(l, r.lastIndex-1) + "\\x" + 
                c[0].charCodeAt(0).toString(16)) : (str.substring(l)));
        } while (c && ((l = r.lastIndex) > 0))
        return (result.length ? result : str);
    };
 
    var bFunction = isFunction(source);
    var elem = document.createElement("script");    // create the new script element.
    var script, ret, id = "";
 
    if (bFunction)
    {
        var args = [];
 
        for (var i = 1; i < arguments.length; i++)
        {
            var raw = arguments[i];
            var arg;
 
            if (isFunction(raw))    // argument is a function.
                arg = "eval(\"" + jsEscape("(" + raw.toString() + ")") + "\")";
            else if (Object.prototype.toString.call(raw) == '[object Date]') // Date
                arg = "(new Date(" + raw.getTime().toString() + "))";
            else if (Object.prototype.toString.call(raw) == '[object RegExp]') // RegExp
                arg = "(new RegExp(" + raw.toString() + "))";
            else if (typeof raw === 'string' || typeof raw === 'object') // String or another object
                arg = "JSON.parse(\"" + jsEscape(JSON.stringify(raw)) + "\")";
            else
                arg = raw.toString(); // Anything else number/boolean
 
            args.push(arg);    // push the new argument on the list
        }
 
        // generate a random id string for the script block
        while (id.length < 16) id += String.fromCharCode(((!id.length || Math.random() > 0.5) ?
            0x61 + Math.floor(Math.random() * 0x19) : 0x30 + Math.floor(Math.random() * 0x9 )));
 
        // build the final script string, wrapping the original in a boot-strapper/proxy:
        script = "(function(){var value={callResult: null, throwValue: false};try{value.callResult=(("+
            source.toString()+")("+args.join()+"));}catch(e){value.throwValue=true;value.callResult=e;};"+
            "document.getElementById('"+id+"').innerText=JSON.stringify(value);})();";
 
        elem.id = id;
    }
    else // plain string, just copy it over.
    {
        script = source;
    }
 
    elem.type = "text/javascript";
    elem.innerHTML = script;
 
    document.head.appendChild(elem);
 
    if (bFunction)
    {
        // get the return value from our function:
        ret = JSON.parse(elem.innerText);
 
        // remove the now-useless clutter.
        elem.parentNode.removeChild(elem);
 
        // make sure the garbage collector picks it instantly. (and hope it does)
        delete (elem);
 
        // see if our returned value was thrown or not
        if (ret.throwValue)
            throw (ret.callResult);
        else
            return (ret.callResult);
    }
    else // plain text insertion, return the new script element.
        return (elem);
}

var flashPauseStatus;

function togglePlayPause() {
    if (window.QL_player != null) {
    	if(window.QL_player.mediaelement_media.paused) {
    		window.QL_player.mediaelement_handle.play(); 
    	}else{
    		window.QL_player.mediaelement_handle.pause(); 
    	}
    } else if ($('me_flash_0') != null) {
        if (flashPauseStatus == undefined || flashPauseStatus == true) {
            flashPauseStatus = false;
            $('me_flash_0').playMedia();
        } else if (flashPauseStatus == false) {
            flashPauseStatus = true;
            $('me_flash_0').pauseMedia();
        } 
    }
}

injectScript(togglePlayPause);
