const request = require('request')
const cookieFile = require('tough-cookie-filestore')
const debug = require('debug')('CFlogin')

const enquirer = new require('enquirer')()
enquirer.register('input', require('prompt-input'))
enquirer.register('password', require('prompt-password'))

const getHeader = require('./util.js').getHeader

module.exports = (CSRF_token) => {
    return new Promise((resolve, reject) => {
        enquirer.prompt([{
            type: 'input',
            name: 'handle',
            message: 'handle: '
        }, {
            type: 'password',
            name: 'password',
            message: 'password: '
        }]).then((ret) => {
            let header = getHeader()
            header.Origin = 'https://codeforces.com'
            header.Referer = 'https://codeforces.com/enter?back=%2F'

            let cookiePath = process.env.HOME + '/.codeforces-cli-tool/cookie.json'
            let cookiejar = request.jar(new cookieFile(cookiePath))

            request.post({
                headers: header,
                url: 'https://codeforces.com/enter',
                form: {
                    csrf_token: CSRF_token,
                    action: 'enter',
                    handleOrEmail: ret.handle,
                    password: ret.password
                },
                jar: cookiejar,
                timeout: 30000
            }, (err, res, body) => {
                // debug("finish login", res, body)
                if(body) return reject('Login failed.')
                resolve()
            })
        })
    })
}
