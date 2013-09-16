function isAuthorized() {
  if ($("#dialog")) {
      $("#dialog").html('');
      $("#dialog").remove();
  }
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
  uId = 's'+jsonResp.id + 's'; //set a 's' prefix right in the beginning
  dispName = jsonResp.name;
  
  chrome.storage.local.set({'gId': uId, 'displayName': dispName});
  triggerGetNotes();
}

function triggerGetNotes() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var url = tabs[0].url;
    if (url.substring(0,6) == "chrome") {
      alert("about to remove tab " + tabs[0].id);
      chrome.tabs.remove(tabs[0].id);
    }
    var lastWord = url.substring(url.lastIndexOf("/") + 1);
    if (lastWord.indexOf('index') < 0) {
      tabId = tabs[0].id;
      loadNotes(uId, url, tabId);
    }        
  });
}

function loadNotes(uId, url, tabId) {
  //alert(url);
  //WARNING - dont make URL-REGEX a class var because it would be cached and .exec would give match null alternately
  var URL_REGEX = /(http|https):\/\/class.coursera.org\/([a-zA-Z0-9-]*)\/lecture\/([0-9]{0,4})/g; 
  var match = URL_REGEX.exec(url); //this would match all the groups mentioned in parentheses in the regex
  var courseCode = match[2];
  var lectureCode = match[3];

  vId = courseCode + "_" + lectureCode;
  chrome.storage.local.set({'vId': vId, 'url': url});
  $.support.cors = true; //NOTE: without this ($.support.cors = true),  the ajax call to an external server would not work
  //alert('loading notes');

  $.ajax({
      type: 'GET',
      url: 'http://playnnote.herokuapp.com/getNotesExtn',
      //url: 'http://localhost:3000/getNotesExtn',
      data: {googleId: uId, videoURL: vId},
      success: function(data) {
        strData = JSON.stringify(data);
        chrome.tabs.executeScript(tabId, {code: "var notes={notesData: '" + strData + "'};"}, function() {
          chrome.tabs.executeScript(tabId, {code: "var ids={vId: '" + vId + "', gId: '" + uId + "'};"}, function() {
            chrome.tabs.executeScript(tabId, {file: "src/shownotes.js"});
          });
        });
      },
      error: function (xhr, error) {
        alert('failure in getting notes');
        chrome.tabs.executeScript({file: "src/shownotes.js"});
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

var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key' : 'anonymous',
  'consumer_secret' : 'anonymous',
  //'scope' : 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata',
  'scope' : 'https://www.googleapis.com/auth/userinfo.profile',
  'app_name' : 'Play-n-Note'
});

chrome.webNavigation.onCompleted.addListener(isAuthorized, 
                                              {
                                                url: [{hostSuffix: 'class.coursera.org'}]
                                              });


 
 
