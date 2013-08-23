var paused = false;

function setListeners() {
  if (document.addEventListener) { //code for Moz
    document.addEventListener("keypress",keyCapt,false);
  } else {
    document.attachEvent("onkeypress",keyCapt); 
  }
}

function submitNote(text, timenow) {    
  //uId = '116344056495429556007';
  //vId = 'startup-001_1';
  chrome.storage.local.get('gId', function(ids) {
    uId = ids.gId;
    chrome.storage.local.get('vId', function(videos) {
      vId = videos.vId;
      text = text.replace(/\n/g, '<br>').trim();
      $.support.cors = true;
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/submitNote',
        data: {googleId: uId, videoURL: vId, comments: text, noteId: new Date().getTime(), instant: timenow, ispublic: false},
          success: function(data) { 
            var lielem = document.getElementById("commentList").firstChild;
            lielem.setAttribute('id', 'li' + data.noteId);
            lielem.firstChild.setAttribute('href', 'javascript:deleteNote("' + data.noteId + '")');
         },
         error: function (xhr, error) {
         }, 
         dataType: "json"
      });
    });
  });

        
}

function processNote() {
  var elem = document.getElementById("commentTxt");
  text = elem.value.trim();
  text = text.replace(/\n/g, '<br>').trim();
  
  elem.value = "";
  chrome.tabs.executeScript({file: "javascripts/getcurrtime.js"}, function(results) {
    timestamp = Math.round(parseFloat(results));
    displayNote(text, timestamp);
    submitNote(text, timestamp);
  }); 
  
}

function displayNote (text, instant) {
  var lst = document.getElementById("commentList");
  var listli = document.createElement('li');
  listli.innerHTML = '<a><img src="images/deletecomment.png" alt="Delete"/></a> &nbsp;' + text + '&nbsp;&nbsp;&nbsp;<a href=javascript:moveTo(' + instant + '); alt="Delete">' + instant + ' s</a>';
  lst.insertBefore(listli, lst.firstChild);
}

var timestamps = []; //keep adding the timestamps in case of 

function keyCapt(e) {
  if (typeof window.event != "undefined") {
    e = window.event;//code for IE
  }
  if(e.type=="keypress") {
    if (e.keyCode == "13") {
      processNote();
      chrome.tabs.executeScript({
        file: "javascripts/playit.js"
      });
      paused = false;
      timestamps = []; //reset the array
    } else {
      chrome.tabs.executeScript({file: "javascripts/pauseit.js"});
    }
  }
}


window.onload = function() {
  
  setListeners();
  
  chrome.storage.local.get('strData', function(ids) {
      data = JSON.parse(ids.strData);
      var lst = document.getElementById("commentList");
      for (i=0; i < data.length; i++) {
        var listli = document.createElement('li');
        listli.innerHTML = '<a href="javascript:deleteNote(' + data[i].noteId + ')"><img src="images/deletecomment.png" alt="Delete"/></a> &nbsp;' + data[i].comments + '&nbsp;&nbsp;&nbsp;<a href=javascript:moveTo(' + data[i].instant + '); alt="Delete">' + data[i].instant + ' s</a>';
        lst.insertBefore(listli, lst.firstChild);
      }
  });

  document.getElementById('commentBtn').onclick = submitNote;

};