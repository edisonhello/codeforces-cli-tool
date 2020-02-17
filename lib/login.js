const GetCsrfToken = require('./getCSRFtoken.js')
const login = require('./codeforcesLogin.js')

module.exports = async (options) => {
	let [csrf_token, account_status] = await GetCsrfToken(options)
	if (account_status !== 'Enter') return console.log('You are currently login as ' + account_status + '.')
	try {
		await login(csrf_token, options)
		console.log('Successful login.')
	} catch (e) {
		console.error(e.message)
	}
}
