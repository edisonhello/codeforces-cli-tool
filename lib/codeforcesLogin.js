const inquirer = require('inquirer')
const request = require('request')

const getHeader = require('./util.js').getHeader

module.exports = (cookiejar, CSRF_token) => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([{
            type: 'input',
            name: 'handle',
            message: 'handle: '
        }, {
            type: 'password',
            name: 'password',
            message: 'password: '
        }]).then((ret) => {
            let header = getHeader()
            header.Origin = 'http://codeforces.com'
            header.Referer = 'http://codeforces.com/enter?back=%2F'

            request.post({
                headers: header,
                url: 'http://codeforces.com/enter',
                form: {
                    csrf_token: CSRF_token,
                    action: 'enter',
                    handleOrEmail: ret.handle,
                    password: ret.password
                },
                jar: cookiejar,
                timeout: 30000
            }, (err, res, body) => {
                if(body) return reject('Login failed.')
                resolve()
            })
        })
    })
}
