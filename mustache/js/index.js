var engine_name = "hogan";
var engine = require("hogan.js")
  , fs    = require('fs')
  , AutoLoader = require('./classes/autoload-hogan.js');

var output_folder = 'output';
var compressor;
try {
	compressor = require('yuicompressor');	
} catch(e) {
	compressor = null;//unable to resolve, means yuicompressor is not available
}

var path = 
{
 data : __dirname + '/../app/data',
 views : __dirname + '/../app/views',
 base : '..',
 assets : '../assets',
 images : '../assets/images'
}

//avoid any file reading in production because readFileSync is a synchronous process. Keep the config values in memory if possible
//var site = JSON.parse(fs.readFileSync(path['data']+'/common/site.json' , 'utf-8'));//this site some basic site variables
var site_json = "{" +
 "\"title\" : \"Play N Note\", " +
 "\"brand_text\" : \"Play N Note\", " +
 "\"brand_icon\" : \"fa\", " +
 "\"remote_jquery\" : false, " +
 "\"remote_fonts\" : false, " +
 "\"remote_bootstrap_js\" : false, " +
 "\"remote_fontawesome\" : false, " +
 "\"onpage_help\" : false}";
var site = JSON.parse(site_json);
site['protocol'] = 'http:'
if(site['protocol'] == false) site['protocol'] = '';

var Sidenav_Class = require('./classes/Sidenav')
var sidenav = new Sidenav_Class()

var Page_Class = require('./classes/Page')
var Indentation = require('./classes/Indent')
var autoload = new AutoLoader(engine , path);

if(site['development'] == true) {
 site['ace_scripts'] = [];
 //var scripts_data = fs.readFileSync(__dirname + '/../../assets/js/ace/scripts.json' , 'utf-8');
 var scripts_data = "{" +
 				 "\"elements.scroller.js\" : false, "+
 				 "\"elements.colorpicker.js\" : false, "+
 				 "\"elements.fileinput.js\" : false, "+ 
 				 "\"elements.typeahead.js\" : false, "+
	 			 "\"elements.wysiwyg.js\" : true, "+
	 			 "\"elements.spinner.js\" : false, "+
	 			 "\"elements.treeview.js\" : false, "+
	 			 "\"elements.wizard.js\" : false, "+
	 			 "\"ace.js\" : true, "+
	 			 "\"ace.touch-drag.js\" : false, "+
	 			 "\"ace.sidebar.js\" : true, "+
	 			 "\"ace.submenu-1.js\" : false, "+
	 			 "\"ace.sidebar-scroll-1.js\" : false, "+
	 			 "\"ace.submenu-hover.js\" : true, "+
	 			 "\"ace.widget-box.js\" : false, "+
	 			 "\"ace.settings.js\" : true, "+
	 			 "\"ace.settings-rtl.js\" : true, "+
	 			 "\"ace.settings-skin.js\" : true, "+
	 			 "\"ace.widget-on-reload.js\" : false, "+
	 			 "\"ace.searchbox-autocomplete.js\" : false, "+
	 			 "\"ace.autohide-sidebar.js\" : true, "+
	 			 "\"ace.auto-padding.js\" : false, "+
	 			 "\"ace.auto-container.js\" : false}";
 var scripts = JSON.parse(scripts_data);

 for(var name in scripts)
   if(scripts.hasOwnProperty(name) && scripts[name] == true) {
	 site['ace_scripts'].push(name);
   }
}

//iterate over all pages and generate the static html file
var page_views_folder = path["views"]+"/pages";

//var files = fs.readdirSync(page_views_folder)
var files = [ "timeline.mustache" ]	;
files.forEach(function (name) {
	var filename;//file name, which we use as the variable name
	if (! (filename = name.match(/(.+?)\.(mustache|html)$/)) ) return;
	var page_name = filename[1];
	
	generate(page_name);
})

function generate(page_name) {
	var page = new Page_Class( {'engine':engine, 'path':path, 'name':page_name, 'type':'page', 'compressor': compressor} );
	page.initiate(function() {
		var layout_name = page.get_var('layout');
		var layout = new Page_Class( {'engine':engine, 'path':path, 'name':layout_name, 'type':'layout'} );
		layout.initiate();
		if(layout.get_var('sidebar_items'))
		{
			sidenav.set_items(layout.get_var('sidebar_items'));
			sidenav.mark_active_item(page_name);
		}


		var context = { "page":page.get_vars() , "layout":layout.get_vars(), "path" : path , "site" : site }
		context['breadcrumbs'] = sidenav.get_breadcrumbs();
		context['user_name'] = 'Ashish';
		context['timelines'] = [
			{ "date" : "Tuesday Jun 3", "date_id" : "one"}, 
			{ "date" : "Sunday, Jun 1", "date_id" : "two"},
			{ "date" : "Sunday, May 24", "date_id" : "three"}
		];
		context['course1_name'] = 'First Course';
		context['video1_name'] = 'First Video';
		context['video1_timespan'] = '10:20';
		context['first_note'] = true;
		context['notes1_details'] = 'This would contain the <em>rich</em> and <i>important</i> content.<li> line bullet </li><ol> Indent in html?<ol> Double <em>indent</em> ? </ol></ol><p></p>';
		var moreNotes = new Array(5);
		for (var i=0; i< 5; i++) {
			moreNotes[i] = {"note_number": i+1, "course_name" : "Course" + i, "video_name" : "Video"+i, "video_timespan" : "" + 5*i + ":" + 5*2*i, "notes_details" : "Note number " + i + " has these details "};
		}
		context['more_notes'] = moreNotes;
		context['createLinkFunction'] = function(value) {
			return value+'.html';
		}

		autoload.set_params(page.get_name() , layout_name);

		var rendered_output = engine_name == "hogan" ? layout.get_template().render(context) : (layout.get_template())(context)
		Indentation(rendered_output , site['onpage_help'], function(result) {
			var output_file = output_folder+'/'+page_name+'.html';
			fs.writeFileSync( __dirname + '/'+output_file , result, 'utf-8' );
			console.log(output_file);
		})
	});

}
