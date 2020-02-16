const getCSRFtoken = require('./getCSRFtoken.js')
const login = require('./codeforcesLogin.js')

module.exports = () => {
    getCSRFtoken().then(([CSRF_token, accountStatus]) => {
        if (accountStatus !== 'Enter') return console.log('You are already login as ' + accountStatus + '!')
        login(CSRF_token).then(() => {
            console.log('Successful login.')
        }).catch((err) => {
            console.log(err)
        })
    })
}
