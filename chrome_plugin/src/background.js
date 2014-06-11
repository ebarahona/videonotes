function isAuthorized() {
  if ($("#dialog")) {
      $("#dialog").html('');
      $("#dialog").remove();
  }
  var google = new OAuth2('google', {
    client_id: '89641588136-sjr8kvn7bg4pel7qkrvaji8cg697ap79.apps.googleusercontent.com',
    client_secret: 'cma_qHvZRuCQ3cO6tdnmF9XS',
    api_scope: 'https://www.googleapis.com/auth/userinfo.profile'
  });

  google.authorize(function() {
    token = google.getAccessToken();
    $.ajax({
      type: 'GET',
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      crossDomain: true,
      headers: {'Authorization': 'Bearer ' + token},
      
      success: function(data) {
        uId = 's'+data.id + 's'; //set a 's' prefix right in the beginning
        dispName = data.name;
        chrome.storage.local.set({'gId': uId, 'displayName': dispName});
        //store this user information in data store
        triggerGetNotes(uId);
      },
      
      error: function (xhr, error) {
        google.removeAuthToken({token: token}, isAuthorized);
      },
      dataType: "json"
    });  
  });
}

function attachPrevNextLinks() {
  $(".course-lecture-view-prev-link.course-lecture-controls-button").on("click", isAuthorized);
  $(".course-lecture-view-next-link.course-lecture-controls-button").on("click", isAuthorized);
}

var displaying = false;
var uId;
var dispName;
var tabId;
//var SERVER_URL = "http://localhost:3000";
var SERVER_URL = "http://playnnote.herokuapp.com";

function triggerGetNotes(uId) {
  //alert('triggerGetNotes');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var url = tabs[0].url;
    var lastWord = url.substring(url.lastIndexOf("/") + 1);
    if (lastWord.indexOf('index') < 0) {
      tabId = tabs[0].id;
      loadNotes(uId, url, tabId);
    }
  });
}

function loadNotes(uId, url, tabId) {
  //WARNING - dont make URL-REGEX a class var because it would be cached and .exec would give match null alternately
  //alert('loadNotes');
  attachPrevNextLinks();
  var URL_REGEX = /(http|https):\/\/class.coursera.org\/([a-zA-Z0-9-]*)\/lecture\/([0-9]{0,4})/g; 
  var match = URL_REGEX.exec(url); //this would match all the groups mentioned in parentheses in the regex
  var courseCode = match[2];
  var lectureCode = match[3];
  var timenow = new Date().getTime();

  vId = courseCode + "$" + lectureCode;
  chrome.storage.local.set({'vId': vId, 'url': url});
  $.support.cors = true; 
  if (displaying == false)
    displaying = true;
  else
    return;
  $.ajax({
      type: 'GET',
      url: SERVER_URL + '/getNotesExtn',
      data: { googleId: uId, lId: lectureCode, cId: courseCode, videoURL: vId, timenow: timenow },
      dataType: 'json', //json works
      crossDomain: true, //crossdomain works
      error: function (textStatus, xhr, error) {
        //alert('failure');
        chrome.tabs.executeScript(tabId, {code: "var ids={vId: '" + vId + "', gId: '" + uId + "'}; var notes='';"}, function() {
          displaying = false;
          chrome.tabs.executeScript(tabId, {file: "shownotes.js"});
        });
      },
      success: function(data) {
        strData = JSON.stringify(data);
        //alert(strData);
        chrome.tabs.executeScript(tabId, {code: "var notes={notesData: '" + strData + "'};"}, function() {
          chrome.tabs.executeScript(tabId, {code: "var ids={vId: '" + vId + "', gId: '" + uId + "'};"}, function() {
            displaying = false;
            chrome.tabs.executeScript(tabId, {file: "shownotes.js"});
          });
        });
      },
      
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
    sendResponse('ok');
  }
);

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    sendResponse('yes');
  }
);

chrome.webNavigation.onCompleted.addListener(isAuthorized, 
                                              {
                                                url: [{hostSuffix: 'class.coursera.org'}]
                                              });


 
 
