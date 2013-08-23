function injectScriptNoDelete(e,t){var n=function(e){return Object.prototype.toString.call(e)=="[object Function]"};var r=function(e){if(!e||!e.length)return e;var t=/['"<>\/]/g,n="",r=0,i;do{i=t.exec(e);n+=i?e.substring(r,t.lastIndex-1)+"\\x"+i[0].charCodeAt(0).toString(16):e.substring(r)}while(i&&(r=t.lastIndex)>0);return n.length?n:e};var i=n(e);var s=document.createElement("script");var o,u,a="";if(i){var f=[];for(var l=2;l<arguments.length;l++){var c=arguments[l];var h;if(n(c))h='eval("'+r("("+c.toString()+")")+'")';else if(Object.prototype.toString.call(c)=="[object Date]")h="(new Date("+c.getTime().toString()+"))";else if(Object.prototype.toString.call(c)=="[object RegExp]")h="(new RegExp("+c.toString()+"))";else if(typeof c==="string"||typeof c==="object")h='JSON.parse("'+r(JSON.stringify(c))+'")';else h=c.toString();f.push(h)}while(a.length<16)a+=String.fromCharCode(!a.length||Math.random()>.5?97+Math.floor(Math.random()*25):48+Math.floor(Math.random()*9));o="(function(){var value={callResult: null, throwValue: false};try{value.callResult=(("+e.toString()+")("+f.join()+"));}catch(e){value.throwValue=true;value.callResult=e;};"+"document.getElementById('"+a+"').innerText=JSON.stringify(value);})();";s.id=a}else{o=e}s.type="text/javascript";s.innerHTML=o;document.head.appendChild(s);if(i){u=JSON.parse(s.innerText);if(t==true){s.parentNode.removeChild(s);delete s}if(u.throwValue)throw u.callResult;else return u.callResult}else return s}
function isAuthorized() {
  oauth.authorize(function() {
    //setIcon();
    //look at https://developers.google.com/oauthplayground/ to choose the right API.
    var url = "https://www.googleapis.com/oauth2/v2/userinfo"; //this is the API to call to get the name and google Id
    oauth.sendSignedRequest(url, saveGInfo, {
      'parameters' : {
        'alt' : 'json',
      }
    });
  });
};
var uId;
var dispName;
var tabId;

function saveGInfo(text, xhr) {
  var jsonResp = JSON.parse(text);
  uId = jsonResp.id;
  dispName = jsonResp.name;
  //alert(uId);
  chrome.storage.local.set({'gId': uId, 'displayName': dispName});
  triggerGetNotes();
}

function triggerGetNotes() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var url = tabs[0].url;
      var lastWord = url.substring(url.lastIndexOf("/") + 1);
      //alert(lastWord);
      if (lastWord != 'index') {
        tabId = tabs[0].id;
        loadNotes(uId, url, tabId);
        //chrome.storage.local.set({'tabId': tabId});
      }
  });
}

function loadNotes(uId, url, tabId) {
  //alert(url);
  //WARNING - dont make URL-REGEX a class var because it would be cached and .exec would give match null alternately
  var URL_REGEX = /(http|https):\/\/class.coursera.org\/([-a-zA-Z0-9]*)\/lecture\/([1-9]*)/g; 
  var match = URL_REGEX.exec(url); //this would match all the groups mentioned in parentheses in the regex
  //alert(JSON.stringify(match));
  var courseCode = match[2];
  var lectureCode = match[3];

  vId = courseCode + "_" + lectureCode;
  //alert(vId);
  chrome.storage.local.set({'vId': vId});
  $.support.cors = true; //NOTE: without this ($.support.cors = true),  the ajax call to an external server would not work
  
  $.ajax({
      type: 'GET',
      //url: 'http://playnnote.herokuapp.com/getNotes',
      url: 'http://localhost:3000/getNotesExtn',
      data: {googleId: uId, videoURL: vId},
      success: function(data) {
        strData = JSON.stringify(data);
        chrome.tabs.executeScript(tabId, {code: "var notes={notesData: '" + strData + "'};"}, function() {
          chrome.tabs.executeScript(tabId, {file: "javascripts/shownotes.js"});
        });
      },
      error: function (xhr, error) {
        alert('failure in getting notes');
        chrome.tabs.executeScript({file: "javascripts/shownotes.js"});
      },
      dataType: "json"
  });  
}

function getCurrentTime() {
  if (window.QL_player != null) {
      return window.QL_player.mediaelement_media.currentTime;
  } else if ($('me_flash_0') != null) {
      return $('me_flash_0').currentTime();
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var time = getCurrentTime();
    sendResponse({currTime: time});
  }
);

//this method is to load the notes for a given lecture in the page displayed


// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf('coursera.org') > -1) {
    chrome.pageAction.show(tabId);
  }
  chrome.tabs.create({ 'url' : 'test.html'});
}

var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key' : 'anonymous',
  'consumer_secret' : 'anonymous',
  'scope' : 'https://www.googleapis.com/auth/userinfo.profile',
  'app_name' : 'Play-n-Note - Play Videos · Take Notes'
});

/*
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "knockknock");
  port.onMessage.addListener(function(msg) {
    if (msg.joke == "Knock knock")
      port.postMessage({question: "Who's there?"});
    else if (msg.answer == "Madame")
      port.postMessage({question: "Madame who?"});
    else if (msg.answer == "Madame... Bovary")
      port.postMessage({question: "I don't get it."});
  });
});
*/

// Execute the content script to be pushed to 
//chrome.tabs.executeScript(null, {file: "javascripts/contentscript.js"});
//chrome.tabs.onUpdated.addListener(isAuthorized);
chrome.webNavigation.onCompleted.addListener(isAuthorized, 
                                              {
                                                url: [{hostSuffix: 'class.coursera.org'}]
                                              });


 
 
