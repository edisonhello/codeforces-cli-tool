const getCSRFtoken = require('./getCSRFtoken.js')
const login = require('./codeforcesLogin.js')
const cookieFile = require('tough-cookie-filestore')

module.exports = (callback) => {
    let cookiePath = process.env.HOME + '/.codeforces-cli-tool/cookie.json'
    let cookiejar = request.jar(new cookieFile(cookiePath))

    getCSRFtoken(cookiejar).then(([CSRF_token, isAlive]) => {
        if(isAlive) return console.log('You are already login!')
        login(cookiejar, CSRF_token).then(() => {
            console.log('Successful login.')
            callback()
        }).catch((err) => {
            console.log(err)
            callback()
        })
    })
}
