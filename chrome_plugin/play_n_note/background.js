// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

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

function saveGInfo(text, xhr) {
  var jsonResp = JSON.parse(text);
  uId = jsonResp.id;
  dispName = jsonResp.name;
  //alert(uId);
  chrome.storage.sync.set({'gId': uId, 'displayName': dispName});
  triggerGetNotes();
}

function triggerGetNotes() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        var url = tabs[0].url;
        //alert('url: ' + url);     
        var lastWord = url.substring(url.lastIndexOf("/") + 1);
        //alert(lastWord);
        if (lastWord != 'index') {
          loadNotes(uId);
        }
    });
}

var notes;

function loadNotes(uId) {
  //alert('in load notes');
  //uId = "116344056495429556007";
  vId = "startup-001_1_1";
  $.support.cors = true; //NOTE: without this ($.support.cors = true),  the ajax call to an external server would not work
  $.ajax({
       type: 'GET',
       //url: 'http://playnnote.herokuapp.com/getNotes',
       url: 'http://localhost:3000/getNotes',
       data: {googleId: uId, videoURL: vId},
       success: function(data) {
         strData = JSON.stringify(data);
         chrome.storage.sync.set({'currentNote': strData}, function() {
            //alert('notes saved');
         });
         //alert(strData);
         //chrome.storage.StorageArea.getBytesInUse('currentNote', function(bytesInUse) {
         //   alert('Byes in Use:' + bytesInUse);
         //});         
       },
       error: function (xhr, error) {
         alert("Couldn't load notes from server");
       }, 
       dataType: "json"
  });
}

//this method is to load the notes for a given lecture in the page displayed
function loadNotesInFrame(data) {
    var elem = document.getElementById('commentList');
    if (elem) {
      while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
      }
    }
    if (data == null || data.length == 0)
      return;

    for(i=0; i<data.length; i++) {
      
      var listli = document.createElement('li');
      listli.setAttribute('id', 'li' + data[i].noteId);
      var aelem = document.createElement('a');
      aelem.setAttribute();
      instant = data[i].instant;
      listli.innerHTML = '<a alt="Delete" href=javascript:deleteNote("' + data[i].noteId + '")><img src="/images/deletecomment.png" alt="Delete"/></a> &nbsp;' + data[i].comments;
      listli.innerHTML += '&nbsp;&nbsp;&nbsp;<a href=javascript:moveTo(' + instant + '); alt="Delete">' + instant + ' s</a>';
      elem.insertBefore(listli, elem.firstChild);        
    }
}

// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
  // If the letter 'g' is found in the tab's URL...
  if (tab.url.indexOf('coursera.org') > -1) {
    chrome.pageAction.show(tabId);
  }
  chrome.tabs.create({ 'url' : 'test.html'});
};

var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key' : 'anonymous',
  'consumer_secret' : 'anonymous',
  'scope' : 'https://www.googleapis.com/auth/userinfo.profile',
  'app_name' : 'Play-n-Note - Play Videos · Take Notes'
});

//assume that as a result of authentication and authorization from Google oauth, the access tokens are stored in localstorage

function getTheNotes(text, xhr) {
  console.log(text);
  var data = JSON.parse(text);
}
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

chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  //alert('Turning ' + tab.url + ' red!');
  chrome.tabs.executeScript({
    file: "javascripts/contentscript.js"
  });
});


 
 
