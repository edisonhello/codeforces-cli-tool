const path = require('path')

const debug = require('debug')('parseCommand')
const yargs = require('yargs')

const submit = require('./submit.js')
const login = require('./login.js')
const setup = require('./setup.js')

function parseArgumentOptions(args) {
	return yargs(args).options({
		watch: {
			alias: 'w',
			describe: 'Automatically update submitted status',
		},
		'config-root': {
			describe: 'Change config root directory',
			default: path.join("$HOME", '.codeforces-cli-tool'),
			type: 'string',
		},
		'cookie-file': {
			describe: `Change cookie file path (relative to 'config-root')`,
			default: 'cookie.json',
			type: 'string',
		},
		'compiler-file': {
			describe: `Change compiler file path (relative to 'config-root')`,
			default: 'compiler.json',
			type: 'string',
		},
	}).help().argv
}

module.exports = (args, interactive, callback) => {
	debug('args', args)
	let options = parseArgumentOptions(args)
	args = options._
	debug('after options', args, options)
	if (args[0] === 'submit') 
		submit(args.splice(1), interactive, options, callback)
	else if (args[0] === 'login') {
		if (interactive) return console.error('login command not support in interactive mode now.')
		login(args.splice(1), options)
	} else if (args[0] === 'set') {
		if (interactive && args[1] !== 'cookie') return console.error('Please run this command in non-interactive mode.')
		setup(args.splice(1), options, callback)
	} else if (args[0] === 'logout') {
		// setup(['cookie'] + args.splice(1))
	} else 
		return console.error('No such command')
}
