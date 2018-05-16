const debug = require('debug')('status')
const request = require('request')
const cheerio = require('cheerio')
const waterfall = require('async').waterfall
const cookieFile = require('tough-cookie-filestore')

const getCSRFtoken = require('./getCSRFtoken.js')
const getHeader = require('./util.js').getHeader

function getSingleFormat(id, time, problem, verdict, utime, umem) {
    return ``
}

function printSubmissionStatus(outputFunction, id, time, problemItem, verdict, utime, umem) {
    let problem = ''
    problem += problemItem.attr('href').replace(/\/(gym)\/(100570)\/problem\/(F)/, '$1 $2$3 - ')
    problem += problemItem.text().replace(/^\s*(.*)\s*$/, '$1').replace(/^.+\s-\s(.*)$/, '$1')
    time = time.replace(/^\s*(.*)\s*$/, '$1')
    verdict = verdict.replace(/^\s*(.*)\s*$/, '$1')
    utime = utime.replace(/^\s*(.*)\s*$/, '$1')
    umem = umem.replace(/^\s*(.*)\s*$/, '$1')

    outputFunction(getSingleFormat(id, time, problem, verdict, utime, umem))
}

function isWaiting(text) {
    let waiting = false;
    text = text.replace(/^\s*(.*)\s*$/, '$1')
    // ;
    if(!waiting) process.stdout.write('\n')
    return waiting
}

module.exports = (args, callback) => {
    debug(args)
    if(args[0] === 'getNewSubmissionId') {
        let cookiePath = process.env.HOME + '/.codeforces-cli-tool/cookie.json'
        let cookiejar = request.jar(new cookieFile(cookiePath))

        waterfall([
            (next) => getCSRFtoken().then(([CSRF_token, accountStatus]) => {
                if(accountStatus === 'Enter') return next('You are logged out.')
                debug('handle', accountStatus)
                next(null, accountStatus)
            }).catch((err) => next(err)),
            (handle, next) => {
                let url = 'http://codeforces.com/submissions/' + handle
                debug('url', url)
                request.get({
                    headers: getHeader(),
                    url: url,
                    jar: cookiejar,
                    timeout: 30000
                }, (err, res, body) => {
                    if(err) return next(err)

                    let $ = cheerio.load(body, {decodeEntities: false})
                    let submissionId = $('.id-cell span').eq(0).html()
                    if(/[0-9]{8}/.exec(submissionId) === null) {
                        debug($.html())
                        debug('no submission id', submissionId)
                        return next('Can not get submission id.')
                    }
                    let submissionItem = $('.id-cell').parent().children('td')
                    let problemLink = submissionItem.eq(3).children('a').attr('href')
                    let submissionUrl = 'http://codeforces.com' + problemLink.replace(/^\/([^\/]*)\/([^\/]*)\/.*$/, '\/$1\/$2\/submission/' + submissionId)
                    debug('url', submissionUrl)
                    if(args[1] === 'output') {
                        console.log('New submission id: ' + submissionId)
                        console.log(submissionUrl)
                        return next('Skip')
                    }
                    if(args[1] === 'wait') {
                        printSubmissionStatus(process.stdout.write, submissionId, submissionItem.eq(1).text(), submissionItem.eq(3).children('a'), submissionItem.eq(5).children('span').text(), submissionItem.eq(6).text(), submissionItem.eq(7).text())
                        if(isWaiting(submissionItem.eq(5).children('span').text())) return next(null, submissionUrl)
                        else return next('Skip')
                    }
                    if(args[1] === 'once'){
                        printSubmissionStatus(console.log, submissionId, submissionItem.eq(1).text(), submissionItem.eq(3).children('a'), submissionItem.eq(5).children('span').text(), submissionItem.eq(6).text(), submissionItem.eq(7).text())
                        return next('Skip')
                    }
                }),
                (url, next) => {
                    function checkStatus(myself) {
                        // ;
                    }
                    checkStatus(checkStatus)
                }
            }
        ], (err, res) => {
            if(err !== 'Skip') console.log(err)
            if(typeof(callback) === 'function') callback()
        })
    }
}
