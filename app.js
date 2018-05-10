#!/usr/bin/env node

const readline = require('readline')
const parseCommand = require('./lib/parseCommand.js')
const request = require('request')
const cookieFile = require('tough-cookie-filestore')
const fs = require('fs')

let cookiePath = process.env.HOME + '/.codeforces-cli-tool/cookie.json'
let cookiejar = request.jar(new cookieFile(cookiePath))

var args = process.argv.splice(2)
if( args.length > 0 ) {
    parseCommand(args, false, cookiejar)
    return
}

var input = readline.createInterface({input: process.stdin, output: process.stdout})
input.on('line', (line) => {
    let args = line.split(' ')

    if( args[0] === 'exit') return input.close()

    parseCommand(args, true, cookiejar, () => {
        input.prompt()
    })
})
input.prompt()
