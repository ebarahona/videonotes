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

function showNotes(notesHTML, vId, gId, delimiter, notesData, notesTxtData) {
    if ($("#dialog1")) {
        $("#dialog1").html('');
        $("#dialog1").remove();
    }
    //var SERVER_URL = 'https://playnnote.herokuapp.com';
    var SERVER_URL = 'http://localhost:3000';
    var RESOURCE_DOMAIN = 'https://playnnote.herokuapp.com';

    var tab_url = window.location.href;
    var source_url = tab_url.substring(0,tab_url.lastIndexOf("/")) + "/view?lecture_id=" + tab_url.substring(tab_url.lastIndexOf("/")+1);
    
    $.ajax({
      type: 'GET',
      url: source_url,
      dataType: 'html',
      success: function(data) {
        var sources = [];
        var start_index = 0, open_start_index, close_start_index;
        var sources_count = 0;
        while (data.indexOf("<source", start_index) > -1) {
            open_start_index = data.indexOf("<source", start_index);
            close_start_index = data.indexOf(">", open_start_index);
            sources[sources_count++] = data.substring(open_start_index, close_start_index+1);
            start_index = close_start_index;
        }

        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: SERVER_URL + '/getSourceVideosExtn',
            data: {url: window.location.href, title: $('title').html(), source_tags: sources.join()},
            success: function(data){
                console.log('course video created');
            }
        });

        }
    });


    $(".icon-remove").on('click', function(event) { $("#dialog1").remove();}); 

    var fnsExist = false;
    if (document.getElementById("fns") != null) {
        rows_hidden = undefined;
        sort_instant = undefined;
    } else {

        var styleElem = document.createElement('style');
        styleElem.type = "text/css";
        styleElem.innerText = ".uploadcare-dialog-tab:before,.uploadcare-dialog-tab:hover:before,.uploadcare-dialog-disabled-tab:hover:before{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/tab-icons.png\")}.uploadcare-dialog-tab_current:before,.uploadcare-dialog-tab_current:hover:before{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/tab-icons-active.png\")}.uploadcare-crop-widget .jcrop-vline,.uploadcare-crop-widget .jcrop-hline{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/crop-border-bg.gif\")}.uploadcare-dialog-file-sources:before{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/arrow.png\")}.uploadcare-crop-widget--loading{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/loading-spinner.gif\");background-size:25px 25px}.uploadcare-dpm-file-remove{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/remove-button.png\")}.uploadcare-dpm-file-error:before{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/error-icon.png\")}.uploadcare-dpm-file-preview{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/file-icon.png\")}.uploadcare-dialog-error-tab-illustration{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/error-default.png\")}.uploadcare-dialog-error-tab-image .uploadcare-dialog-error-tab-illustration{background-image:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/error-image.png\")}.uploadcare-dialog{background:url(\"http://ucarecdn.com/widget/1.0.0/uploadcare/images/dialog-overlay.png\");background:rgba(48,48,48,0.7)}html.uploadcare-dialog-opened{overflow:hidden}.uploadcare-dialog{font-family:\"Helvetica Neue\",Helvetica,Arial,\"Lucida Grande\",sans-serif;position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;overflow:auto;white-space:nowrap;text-align:center}.uploadcare-dialog:before{display:inline-block;vertical-align:middle;content:'';height:100%;position:static;width:0}.uploadcare-dialog *{margin:0;padding:0}.uploadcare-dialog .uploadcare-dialog-panel{border-radius:8px;-webkit-box-shadow:0 1px 2px rgba(0,0,0,0.35);-moz-box-shadow:0 1px 2px rgba(0,0,0,0.35);box-shadow:0 1px 2px rgba(0,0,0,0.35)}.uploadcare-dialog{-webkit-transition:opacity .25s cubic-bezier(0.05,0.7,0.25,1);-moz-transition:opacity .25s cubic-bezier(0.05,0.7,0.25,1);transition:opacity .25s cubic-bezier(0.05,0.7,0.25,1);opacity:0}.uploadcare-dialog .uploadcare-dialog-inner-wrap{-webkit-transition:-webkit-transform .25s cubic-bezier(0.05,0.7,0.25,1);-moz-transition:-moz-transform .25s cubic-bezier(0.05,0.7,0.25,1);transition:transform .25s cubic-bezier(0.05,0.7,0.25,1);-webkit-transform:scale(0.8);-moz-transform:scale(0.8);transform:scale(0.8);-webkit-transform-origin:50% 100%;-moz-transform-origin:50% 100%;transform-origin:50% 100%}.uploadcare-dialog.uploadcare-active{opacity:1}.uploadcare-dialog.uploadcare-active .uploadcare-dialog-inner-wrap{-webkit-transform:none;-moz-transform:none;transform:none}.uploadcare-dialog-inner-wrap{display:inline-block;vertical-align:middle;white-space:normal;text-align:left;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;width:100%;min-width:760px;max-width:944px;margin:0 auto;padding:0 33px 0 11px}.uploadcare-dialog-close{width:33px;height:33px;line-height:33px;font-size:29.7px;font-weight:bold;color:#fff;cursor:pointer;position:absolute;text-align:center;right:0}.uploadcare-dialog-panel{overflow:hidden;position:relative;background:#efefef;font-weight:normal}.uploadcare-dialog-tabs{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;width:75px;height:616px;float:left;background:#dee0e1;border-right:1px solid #c5cace}.uploadcare-dialog-tab{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;height:56px;position:relative;border-bottom:1px solid #c5cace;cursor:pointer}.uploadcare-dialog-tab .uploadcare-dialog-icon,.uploadcare-dialog-tab:before{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;top:50%;left:50%;display:inline-block;width:50px;height:50px;margin:-25px;opacity:.66}.uploadcare-dialog-tab:before{content:''}.uploadcare-dialog-tab:hover{background-color:#e5e7e8}.uploadcare-dialog-tab:hover .uploadcare-dialog-icon{opacity:1}.uploadcare-dialog-tab:hover:before{opacity:1}.uploadcare-dialog-tab_current{margin-right:-1px;border-right:1px solid #efefef}.uploadcare-dialog-tab_current,.uploadcare-dialog-tab_current:hover{background-color:#efefef}.uploadcare-dialog-tab_current .uploadcare-dialog-icon{opacity:1}.uploadcare-dialog-tab_current:before{opacity:1}.uploadcare-dialog-tab_hidden{display:none!important}.uploadcare-dialog-disabled-tab{cursor:default}.uploadcare-dialog-disabled-tab:hover{background-color:#dee0e1}.uploadcare-dialog-tab-preview:before{display:none}.uploadcare-dialog-tab-file:before{background-position:0 -50px}.uploadcare-dialog-tab-url:before{background-position:0 -100px}.uploadcare-dialog-tab-facebook:before{background-position:0 -150px}.uploadcare-dialog-tab-dropbox:before{background-position:0 -200px}.uploadcare-dialog-tab-gdrive:before{background-position:0 -250px}.uploadcare-dialog-tab-instagram:before{background-position:0 -300px}.uploadcare-dialog-tab-vk:before{background-position:0 -350px}.uploadcare-dialog-tab-evernote:before{background-position:0 -400px}.uploadcare-dialog-tab-box:before{background-position:0 -450px}.uploadcare-dialog-tab-skydrive:before{background-position:0 -500px}.uploadcare-dialog-tabs-panel{position:relative;display:none;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;margin-left:75px;height:616px;line-height:22px;font-size:16px;color:black}.uploadcare-dialog-tabs-panel .uploadcare-dialog-input{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;width:100%;height:44px;margin-bottom:22px;padding:11px 12.5px;font-family:inherit;font-size:16px;border:1px solid #c5cace;background:white;color:black}.uploadcare-dialog-tabs-panel_current{display:block}.uploadcare-pre{white-space:pre;font-family:monospace;margin:22px auto;padding:22px 25px;background-color:white;border:1px solid #c5cace;border-radius:3px;text-align:left;font-size:15px;line-height:22px}.uploadcare-dialog-footer{font-size:13px;text-align:center;color:#ddd;margin:15px}.uploadcare-dialog .uploadcare-dialog-footer a{color:#c2c2c2;text-decoration:none}.uploadcare-dialog .uploadcare-dialog-footer a:hover{text-decoration:underline}.uploadcare-dialog-title{font-size:22px;line-height:1;margin-bottom:22px}.uploadcare-dialog-title.uploadcare-error{color:red}.uploadcare-dialog-title2{font-size:20px;line-height:1;padding-bottom:11px}.uploadcare-dialog-big-title{font-size:40px;font-weight:bold;line-height:1em;margin-bottom:50px}.uploadcare-dialog-label{font-size:15px;line-height:25px;margin-bottom:12.5px;word-wrap:break-word}.uploadcare-dialog-large-text{font-size:20px;font-weight:normal;line-height:1.5em}.uploadcare-dialog-large-text .uploadcare-pre{display:inline-block;font-size:18px}.uploadcare-dialog-section{margin-bottom:22px}.uploadcare-dialog-normal-text{font-size:13px;color:#545454}.uploadcare-dialog-button{display:inline-block;font-size:13px;line-height:31px;padding:0 12.5px;margin-right:.5em;border:solid 1px;border-radius:3px;cursor:pointer;color:#444}.uploadcare-dialog-button,.uploadcare-dialog-button[disabled]:active,.uploadcare-dialog-button.uploadcare-disabled-el:active,.uploadcare-dialog-button[disabled]:hover,.uploadcare-dialog-button.uploadcare-disabled-el:hover{background:#f3f3f3;background:-webkit-linear-gradient(whitesmoke,#f1f1f1);background:-moz-linear-gradient(whitesmoke,#f1f1f1);background:linear-gradient(whitesmoke,#f1f1f1);-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;border-color:gainsboro}.uploadcare-dialog-button:hover{background:#f8f8f8;background:-webkit-linear-gradient(#fbfbfb,#f6f6f6);background:-moz-linear-gradient(#fbfbfb,#f6f6f6);background:linear-gradient(#fbfbfb,#f6f6f6);-webkit-box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05);box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05)}.uploadcare-dialog-button:active{background:#f3f3f3;background:-webkit-linear-gradient(whitesmoke,#f1f1f1);background:-moz-linear-gradient(whitesmoke,#f1f1f1);background:linear-gradient(whitesmoke,#f1f1f1);-webkit-box-shadow:inset 0 2px 2px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 2px 2px rgba(0,0,0,0.05);box-shadow:inset 0 2px 2px rgba(0,0,0,0.05)}.uploadcare-dialog-button[disabled],.uploadcare-dialog-button.uploadcare-disabled-el{cursor:default;opacity:.6}.uploadcare-dialog-button:active,.uploadcare-dialog-button:hover{border-color:#cbcbcb}.uploadcare-dialog-button-success{display:inline-block;font-size:13px;line-height:31px;padding:0 12.5px;margin-right:.5em;border:solid 1px;border-radius:3px;cursor:pointer;color:white}.uploadcare-dialog-button-success,.uploadcare-dialog-button-success[disabled]:active,.uploadcare-dialog-button-success.uploadcare-disabled-el:active,.uploadcare-dialog-button-success[disabled]:hover,.uploadcare-dialog-button-success.uploadcare-disabled-el:hover{background:#3786eb;background:-webkit-linear-gradient(#3b8df7,#347fdf);background:-moz-linear-gradient(#3b8df7,#347fdf);background:linear-gradient(#3b8df7,#347fdf);-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;border-color:#266fcb}.uploadcare-dialog-button-success:hover{background:#3279d6;background:-webkit-linear-gradient(#3986ea,#2c6dc2);background:-moz-linear-gradient(#3986ea,#2c6dc2);background:linear-gradient(#3986ea,#2c6dc2);-webkit-box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05);box-shadow:inset 0 -1px 3px rgba(0,0,0,0.05)}.uploadcare-dialog-button-success:active{background:#3177d3;background:-webkit-linear-gradient(#3680e1,#2c6fc5);background:-moz-linear-gradient(#3680e1,#2c6fc5);background:linear-gradient(#3680e1,#2c6fc5);-webkit-box-shadow:inset 0 2px 2px rgba(0,0,0,0.05);-moz-box-shadow:inset 0 2px 2px rgba(0,0,0,0.05);box-shadow:inset 0 2px 2px rgba(0,0,0,0.05)}.uploadcare-dialog-button-success[disabled],.uploadcare-dialog-button-success.uploadcare-disabled-el{cursor:default;opacity:.6}.uploadcare-dialog-button-success:active,.uploadcare-dialog-button-success:hover{border-color:#266eca #1f62b7 #1753a1}.uploadcare-dialog-button-success:hover{-webkit-box-shadow:inset 0 -1px 3px rgba(22,82,160,0.5);-moz-box-shadow:inset 0 -1px 3px rgba(22,82,160,0.5);box-shadow:inset 0 -1px 3px rgba(22,82,160,0.5)}.uploadcare-dialog-button-success:active{-webkit-box-shadow:inset 0 1px 3px rgba(22,82,160,0.4);-moz-box-shadow:inset 0 1px 3px rgba(22,82,160,0.4);box-shadow:inset 0 1px 3px rgba(22,82,160,0.4)}.uploadcare-dialog-big-button{border-radius:100px;font-size:20px;font-weight:normal;letter-spacing:1px;color:white;line-height:33px;border:solid 1px #276fcb;text-shadow:0 -1px #2a7ce5;display:inline-block;padding:16.5px 2em;cursor:pointer;-webkit-box-shadow:inset 0 -2px #1f66c1;-moz-box-shadow:inset 0 -2px #1f66c1;box-shadow:inset 0 -2px #1f66c1;background:#458dee;background:-webkit-linear-gradient(#4892f6,#4289e6);background:-moz-linear-gradient(#4892f6,#4289e6);background:linear-gradient(#4892f6,#4289e6)}.uploadcare-dialog-big-button:hover{-webkit-box-shadow:inset 0 -2px #1652a0;-moz-box-shadow:inset 0 -2px #1652a0;box-shadow:inset 0 -2px #1652a0;background:#3279d6;background:-webkit-linear-gradient(#3986eb,#2c6dc2);background:-moz-linear-gradient(#3986eb,#2c6dc2);background:linear-gradient(#3986eb,#2c6dc2)}.uploadcare-dialog-big-button:active{-webkit-box-shadow:inset 0 2px #2561b9;-moz-box-shadow:inset 0 2px #2561b9;box-shadow:inset 0 2px #2561b9;background:#2c6ec3;background:-webkit-linear-gradient(#2c6ec3,#2c6ec3);background:-moz-linear-gradient(#2c6ec3,#2c6ec3);background:linear-gradient(#2c6ec3,#2c6ec3)}.uploadcare-dialog-preview-image-wrap1{width:100%;height:462px;display:table}.uploadcare-dialog-preview-image-wrap2{display:table-cell;vertical-align:middle}.uploadcare-dialog-preview-image{max-width:100%;max-height:462px;display:block;margin:0 auto}.uploadcare-crop-widget .jcrop-handle:before{content:'';display:block;width:26px;height:26px;margin:-9px}.uploadcare-dialog-inner-footer{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;background:#fff3be;border-top:1px solid #efe2a9;height:66px;padding:16.5px 25px 0}.uploadcare-dialog-inner-footer .uploadcare-dialog-button-success{float:right}.uploadcare-dialog-inner-footer .uploadcare-dialog-button{float:left}.uploadcare-dialog-inner-footer .uploadcare-dialog-button-success,.uploadcare-dialog-inner-footer .uploadcare-dialog-button{min-width:100px;text-align:center;margin-right:0}.uploadcare-dialog-inner-footer .uploadcare-error{color:red}.uploadcare-dialog-inner-footer-text{text-align:center;color:#85732c;font-size:15px;line-height:33px}.uploadcare-dialog-message-center{text-align:center;padding-top:110px}.uploadcare-dialog-preview-center{text-align:center;padding-top:176px}.uploadcare-dialog-preview-circle{width:66px;height:66px;display:inline-block;margin-bottom:22px}.uploadcare-dialog-error-tab-wrap{height:100%;text-align:center;white-space:nowrap}.uploadcare-dialog-error-tab-wrap:before{display:inline-block;vertical-align:middle;content:'';height:100%;position:static;width:0}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-title{margin-bottom:12px}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-error-tab-illustration,.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-normal-text{margin-bottom:38px}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-button-success{margin:0}.uploadcare-dialog-error-tab-wrap2{display:inline-block;vertical-align:middle;white-space:normal;margin-top:-22px}.uploadcare-dialog-error-tab-illustration{display:inline-block;width:170px;height:120px;background-position:center;background-repeat:no-repeat}.uploadcare-if-draganddrop{display:none}@media screen and (min-width:600px){.uploadcare-draganddrop .uploadcare-if-no-draganddrop{display:none}.uploadcare-draganddrop .uploadcare-if-draganddrop{display:block}.uploadcare-draganddrop .uploadcare-dialog-file-drop-area{border:dashed 3px #c5cacd;background:rgba(255,255,255,0.64)}.uploadcare-draganddrop .uploadcare-dialog-file-title{color:#dee0e1;text-shadow:0 1px white;margin-top:0}}.uploadcare-dialog-file-drop-area{width:100%;height:100%;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;border:none;text-align:center;border-radius:3px;padding-top:70px}.uploadcare-dialog-file-drop-area .uploadcare-dialog-big-button{margin-top:11px;margin-bottom:55px}.uploadcare-dialog-file-title{font-size:40px;line-height:1;color:black;font-weight:bold;margin:66px 0}.uploadcare-dialog-file-or{font-size:13px;color:#8f9498;margin-bottom:33px}.uploadcare-dialog-file-sources{position:relative;display:inline-block;padding:0 80px 0 100px;line-height:2em}.uploadcare-dialog-file-sources:before{background-repeat:no-repeat;content:'';display:block;position:absolute;width:67px;height:44px;padding:0;top:-30px;left:10px}.uploadcare-dialog-file-source{display:inline;font-size:15px;margin-right:.2em;cursor:pointer;font-weight:300;white-space:nowrap}.uploadcare-dialog-file-source:after{content:'\00B7';color:#b7babc;margin-left:.5em}.uploadcare-dialog-file-source:last-child:after{display:none}.uploadcare-dragging .uploadcare-dialog-file-or,.uploadcare-dragging .uploadcare-dialog-file-sources,.uploadcare-dragging .uploadcare-dialog-file-drop-area .uploadcare-dialog-big-button{display:none}.uploadcare-dragging .uploadcare-dialog-file-drop-area{background-color:#f0f0f0;border-color:#b3b5b6;padding-top:264px}.uploadcare-dragging .uploadcare-dialog-file-title{color:#707478}.uploadcare-dragging.uploadcare-dialog-file-drop-area{background-color:#f2f7fe;border-color:#438ae7}.uploadcare-dragging.uploadcare-dialog-file-drop-area .uploadcare-dialog-file-title{color:#438ae7}.uploadcare-dpm-file-list{height:484px;overflow:auto;margin:0 -25px -22px 0}.uploadcare-dpm-file-item{border-top:1px solid #e3e3e3;border-bottom:1px solid #e3e3e3;margin-bottom:-1px;display:table;table-layout:fixed;width:100%;padding:10px 0;min-height:20px;font-size:13px;line-height:1.2}.uploadcare-dpm-file-item>*{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:table-cell;vertical-align:middle;padding-right:20px}.uploadcare-dpm-file-item:last-child{margin-bottom:0}.uploadcare-dpm-file-item:hover{background:#ececec}.uploadcare-dpm-file-item:hover .uploadcare-dpm-file-remove{display:inline-block}.uploadcare-dpm-uploaded .uploadcare-dpm-file-progressbar-wrap{display:none}.uploadcare-dpm-error .uploadcare-dpm-file-error{display:table-cell}.uploadcare-dpm-error .uploadcare-dpm-file-size,.uploadcare-dpm-error .uploadcare-dpm-file-progressbar-wrap{display:none}.uploadcare-dpm-file-preview,.uploadcare-dpm-file-error:before{content:'';display:inline-block;width:20px;height:20px;margin:-3.5px .7em -3.5px 0}.uploadcare-dpm-file-preview-wrap{width:45px;display:table-cell;text-align:center;line-height:0;padding-right:10px}.uploadcare-dpm-file-preview{margin:0}.uploadcare-dpm-file-name{width:100%;word-wrap:break-word}.uploadcare-dpm-file-size{width:3.5em;text-align:left}.uploadcare-dpm-file-progressbar-wrap{width:80px}.uploadcare-dpm-file-progressbar{width:100%;height:8px;background:#e0e0e0;border-radius:100px}.uploadcare-dpm-file-progressbar-value{height:100%;background:#d6b849;border-radius:100px}.uploadcare-dpm-file-error{width:200px;display:none;color:#f5444b}.uploadcare-dpm-file-remove-wrap{width:20px;text-align:right;line-height:0}.uploadcare-dpm-file-remove{display:none;width:20px;height:20px;cursor:pointer}.uploadcare-dialog-source-base-wrap{height:616px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.uploadcare-dialog-multiple .uploadcare-dialog-source-base-wrap{height:550px}.uploadcare-dialog-padding{padding:22px 25px}.uploadcare-dialog-remote-iframe-wrap{overflow:auto;-webkit-overflow-scrolling:touch}.uploadcare-dialog-remote-iframe{display:block;width:100%;height:100%;border:0;opacity:0}.uploadcare-dialog-source-base-footer{display:none}.uploadcare-dialog-multiple .uploadcare-dialog-source-base-footer{display:block}.uploadcare-dialog-source-base-counter{display:none}.uploadcare-if-mobile{display:none}@media screen and (max-width:600px){.uploadcare-dialog-opened{overflow:visible!important;position:static!important;width:auto!important;height:auto!important;min-width:0!important;background:#efefef!important}body.uploadcare-dialog-opened>:not(.uploadcare-dialog){display:none!important}.uploadcare-if-mobile{display:block}.uploadcare-if-no-mobile{display:none}.uploadcare-dialog{position:absolute;overflow:visible}.uploadcare-dialog:before{display:none}.uploadcare-dialog-inner-wrap{padding:0;min-width:310px;height:100%}.uploadcare-dialog-close{position:fixed;z-index:2;color:#000;width:50px;height:50px;line-height:45px}.uploadcare-dialog-footer{display:none}.uploadcare-dialog .uploadcare-dialog-panel{overflow:visible;height:100%;border-radius:0;-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none}.uploadcare-dialog .uploadcare-dialog-tabs-panel{padding:50px 0 0;margin:0;height:100%}.uploadcare-dialog .uploadcare-dialog-source-base-wrap{height:auto}.uploadcare-dialog .uploadcare-dialog-remote-iframe-wrap{overflow:visible;height:100%}.uploadcare-dialog .uploadcare-dialog-padding{padding:22px 15px}.uploadcare-dialog .uploadcare-dialog-preview-image-wrap1{height:auto;padding-bottom:50px}.uploadcare-dialog .uploadcare-dpm-file-list{height:auto;margin:0 -15px 0 0}.uploadcare-dialog .uploadcare-dpm-file-item>*{padding-right:10px}.uploadcare-dialog .uploadcare-dpm-file-progressbar-wrap{width:40px}.uploadcare-dialog .uploadcare-dpm-file-remove{display:inline-block}.uploadcare-dialog .uploadcare-dialog-file-sources,.uploadcare-dialog .uploadcare-dialog-file-or{display:none}.uploadcare-dialog .uploadcare-dialog-file-title{font-size:30px;margin:22px 0}.uploadcare-dialog .uploadcare-dialog-file-drop-area{padding-top:0}.uploadcare-dialog .uploadcare-dialog-inner-footer{position:fixed;left:0;bottom:0;width:100%;min-width:310px;height:50px;padding:8.5px 15px 0;background:rgba(255,243,190,0.95)}.uploadcare-dialog .uploadcare-dialog-inner-footer-text{display:none}.uploadcare-dialog .uploadcare-dialog-source-base-counter{display:inline}.uploadcare-dialog .uploadcare-dialog-multiple .uploadcare-dialog-remote-iframe-wrap:after{content:'';display:block;height:50px}.uploadcare-dialog .uploadcare-dialog-multiple .uploadcare-dialog-source-base-wrap{padding-bottom:50px}.uploadcare-dialog .uploadcare-dialog-multiple .uploadcare-dialog-padding{padding-bottom:72px}.uploadcare-dialog .uploadcare-dialog-tabs{position:fixed;top:0;left:0;width:100%;min-width:310px;height:auto;float:none;z-index:1;background:transparent}.uploadcare-dialog .uploadcare-dialog-tab{display:none;height:50px;white-space:nowrap;background:#dee0e1}.uploadcare-dialog .uploadcare-dialog-tab .uploadcare-dialog-icon,.uploadcare-dialog .uploadcare-dialog-tab:before{position:static;margin:0 6px;vertical-align:middle;opacity:1}.uploadcare-dialog .uploadcare-dialog-tab_current{display:block;background:rgba(239,239,239,0.95)}.uploadcare-dialog .uploadcare-dialog-tab:after{content:attr(title);font-size:20px;vertical-align:middle}.uploadcare-dialog .uploadcare-dialog-opened-tabs .uploadcare-dialog-tabs-panel_current{display:none}.uploadcare-dialog .uploadcare-dialog-opened-tabs .uploadcare-dialog-tabs{position:relative;z-index:3}.uploadcare-dialog .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab{display:block}.uploadcare-dialog .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab_current{background:#efefef}.uploadcare-dialog .uploadcare-dialog-panel:not(.uploadcare-dialog-opened-tabs) .uploadcare-dialog-tab_current{text-align:center}.uploadcare-dialog .uploadcare-dialog-panel:not(.uploadcare-dialog-opened-tabs) .uploadcare-dialog-tab_current:after{content:'';position:absolute;top:16px;left:14px;display:block;width:22px;height:18px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAOCAQAAAD+6Ta3AAAARklEQVR4Ae3SsRFEIQhAwW1IR2s3s6zTGUN+AxdK5tucAIBmOuKSY2pQbHHZVhgiweAnEixW1uC0VdSU41Xo19+te73+9AGOg1FzTMH13gAAAABJRU5ErkJggg==);background-size:22px}}.uploadcare-crop-widget .jcrop-holder{direction:ltr;text-align:left}.uploadcare-crop-widget .jcrop-vline,.uploadcare-crop-widget .jcrop-hline{background-color:white;background-position:top left;background-repeat:repeat;font-size:0;position:absolute}.uploadcare-crop-widget .jcrop-vline{height:100%;width:1px!important}.uploadcare-crop-widget .jcrop-hline{height:1px!important;width:100%}.uploadcare-crop-widget .jcrop-vline.right{right:0}.uploadcare-crop-widget .jcrop-hline.bottom{bottom:0}.uploadcare-crop-widget .jcrop-handle{background-color:#333;border:1px #eee solid;font-size:1px}.uploadcare-crop-widget .jcrop-tracker{height:100%;width:100%;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none}.uploadcare-crop-widget .jcrop-handle.ord-n{left:50%;margin-left:-4px;margin-top:-4px;top:0}.uploadcare-crop-widget .jcrop-handle.ord-s{bottom:0;left:50%;margin-bottom:-4px;margin-left:-4px}.uploadcare-crop-widget .jcrop-handle.ord-e{margin-right:-4px;margin-top:-4px;right:0;top:50%}.uploadcare-crop-widget .jcrop-handle.ord-w{left:0;margin-left:-4px;margin-top:-4px;top:50%}.uploadcare-crop-widget .jcrop-handle.ord-nw{left:0;margin-left:-4px;margin-top:-4px;top:0}.uploadcare-crop-widget .jcrop-handle.ord-ne{margin-right:-4px;margin-top:-4px;right:0;top:0}.uploadcare-crop-widget .jcrop-handle.ord-se{bottom:0;margin-bottom:-4px;margin-right:-4px;right:0}.uploadcare-crop-widget .jcrop-handle.ord-sw{bottom:0;left:0;margin-bottom:-4px;margin-left:-4px}.uploadcare-crop-widget .jcrop-dragbar.ord-n,.uploadcare-crop-widget .jcrop-dragbar.ord-s{height:7px;width:100%}.uploadcare-crop-widget .jcrop-dragbar.ord-e,.uploadcare-crop-widget .jcrop-dragbar.ord-w{height:100%;width:7px}.uploadcare-crop-widget .jcrop-dragbar.ord-n{margin-top:-4px}.uploadcare-crop-widget .jcrop-dragbar.ord-s{bottom:0;margin-bottom:-4px}.uploadcare-crop-widget .jcrop-dragbar.ord-e{margin-right:-4px;right:0}.uploadcare-crop-widget .jcrop-dragbar.ord-w{margin-left:-4px}.uploadcare-crop-widget .jcrop-light .jcrop-vline,.uploadcare-crop-widget .jcrop-light .jcrop-hline{background:#FFF;filter:Alpha(opacity=70)!important;opacity:.7!important}.uploadcare-crop-widget .jcrop-light .jcrop-handle{-moz-border-radius:3px;-webkit-border-radius:3px;background-color:#000;border-color:#FFF;border-radius:3px}.uploadcare-crop-widget .jcrop-dark .jcrop-vline,.uploadcare-crop-widget .jcrop-dark .jcrop-hline{background:#000;filter:Alpha(opacity=70)!important;opacity:.7!important}.uploadcare-crop-widget .jcrop-dark .jcrop-handle{-moz-border-radius:3px;-webkit-border-radius:3px;background-color:#FFF;border-color:#000;border-radius:3px}.uploadcare-crop-widget .jcrop-holder img,.uploadcare-crop-widget img.jcrop-preview{max-width:none}.uploadcare-crop-widget{font-family:\"Helvetica Neue\",Helvetica,Arial,\"Lucida Grande\",sans-serif;position:relative}.uploadcare-crop-widget .jcrop-holder{margin:0 auto;-webkit-transform:translateZ(0)}.uploadcare-crop-widget--loading{background-repeat:no-repeat;background-position:center}.uploadcare-crop-widget img{display:block}.uploadcare-crop-widget__error{text-align:center;display:none}.uploadcare-crop-widget--error .uploadcare-crop-widget__error{display:block}.uploadcare-crop-widget__error__title{font-size:20px}.uploadcare-crop-widget__error__text{font-size:15px}.uploadcare-widget{position:relative;display:inline-block;vertical-align:baseline;line-height:2;white-space:nowrap}.uploadcare-widget-status-ready .uploadcare-widget-button-open,.uploadcare-widget-status-started .uploadcare-widget-status,.uploadcare-widget-status-started .uploadcare-widget-text,.uploadcare-widget-status-started .uploadcare-widget-button-cancel,.uploadcare-widget-status-loaded .uploadcare-widget-text,.uploadcare-widget-status-loaded .uploadcare-widget-button-remove,.uploadcare-widget-status-error .uploadcare-widget-text,.uploadcare-widget-status-error .uploadcare-widget-button-open{display:inline-block!important}.uploadcare-widget-status{display:none!important;width:1.8em;height:1.8em;margin:-1em 0;margin-right:1ex;line-height:0;vertical-align:middle}.uploadcare-widget-circle--text .uploadcare-widget-circle-back{width:100%;height:100%;border-radius:50%;display:table;white-space:normal}.uploadcare-widget-circle--text .uploadcare-widget-circle-text{display:table-cell;vertical-align:middle;text-align:center;font-size:60%;line-height:1}.uploadcare-widget-circle--canvas canvas{width:100%;height:100%}.uploadcare-widget-text{display:none!important;margin-right:1ex}.uploadcare-widget-file-name{display:inline}.uploadcare-link,.uploadcare-link:link,.uploadcare-link:visited{cursor:pointer;color:#1a85ad;text-decoration:none;border-bottom:1px dotted #1a85ad;border-color:-moz-initial;border-color:initial}.uploadcare-link:hover,.uploadcare-link:active{color:#176e8f}.uploadcare-widget-button{display:none!important;color:white;padding:.4em .6em;line-height:1;margin:-1em 0;margin-right:.5ex;border-radius:.25em;background:#c3c3c3;cursor:default}.uploadcare-widget-button:hover{background:#b3b3b3}.uploadcare-widget-button-open{padding:.5em .8em;background:#18a5d0}.uploadcare-widget-button-open:hover{background:#0094c0}.uploadcare-widget-dragndrop-area{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:none;position:absolute;top:50%;margin-top:-1.3em;left:-1em;padding:0 1em;line-height:2.6;min-width:100%;text-align:center;background-color:#f0f0f0;color:#707478;border:1px dashed #b3b5b6;border-radius:100px}.uploadcare-widget.uploadcare-dragging .uploadcare-widget-dragndrop-area{background-color:#f2f7fe;border-color:#438ae7;color:#438ae7}.uploadcare-dragging .uploadcare-widget-dragndrop-area{display:block}.uploadcare-dialog-opened .uploadcare-widget-dragndrop-area{display:none}";
        document.head.appendChild(styleElem);

        var ckeditorjs = document.createElement('script');
        ckeditorjs.type = "text/javascript";
        ckeditorjs.src = RESOURCE_DOMAIN + "/javascripts/ckeditor/ckeditor.js";
        document.head.appendChild(ckeditorjs);

        var ckestyle = document.createElement('style');
        ckestyle.type = "text/css";
        ckestyle.innerText = '.cke{visibility:hidden;} .cke_textarea_inline{padding: 10px;height: 200px; overflow: auto; border: 1px solid gray; background-color: white; color: black; font-size: 12px; -webkit-appearance: textfield;}';
        document.head.appendChild(ckestyle);

        var configjs = document.createElement('script');
        configjs.type = "text/javascript";
        configjs.src = RESOURCE_DOMAIN + "/javascripts/ckeditor/config.js";
        document.head.appendChild(configjs);

        var editorcss = document.createElement('link');
        editorcss.type = "text/css";
        editorcss.rel = "stylesheet";
        editorcss.href = RESOURCE_DOMAIN + "/javascripts/ckeditor/skins/bootstrapck/editor.css";
        document.head.appendChild(editorcss);

        var langen = document.createElement('script');
        langen.type = "text/javascript";
        langen.src = RESOURCE_DOMAIN + "/javascripts/ckeditor/lang/en.js";
        document.head.appendChild(langen);

        var stylesjs = document.createElement('script');
        stylesjs.type = "text/javascript";
        stylesjs.src = RESOURCE_DOMAIN + "/javascripts/ckeditor/styles.js";
        document.head.appendChild(stylesjs);

        var juicss = document.createElement('link');
        juicss.type = "text/css";
        juicss.rel = "stylesheet";
        juicss.href = RESOURCE_DOMAIN + "/stylesheets/jquery-ui.css";
        document.head.appendChild(juicss);

        var jqjs = document.createElement('script');
        jqjs.type = "text/javascript";
        jqjs.src = RESOURCE_DOMAIN + "/javascripts/jquery.js";
        document.head.appendChild(jqjs);

        var juijs = document.createElement('script');
        juijs.type = "text/javascript";
        juijs.src = RESOURCE_DOMAIN + "/javascripts/jqueryui.js";
        document.head.appendChild(juijs);

        /*var juixjs = document.createElement('script');
        juixjs.type = "text/javascript";
        juixjs.src = RESOURCE_DOMAIN + "/javascripts/jquery.dialogextend.js";
        document.head.appendChild(juixjs);*/

        var ttjs = document.createElement('script');
        ttjs.type = "text/javascript";
        ttjs.src = RESOURCE_DOMAIN + "/javascripts/jquery.darktooltip.min.js";
        document.head.appendChild(ttjs);

        var ttcss = document.createElement('link');
        ttcss.type = "text/css";
        ttcss.rel = "stylesheet";
        ttcss.href = RESOURCE_DOMAIN + "/stylesheets/darktooltip.min.css";
        document.head.appendChild(ttcss);

        //This reset css messes up the format in the table. If commented out, the <ins> stops to work. Removed the table from reset.css
        var resetcss = document.createElement('link');
        resetcss.type = "text/css";
        resetcss.rel = "stylesheet";
        resetcss.href = RESOURCE_DOMAIN + "/stylesheets/reset.css";
        document.head.appendChild(resetcss);

        /*var eq_configjs = document.createElement('script');
        eq_configjs.type = "text/javascript";
        eq_configjs.src = "http://latex.codecogs.com/js/eq_config.js";
        document.head.appendChild(eq_configjs);

        var eq_editor_lite_16js = document.createElement('script');
        eq_editor_lite_16js.type = "text/javascript";
        eq_editor_lite_16js.src = "http://latex.codecogs.com/js/eq_editor-lite-16.js";
        document.head.appendChild(eq_editor_lite_16js);

        var eqn_embedcss = document.createElement('link');
        eqn_embedcss.type = "text/css";
        eqn_embedcss.rel = "stylesheet";
        eqn_embedcss.href = "http://latex.codecogs.com/css/equation-embed.css";
        document.head.appendChild(eqn_embedcss);

        var highlighterjs = document.createElement('script');
        highlighterjs.type = "text/javascript";
        highlighterjs.src = RESOURCE_DOMAIN + "/javascripts/ckeditor/plugins/pbckcode/dialogs/PBSyntaxHighlighter.js";
        document.head.appendChild(highlighterjs);

        //ignoring the js for uploadcare deployed at - https://ucarecdn.r.worldssl.net/widget/1.0.0/uploadcare/uploadcare-1.0.0.min.js

        var highlightpackjs = document.createElement('script');
        highlightpackjs.type = "text/javascript";
        highlightpackjs.src = RESOURCE_DOMAIN + "/javascripts/ckeditor/plugins/codesnippet/lib/highlight/highlight.pack.js";
        document.head.appendChild(highlightpackjs);*/

        var stylecss = document.createElement('link');
        stylecss.type = "text/css";
        stylecss.rel = "stylesheet";
        stylecss.href = RESOURCE_DOMAIN + "/javascripts/ckeditor/plugins/pbckcode/dialogs/style.css";
        document.head.appendChild(stylecss);

        var findjs = document.createElement('script');
        findjs.type = "text/javascript";
        findjs.src = RESOURCE_DOMAIN + "/javascripts/ckeditor/plugins/find/dialogs/find.js";
        document.head.appendChild(findjs);

        var scriptElem = document.createElement('script');
        scriptElem.type = "text/javascript";
        scriptElem.id = "fns";
        var scriptElem2 = document.createElement('script');
        scriptElem2.type = "text/javascript";
        scriptElem2.id = "fns2";
        var vardefs = "var notes_public, sort_instant, rows_hidden; var SERVER_URL='" + SERVER_URL + "'; var RESOURCE_DOMAIN='" + RESOURCE_DOMAIN + "'; var rich_text = false; var rtdisplayed = ''; var display_state = 'normal'; ";
        var moveToStr = "function moveTo(toTime) { " +
                            "if (window.QL_player != null) { " +
                                "window.QL_player.mediaelement_handle.setCurrentTime(toTime); " +
                        "} else if ($('me_flash_0') != null) { " +
                            "$('me_flash_0').setCurrentTime(toTime);  " +
                        "}} ";
        var deleteNoteStr = "function deleteNote(prms) {  " +
                                 "noteId = prms.split('$')[0]; " +
                                  "uId1  = prms.split('$')[1]; " +
                                  "uId2 = prms.split('$')[2];  " +
                                  "vId = prms.split('$')[3] + '$' + prms.split('$')[4]; " +
                                  "uId = '' + uId1 + uId2; $.ajax({type: 'GET', url: SERVER_URL + '/deleteNoteExtn',data: {gId: uId, noteId: noteId, vId: vId}}); " +
                                  "$('#cmt' + noteId).remove(); " +
                            "} ";
        var toggleLockStr = "function toggleLock(uIdvId) { " +
                                 "uId = uIdvId.split('$')[0]; " +
                                 "vId = uIdvId.split('$')[1] + '$' + uIdvId.split('$')[2]; " +
                                 "if ($('#lockall' ).attr('src').indexOf('open') > -1) { " +
                                     "notes_public = false; " + 
                                     "$( \"img[id^='lock']\" ).attr('src', RESOURCE_DOMAIN + '/images/lock_closed.png'); " +
                                     "$.ajax({type: 'GET', url: SERVER_URL + '/toggleVideoNotesExtn',data: {open:0, uId: uId, vId: vId}}); " +
                                 "} else { " + 
                                     "notes_public = true; " + 
                                     "$( \"img[id^='lock']\" ).attr('src', RESOURCE_DOMAIN + '/images/lock_open.png'); " + 
                                     "$.ajax({type: 'GET', url: SERVER_URL + '/toggleVideoNotesExtn',data: {open:1, uId: uId, vId: vId}}); " +
                                 "} " +
                            "} ";
        var toggleLockOneStr = "function toggleLockOne(uId1, uId2, i) { " +
                                    "uId = '' + uId1 + uId2; " +
                                    "if ($('#lock'+i).attr('src').indexOf('open') > -1) { " +
                                        "$('#lock'+i).attr('src', RESOURCE_DOMAIN + '/images/lock_closed.png'); " + 
                                        "$.ajax({type: 'GET', url: SERVER_URL + '/toggleNoteExtn',data: {open:0, uId: uId, noteId: i}}); " +
                                    "} else { " +
                                        "$('#lock'+i).attr('src', RESOURCE_DOMAIN + '/images/lock_open.png'); " + 
                                        "$.ajax({type: 'GET', url: SERVER_URL + '/toggleNoteExtn',data: {open:1, uId: uId, noteId: i}}); " +
                                    "} " +
                                "} ";
        var toggleSortStr = "function toggleTimeSort(gIdvId) { " + 
                                "gId = gIdvId.split('$')[0]; " + 
                                "cId = gIdvId.split('$')[1]; " + 
                                "lId = gIdvId.split('$')[2]; " + 
                                "if (sort_instant == undefined || sort_instant == 1) { " + 
                                    "sort_instant = 0; " + 
                                    "$.ajax({type: 'GET', dataType: 'json', url: SERVER_URL + '/reloadNotesExtn', data: {open:-1, sortby: 'instant', googleId: 's' + gId + 's', lId: lId, cId: cId}, " +
                                        "success: function(data) { " + 
                                                      "resetTable(); setTableData(data); " +
                                                    "} " + 
                                    "}); " + 
                                    "$('#sorticon').attr('src',RESOURCE_DOMAIN + '/images/sort_down.png'); " + 
                                "} else { " +
                                    "sort_instant=1; " + 
                                    "$.ajax({type: 'GET', dataType: 'json', url: SERVER_URL + '/reloadNotesExtn', data: {open:1, sortby: 'instant', googleId: 's' + gId + 's', lId: lId, cId: cId}, " + 
                                        "success: function(data) { " + 
                                                    "resetTable(); " + 
                                                    "setTableData(data); " + 
                                                  "} " +
                                    "}); " + 
                                    "$('#sorticon').attr('src', RESOURCE_DOMAIN + '/images/sort_up.png'); " +
                                "} " +
                            "} ";
        var resetTableStr = "function resetTable() { $('tr[id^=\"cmt\"]').remove(); } ";
        var setTableDataStr = "function setTableData(notesData) { " + 
                                    "if (notesData !== '' && notesData.length > 0) { " +
                                        "for (i=0; i<notesData.length; i++) { " + 
                                            "setRowData(unescape(notesData[i].comments), unescape(notesData[i].commentsTxt), notesData[i].noteId, notesData[i].googleId + '$' + notesData[i].videoURL, notesData[i].instant); " + 
                                        "} " +
                                    "} " +
                              "} ";
        var setRowDataStr = "function setRowData(cmts, text, timenow, uIdvId, instant) { " + 
                                "uId = uIdvId.split('$')[0]; " + 
                                "vId = uIdvId.split('$')[1]; " + 
                                "uId1 = uId.substring(0, 9); " + 
                                "uId2 = uId.substring(9, uId.length); " + 
                                "if(text.length > 100) { text = text.substring(0, 97) + '...'; } " + 
                                "prms = '\"' + timenow + '$' + uId1 + '$' + uId2 + '$' + vId + '\"'; " + 
                                "txt_content = '<a style=\"font-size:10px;z-index:50000;padding-right:0px;\" href=javascript:deleteNote(' + prms +')> " +
                                                    "<img src=\"' + RESOURCE_DOMAIN + '/images/deletecomment.png\" alt=\"Delete\"/></a> " + 
                                                    "&nbsp;' + text + '&nbsp; " +
                                                "<a style=\"float:right\" href=javascript:moveTo(' + instant + '); >' + instant + 's</a> &nbsp; " +
                                                "<a href=javascript:toggleLockOne(' + uId1 + ',' + uId2 + ',\"' + timenow + '\")> " +
                                                    "<img width=16 height=16 id=\"lock' + timenow + '\" src=\"' + RESOURCE_DOMAIN + '/images/lock_closed.png\" style=\"float:right\"/></a>'; " +
                                "part_data = timenow + '\">' + '<td><div id=\"div' + timenow + '\">' + txt_content + '</div> " +
                                                "<ins class=\"dark-tooltip dark medium west\" style=\"max-width: none; left: 306px; opacity: 0.9; width: 250%; display: none\"> " +
                                                    "<div>' + cmts + '</div><div class=\"tip\"></div> " +
                                                "</ins></td></tr>'; " +
                                "rich_content_white = '<tr bgcolor=\"white\" id=\"cmt' + part_data; " + 
                                "if ($(\"#notesTbl > tbody > tr\").length == 0 ) { " + 
                                    "$(rich_content_white).insertAfter($('table > tbody')); " + 
                                "} else { " + 
                                    "$(rich_content_white).insertBefore($('table > tbody > tr:first')); " + 
                                "} " + 
                                "$(\"#div\" + timenow).mousedown(function() { " + 
                                    "if (rtdisplayed != '' && rtdisplayed != $(this).attr(\"id\")) { " + 
                                        "$(\"#\" + rtdisplayed).next().css('display', 'none'); " + 
                                    "} " + 
                                    "p = $(this).parent().position(); " + 
                                    "if($(this).next().css('display') == \"none\") " + 
                                        "$(this).next().css({'display': 'block', 'width': '250%', 'top': p.top}); " + 
                                    "else " + 
                                        "$(this).next().css('display','none'); rtdisplayed = $(this).attr(\"id\"); " + 
                                "}); " + 
                            "} ";

        var setImportTableDataStr = "function setImportTableData(notesData, gId) { " + 
                                        "if (notesData !== '' && notesData.length > 0) { " +
                                            "for (i=0; i<notesData.length; i++) { " + 
                                                "setImportRowData(i, unescape(notesData[i].comments), unescape(notesData[i].commentsTxt), notesData[i].date, notesData[i].googleId + '$' + notesData[i].videoURL, notesData[i].instant, gId); " +
                                            "} " + 
                                        "} " +
                                    "} ";
        
        var setImportRowDataStr = "function setImportRowData(i, cmts, text, timenow, uIdvId, instant, gId) { " + 
                                        "uId = uIdvId.split('$')[0]; " + 
                                        "vId = uIdvId.split('$')[1] + '$' + uIdvId.split('$')[2]; " + 
                                        "uId1 = uId.substring(0, 9); " + 
                                        "uId2 = uId.substring(9, uId.length); " + 
                                        "if (text.length > 100) { " +
                                            "text = text.substring(0, 97) + '...'; " +
                                        "} " +
                                        "prms = '\"' + i + '$' + timenow + '$' + uId1 + '$' + uId2 + '$' + vId + '$' + gId + '$' + instant + '\"'; " + 
                                        "content = '<a style=\"font-size:10px;z-index:50000;padding-right:0px;\" href=javascript:copyNote(' + prms +')><img src=\"' + RESOURCE_DOMAIN + '/images/import.png\" alt=\"Import\"/></a> &nbsp;<span id=\"imp' + i + '\">' + text + '</span>&nbsp;<a style=\"float:right\" >' + instant + 's</a> &nbsp;'; " + 
                                        "part_data = timenow + '\">' + '<td><div id=\"div' + timenow + '\">' + content + '</div><ins class=\"dark-tooltip dark medium west\" style=\"max-width: none; left: 306px; opacity: 0.9; width: 250%; display: none\"><div>' + cmts + '</div><div class=\"tip\"></div></ins></td></tr>'; " +
                                        "rich_content_white = '<tr bgcolor=\"white\" id=\"cmt' + part_data; " +
                                        "if ($('#notesTbl > tbody > tr').length == 0 ) { " + 
                                            "$(rich_content_white).appendTo($('table > tbody')); " +
                                        "} else { " +
                                            "$(rich_content_white).insertAfter($('table > tbody > tr:first')); " +
                                        "} " +
                                        //"alert($('#div' + timenow).length); " + 
                                    "} ";
        
        var copyNoteStr = "function copyNote(dtuIdvId) {  " +
                            "nth = dtuIdvId.split('$')[0]; " + 
                            "tn = new Date().getTime(); " + 
                            "timenow = dtuIdvId.split('$')[1]; " + 
                            "vId = dtuIdvId.split('$')[4] + '$' + dtuIdvId.split('$')[5]; " + 
                            "gId = dtuIdvId.split('$')[6]; " + 
                            "instant = dtuIdvId.split('$')[7]; " + 
                            "text = $('#imp' + nth).html(); " + 
                            "nth_1=parseInt(nth)+1; $(\'tbody tr:nth-child(' + nth_1 + ')\').remove(); " + 
                            "$.ajax({ " + 
                                "type: 'POST', url: SERVER_URL + '/submitNoteExtn', dataType: 'json', " + 
                                "data: {googleId: 's' + gId + 's', videoURL: vId, comments: escape(text), noteId: tn, instant: instant, ispublic: false, title: $(\"title\").html(), url: document.URL} " + 
                            "}); " + 
                        "} ";
        var importNotesStr ="function importNotes(gIdvId) { " + 
                                "gId = gIdvId.split('$')[0]; " + 
                                "cId = gIdvId.split('$')[1]; " + 
                                "lId = gIdvId.split('$')[2]; " + 
                                "vId = cId + '$' + lId; " + 
                                "if (rows_hidden == undefined || rows_hidden == false) { " +
                                    "createImportDlg(gId, vId); " + 
                                    "rows_hidden = true; " + 
                                    "pauseIt(); " + 
                                "} else { " + 
                                    "$.ajax({type: 'GET', dataType: 'json', url: SERVER_URL + '/reloadNotesExtn', " + 
                                        "data: {open:1, sortby: 'instant', googleId: 's' + gId + 's', lId: lId, cId: cId}, " + 
                                        "success: function(data) { " + 
                                            " resetTable(); " + 
                                            " setTableData(data); " + 
                                        "} " + 
                                    "}); " + 
                                    "rows_hidden = false; " +
                                    //"playIt(); " + 
                                "} " +  
                            "} ";

        var importNotesDataStr ="function importNotesData(gId, vId) { " + 
                                    "$.ajax({type: 'GET',  " + 
                                        "url: SERVER_URL + '/getLectureNotesExtn', " +
                                        "data: {uId: gId, vId: vId}, " + 
                                        "success: function(data) { " + 
                                            "resetTable(); " +
                                            "setImportTableData(data, gId);" +
                                        "} " + 
                                    "}); " + 
                                "} ";

        var createCommentsTextStr = "function createCommentsTextarea() {    return \"<textarea id='commentsTxt' contentdeditable='true' name='commentsTxt' placeholder='Write a note (Enter to play)... ' style='margin:-5px 0 0 -2px;min-height:104px;width:100%;background-color:#fcfbf7;border:none;outline:none;overflow-y:visible;border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border-bottom-left-radius: 0px; font-size:12px;line-height:18px;word-wrap:break-word; resize: none; top:40px; position:absolute'></textarea>\";} ";

        var createCommentsDivStr = "function createCommentsDiv() {    return \"<div id='commentsTxt' contenteditable='true' name='commentsTxt' placeholder='Write a note (Enter to play)... ' style='min-height:104px;width:100%;background-color:#fcfbf7; font-size:12px;line-height:18px;word-wrap:break-word; resize: none; top:40px; position:absolute'><p></p></div>\";} ";


        var writeNotesStr = "function writeRichNote(gIdvId) { " + 
                                "removeShortCuts(); " +
                                "gId = gIdvId.split('$')[0]; vId = gIdvId.split('$')[1] + '$' + gIdvId.split('$')[2]; " + 
                                
                                "if (!rich_text) { " + 
//" alert(\"not rich_text\"); " +                                
                                    "$('textarea').remove('#commentsTxt'); " +
                                    "rich_text = true; " + 
                                    "var richeditor = createCommentsDiv(); " +
                                    "$(\"#notesTbl\").before(richeditor); " + 
//" alert(\"cke_commentsTxt not present\"); " +                                
                                        "CKEDITOR.disableAutoInline = true; " +
                                        "CKEDITOR.inline('commentsTxt', {on: { instanceReady : function(ev) { " + 
                                                                                    "var dlg = document.getElementById(\"dialog1\"); " + 
                                                                                    "var dlgleft = $(\"#dialog1\").css('left'); dlgleft = parseInt(dlgleft.substring(0, dlgleft.length-2)); " +
                                                                                    "elem = document.getElementById(\"cke_commentsTxt\"); " + 
    //"alert ('elem created'); " +
                                                                                    "$(\"#cke_commentsTxt\").css('top','0px'); " +
                                                                                    "$(\"#cke_commentsTxt\").css('position','fixed'); " + 
                                                                                    "$(\"#cke_commentsTxt\").css('left','16px'); " + 
                                                                                    "$(\"#cke_commentsTxt\").css('z-index','100020'); $(\"#cke_commentsTxt\").show(); " +
    //"alert ('z-index hchanged'); " +
                                                                                 "} " +
                                                                            "} " +
                                                                        "}); " + 
                                        "$(\"#notesTbl\").css('top', '90px'); " +
                                        "$(\"#dialog1\").css('width', '60%'); $(\"#notesTbl\").css('width', '100%'); $(\"div[contenteditable='true']\").css('width', '100%'); " + 
                                        "$(\"#dialog1\").css('top','65px'); " +
                                        "if (window.QL_player != null) { " +
                                            "window.QL_player.mediaelement_handle.pause(); " + 
                                            "instant = window.QL_player.mediaelement_media.currentTime; " +
                                        "} else {" + 
                                            "if ($('me_flash_0') != null) { " + 
                                                "$('me_flash_0').pauseMedia(); " + 
                                                "instant = $('me_flash_0').currentTime(); " +
                                            " } " +
                                        "} " +
                                "} else { " + 
                                    "$('div').remove('#cke_commentsTxt'); " +
                                    "$('div').remove('#commentsTxt'); " +
                                    "rich_text = false; " + 
                                    "$(\"#dialog1\").css('top','10px'); " +
                                    "$(\"#notesTbl\").css('top', '94px'); " +
                                    "var txteditor = createCommentsTextarea(); " +
                                    "$(\"#notesTbl\").before(txteditor); " + 

                                    "$('#commentsTxt').keydown(function (e) { " +
                                        "pauseIt(); " +
                                        "if (e.keyCode == 8) { " +
                                            "if ($('#commentsTxt').val().length < 2) { " +
                                                "if (window.QL_player != null) { " +
                                                    "window.QL_player.mediaelement_handle.play(); " +
                                                "} else if ($('me_flash_0') != null) { " +
                                                    "$('me_flash_0').playMedia(); " +
                                                "} " +
                                                "instant = 0; " +
                                            "} " +            
                                        "} else if (e.keyCode == 13) { " + 
                                            "if (window.QL_player != null) { " +
                                                "window.QL_player.mediaelement_handle.play(); " +
                                            "} else if ($('me_flash_0') != null) { " +
                                                "$('me_flash_0').playMedia(); " +
                                            "} " +
                                            "text = $('#commentsTxt').val(); " +
                                            "timenow = new Date().getTime(); " +
                                            "if ($.trim(text) != '') { " +
                                                "uId = '' + gId; " + 
                                                "uId1 = uId.substring(1, 10); " +
                                                "uId2 = uId.substring(10, uId.length-1); " +
                                                "prms = timenow + \"$\" + uId1  + \"$\" + uId2 + \"$\" + vId ; " +
                                                "content = '<tr bgcolor=\"white\" id=\"cmt' + timenow + '\"><td><div id=\"div' + timenow + '\"><a style=\"font-size:10px;z-index:50000;padding-right:0px;\" href=javascript:deleteNote(\"' + prms +'\")><img src=\"' + RESOURCE_DOMAIN + '/images/deletecomment.png\" alt=\"Delete\"/></a> &nbsp;&nbsp;<a style=\"float:right\" href=\"javascript:moveTo(' + instant + ')\" >' + instant + 's</a> &nbsp;<a href=javascript:toggleLockOne(' + uId1 + ',' + uId2 + ',' + timenow + ')><img width=16 height=16 id=\"lock' + timenow + '\" src=\"' + RESOURCE_DOMAIN + '/images/lock_closed.png\" style=\"float:right\"/></a></div><ins class=\"dark-tooltip dark medium west\" style=\"max-width: none; left: 306px; opacity: 0.9; width: 250%; display: none\"></ins></td></tr>'; " +
                                                "var rich_content_white = content; " +
                                                "if ($('#notesTbl > tbody > tr').length == 0 ) { " +
                                                    "$(rich_content_white).insertAfter($('table > tbody')); " +
                                                "} else { " +
                                                    "$(rich_content_white).insertBefore($('table > tbody > tr:first')); " +
                                                "} " +
                                                "if ($('#div' + timenow).length > 0) { " +
                                                    "textval = $('#div' + timenow).next().find('div:first-child').text(); " +
                                                    "if (textval.length > 100) { " +
                                                        "textval = textval.substring(0, 97) + '...'; " +
                                                    "} " +
                                                    "$(\"#div\" + timenow).find(\"a:first-child\").after(textval); " +
                                                    "$(\"#div\" + timenow).mousedown(function() { " +
                                                        "p = $(this).parent().position(); " +
                                                        "if($(this).next().css('display') == 'none') " +
                                                            "$(this).next().css({'display': 'block', 'width': '250%', 'top': p.top}); " +
                                                        "else " +
                                                            "$(this).next().css('display','none'); " +                                                    
                                                    "}); " +
                                                "} " +
//"text = text.replace(/\n/g, '<br>').trim(); " +
                                                "$.support.cors = true; " +                                            
                                                "$.ajax({ " +
                                                    "type: 'POST', " +
                                                    "url: SERVER_URL + '/submitNoteExtn', " +
                                                    "dataType: 'json', " +
                                                    "data: {googleId: gId, videoURL: vId, comments: escape(text), noteId: timenow, instant: instant, ispublic: false, title: $(\"title\").html(), url: document.URL} " +
                                                "}); " +
                                                "text = ''; " +
                                            "} " +
                                            "$('#commentsTxt').val(''); " +
                                            "shiftOn = false; " +
                                            "instant = 0; " +
                                            "return false; " +
                                        "} " +
                                        "shiftOn = false; " +
                                    "}); " +                                    
                                    "$(\"#dialog1\").css('width', '294px'); $(\"#notesTbl\").css('width', '100%'); $(\"div[contenteditable='true']\").css('width', '100%'); " + 
                                    "$(\"#commentsTxt\").val(CKEDITOR.instances.commentsTxt.getData()); " + 
                                    "CKEDITOR.instances.commentsTxt.setData(''); " + 
                                    "if (window.QL_player != null) { " + 
                                        "window.QL_player.mediaelement_handle.play(); " + 
                                    "} else " + 
                                        "if ($('me_flash_0') != null) { $('me_flash_0').playMedia(); } " +
                                "} " + 
                            "} ";

        /*var dialogLoadStr = "$(\"div[role='dialog']\" ).on('load', function() { " +
                                "alert('dialog created'); " +
                                "console.log('dialog created'); " + 
                            "}); ";*/

        var removeShortcutsStr = "function removeShortCuts() { " + 
                                     "try { " +  
//"alert('removeShortCuts'); " +                                     
                                        "len = window.QL_player.mediaelement_handle.options.keyActions.length; " + 
                                        "for (i=0; i < len; i++) { " +  
                                            "delete window.QL_player.mediaelement_handle.options.keyActions[i]; " + 
                                        "} " + 
                                        "window.QL_player.mediaelement_handle.enableKeyboard = false; " + 
//"window.QL_player.mediaelement_handle.options.keyActions = null; " + 
                                    "} catch (e) {} " + 
                                "} ";

        var createImportDlgStr = "function createImportDlg(gid, vid) { " + 
                                    "removeShortCuts(); " +
                                    "var dlgElem = document.createElement('div'); " + 
                                    "dlgElem.setAttribute('id', 'dlgImport');" + 
                                    "dlgElem.setAttribute('title', 'Import Notes');" +
                                    "dlgElem.setAttribute('style', 'z-index: 50000;');" +
                                    "document.body.appendChild(dlgElem);" + 
                                    " var sliderHtml = '<p><label for=\"timeRange\">Time range:</label><input type=\"text\" id=\"timeRange\" readonly style=\"border:0; color:#f6931f; font-weight:bold;\"></p><div id=\"slider-range\"></div><hr>'; " +

                                    " var usersListHtml = '<p><label for=\"notesOfUser\">Notes of:</label><input type=\"text\" id=\"notesOfUser\" value=\"All\"><input type=\"hidden\" id=\"notesOfUserVal\" value=\"dummy\">';  " +
                                    "$(\"#dlgImport\").html(sliderHtml + usersListHtml);" + 
                                    " var val = $('iframe').contents().find(\"body\").html(); var idx1 = val.indexOf(\"mejs-duration\")+15; var idx2 = val.indexOf(\"<\", idx1); " +
                                    " var duration = val.substring(idx1, idx2); " +
                                    " var mins = duration.split(\":\")[0]; var secs = duration.split(\":\")[1]; var total = parseInt(mins*60) + parseInt(secs); " + 
                                    " var v0, v1; " +

                                    "$(\"#dlgImport\").dialog({'modal' : true, resizable: false, " + 
                                        "open: function(event, ui) {" + 
                                            " var stl = $(\"div[aria-describedby='dlgImport']\").attr('style') + ' z-index: 50005;'; " +
                                            " $(\"div[aria-describedby='dlgImport']\").attr('style', stl); " +
                                            " $('.ui-widget-overlay.ui-front').attr('style', 'z-index: 50004'); " +
                                            " $( \"#slider-range\" ).slider({ " +
                                              " range: true, " +
                                              " min: 0, " +
                                              " max: total, " +
                                              " values: [ 0, total ], " +
                                              " slide: function( event, ui ) { " +
                                                " $( \"#timeRange\" ).val( giveMinsSecs(ui.values[ 0 ])" + " + \" - \" + " + "giveMinsSecs(ui.values[ 1 ]) ); " +
                                              " } " +
                                              ", stop: function(event, ui) { " + 
                                                    " v0 = giveMinsSecs(ui.values[ 0 ]); v1 = giveMinsSecs(ui.values[ 1 ]); " + 
                                                    " $( \"#timeRange\" ).val( v0 + \" - \" + v1); " +
                                              " } " +
                                            " }); " +
                                            " v0 = $( \"#slider-range\" ).slider( \"values\", 0 ); v0 = giveMinsSecs(v0); v1 = $( \"#slider-range\" ).slider( \"values\", 1 ); v1 = giveMinsSecs(v1); " + 
                                            " $( \"#timeRange\" ).val( v0 + \" - \" + v1 ); " +

                                            " var usersData; " +
                                            " $(\"#notesOfUser\").autocomplete({ minLength:3, source: function (request, response) { "  +
                                                " $.ajax({ type: 'GET', " + 
                                                    " url: SERVER_URL + '/usersForVideoExtn', " +
                                                    " dataType: 'json', " +
                                                    " data: {gId: gid, nameContains: $(\"#notesOfUser\").val(), vRL: vid}, " +

                                                    " success: function(data1) { " +
                                                        " usersData = data1; " +
                                                        " response($.map( data1, function( item ) { " +
                                                            " return { " +
                                                                " label : item.displayName, " +
                                                                " value : item.displayName + \"                                                          \" + item.gId" + 
                                                            " } " +
                                                        "})); " +
                                                    " }, " +
                                                    " error: function (msg) { " +
                                                        " alert(msg.status + ' ' + msg.statusText); " +
                                                    " }" +
                                                " }); " +
                                            " } " + 
                                            " }); " +
                                        "}, " + 
                                        "buttons : [ { text: 'OK' , style: 'margin-left: 30px; margin-right: 10px', click: function() { importNotesData(gid, vid); rows_hidden = true; closeImport(); } }, " + 
                                                    "{ text: 'Cancel' , style: 'margin-left: 0px; margin-right: 40px', click: function() { rows_hidden = false; closeImport(); } } ], " +
                                        "close: function(event, ui) {" + 
                                            " rows_hidden = false; closeImport(); " + 
                                        "}" + 
                                    "});" + 
                                 "} ";

        var closeImportStr = "function closeImport() { $(\"div[aria-describedby='dlgImport']\").empty(); $(\"div[aria-describedby='dlgImport']\").remove(); $('#dlgImport').empty(); $('#dlgImport').remove(); playIt(); } ";
        var collapseItStr = "function collapseIt() { $('.ui-dialog-titlebar-restore').show(); $('.ui-dialog-titlebar-collapse').hide(); $('#commentsTxt').hide(); $('#notesTbl').hide();} ";
        var restoreItStr = "function restoreIt() { $('.ui-dialog-titlebar-restore').hide(); $('.ui-dialog-titlebar-collapse').show(); $('#commentsTxt').show(); $('#notesTbl').show();} ";
        var closeItStr = "function closeIt() { rich_text = false; $('#dialog1').remove(); } ";
        var pauseItStr = "function pauseIt() { " + 
                            "if (window.QL_player != null) { " +
                                "window.QL_player.mediaelement_handle.pause(); " + 
                            "} else if ($('me_flash_0') != null) { " + 
                                "$('me_flash_0').pauseMedia(); " + 
                            "} " +
                        "} ";
        var playItStr = "function playIt() { " + 
                            "if (window.QL_player != null) { " + 
                                "window.QL_player.mediaelement_handle.play(); " +
                            "} else if ($('me_flash_0') != null) { " + 
                                "$('me_flash_0').playMedia(); " +
                            "}" +
                        "} ";

        var giveMinsSecsStr = "function giveMinsSecs(val) { " + 
                                " var v = parseInt(val); " + 
                                " var vrem = (v % 60 < 10) ? '0' + v%60 : v%60; " +
                                " v = Math.floor(v / 60) + \":\" + vrem; " +
                                " return v; " +
                              "} ";

        var dialog_extend_css = ".ui-dialog .ui-dialog-titlebar-buttonpane>a { float: right; }.ui-dialog .ui-dialog-titlebar-restore { width: 19px; height: 18px; }.ui-dialog .ui-dialog-titlebar-restore span { display: block; margin: 1px; }.ui-dialog .ui-dialog-titlebar-restore:hover,.ui-dialog .ui-dialog-titlebar-restore:focus { padding: 0; }.ui-dialog .ui-dialog-titlebar ::selection { background-color: transparent; }"; 
        var dialog_extend_collapse_css = ".ui-dialog .ui-dialog-titlebar-collapse { width: 19px; height: 18px; }.ui-dialog .ui-dialog-titlebar-collapse span { display: block; margin: 1px; }.ui-dialog .ui-dialog-titlebar-collapse:hover,.ui-dialog .ui-dialog-titlebar-collapse:focus { padding: 0; }"; 
        var dialog_extend_maximize_css = ".ui-dialog .ui-dialog-titlebar-maximize { width: 19px; height: 18px; }.ui-dialog .ui-dialog-titlebar-maximize span { display: block; margin: 1px; }.ui-dialog .ui-dialog-titlebar-maximize:hover,.ui-dialog .ui-dialog-titlebar-maximize:focus { padding: 0; }"; 
        var dialog_extend_minimize_css = ".ui-dialog .ui-dialog-titlebar-minimize { width: 19px; height: 18px; }.ui-dialog .ui-dialog-titlebar-minimize span { display: block; margin: 1px; }.ui-dialog .ui-dialog-titlebar-minimize:hover,.ui-dialog .ui-dialog-titlebar-minimize:focus { padding: 0; }";

        var containerElem = document.createElement('div');
        containerElem.setAttribute('id', 'dialog-extend-fixed-container');
        containerElem.setAttribute('style', 'position: fixed; bottom: 1px; left: 1px; right: 1px; z-index: 50010;');
        document.body.appendChild(containerElem);

        var dec = document.createElement('style');
        dec.type = 'text/css';
        dec.className = 'dialog-extend-css';
        dec.innerHTML = dialog_extend_css;
        document.body.appendChild(dec);

        var decc = document.createElement('style');
        decc.type = 'text/css';
        decc.className = 'dialog-extend-collapse-css';
        decc.innerHTML = dialog_extend_collapse_css;
        document.body.appendChild(decc);

        var demac = document.createElement('style');
        demac.type = 'text/css';
        demac.className = 'dialog-extend-maximize-css';
        demac.innerHTML = dialog_extend_maximize_css;
        document.body.appendChild(demac);

        var demic = document.createElement('style');
        demic.type = 'text/css';
        demic.className = 'dialog-extend-minimize-css';
        demic.innerHTML = dialog_extend_minimize_css;
        document.body.appendChild(demic);

        scriptElem.innerHTML = vardefs + moveToStr + deleteNoteStr + toggleLockStr + toggleLockOneStr + toggleSortStr + resetTableStr + setTableDataStr + setRowDataStr + setImportTableDataStr + setImportRowDataStr + copyNoteStr + importNotesStr + importNotesDataStr ;// + minimizeItStr;// 
        scriptElem2.innerHTML = removeShortcutsStr + collapseItStr + restoreItStr + closeItStr + createImportDlgStr + pauseItStr + playItStr + closeImportStr + giveMinsSecsStr + writeNotesStr + createCommentsTextStr + createCommentsDivStr;// + minimizeItStr;// 
        document.body.appendChild(scriptElem);
        document.body.appendChild(scriptElem2);
    }

    var divElem = document.createElement('div');
    divElem.setAttribute('id', 'dialog1');
    divElem.setAttribute('title', 'Play-n-Note');
    //divElem.setAttribute('option', 'autoOpen', 'false');
    divElem.setAttribute('style', 'position: absolute; left: 12px; top: 10px; z-index: 50000; display: block; height: 36px; width:294px; background-color: #428BCA; display:none');
    divElem.setAttribute('class', 'ui-dialog ui-widget ui-widget-content ui-corner-all ui-front ui-dialog-buttons ui-draggable draggable'); // ui-resizable
    divElem.setAttribute('role', 'dialog');
    divElem.setAttribute('aria-describedby', 'contentval');
    divElem.setAttribute('aria-labelledby', 'dlgtitle');
    divElem.innerHTML = notesHTML;

    /*var richEditElem = document.createElement('textarea');
    richEditElem.setAttribute('id','richEdit');
    richEditElem.setAttribute('name', 'richEdit');
    richEditElem.setAttribute('width', '100%');
    richEditElem.setAttribute('style', 'margin:30px 0 0 0;min-height:1px;width:100%;background-color:#fcfbf7;border:none;outline:none;overflow-y:visible;resize:none!important;border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border-bottom-left-radius: 0px; font-size:12px;line-height:18px;word-wrap:break-word;');*/
    var commentsTxtElem = document.getElementById('commentsTxt');

    if ($(".course-modal-frame")) {
        $(".course-modal-frame").after(function() { return divElem; });
        if ($("#commentsTxt").length == 0) {
            $(".course-modal-frame").after(commentsTxtElem);
        }
    } else if ($(".course-modal-frame.course-modal-frame-with-slides")) {
        $(".course-modal-frame.course-modal-frame-with-slides").after(function() { return divElem; });
        if ($("#commentsTxt").length == 0) {
            $(".course-modal-frame.course-modal-frame-with-slides").after(commentsTxtElem);
        }
    }
    //create extend container element /*<div id="dialog-extend-fixed-container" style="position: fixed; bottom: 1px; left: 1px; right: 1px; z-index: 9999;"></div>*/
    
    var rtdisplayed = '';
    if (notesData !== "" && notesData.length > 0) {
        notes = notesData.split(delimiter);
        txtNotes = notesTxtData.split(delimiter);
        i=0;
        $("tr[id^='cmt'] > td > div[id^='div'] > a").each( function(index) {
            //alert(JSON.stringify($(this).parent().parent().html()));
            if ($(this).attr("href").indexOf("deleteNote") > -1) {
                note = unescape(notes[i]);
                txtNote = unescape(txtNotes[i]);

                if (txtNote.length > 100) {
                    txtNote = txtNote.substring(0,97) + "...";
                }
                //alert(note);
                $(this).after("&nbsp;" + txtNote + "&nbsp;");
                $(this).parent().next().find("div:first-child").html(note);
                $(this).parent().mousedown(function() {
                    //alert(this.id);
                    if (rtdisplayed != "" && rtdisplayed != $(this).attr("id")) {
                        $("#" + rtdisplayed).next().css('display', 'none');
                    }
                    /*alert($(this).html());
                    alert($(this).parent().html());*/
                    p = $(this).parent().position();
                    if($(this).next().css('display') == "none")
                        $(this).next().css({'display': 'block', 'width': '250%', 'top': p.top});
                    else
                        $(this).next().css('display','none');

                    rtdisplayed = $(this).attr("id");
                    
                });
                
                i++;
                if (i == txtNotes.length) {
                    setTimeout(makeItDraggable, 1000);
                }
            }
        });
    } else {
        setTimeout(makeItDraggable, 1000);
    }

    var capsOn = false;
    var shiftOn = false;
    var pauseFn = "0";
    var playFn = "1";
    var instant = 0;

    $( "#commentsTxt" ).mousedown(function() {
        removeShortCuts();
        pauseIt();
    });

    $( "div[role='dialog']" ).on('load', function() {
        alert('dialog created');
        console.log('dialog created');
    });


    $( "div[contenteditable='true']" ).mousedown(function() {
        alert('123');
        $("#cke_commentsTxt").css('z-index','100016');
        removeShortCuts();
        pauseIt();
    });

    function makeItDraggable() {
        try {
            if ($("#dialog1").length) {
                $("#dialog1").draggable({containment: "window"});
            }
        } catch (e) {
            console.log("couldn't make the comment window draggable");
        }
            //alert("should be draggable now");
        $("#dialog1").show();

    }

    function pauseIt() {
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
    }

    function playIt() {
        if (window.QL_player != null) {
            window.QL_player.mediaelement_handle.play();
        } else if ($('me_flash_0') != null) {
            $('me_flash_0').playMedia();
        }
    }

    $("#commentsTxt").keydown(function (e) { //this should take care of special characters not being trapped.
        pauseIt();        
        if (e.keyCode == 8) { //backspace = 8
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
                content = '<a style="font-size:10px;z-index:50000;padding-right:0px;" href="javascript:deleteNote(' + prms +')"><img src="' + RESOURCE_DOMAIN + '/images/deletecomment.png" alt="Delete"/></a> &nbsp;&nbsp;<a style="float:right" href=javascript:moveTo(' + instant + '); >' + instant + 's</a> &nbsp;<a href=javascript:toggleLockOne(' + uId1 + ',' + uId2 + ',"' + timenow + '")><img width=16 height=16 id="lock' + timenow + '" src="' + RESOURCE_DOMAIN + '/images/lock_closed.png" style="float:right"/></a>';
                part_data = timenow + '">' + '"><td><div id="div' + timenow + '">' + content + '</div><ins class="dark-tooltip dark medium west" style="max-width: none; left: 306px; opacity: 0.9; width: 250%; display: none"><div>' + text + '</div><div class="tip"></div></ins></td></tr>'
                rich_content_white = '<tr bgcolor="white" id="cmt' + part_data; 
                if ($("#notesTbl > tbody > tr").length == 0 ) {
                    $(rich_content_white).insertAfter($('table > tbody'));
                } else {
                    $(rich_content_white).insertBefore($('table > tbody > tr:first'));
                }
                if ($("#div" + timenow).length > 0) {
                    textval = $("#div" + timenow).next().find("div:first-child").text();
                    if (textval.length > 100) {
                        textval = textval.substring(0, 97) + '...';
                    }
                    $("#div" + timenow).find("a:first-child").after(textval);
                    $("#div" + timenow).mousedown(function() {
                        p = $(this).parent().position();
                        if($(this).next().css('display') == "none")
                            $(this).next().css({'display': 'block', 'width': '250%', 'top': p.top});
                        else
                            $(this).next().css('display','none');
                    });
                }
                text = text.replace(/\n/g, '<br>').trim();
                $.support.cors = true;
                $.ajax({
                    type: 'POST',
                    url: SERVER_URL + '/submitNoteExtn',
                    dataType: 'json',
                    data: {googleId: gId, videoURL: vId, comments: escape(text), noteId: timenow, instant: instant, ispublic: false, title: $("title").html(), url: document.URL}
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

    $(".icon-remove").on('click', function(event) { $("#dialog1").remove(); if ($("#cke_commentsTxt").length > 0) $("#cke_commentsTxt").hide(); });    

    $("#commentsTxt").focus();

}

function createCommentsTextarea() {
    return "<textarea id='commentsTxt' contentdeditable='true' name='commentsTxt' placeholder='Write a note (Enter to play)... ' style='margin:-5px 0 0 -2px;min-height:150px;width:100%;background-color:#fcfbf7;border:none;outline:none;overflow-y:visible;border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border-bottom-left-radius: 0px; font-size:12px;line-height:18px;word-wrap:break-word; resize: none; top:40px; position:absolute'></textarea>";
}

function createCommentsDiv() {
    return "<div id='commentsTxt' contenteditable='true' name='commentsTxt' placeholder='Write a note (Enter to play)... ' style='margin:-5px 0 0 -2px;min-height:200px;width:100%;background-color:#fcfbf7; font-size:12px;line-height:18px;word-wrap:break-word; resize: none; top:40px; position:absolute'><p></p></div>";
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

    tableHeaders = "<table id='notesTbl' style='font-size:12px; table-layout:auto; position: relative; padding-right:0px;width:289px;top:94px; margin: 0 0 0 0; word-wrap:break-word' class='table table-striped table-bordered table-condensed'>";
    tableHeaders += "<thead><tr bgcolor='white' ><td>";
    tableHeaders += "&nbsp;<a href=javascript:writeRichNote('" + uId + "$" + vId + "')><img width=16 height=16 src='" + RESOURCE_DOMAIN + "/images/editor.png' alt='Rich Text Editor' /></a>&nbsp;&nbsp;";
    tableHeaders += "&nbsp;<a href=javascript:importNotes('" + uId.substring(1,uId.length-1) + "$" + vId + "')><img width=16 height=16 src='" + RESOURCE_DOMAIN + "/images/import.png' alt='Import Video Notes' /></a>&nbsp;&nbsp;";
    tableHeaders += "&nbsp;<a href=javascript:toggleTimeSort('" + uId.substring(1,uId.length-1) + "$" + vId + "')>&nbsp;<img width=16 height=16 id='sorticon' src='" + RESOURCE_DOMAIN + "/images/sort_up.png' alt='Sort By Instant/Timestamp'  align='right'/>&nbsp;</a>&nbsp;&nbsp;";
    tableHeaders += "&nbsp;<a href=javascript:toggleLock('" + uId.substring(1,uId.length-1) + "$" + vId + "')>&nbsp;<img width=16 height=16 id='lockall' src='" + RESOURCE_DOMAIN + "/images/" + lockicon + "'  alt='Latest Comments' align='right'/>&nbsp;</a>&nbsp;&nbsp;";
    tableHeaders += "</td></tr></thead><tbody>";
        
    for(i = 0; i < len-1; i++) {
      uId = "s" + data[i].googleId + "s"; //put the s back together 
      uId1 = uId.substring(1, 10);
      uId2 = uId.substring(10, uId.length-1);
        if (data[i].ispublic == true)
            lockicon = "lock_open.png";
        else
            lockicon = "lock_closed.png";
      prms = "'" + data[i].noteId + "$" + uId1  + "$" + uId2 + "$" + vId + "'";
        tableData = tableData + "<tr bgcolor='white' id='cmt" + data[i].noteId + "'><td><div id='div" + data[i].noteId + "'><a style='font-size:10px;z-index:50000;padding-right:0px;' href=javascript:deleteNote(" + prms + ")><img src='" + RESOURCE_DOMAIN + "/images/deletecomment.png' alt='Delete'/></a><a  style='float:right' href=javascript:moveTo(" + data[i].instant + "); alt='Delete'>" + data[i].instant + "s</a> &nbsp;<a href='javascript:toggleLockOne(" + uId1  + ", " + uId2 + ", " + data[i].noteId + ")'><img width=16 height=16 id='lock" + data[i].noteId + "' src='" + RESOURCE_DOMAIN + "/images/" + lockicon + "' style='float:right'/></a></div><ins class='dark-tooltip dark medium west' style='max-width: none; left: 306px; opacity: 0.9; width: 250%; display: none'><div></div><div class='tip'></div></ins></td></tr>";
    }
    tableEnd = "</tbody></table>";
    var commentHTML = createCommentsTextarea(); //"<textarea id='commentsTxt' contentdeditable='true' name='commentsTxt' placeholder='Write a note (Enter to play)... ' style='margin:-5px 0 0 -2px;min-height:104px;width:100%;background-color:#fcfbf7;border:none;outline:none;overflow-y:visible;border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border-bottom-left-radius: 0px; font-size:12px;line-height:18px;word-wrap:break-word; resize: none; top:40px; position:absolute'></textarea>";
    tableData = commentHTML + tableHeaders + tableData + tableEnd;

    return tableData;
}

var delimiter = "" + Math.random().toString(36).substring(0,5);
var notesHTML = "";
var richDataStr = "";
var txtDataStr = "";
//var SERVER_URL = "https://playnnote.herokuapp.com";
var SERVER_URL = "http://localhost:3000";
var RESOURCE_DOMAIN = "https://playnnote.herokuapp.com";
if (notes === undefined || notes === 'undefined' || notes == "") {
    notesHTML = createTableData("", ids.vId, ids.gId);
} else {
    data = JSON.parse(notes.notesData);
    notesHTML = createTableData(data, ids.vId, ids.gId);
    var txtDataStr = "";
    for (i=0; i<data.length-1; i++) {
        //alert('data[i]' + JSON.stringify(data[i]));
        if (i > 0) {
            txtDataStr += delimiter;
            richDataStr += delimiter;
        }
        val = data[i].commentsTxt;
        txtDataStr += val;
        richDataStr += data[i].comments;
    }
}
var cssHTML = "<div id='dlghdr1' class='ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix' style='border: 0px; background-image: none; background-color: #428BCA; margin: -4px -4px 4px -4px;'>";
cssHTML += "<span id='dlgtitle' class='ui-dialog-title' style='margin: 5px 5px 5px 5px; background-color: #428BCA; color: #fff'>Play N Note</span>";

cssHTML += "<div class='ui-dialog-titlebar-buttonpane' style='position: absolute; top: 50%; right: 0.3em; margin-top: -10px; height: 18px;'>" + 
                "<a class='ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close' href='javascript:closeIt()' role='button' aria-disabled='false' title='close' style='position: relative; float: right; top: auto; right: auto; margin: 0px;'>" + 
                    "<span class='ui-button-icon-primary ui-icon ui-icon-closethick'></span></a>" + 
                    /*"<span class='ui-button-text'>close</span>" + 
                "</button>" + */
                "<a class='ui-dialog-titlebar-collapse ui-corner-all ui-state-default' href='javascript: collapseIt()' role='button' style='display: block;'>" +
                    "<span class='ui-icon ui-icon-triangle-1-s'>collapse</span></a>" + 
                /*"<a class='ui-dialog-titlebar-maximize ui-corner-all ui-state-default' href='#' role='button' style='display: block;'>" + 
                    "<span class='ui-icon ui-icon-extlink'>maximize</span></a>" + 
                "<a class='ui-dialog-titlebar-minimize ui-corner-all ui-state-default' href='javascript: minimizeIt()' role='button' style='display: block;'>" + 
                    "<span class='ui-icon ui-icon-minus'>minimize</span></a>" +*/
                "<a class='ui-dialog-titlebar-restore ui-corner-all ui-state-default' href='javascript: restoreIt()' role='button' style='display: none'>" + 
                    "<span class='ui-icon ui-icon-newwin'>restore</span></a>" + 
            "</div>";
cssHTML += "</div>";
var hdrcontent="<div id='contentval' class='ui-dialog-content ui-widget-content ui-dialog-normal' style='display: block; width: auto; min-height: 0px; max-height: none; height: auto;'>";

notesHTML = cssHTML + notesHTML;//endDiv + hdrcontent + notesHTML + endDiv;
var injected = false;
injectScript(showNotes, notesHTML, ids.vId, ids.gId, delimiter, richDataStr, txtDataStr);
