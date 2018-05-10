const fs = require('fs')
const path = require('path')
const debug = require('debug')('submit')
const request = require('request')
const cheerio = require('cheerio')
const inquirer = require('inquirer')
const series = require('async').series
const waterfall = require('async').waterfall


const getHeader = require('./util.js').getHeader
const getCSRFtoken = require('./getCSRFtoken.js')
const login = require('./codeforcesLogin.js')

module.exports = (args, interactive, cookiejar, callback) => {
    if(args.length === 0) return

    // console.log(cookiejar)

    series([
        (_next) => {
            let filePath = args[0]
            if(!fs.existsSync(filePath)) return _next('Could not file such file.')
            fs.readFile(filePath, 'ascii', (err, data) => {
                if(err) return _next(err)

                _next(null, {
                    problemCode: path.parse(filePath).name,
                    source: data
                })
            })
        },
        (_next) => waterfall([
            (next) => {
                getCSRFtoken(cookiejar).then(([CSRF_token, isAlive]) => {
                    debug(CSRF_token, isAlive)

                    if(isAlive) next(null, CSRF_token)
                    else if(interactive) next('Login failed. Please run login in non-interactive mode.')
                    else login(cookiejar, CSRF_token).then(() => next(null, CSRF_token)).catch((err) => next(err))
                }).catch((err) => next(err))
            },
        ], (err, CSRF_token) => {
            _next(err, CSRF_token)
        })
    ], (errs, ress) => {
        if(errs) {
            console.log(errs)
            return callback()
        }
        let [file, CSRF_token] = ress

        let header = getHeader()
        header.Origin = 'http://codeforces.com'
        header.Referer = 'http://codeforces.com/problemset/submit'

        request.post({
            headers: header,
            url: `http://codeforces.com/problemset/submit?csrf_token=${CSRF_token}`,
            formData: {
                csrf_token: CSRF_token,
                action: 'submitSolutionFormSubmitted',
                submittedProblemCode: file.problemCode,
                programTypeId: '42',
                source: file.source,
                tabSize: '4',
                sourceFile: ''
            },
            jar: cookiejar,
            timeout: 30000
        }, (err, res, body) => {
            if(err) throw err
            if(res.headers.location !== 'http://codeforces.com/problemset/status') {
                let $ = cheerio.load(body, {decodeEntities: false})
                let errs = $('.error')
                console.log(errs.text())

                debug('something went wrong')
                if(typeof(callback) === 'function') callback()
            }
            else {
                debug('submitted')
                if(typeof(callback) === 'function') callback()
            }
        })
    })
}
