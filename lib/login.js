const getCSRFtoken = require('./getCSRFtoken.js')
const login = require('./codeforcesLogin.js')

module.exports = (cookiejar, callback) => {
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
