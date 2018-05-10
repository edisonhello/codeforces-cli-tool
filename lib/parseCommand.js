const debug = require('debug')('parse')
const submit = require('./submit.js')
const login = require('./login.js')

function noInteractive(command, callback) {
    console.log(command + ' can not be used in interactive mode now.')
    if( typeof(callback) === 'function' ) callback()
}

module.exports = (args, interactive, cookiejar, callback) => {
    debug(args)
    if( args[0] === 'submit' ) {
        submit(args.splice(1), interactive, cookiejar, callback)
    }
    else if(args[0] === 'login') {
        if(interactive) {
            console.log('login command not support in interactive mode now.')
            if(typeof(callback) === 'function') callback()
        }
        else {
            login(cookiejar)
        }
    }
    else {
        console.log('no such command')
    }
}
