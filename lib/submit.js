const fs = require('fs')
const path = require('path')
const debug = require('debug')('submit')
const request = require('request')
const cheerio = require('cheerio')
const series = require('async').series
const cookieFile = require('tough-cookie-filestore')

const getHeader = require('./util.js').getHeader
const getCompilerId = require('./util.js').getCompilerId
const getCSRFtoken = require('./getCSRFtoken.js')
const login = require('./codeforcesLogin.js')

module.exports = (args, interactive, callback) => {
    if(args.length === 0) {
        console.log('Path to file are needed.')
        if(typeof(callback) === 'function') callback()
    }

    let dirPath = process.env.HOME + '/.codeforces-cli-tool'
    let cookiejar = request.jar(new cookieFile(dirPath + '/cookie.json'))

    series([
        (next) => {
            let filePath = args[0]
            if(!fs.existsSync(filePath)) return next('Could not file such file.')
            fs.readFile(filePath, 'ascii', (err, data) => {
                if(err) return next(err)

                if(!fs.existsSync(dirPath + '/config.json')) return next('Config not found. Did init run?')
                let ext2comp = JSON.parse(fs.readFileSync(dirPath + '/config.json'))

                let ext = path.extname(filePath).substr(1)
                if(!ext2comp[ext]) return next('Not support this extensions now.')

                debug('Get file.')

                next(null, {
                    problemCode: path.parse(filePath).name,
                    source: data,
                    compilerId: getCompilerId(ext2comp[ext])
                })
            })
        },
        (next) => getCSRFtoken().then(([CSRF_token, accountStatus]) => {
            debug(CSRF_token, accountStatus)

            if(accountStatus !== 'Enter') next(null, CSRF_token)
            else if(interactive) next('Login failed. Please run login in non-interactive mode.')
            else login(CSRF_token).then(() => next(null, CSRF_token)).catch((err) => next(err))
        }).catch((err) => next(err))
    ], (err, [file, CSRF_token]) => {
        if(err) {
            console.log(err)
            if(typeof(callback) === 'function') callback()
            return
        }

        debug('Final submit')

        let header = getHeader()
        header.Origin = 'http://codeforces.com'
        header.Referer = 'http://codeforces.com/problemset/submit'

        request.post({
            headers: header,
            url: `http://codeforces.com/problemset/submit?csrf_token=${CSRF_token}`,
            formData: {
                csrf_token: CSRF_token,
                action: 'submitSolutionFormSubmitted',
                submittedProblemCode: file.problemCode,
                programTypeId: file.compilerId,
                source: file.source,
                tabSize: '4',
                sourceFile: ''
            },
            jar: cookiejar,
            timeout: 30000
        }, (err, res, body) => {
            if(err) throw err
            if(res.headers.location !== 'http://codeforces.com/problemset/status') {
                let $ = cheerio.load(body, {decodeEntities: false})
                let errs = $('.error')
                console.log(errs.text())

                debug('something went wrong')
                if(typeof(callback) === 'function') callback()
            }
            else {
                debug('submitted')
                console.log('Successfully submitted')
                if(typeof(callback) === 'function') callback()
            }
        })
    })
}
