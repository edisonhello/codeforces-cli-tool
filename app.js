#!/usr/bin/env node

const readline = require('readline')
const parseCommand = require('./lib/parseCommand.js')
const request = require('request')
const fs = require('fs')

let args = process.argv.splice(2)
if (args.length > 0) 
    return parseCommand(args, false)

console.error('Interactive mode is temporary deprecated.')
console.error('Using interactive mode may cause errors.')

console.log(`Type "exit" to exit interactive mode`)

let input = readline.createInterface({ input: process.stdin, output: process.stdout })
let busy = false
input.on('line', (line) => {
    if (busy) return
    busy = true

    let args = line.split(' ')

    if (args[0] === 'exit') return input.close()

    parseCommand(args, true, () => {
		input.prompt()
		busy = false
	})
})
input.prompt()
