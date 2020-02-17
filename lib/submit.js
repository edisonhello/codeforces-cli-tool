const fs = require('fs')
const path = require('path')

const debug = require('debug')('submit')
const cheerio = require('cheerio')
const series = require('async').series
const cookieFile = require('tough-cookie-filestore')
const request = require('request')

const getHeader = require('./util.js').getHeader
const getCompilerId = require('./util.js').getCompilerId
const GetCurrentCompiler = require('./util.js').getCurrentCompiler
const GetCsrfToken = require('./getCSRFtoken.js')
const getStatus = require('./getStatus.js')
const Login = require('./codeforcesLogin.js')

async function GetFileInformation(file_path) {
	debug('GetFileInformation', file_path)
	if (!fs.existsSync(file_path)) return console.error(`File ${file_path} doesn't exist.`)
	let data = await fs.readFileSync(file_path, 'ascii')
	let ext2comp = GetCurrentCompiler()
	let ext = path.extname(file_path).substr(1)
	if (!ext2comp[ext]) return console.error(`Extension ${ext} is not supported now.`)

	debug(`Get file.`)

	return {
		problemCode: path.parse(file_path).name,
		source: data,
		compilerId: getCompilerId(ext2comp[ext])
	}
}

async function Main(args, interactive, options, callback) {
	debug('Main', args, interactive, options)

    if (args.length === 0) {
        console.error('Path to file is needed.')
        if (typeof(callback) === 'function') callback()
		return
    }

	let configPath = options['config-root'] ? options['config-root'] : process.env.HOME + '/.codeforces-cli-tool'
	let cookiePath = options['cookie-file'] ? options['cookie-file'] : path.join(configPath, 'cookie.json')
	let cookiejar = request.jar(new cookieFile(cookiePath))

	let file_info = await GetFileInformation(args.splice(0, 1)[0])
	let [csrf_token, account_status] = await GetCsrfToken(options)

	if (account_status === 'Enter') {
		if (interactive) return console.error('You are not logged in.')
		await Login(csrf_token, options)
	} else options.handle = account_status

	debug('Start submitting')

	let header = getHeader({
		Origin: 'https://codeforces.com',
		Referer: 'https://codeforces.com/problemset/submit',
	})

	let url = `https://codeforces.com/problemset/submit?csrf_token=${csrf_token}`
	// https://codeforces.com/contest/1296/submit
	// https://codeforces.com/gym/102512/submit
	let [res, body] = await (() => { return new Promise((resolve, reject) => {
        request.post({
            headers: header,
            url: url, 
            formData: {
                csrf_token: csrf_token,
                action: 'submitSolutionFormSubmitted',
                submittedProblemCode: file_info.problemCode,
                programTypeId: file_info.compilerId,
                source: file_info.source,
                tabSize: '4',
                sourceFile: ''
            },
            jar: cookiejar,
            timeout: 30000
        }, (err, res, body) => {
			if (err) return reject(err)
			resolve([res, body])
        })
	})})()

	if (res.headers.location !== 'https://codeforces.com/problemset/status') {
		let $ = cheerio.load(body, {decodeEntities: false})
		let errs = $('.error')
		fs.writeFileSync(configPath + '/error.html', JSON.stringify(res) + '\n\n' + $.html())

		if (errs.text()) 
			return console.error(errs.text())
		if (res.statusCode === 302) 
			throw new Error('Submit failed. Got 302 error. (Unknown reason)')

		if (typeof(callback) === 'function') callback()
	} else {
		debug('Submitted')
		console.log('Successfully submitted.')

		if (options.watch) getStatus(['getLastSubmissionId', 'watch'], interactive, csrf_token, options, callback)
		else getStatus(['getLastSubmissionId', 'query'], interactive, csrf_token, options, callback)
	}
}

module.exports = Main
