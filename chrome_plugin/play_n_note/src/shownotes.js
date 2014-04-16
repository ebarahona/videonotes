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

function showNotes(notesHTML, vId, gId, delimiter, notesData) {
    if ($("#dialog")) {
        $("#dialog").html('');
        $("#dialog").remove();
    }

    var scriptElem = document.createElement('script');
    scriptElem.type = "text/javascript";
    var vardefs = "var notes_public, sort_instant; ";
    var moveToStr = "function moveTo(toTime) {if (window.QL_player != null) {window.QL_player.mediaelement_handle.setCurrentTime(toTime);} else if ($('me_flash_0') != null) {$('me_flash_0').setCurrentTime(toTime);}} ";
    var deleteNoteStr = "function deleteNote(prms) {  noteId = prms.split('$')[0]; uId1  = prms.split('$')[1]; uId2 = prms.split('$')[2];  vId = prms.split('$')[3] + '$' + prms.split('$')[4]; uId = '' + uId1 + uId2; $.ajax({type: 'GET', url: 'http://localhost:3000/deleteNoteExtn',data: {gId: uId, noteId: noteId, vId: vId}}); $('#cmt' + noteId).remove();} ";
    var toggleLockStr = "function toggleLock(uIdvId) { uId = uIdvId.split('$')[0]; vId = uIdvId.split('$')[1] + '$' + uIdvId.split('$')[2]; if ($('#lockall' ).attr('src').indexOf('open') > -1) { notes_public = false; $( \"img[id^='lock']\" ).attr('src', 'http://localhost:3000/images/lock_closed.png'); $.ajax({type: 'GET', url: 'http://localhost:3000/toggleVideoNotesExtn',data: {open:0, uId: uId, vId: vId}});} else { notes_public = true; $( \"img[id^='lock']\" ).attr('src', 'http://localhost:3000/images/lock_open.png'); $.ajax({type: 'GET', url: 'http://localhost:3000/toggleVideoNotesExtn',data: {open:1, uId: uId, vId: vId}});}} ";
    var toggleLockOneStr = "function toggleLockOne(uId1, uId2, i) { uId = '' + uId1 + uId2; if ($('#lock'+i).attr('src').indexOf('open') > -1) { $('#lock'+i).attr('src', 'http://localhost:3000/images/lock_closed.png'); $.ajax({type: 'GET', url: 'http://localhost:3000/toggleNoteExtn',data: {open:0, uId: uId, noteId: i}});} else {$('#lock'+i).attr('src', 'http://localhost:3000/images/lock_open.png'); $.ajax({type: 'GET', url: 'http://localhost:3000/toggleNoteExtn',data: {open:1, uId: uId, noteId: i}});}} ";
    var toggleSortStr = "function toggleTimeSort(gIdvId) { gId = gIdvId.split('$')[0]; cId = gIdvId.split('$')[1]; lId = gIdvId.split('$')[2]; if (sort_instant == undefined || sort_instant == 1) { sort_instant = 0; $.ajax({type: 'GET', dataType: 'json', url: 'http://localhost:3000/getNotesExtn', data: {open:1, sortby: 'instant', googleId: 's' + gId + 's', lId: lId, cId: cId}, success: function(data) { alert(JSON.stringify(data)); createTableData(data, cId + '$' + lId, 's' + gId + 's'); } }); $('#sorticon').attr('src','http://localhost:3000/images/lock_closed.png'); } else {sort_instant=1; $.ajax({type: 'GET', dataType: 'json', url: 'http://localhost:3000/getNotesExtn', data: {open:-1, sortby: 'instant', googleId: 's' + gId + 's', lId: lId, cId: cId}, success: function(data) { alert(JSON.stringify(data)); createTableData(data, cId + '$' + lId, 's' + gId + 's'); } }); $('#sorticon').attr('src', 'http://localhost:3000/images/clock.png');}} ";

    scriptElem.innerHTML = vardefs + moveToStr + deleteNoteStr + toggleLockStr + toggleLockOneStr + toggleSortStr;
    document.body.appendChild(scriptElem);

    var divElem = document.createElement('div');
    divElem.setAttribute('id', 'dialog');
    divElem.setAttribute('title', 'Play-n-Note');
    divElem.setAttribute('style', 'position: absolute; left: 12px; top: 9px; z-index: 1000000; display: block; height: 30px; width:294px; border-top-left-radius: 2px; border-top-right-radius: 2px; -webkit-transition: background-color 200ms ease; transition: padding-right: 5px; background-color: #D2D5D6; background-position: initial initial; background-repeat: initial initial;');
    
    len = window.QL_player.mediaelement_handle.options.keyActions.length;
    for (i=0; i < len; i++) {
        delete window.QL_player.mediaelement_handle.options.keyActions[i];
    }
    window.QL_player.mediaelement_handle.enableKeyboard = false;
    window.QL_player.mediaelement_handle.options.keyActions = null;

    divElem.innerHTML = notesHTML;

    if ($(".course-modal-frame")) {
        $(".course-modal-frame").after(divElem);
    } else if ($(".course-modal-frame.course-modal-frame-with-slides")) {
        $(".course-modal-frame.course-modal-frame-with-slides").after(divElem);
    }

    if (notesData !== "" && notesData.length > 0) {
        notes = notesData.split(delimiter);
        i=0;
        $("tr[id^='cmt'] > td > a").each( function(index) {
            if ($(this).attr("href").indexOf("deleteNote") > -1) {
                $(this).after("&nbsp;" + unescape(notes[i]) + "&nbsp;");
                i++;
            }
        });
    }
    
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
                    charval = "_";
                else
                    charval = "-";
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
        } else if (e.keyCode == 8) { //backspace = 8
            if ($("#commentsTxt").val().length < 2) { //one or zero character left for backspace
                if (window.QL_player != null) {
                    window.QL_player.mediaelement_handle.play();
                } else if ($('me_flash_0') != null) {
                    $('me_flash_0').playMedia();
                }
                instant = 0;
            }            
        } else if (e.keyCode == 13) { //Enter = 13
            if (window.QL_player != null) {
                window.QL_player.mediaelement_handle.play();
            } else if ($('me_flash_0') != null) {
                $('me_flash_0').playMedia();
            }
            text = $("#commentsTxt").val();
            timenow = new Date().getTime();
            if ($.trim(text) != "") {
                uId = "" + gId; //put the s back together 
                uId1 = uId.substring(1, 10);
                uId2 = uId.substring(10, uId.length-1);
                prms = "'" + timenow + "$" + uId1  + "$" + uId2 + "$" + vId + "'";
                content = '<a style="font-size:10px;z-index:1000000;padding-right:0px;" href="javascript:deleteNote(' + prms +')"><img src="http://localhost:3000/images/deletecomment.png" alt="Delete"/></a> &nbsp;' + text + '&nbsp;<a style="float:right" href=javascript:moveTo(' + instant + '); >' + instant + 's</a> &nbsp;<a href=javascript:toggleLockOne(' + uId1 + ',' + uId2 + ',"' + timenow + '")><img width=16 height=16 id="lock' + timenow + '" src="http://localhost:3000/images/lock_closed.png" style="float:right"/></a>';
                if ($("#notesTbl > tbody > tr").length == 0 ) {
                    $('<tr bgcolor="white" id="cmt' + timenow + '"><td>' + content + '</td></tr>').insertAfter($('table > tbody'));
                } else {
                    if ($("#notesTbl > tbody > tr").length % 2 == 0 ) {
                        $('<tr bgcolor="white" id="cmt' + timenow + '"+><td>' + content + '</td></tr>').insertBefore($('table > tbody > tr:first'));
                    } else {
                        $('<tr bgcolor="grey" id="cmt' + timenow + '"+><td>' + content + '</td></tr>').insertBefore($('table > tbody > tr:first'));
                    }
                }
                text = text.replace(/\n/g, '<br>').trim();
                $.support.cors = true;
                
                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:3000/submitNoteExtn',
                    dataType: 'json',
                    data: {googleId: gId, videoURL: vId, comments: escape(text), noteId: timenow, instant: instant, ispublic: false}
                  });
                text = "";                
            }
            $("#commentsTxt").val('');
            shiftOn = false;
            instant = 0; //resetting the instant
            return false;
        }
        shiftOn = false;

    });

    $(".icon-remove").on('click', function(event) { $("#dialog").remove();});    

    $("#dialog").dialog({
      title: "Play-n-Note",
      //dialogClass: "no-close",
      autoOpen: false,
      height: 350,
      width: 400,
      draggable: true,
      position: [0,0],  
      //zIndex: 1000000, //this option is deprecated in jquery UI 1.10
      modal: false
    });
    
    $("#dialog").open();
    
}

function createTableData(data, vId, uId) {
    var tableData = "";
    var ispublic = false;
    var len = 0;
    if (data != "") {
      len = data.length;
      ispublic = data[len-1].ispublic;
    }

    if (ispublic == 'true')
        lockicon = "lock_open.png";
    else
        lockicon = "lock_closed.png";

    tableHeaders = "<table id='notesTbl' style='table-layout:fixed; padding-right:0px;width=100%; word-wrap:break-word' class='table table-striped table-bordered table-condensed'>";
    tableHeaders += "<thead><tr bgcolor='white' ><td>";
    tableHeaders += "&nbsp;<a href=javascript:toggleTimeSort('" + uId.substring(1,uId.length-1) + "$" + vId + "') alt='Sort By Instant/Timestamp'><img width=16 height=16 id='sorticon' src='http://localhost:3000/images/clock.png' style='float:right'/></a>&nbsp;";
    tableHeaders += "&nbsp;<a href=javascript:toggleLock('" + uId.substring(1,uId.length-1) + "$" + vId + "') alt='Latest Comments'><img width=16 height=16 id='lockall' src='http://localhost:3000/images/" + lockicon + "' style='float:right'/></a>&nbsp;";
    tableHeaders += "</td></tr></thead><tbody>";
    
    //NOTE: escape single quote in comments to avoid JSON failure
    
    for(i = 0; i < len-1; i++) {
      uId = "s" + data[i].googleId + "s"; //put the s back together 
      uId1 = uId.substring(1, 10);
      uId2 = uId.substring(10, uId.length-1);
        if (data[i].ispublic == true)
            lockicon = "lock_open.png";
        else
            lockicon = "lock_closed.png";
      prms = "'" + data[i].noteId + "$" + uId1  + "$" + uId2 + "$" + vId + "'";
      if (i%2 == 0) {
        tableData = tableData + "<tr bgcolor='white' id='cmt" + data[i].noteId + "'><td><a style='font-size:10px;z-index:1000000;padding-right:0px;' href=javascript:deleteNote(" + prms + ")><img src='http://localhost:3000/images/deletecomment.png' alt='Delete'/></a><a  style='float:right' href=javascript:moveTo(" + data[i].instant + "); alt='Delete'>" + data[i].instant + "s</a> &nbsp;<a href='javascript:toggleLockOne(" + uId1  + ", " + uId2 + ", " + data[i].noteId + ")'><img width=16 height=16 id='lock" + data[i].noteId + "' src='http://localhost:3000/images/" + lockicon + "' style='float:right'/></a></td></tr>";
      }else{
        tableData = tableData + "<tr bgcolor='grey' id='cmt" + data[i].noteId + "'><td><a style='font-size:10px;z-index:1000000;padding-right:0px;' href=javascript:deleteNote(" + prms + ")><img src='http://localhost:3000/images/deletecomment.png' alt='Delete'/></a><a style='float:right' href=javascript:moveTo(" + data[i].instant + "); alt='Delete'>" + data[i].instant + "s</a> &nbsp;<a href='javascript:toggleLockOne(" + uId1  + ", " + uId2 + ", " + data[i].noteId + ")'><img width=16 height=16 id='lock" + data[i].noteId + "' src='http://localhost:3000/images/" + lockicon + "' style='float:right'/></a></td></tr>";
      }
    }
    tableEnd = "</tbody></table>";
    var commentHTML = "<textarea id='commentsTxt' placeholder='Write a note ... ' width='100%' style='margin:30px 0 0 0;min-height:104px;width:294px;background-color:#fcfbf7;border:none;outline:none;overflow-y:visible;resize:none!important;border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border-bottom-left-radius: 0px; font-size:12px;line-height:18px;word-wrap:break-word;'></textarea>";
    tableData = commentHTML + tableHeaders + tableData + tableEnd;
    return tableData;
}

var delimiter = "" + Math.random().toString(36).substring(0,5);
var notesHTML = "";
var dataStr = "";
if (notes === undefined || notes === 'undefined' || notes == "") {
    notesHTML = createTableData("", ids.vId, ids.gId);
} else {
    data = JSON.parse(notes.notesData);
    notesHTML = createTableData(data, ids.vId, ids.gId);
    var dataStr = "";
    for (i=0; i<data.length-1; i++) {
        if (i > 0)
            dataStr += delimiter;
        dataStr += data[i].comments;
    }
}

var cssHTML = "<div id='dlghdr1' style='height:30px;border-radius:2px 2px 0 0;position:relative;z-index:2;-webkit-transition:background-color 200ms ease;padding-right:5px;' class='_dragHandle'>";
cssHTML += "<span id='closeDlg' style='float:right;height:20px;width:20px; 50% 50% no-repeat;margin:5px 4px 0 0;cursor:pointer;display:none;'></span>";
var endDiv = "</div>";
notesHTML = cssHTML + notesHTML + endDiv;
var injected = false;
injectScript(showNotes, notesHTML, ids.vId, ids.gId, delimiter, dataStr);