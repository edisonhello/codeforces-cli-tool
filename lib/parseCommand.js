const debug = require('debug')('parse')
const submit = require('./submit.js')
const login = require('./login.js')
const initialize = require('./initialize.js')

module.exports = (args, interactive, callback) => {
    debug(args)
    if( args[0] === 'submit' ) {
        submit(args.splice(1), interactive, callback)
    }
    else if(args[0] === 'login') {
        if(interactive) {
            console.log('login command not support in interactive mode now.')
            if(typeof(callback) === 'function') callback()
        }
        else {
            login()
        }
    }
    else if(args[0] === 'init') {
        if(interactive) {
            console.log('Please run init command in non-interactive mode.')
            if(typeof(callback) === 'function') callback()
        }
        else {
            initialize(args.splice(1))
        }
    }
    else {
        console.log('no such command')
    }
}
