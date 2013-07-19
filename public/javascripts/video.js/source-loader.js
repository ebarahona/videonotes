// This file is used to load the video.js source files into a page
// in the correct order based on dependencies.
// When you create a new source file you will need to add
// it to the list below to use it in sandbox/index.html and
// test/index.html

// You can use the projectRoot variable to adjust relative urls
// that this script loads. By default it's "../", which is what /sandbox
// and /test need. If you had sandbox/newDir/index.html, in index.html you
// would set projectRoot = "../../"

// We could use somehting like requireJS to load files, and at one point
// we used goog.require/provide to load dependencies, but that seems like
// overkill with the small number of files we actually have.

// ADD NEW SOURCE FILES HERE
var sourceFiles = [
  "javascripts/video.js/js/core.js",
  "javascripts/video.js/js/core-object.js",
  "javascripts/video.js/js/events.js",
  "javascripts/video.js/js/lib.js",
  "javascripts/video.js/js/component.js",
  "javascripts/video.js/js/button.js",
  "javascripts/video.js/js/slider.js",
  "javascripts/video.js/js/menu.js",
  "javascripts/video.js/js/player.js",
  "javascripts/video.js/js/control-bar/control-bar.js",
  "javascripts/video.js/js/control-bar/play-toggle.js",
  "javascripts/video.js/js/control-bar/time-display.js",
  "javascripts/video.js/js/control-bar/fullscreen-toggle.js",
  "javascripts/video.js/js/control-bar/progress-control.js",
  "javascripts/video.js/js/control-bar/volume-control.js",
  "javascripts/video.js/js/control-bar/mute-toggle.js",
  "javascripts/video.js/js/control-bar/volume-menu-button.js",
  "javascripts/video.js/js/poster.js",
  "javascripts/video.js/js/loading-spinner.js",
  "javascripts/video.js/js/big-play-button.js",
  "javascripts/video.js/js/media/media.js",
  "javascripts/video.js/js/media/html5.js",
  "javascripts/video.js/js/media/flash.js",
  "javascripts/video.js/js/media/loader.js",
  "javascripts/video.js/js/tracks.js",
  "javascripts/video.js/js/json.js",
  "javascripts/video.js/js/setup.js",
  "javascripts/video.js/js/plugins.js"
];

// Allow overriding the default project root
var projectRoot = projectRoot || '../';

function loadScripts(scriptsArr){
  for (var i = 0; i < scriptsArr.length; i++) {
    // Using document.write because that's the easiest way to avoid triggering
    // asynchrnous script loading
    document.write( "<script src='" + projectRoot + scriptsArr[i] + "'><\/script>" );
  }
}

// We use this file in the grunt build script to load the same source file list
// and don't want to load the scripts there.
if (typeof blockSourceLoading === 'undefined') {
  loadScripts(sourceFiles);

  // Allow for making Flash first
  if (window.location.href.indexOf("?flash") !== -1) {
    // Using doc.write to load this script to, otherwise when it runs videojs
    // is undefined
    document.write('<script>videojs.options.techOrder = ["flash"];videojs.options.flash.swf = "../swf/video-js.swf";</script>')
  }
}


