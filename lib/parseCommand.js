const submit=require('./submit.js')

module.exports = (args) => {
    if( args[0] === 'submit' ) {
        submit(args.splice(1))
    }
    else {
        console.log('no such command')
    }
}
