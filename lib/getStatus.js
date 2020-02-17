const path = require('path')

const debug = require('debug')('getStatus')
const request = require('request')
const cheerio = require('cheerio')
const waterfall = require('async').waterfall
const cookieFile = require('tough-cookie-filestore')

const GetCsrfToken = require('./getCSRFtoken.js')
const getHeader = require('./util.js').getHeader
const Login = require('./codeforcesLogin.js')

const color = require('./util.js').colorOptions

function getColor(verdict) {
    if (verdict.indexOf('Accepted') !== -1) return color.green + color.bright + verdict + color.reset
    if (verdict.indexOf('Wrong answer') !== -1) return color.red + color.bright + verdict + color.reset
    if (verdict.indexOf('Time limit exceeded') !== -1) return color.blue + color.bright + verdict + color.reset
    if (verdict.indexOf('Runtime error') !== -1) return color.cyan + color.bright + color.dim + verdict + color.reset
    if (verdict.indexOf('Memory limit exceeded') !== -1) return color.blue + color.bright + color.dim + verdict + color.reset
    if (verdict.indexOf('Running')) return color.black + color.bright + verdict + color.reset
    return verdict
}

function getSingleFormat(id, time, problem, verdict, utime, umem) {
    verdict = getColor(verdict)
    return id + '   ' + time + '   ' + problem + '   ' + verdict + '   ' + utime + '   ' + umem
}

function parseSubmissionId($) {
	let submissionId = $('.id-cell span').eq(0).html()
	if (/[0-9]{8}/.exec(submissionId) !== null) return submissionId
	submissionId = $(".id-cell a").eq(0).text()
	if (/[0-9]{8}/.exec(submissionId) !== null) return submissionId
	throw new Error($.html())
}

function printSubmissionStatus(outputType, id, time, problem, verdict, utime, umem) {
	time = time.replace(/^\s*(.*)\s*$/, '$1')
    verdict = verdict.replace(/^\s*(.*)\s*$/, '$1')
    utime = utime.replace(/^\s*(.*)\s*$/, '$1')
    umem = umem.replace(/^\s*(.*)\s*$/, '$1')

    let outputString = getSingleFormat(id, time, problem, verdict, utime, umem)

    // debug(id, time, problem, verdict, utime, umem)

    if (outputType === 'once') console.log(outputString)
    else {
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        process.stdout.write(outputString)
    }
}

function isWaiting(text) {
    let waiting = false;
    text = text.replace(/^\s*(.*)\s*$/, '$1')
    if (text.indexOf('In queue') !== -1) waiting = true
    if (text.indexOf('Running') !== -1) waiting = true
    return waiting
}

async function GetLastSubmissionId(args, interactive, csrf_token, options, callback) {
	debug('GetLastSubmissionId', args, csrf_token, options)

	let configPath = options['config-root'] ? options['config-root'] : process.env.HOME + '/.codeforces-cli-tool'
	let cookiePath = options['cookie-file'] ? options['cookie-file'] : path.join(configPath, 'cookie.json')
	let cookiejar = request.jar(new cookieFile(cookiePath))

	if (!options.handle) {
		let [new_csrf, handle] = await GetCsrfToken(options)
		if (handle === 'Enter') {
			if (interactive) throw new Error('You are not logged in.')
			await Login(csrf_token, options)
		}
	}

	let url = `https://codeforces.com/submissions/${options.handle}`
	debug('url', url)

	let [res, body] = await (() => { return new Promise((resolve, reject) => {
		request.get({
			headers: getHeader(),
			url: url,
			jar: cookiejar,
			timeout: 30000
		}, (err, res, body) => {
			if (err) return reject(err)
			resolve([res, body])
		})
	})})()

	let $ = cheerio.load(body, {decodeEntities: false})

	let submissionId
	try {
		submissionId = parseSubmissionId($)
	} catch (e) {
		debug(e.message)
		debug('Error: can not get submission id')
		throw new Error('Can not get submission id.')
	}

	let table = $('.id-cell').parent().children('td')
	let problemLink = table.eq(3).children('a').attr('href')
	let submissionUrl = 'https://codeforces.com' + problemLink.replace(/^\/([^\/]*)\/([^\/]*)\/.*$/, '\/$1\/$2\/submission/' + submissionId)

	debug('submission url', submissionUrl)
	if (args[1] === 'query') {
		console.log('New submission id: ' + submissionId)
		console.log(submissionUrl)
		return
	}
	// if (args[1] === 'once') {
	// 	printSubmissionStatus('once', submissionId, table.eq(1).text(), table.eq(3).children('a'), table.eq(5).children('span').text(), table.eq(6).text(), table.eq(7).text())
	// 	return next('Skip')
	// }
	if (args[1] === 'watch') {
		console.log('Waiting result for ' + submissionId)

		let problemItem = table.eq(3).children('a')
		let problem = ''
		problem += problemItem.attr('href').replace(/\/([^\/]*)\/([^\/]*)\/problem\/([^\/])/, '$1 $2$3 - ')
		problem += problemItem.text().replace(/^\s*(.*)\s*$/, '$1').replace(/^.+\s-\s(.*)$/, '$1')

		printSubmissionStatus('wait', submissionId, table.eq(1).text(), problem, table.eq(5).children('span').text(), table.eq(6).text(), table.eq(7).text())

		if (!isWaiting(table.eq(5).children('span').text())) return process.stdout.write('\n')

		while (true) {
			let [res, body] = await (() => { return new Promise((resolve, reject) => {
				request.get({
					headers: getHeader(),
					url: submissionUrl,
					jar: cookiejar,
					timeout: 30000
				}, (err, res, body) => {
					if (err) return reject(err)
					resolve([res, body])
				})
			})})()

			let $ = cheerio.load(body, {decodeEntities: false})
			let table = $('.datatable table tr').eq(1).children('td')

			let problemItem = table.eq(2).children('a')
			let problem = ''
			problem += problemItem.attr('href').replace(/\/([^\/]*)\/([^\/]*)\/problem\/([^\/])/, '$1 $2$3 - ')
			problem += problemItem.attr('title').replace(/[^\s]+\s-\s(.*)$/,'$1').replace(/\s*(.*)\s*$/, '$1').replace(/^.+\s-\s(.*)$/, '$1')

			printSubmissionStatus('wait', table.eq(0).text(), table.eq(7).text(), problem, table.eq(4).text(), table.eq(5).text(), table.eq(6).text())

			if (!isWaiting(table.eq(4).text())) return process.stdout.write('\n')
		}
	}
}

function Main(args, interactive, csrf_token, options, callback) {
	debug('Main', args, csrf_token, options)
	if (args[0] === 'getLastSubmissionId') 
		GetLastSubmissionId(args, interactive, csrf_token, options, callback)
}

module.exports = Main
