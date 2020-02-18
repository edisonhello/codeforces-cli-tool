const path = require('path')

const request = require('request')
const cookieFile = require('tough-cookie-filestore')
const debug = require('debug')('CFlogin')

const enquirer = new require('enquirer')()
enquirer.register('input', require('prompt-input'))
enquirer.register('password', require('prompt-password'))

const getHeader = require('./util.js').getHeader

module.exports = (csrf_token, options) => {
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

			let configPath = options['config-root']
			let cookiePath = path.join(configPath, options['cookie-file'])
			let cookiejar = request.jar(new cookieFile(cookiePath))

            request.post({
                headers: header,
                url: 'https://codeforces.com/enter',
                form: {
                    csrf_token: csrf_token,
                    action: 'enter',
                    handleOrEmail: ret.handle,
                    password: ret.password
                },
                jar: cookiejar,
                timeout: 30000
            }, (err, res, body) => {
                // debug("finish login", res, body)
				if (err) return reject(err)
                if (body) return reject('Login failed.')
				options.handle = ret.handle
                resolve()
            })
        })
    })
}
