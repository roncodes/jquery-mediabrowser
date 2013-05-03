import groovy.io.FileType
import grails.converters.JSON
import org.codehaus.groovy.grails.web.util.WebUtils
import java.net.URLDecoder;
import java.net.URLEncoder;
@Grab( 'org.apache.tika:tika-core:0.9' )
@Grab( 'org.apache.tika:tika-parsers:0.9' )
import org.apache.tika.Tika

/*
 * Simple Groovy Connector for jQuery MediaBrowser
 * - use this as a grails service
 * then in your controller do this: def method = { render connectorService.run(params) }
 * by Ronald A. Richardson
 */
class ConnectorService {
	
	def webUtils = WebUtils.retrieveGrailsWebRequest()
	def home_dir = 'public'
	def base_dir = webUtils.getCurrentRequest().getSession().getServletContext().getRealPath("/") + '\\'
	def _response = webUtils.getCurrentResponse()
	def output = [:]
	def grailsLinkGenerator
	
	def run(params) {
		// Handle commands
		params.target = (params.target == '') ? this.home_dir : params.target.replace('%5C', '\\')
		switch(params.cmd) {
			case 'open':
				this.output << [
					'cwd': get_cwd(params.target),
					'files': get_dir(params.target)
				]
				if(this.output.get('cwd').mime != 'directory') {
					return output_file(params.target);
				}
				break
			case 'up': 
				params.target = params.target.replace('\\' + params.target.split('\\\\')[-1], '')
				this.output << [
					'cwd': get_cwd(params.target),
					'files': get_dir(params.target)
				]
				if(this.output.get('cwd').mime != 'directory') {
					return output_file(params.target);
				}
				break
			case 'new_folder':
				break
			case 'new_file':
				break
			case 'delete':
				// parse files
				def files = []
				for(p in params) {
					if(p.toString().contains('files[')) {
						files << p.toString().split('=')[-1]
					}
				}
				for(f in files) {
					def deleted = new File(this.base_dir.replace('\\\\', '') + params.target + '\\' + f).delete()
					this.output.put(f, ['deleted': deleted])
				}
				this.output << [
					'cwd': get_cwd(params.target),
					'files': get_dir(params.target)
				]
				break
		}
		return this.output as JSON
	}

    def get_dir(path = '') {
		def list = []
		def dir = new File(this.base_dir + path)
		if(dir.file) {
			return get_file(path);
		}
		dir.eachFileRecurse (FileType.ANY) { file ->
			list << get_cwd(basename(file.absolutePath))
		}
		return list
	}
	
	def get_file(path = '') {
		def file = new File(this.base_dir + path)
		return [
			'mime': (file.directory) ? 'directory' : new Tika().detect(file),
			'name': file.name,
			'size': file.size(),
			'format': (file.directory) ? 'dir' : get_file_format(file.name),
			'header': [
				'Content-Type: ' + new Tika().detect(file),
				'Content-Disposition: attachment; ' + file.name,
				'Content-Location: ' + basename(file.absolutePath),
				'Content-Transfer-Encoding: binary',
				'Content-Length: ' + file.size(),
				'Connection: close'
			]
		]
	}
	
	def output_file(path = false) {
		if(path) {
			def file = new File(this.base_dir + path)
			try {
				this._response.setHeader "Content-disposition", "attachment; filename=${file.name}"
				this._response.contentType = new Tika().detect(file)
				this._response.outputStream << file.text
				this._response.outputStream.flush()
			} catch (Exception e) {
				e.printStackTrace();
			}
			return '<meta http-equiv="refresh" content="0; url='+ grailsLinkGenerator.link(controller: "media", action: "download") +'?target='+ this.base_dir + path +'"> '
		}
	}
	
	def get_cwd(path = '') {
		def cwd = []
		def f = new File(this.base_dir + path)
		cwd << [
			'mime': (f.directory) ? 'directory' : new Tika().detect(f),
			'name': f.name,
			'size': f.size(),
			'format': (f.directory) ? 'dir' : get_file_format(f.name),
			'target': relpath(f.absolutePath)
		]
		return cwd[0]
	}
	
	def basename(path) {
		return path.split('web-app')[1]
	}
	
	def encode(path) {
		if(path != null) {
			return path.bytes.encodeBase64().toString().replace('+', '-').replace('/', '_').replace('=', '.').replaceAll(/ *$/, '') 
		} 
	}
	
	def relpath(path) {
		if(path.toString().contains('web-app')) {
			return path.toString().split('web-app')[1]
		} else {
			return ''
		}
	}
	
	def get_file_format(filename) {
		return (filename.contains('.')) ? filename.split('\\.')[-1] : 'uknown'
	}
	
	def decode(hash) {
		return new String(hash.replace('-', '+').replace('_', '/').replace('.', '=').decodeBase64())
	}
}
