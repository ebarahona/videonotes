//////////////////////////////////////////////////////////////////////////////////////////////
// Copyright(C) 2010 Abdullah Ali, voodooattack@hotmail.com                                 //
//////////////////////////////////////////////////////////////////////////////////////////////
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php       //
//////////////////////////////////////////////////////////////////////////////////////////////
 
function injectScript(source)
{
     
    // Utilities
    var isFunction = function (arg) { 
        return (Object.prototype.toString.call(arg) == "[object Function]"); 
    };
     
    var jsEscape = function (str) { 
        // Replaces quotes with numerical escape sequences to
        // avoid single-quote-double-quote-hell, also helps by escaping HTML special chars.
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
        // We're dealing with a function, prepare the arguments.
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
 
    // insert the element into the DOM (it starts to execute instantly)
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

function showNotes(notesHTML) {
    //delete the existing data
    if ($("#dialog")) {
        $("#dialog").html('');
        $("#dialog").remove();
    }
    var divElem = document.createElement('div');
    divElem.setAttribute('id', 'dialog');
    divElem.setAttribute('title', 'Play-n-Note');
    divElem.innerHTML = notesHTML;

    if ($(".course-modal-frame")) {
        $(".course-modal-frame").after(divElem);
    } else if ($(".course-modal-frame.course-modal-frame-with-slides")) {
        $(".course-modal-frame.course-modal-frame-with-slides").after(divElem);
    }

    $("#dialog" ).dialog({
      dialogClass: "no-close",
      autoOpen: false,
      height: 350,
      position: [0,0],  
      zIndex: 1000000, //crucial to make the dialog box visible
      modal: false
    });

    $("#dialog").dialog('open');

    var capsOn = false;
    var shiftOn = false;
    var pauseFn = "0";
    var playFn = "1";
    var instant = 0;
    $("#commentsTxt").keydown(function (e) { //this should take care of special characters not being trapped.
        if (instant == 0) {
            if (window.QL_player != null) {
                window.QL_player.mediaelement_handle.pause();
                instant = window.QL_player.mediaelement_media.currentTime;
            } else if ($('me_flash_0') != null) {
                $('me_flash_0').pauseMedia();
                instant = $('me_flash_0').currentTime();
            }
            instant = Math.round(parseFloat(instant));
        }


        if (e.keyCode == 67 || e.keyCode == 70 || e.keyCode == 72 || e.keyCode == 80 || e.keyCode == 187 || e.keyCode == 189 || e.keyCode == 191) { 
            //c=67, f=70, h=72, p=80 
            if (e.keyCode == 67) {
                if (shiftOn == true || capsOn == true) 
                    charval = "C";
                else
                    charval = "c";
            } else if (e.keyCode == 70) {
                if (shiftOn == true || capsOn == true) 
                    charval = "F";
                else
                    charval = "f";
            } else if (e.keyCode == 72) {
                if (shiftOn == true || capsOn == true) 
                    charval = "H";
                else
                    charval = "h";
            } else if (e.keyCode == 80) {
                if (shiftOn == true || capsOn == true) 
                    charval = "P";
                else
                    charval = "p";
            }  else if (e.keyCode == 187) { 
                if (shiftOn == true) 
                    charval = "+";
                else
                    charval = "=";
            } else if (e.keyCode == 189) { 
                if (shiftOn == true) 
                    charval = "-";
                else
                    charval = "_";
            } else if (e.keyCode == 191) { 
                if (shiftOn == true) 
                    charval = "?";
                else
                    charval = "/";
            }
            $("#commentsTxt").val($("#commentsTxt").val() + charval);
            shiftOn = false;
            return false;
        } else if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 27 || e.keyCode == 107 || e.keyCode == 109) { 
            //up = 38, down = 40, left = 37, right = 39, esc = 27, + = 107, - = 109
            shiftOn = false;
            return false;
        } else if (e.keyCode == 20) { //caps lock = 20
            capsOn = !capsOn;
            shiftOn = false;
            return false;
        } else if (e.keyCode == 16) { //shift key = 16
            shiftOn = true;
            return false;
        } else if (e.keyCode == 13) { //Enter = 13
            text = $("#commentsTxt").val();
            content = '<a style="font-size:10px"><img src="http://localhost:3000/images/deletecomment.png" alt="Delete"/></a> &nbsp;' + text + '&nbsp;<a href=javascript:moveTo(' + instant + '); alt="Delete">' + instant + 's</a>';
            if ($("#notesTbl > tbody > tr").length > 0) {
                $('<tr><td>' + content + '</td></tr>').insertBefore($('table > tbody > tr:first'));
            } else {
                $('<tr><td>' + content + '</td></tr>').insertAfter($('table > tbody'));
            }
            $("#commentsTxt").val('');
            if (window.QL_player != null) {
                window.QL_player.mediaelement_handle.play(); 
            } else if ($('me_flash_0') != null) {
                $('me_flash_0').playMedia();
            }
            shiftOn = false;
            instant = 0; //resetting the instant
            return false;
        }
        
    });
}

function createTableData(data) {
    var tableData = "";
    tableHeaders = "<table id='notesTbl' class='table table-striped table-bordered table-condensed'><tbody>";
    var len = data.length;
    //NOTE: escape single quote in comments to avoid JSON failure
    for(i = len-1; i > 0; i--) {
      tableData = tableData + "<tr id='cmt" + (len-i-1) + "'><td><a style='font-size:10px' href='javascript:deleteNote(" + data[i].noteId + ")'><img src='http://localhost:3000/images/deletecomment.png' alt='Delete'/></a> &nbsp;" + data[i].comments + "&nbsp;<a href=javascript:moveTo(" + data[i].instant + "); alt='Delete'>" + data[i].instant + "s</a></td></tr>";
    }
    tableEnd = "</tbody></table>";
    var commentHTML = "<textarea id='commentsTxt' width='100%'></textarea><p></p>";
    tableData = commentHTML + tableHeaders + tableData + tableEnd;
    //alert(tableData);
    return tableData;
}

data = JSON.parse(notes.notesData);
var notesHTML = createTableData(data);
injectScript(showNotes, notesHTML);