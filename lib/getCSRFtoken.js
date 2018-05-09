const request = require('request')
const cheerio = require('cheerio')
const debug = require('debug')('getCSRF')

const getHeader = require('./util.js').getHeader

module.exports = (cookiejar) => {
    return new Promise((resolve, reject) => {
        let header = getHeader()

        request.get({
            headers: header,
            url: 'http://codeforces.com/enter',
            jar: cookiejar,
            timeout: 5000
        }, (err, res, body) => {
            if(err) reject(err)

            let $ = cheerio.load(body, {decodeEntities: false})
            let CSRF_token = $('form input[name="csrf_token"]').attr('value')
            debug('CSRF_token', CSRF_token)
            if( CSRF_token === undefined ) reject(new Error('Could not find CSRF_token'))

            let isAlive = $('.lang-chooser div a').eq(2).html().indexOf('Enter') === -1
            debug('Account status', $('.lang-chooser div a').eq(2).html())
            // debug($('.lang-chooser div a').eq(2).html().indexOf('Enter'), isAlive)

            resolve([CSRF_token, isAlive])
        })
    })
}
