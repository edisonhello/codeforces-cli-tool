const debug = require('debug')('status')
const request = require('request')
const cheerio = require('cheerio')
const waterfall = require('async').waterfall
const cookieFile = require('tough-cookie-filestore')

const getCSRFtoken = require('./getCSRFtoken.js')
const getHeader = require('./util.js').getHeader

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

function parseSubmissionId(body) {
	let $ = cheerio.load(body, {decodeEntities: false})
	let submissionId = $('.id-cell span').eq(0).html()
	if (/[0-9]{8}/.exec(submissionId) !== null) return submissionId
	submissionId = $(".id-cell a").eq(0).text()
	if (/[0-9]{8}/.exec(submissionId) !== null) return submissionId
	return -1
}

function printSubmissionStatus(outputType, id, time, problem, verdict, utime, umem) {
	time = time.replace(/^\s*(.*)\s*$/, '$1')
    verdict = verdict.replace(/^\s*(.*)\s*$/, '$1')
    utime = utime.replace(/^\s*(.*)\s*$/, '$1')
    umem = umem.replace(/^\s*(.*)\s*$/, '$1')

    let outputString = getSingleFormat(id, time, problem, verdict, utime, umem)

    // debug(id, time, problem, verdict, utime, umem)

    if (outputType === 'once')console.log(outputString)
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
    if (!waiting) process.stdout.write('\n')
    return waiting
}

module.exports = (args, CSRF_token, callback) => {
    debug(args)
    if (args[0] === 'getNewSubmissionId') {
        let cookiePath = process.env.HOME + '/.codeforces-cli-tool/cookie.json'
        let cookiejar = request.jar(new cookieFile(cookiePath))

        waterfall([
            (next) => getCSRFtoken().then(([CSRF_token, accountStatus]) => {
                if (accountStatus === 'Enter') return next('You are logged out.')
                debug('handle', accountStatus)
                next(null, accountStatus)
            }).catch((err) => next(err)),
            (handle, next) => {
                let url = 'https://codeforces.com/submissions/' + handle
                debug('url', url)
                request.get({
                    headers: getHeader(),
                    url: url,
                    jar: cookiejar,
                    timeout: 30000
                }, (err, res, body) => {
                    if (err) return next(err)

					let submissionId = parseSubmissionId(body)
                    if (submissionId === -1) {
                        debug($.html())
                        debug('Error: can not get submission id')
                        return next('Can not get submission id.')
                    }

                    let table = $('.id-cell').parent().children('td')
                    let problemLink = table.eq(3).children('a').attr('href')
                    let submissionUrl = 'https://codeforces.com' + problemLink.replace(/^\/([^\/]*)\/([^\/]*)\/.*$/, '\/$1\/$2\/submission/' + submissionId)
                    debug('url', submissionUrl)
                    if (args[1] === 'output') {
                        console.log('New submission id: ' + submissionId)
                        console.log(submissionUrl)
                        return next('Skip')
                    }
                    if (args[1] === 'wait') {
                        console.log('Waiting result for ' + submissionId)

                        let problemItem = table.eq(3).children('a')
                        let problem = ''
                        problem += problemItem.attr('href').replace(/\/([^\/]*)\/([^\/]*)\/problem\/([^\/])/, '$1 $2$3 - ')
                        problem += problemItem.text().replace(/^\s*(.*)\s*$/, '$1').replace(/^.+\s-\s(.*)$/, '$1')

                        printSubmissionStatus('wait', submissionId, table.eq(1).text(), problem, table.eq(5).children('span').text(), table.eq(6).text(), table.eq(7).text())
                        if(isWaiting(table.eq(5).children('span').text())) return next(null, submissionUrl)
                        else return next('Skip')
                    }
                    if (args[1] === 'once') {
                        printSubmissionStatus('once', submissionId, table.eq(1).text(), table.eq(3).children('a'), table.eq(5).children('span').text(), table.eq(6).text(), table.eq(7).text())
                        return next('Skip')
                    }
                })
            },
            (url, next) => {
                function checkStatus(myself) {
                    // debug('checkStatus')
                    request.get({
                        headers: getHeader(),
                        url: url,
                        jar: cookiejar,
                        timeout: 30000
                    }, (err, res, body) => {
                        if (err) return next(err)
                        let $ = cheerio.load(body, {decodeEntities: false})
                        let table = $('.datatable table tr').eq(1).children('td')

                        let problemItem = table.eq(2).children('a')
                        let problem = ''
                        problem += problemItem.attr('href').replace(/\/([^\/]*)\/([^\/]*)\/problem\/([^\/])/, '$1 $2$3 - ')
                        problem += problemItem.attr('title').replace(/[^\s]+\s-\s(.*)$/,'$1').replace(/\s*(.*)\s*$/, '$1').replace(/^.+\s-\s(.*)$/, '$1')

                        printSubmissionStatus('wait', table.eq(0).text(), table.eq(7).text(), problem, table.eq(4).text(), table.eq(5).text(), table.eq(6).text())
                        if (isWaiting(table.eq(4).text())) myself(myself)
                        else next(null)
                    })
                }
                checkStatus(checkStatus)
            }
        ], (err, res) => {
            if (err && err !== 'Skip') console.log(err)
            if (typeof(callback) === 'function') callback()
        })
    }
}
