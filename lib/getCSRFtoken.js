const request = require('request')
const cheerio = require('cheerio')
const debug = require('debug')('getCSRF')
const cookieFile = require('tough-cookie-filestore')

const getHeader = require('./util.js').getHeader

module.exports = () => {
    return new Promise((resolve, reject) => {
        let cookiePath = process.env.HOME + '/.codeforces-cli-tool/cookie.json'
        let cookiejar = request.jar(new cookieFile(cookiePath))

        request.get({
            headers: getHeader(),
            url: 'http://codeforces.com/enter',
            jar: cookiejar,
            timeout: 30000
        }, (err, res, body) => {
            if(err) return reject(err)

            let $ = cheerio.load(body, {decodeEntities: false})
            let CSRF_token = $('form input[name="csrf_token"]').attr('value')
            debug('CSRF_token', CSRF_token)
            if( CSRF_token === undefined ) return reject(new Error('Could not find CSRF_token'))

            let accountStatus = $('.lang-chooser div a').eq(2).html()
            debug('Account status', $('.lang-chooser div a').eq(2).html())

            resolve([CSRF_token, accountStatus])
        })
    })
}
