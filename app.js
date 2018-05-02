const readline = require('readline')
const parseCommand = require('./lib/parseCommand.js')

var args = process.argv.splice(2)
if( args.length > 0 ) {
    parseCommand(args)
    return
}

var input = readline.createInterface({input: process.stdin, output: process.stdout})
input.on('line', (line) => {
    let args = line.split(' ')

    if( args[0] === 'exit') return input.close()
    input.pause()

    parseCommand(args)

    // input.prompt()
})
input.prompt()
