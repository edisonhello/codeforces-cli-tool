const debug = require('debug')('parse')
const submit = require('./submit.js')

function noInteractive(command, callback) {
    console.log(command + ' can not be used in interactive mode now.')
    if( typeof(callback) === 'function' ) callback()
}

module.exports = (args, interactive, callback) => {
    debug(args)
    if( args[0] === 'submit' ) {
        if( interactive ) noInteractive(args[0], callback)
        submit(args.splice(1), callback)
    }
    else {
        console.log('no such command')
    }
}
