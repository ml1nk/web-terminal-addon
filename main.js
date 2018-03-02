const util = require('util');
const url = require('url')
const chalk = require('chalk');
const jsome = require('jsome');
const {VM} = require('vm2');

function webrepl(router, options) {
	const vm = new VM(options);


	// static files
	router.get('/jquery.min.js', (req, res)=>res.sendFile(require.resolve("jquery/dist/jquery.min.js")));
	router.get('/jquery.terminal.min.js', (req, res)=>res.sendFile(require.resolve("jquery.terminal/js/jquery.terminal.min.js")));
	router.get('/unix_formatting.js', (req, res)=>res.sendFile(require.resolve("jquery.terminal/js/unix_formatting.js")));
	router.get('/jquery.terminal.min.css', (req, res)=>res.sendFile(require.resolve("jquery.terminal/css/jquery.terminal.min.css")));
	router.get('/index.css', (req, res)=>res.sendFile(__dirname+"/index.css"));
	router.get('/', (req, res)=>{
		// redirect for example http://localhost:8081/terminal => http://localhost:8081/terminal/
		const me = url.parse(req.originalUrl);
		const ok = me.pathname.endsWith("/");
		if(ok) {
			res.sendFile(__dirname+"/index.html");
		} else {
			me.pathname = me.pathname + '/';
			res.statusCode = 302;
    		res.setHeader('Location', url.format(me));
			res.end();
		}
	});
	

	router.get('/api/:code?', (req, res)=>{
		let code = req.params.code;
		let out = "";
		let capture = "";
		try {
			result = vm.run(code);
			if(result !== undefined) {
				result = jsome.getColoredString(result);
			}
		} catch (err) {
			result = chalk.red("😱 ╣ " +err.message + " ╠ 😱");
		}
		res.set('Content-Type', 'text/plain');
		res.send(result);
	});

}

module.exports = webrepl;



