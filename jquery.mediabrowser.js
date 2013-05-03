/* 
 * jQuery Media Browser Plugin
 * Version 1.0
 * Author: Ronald A. Richardson
 */
(function($){

	var plugin = {	
			
			settings: {},
			
			mouseisdown: false,
			
			selected: {},
			
			init: function(options) { 
				var settings = $.extend( {
					'connector':	'/connector'
			    }, options);
				plugin.settings = settings;
				// Load mediabrowser viewer style
				$(this).addClass('mediaviewer').addClass('mediaviewer-box');
				// Load header
				$(this).append(
					'<div class="mediaviewer-header">' +
					'<i class="mv-icon mv-app-icon" style="margin-right:6px;margin-left:-8px;margin-top:-2px;"></i> <h4 style="margin-bottom:-5px;">Media Browser</h4>' +
					'<a id="back" class="mv-btn" onclick="$(this).mediabrowser(&#39;cmd&#39;, &#39;up&#39;);">&larr; Back</a>' +
					'<a id="back" class="mv-btn" onclick="$(this).mediabrowser(&#39;cmd&#39;, &#39;delete&#39;);">x Delete</a>' +
					'<a id="back" class="mv-btn" onclick="$(this).mediabrowser(&#39;cmd&#39;, &#39;delete&#39;);">+ New Directory</a>' +
					'<a id="back" class="mv-btn" onclick="$(this).mediabrowser(&#39;cmd&#39;, &#39;delete&#39;);">+ New File</a>' +
					'<a id="back" class="mv-btn" onclick="$(this).mediabrowser(&#39;cmd&#39;, &#39;delete&#39;);">&uarr; Upload</a>'
					//'<a id="new-folder" class="mv-btn">+ New Folder</a></div>'
				);
				// Load body
				$(this).append('<div class="mediaviewer-content"><div class="mediaviewer-body"></div></div>');
				// Load footer
				$(this).append('<div class="mediaviewer-footer">Current Directory: <span class="mv-cwd"></span></div>');
				//  initial open command to server
				plugin.cmd('open', '');
				plugin.bindings();
			},
			
			cmd: function(run, target) {
				var data = {}
				if(run == 'up') {
					data = {'cmd': run, 'target': $('.mv-cwd').html()};
				} else if(run == 'delete') {
					data = {'cmd': run, 'target': $('.mv-cwd').html(), 'files': plugin.selected}
				} else if(run == 'open') {
					data = {'cmd': run, 'target': target};
				}
				$.get(plugin.settings.connector, data, function(data){
					if(run == 'open') {
						if(typeof data !== 'object' && run == 'open') {
							plugin.select_file(target);
							return;
						}
						$('.mediaviewer-body').html('');
						$('.mv-cwd').html(data.cwd.target);
						for(var i in data.files) {
							$('.mediaviewer-body').append('<div class="mediaviewer-icon" id="' + data.files[i].name.replace('.', '-') + '" onmouseover="$(this).mediabrowser(&#39;highlight&#39;);" onclick="$(this).mediabrowser(&#39;cmd&#39;, &#39;open&#39;, &#39;' + escape(data.files[i].target) + '&#39;);"><i class="mv-icon mv-' + data.files[i].format + '-icon"></i> <p>' + data.files[i].name + '</p></div>');
						}
					} else if(run == 'delete') {
						$('.mediaviewer-body').html('');
						for(var i in data.files) {
							$('.mediaviewer-body').append('<div class="mediaviewer-icon" id="' + data.files[i].name.replace('.', '-') + '" onmouseover="$(this).mediabrowser(&#39;highlight&#39;);" onclick="$(this).mediabrowser(&#39;cmd&#39;, &#39;open&#39;, &#39;' + escape(data.files[i].target) + '&#39;);"><i class="mv-icon mv-' + data.files[i].format + '-icon"></i> <p>' + data.files[i].name + '</p></div>');
						}
					}
				})
			},
			
			highlight: function() {
				if(plugin.mouseisdown) {
					$(this).addClass('mv-icon-highlighted')
					plugin.selected[$(this).attr('id')] = $(this).children('p').html();
				}
			},
			
			select_file: function(target) {
				var id = '#' + target.replace(escape($('.mv-cwd').html() + '\\'), '').replace('.', '-');
				$(id).addClass('mv-icon-highlighted')
				plugin.selected[$(id).attr('id')] = $(id).children('p').html();
			},
			
			bindings: function() {
				$('.mediaviewer-body').bind('mousedown', function(event) {
					plugin.mouseisdown = true;
				});
				$('.mediaviewer-body').bind('mouseup', function(event) {
					plugin.mouseisdown = false;
				});
				$('.mediaviewer-body').bind('click', function(event) {
					for(var i in plugin.selected) {
						$('#' + plugin.selected[i].replace('.', '-')).removeClass('mv-icon-highlighted');
					}
					plugin.selected = {};
				});
			}
	};
	
	$.fn.mediabrowser = function(method) {
		
		if ( plugin[method] ) {
			return plugin[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return plugin.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.mediabrowser' );
		}    
	};

})(jQuery);