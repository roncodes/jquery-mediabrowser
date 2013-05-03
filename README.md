<h3>jQuery mediaBrowser plugin</h3>
<p>mediaBrowser is a simple jQuery plugin, similiar to elFinder that lets you browse, and send file commands to the server which updates the file browser in real time. It's still in development but for the most part works decently. The connector is simple to code up, and the mediaBrowser is easy to setup.</p>

<h3>Install</h3>
<ul>
	<li>Include jquery.mediabrowser.css, and jquery.mediabrowser.js in the header</li>
	<li>Create an empty div, with an id or class selector - whatever you need it to be. In the example I have <code>id="mediabrowser"</code></li>
	<li>Now all you have to do is add this snippet, modify as needed: <code><script type="text/javascript" charset="utf-8">
	$().ready(function() {
		var mb = $('#mediabrowser').mediabrowser({'connector': 'url')});		
		});
		</script></code>
</ul>

<h3>More info</h3>
<p>Unfortunatley I only have a connector written in Groovy for Grails, but I will knock out a php implementation when I have some time, as well as Python. Contributors more than welcome</p>
