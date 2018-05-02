const request = require('request')
const cheerio = require('cheerio')
const debug = require('debug')('submit')
const inquirer = require('inquirer')
const waterfall = require('async').waterfall
const getHeader = require('./util.js').getHeader

module.exports = (args) => {
    if( args.length === 0 ) return

    let cookiejar = request.jar()

    waterfall([
        (next) => {
            let header = getHeader()

            request.get({
                headers: header,
                url: 'http://codeforces.com/enter',
                jar: cookiejar,
                timeout: 5000
            }, (err, res, body) => {
                if(err) {
                    return next(err)
                }
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
                next(null, form);
            })
        },
        (form, next) => {
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
                console.log(err,res,body)
            })
        }
    ], (err, res) => {
        
    })
}
