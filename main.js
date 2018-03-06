const util = require('util');
const url = require('url')
const chalk = new (require('chalk')).constructor({level: 1, enabled: true});
const fn = require('fn-args');
const jsome = require('jsome');
const {VM} = require('vm2');

function webrepl(router, options = {}) {

	let help = "";
	if(options.hasOwnProperty("sandbox")) {
		help = _createHelp(options.sandbox);
	}

	const vm = new VM(options);

	// static files
	router.get('/jquery.min.js', (req, res)=>res.sendFile(require.resolve("jquery/dist/jquery.min.js")));
	router.get('/jquery.terminal.min.js', (req, res)=>res.sendFile(require.resolve("jquery.terminal/js/jquery.terminal.js")));
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
	
	router.get('/api/:code?', async (req, res)=>{
		let code = req.params.code;
		let out = "";
		let capture = "";
		try {
			if(code) {
				result = await vm.run(code);
				if(result !== undefined) {
					result = _getColoredString(result);
				}
			} else {
				result = help;
			}
		} catch (err) {
			if(typeof err === "object" && err.hasOwnProperty("message")) {
				err = err.message;
			} else if(err === undefined) {
				err = "undefined";
			} else {
				try {
					err =  _getColoredString(err);
				} catch (e) {
					err = "error breaks error processing";
				}
			}
			result = chalk.red("😱 ╣ " + err + " ╠ 😱");
		}
		res.set('Content-Type', 'text/plain');
		res.send(result);
	});

	return vm;
}

function _createHelp(obj) {
	return chalk.green("this.\n" + Object.keys(obj).reduce((res, key)=>{
		if(res) res += "\n";
		res += "	"+key;
		if(typeof obj[key] === "function") {
			res += "("+fn(obj[key]).join(", ")+")";
		}
		return res;
	},""));
}

function _getColoredString(text) {
	let del = false;
	let tmp;
	if(!process.env.hasOwnProperty("FORCE_COLOR")) {
		del = true;
	} else {
		tmp = process.env.FORCE_COLOR;
	}
	process.env.FORCE_COLOR = 1;
	let res =  jsome.getColoredString(text);
	if(del) {
		delete process.env.FORCE_COLOR;
	} else {
		process.env.FORCE_COLOR = tmp;
	}
	return res;
}

module.exports = webrepl;



