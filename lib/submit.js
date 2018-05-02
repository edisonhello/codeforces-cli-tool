const fs = require('fs')
const path = require('path')
const debug = require('debug')('submit')
const request = require('request')
const cheerio = require('cheerio')
const inquirer = require('inquirer')
const series = require('async').series
const waterfall = require('async').waterfall
const getHeader = require('./util.js').getHeader

module.exports = (args, callback) => {
    if( args.length === 0 ) return

    let cookiejar = request.jar()

    series([
        (_next) => {
            let filePath = args[0]
            if( !fs.existsSync(filePath) ) return _next(new Error('Could not file such file.'))
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
                let header = getHeader()

                request.get({
                    headers: header,
                    url: 'http://codeforces.com/enter',
                    jar: cookiejar,
                    timeout: 5000
                }, (err, res, body) => {
                    if(err) return next(err)

                    let $ = cheerio.load(body,{decodeEntities: false})
                    let CSRF_token = $('form input[name="csrf_token"]').attr('value')
                    debug('CSRF_token', CSRF_token)
                    if( CSRF_token === undefined ) return next(new Error('Could not find CSRF_token'))
                    return next(null, CSRF_token)
                })
            },
            (CSRF_token, next) => {
                let form = {
                    csrf_token: CSRF_token,
                    action: 'enter',
                }

                inquirer.prompt([{
                    type: 'input',
                    name: 'handle',
                    message: 'handle: '
                }, {
                    type: 'password',
                    name: 'password',
                    message: 'password: '
                }]).then((ret) => {
                    form.handleOrEmail = ret.handle,
                    form.password = ret.password
                    next(null, CSRF_token, form);
                })
            },
            (CSRF_token, form, next) => {
                let header = getHeader()
                header.Origin = 'http://codeforces.com'
                header.Referer = 'http://codeforces.com/enter?back=%2F'

                request.post({
                    headers: header,
                    url: 'http://codeforces.com/enter',
                    form: form,
                    jar: cookiejar,
                    timeout: 5000
                }, (err, res, body) => {
                    if(body) return next(new Error('Login failed.'))
                    next(null, CSRF_token)
                })
            }
        ], (err, CSRF_token) => {
            _next(err, CSRF_token)
        })
    ], (errs, ress) => {
        if(errs) throw errs
        let [CSRF_token, file] = ress
        // debug(CSRF_token, file)

        let header = getHeader()
        header.Origin = 'http://codeforces.com'
        header.Referer = 'http://codeforces.com/problemset/submit'

        request.post({
            headers: header,
            url: `http://codeforces.com/problemset/submit?csrf_token=${CSRF_token}`,
            // body: JSON.stringify({
            //     csrf_token: CSRF_token,
            //     action: 'submitSolutionFormSubmitted',
            //     submittedProblemCode: file.problemCode,
            //     programTypeId: '42',
            //     source: file.source,
            //     tabSize: '4',
            //     sourceFile: ''
            // }),
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
            timeout: 5000
        }, (err, res, body) => {
            // console.log(err, res, body)
            if(err) throw err
            if( res.headers.location !== 'http://codeforces.com/problemset/status') {
                debug(res.headers)
                // console.log(body)

                let $ = cheerio.load(body,{decodeEntities: false})
                let errs = $('.error')
                console.log(errs.text())

                debug('something went wrong')
                return
            }
            else debug('submitted')
        })
    })
}
