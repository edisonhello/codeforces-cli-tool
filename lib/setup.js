const fs = require('fs')
const path = require('path')

const debug = require('debug')('setup')
const waterfall = require('async').waterfall

const enquirer = new require('enquirer')()
enquirer.register('rawlist', require('prompt-rawlist'))
enquirer.register('confirm', require('prompt-confirm'))

const getCurrentCompiler = require('./util.js').getCurrentCompiler

const questions = {
    'c': {
        'type': 'rawlist',
        'name': 'c',
        'message': 'Which complier to complie file with .c ?',
        'choices': ['GNU GCC 5.1.0', 'GNU GCC C11 5.1.0'],
        'default': 0
    },
    'cpp': {
        'type': 'rawlist',
        'name': 'cpp',
        'message': 'Which complier to complie file with .cpp ?',
        'choices': ['GNU G++ 5.1.0', 'GNU G++11 5.1.0', 'GNU G++14 6.4.0', 'GNU G++17 7.2.0', 'Clang++17 Diagnostics', 'GNU C++17 Diagnostics (DrMemory)', 'Microsoft Visual C++ 2010'],
        'default': 1
    },
    'py': {
        'type': 'rawlist',
        'name': 'py',
        'message': 'Which complier to complie file with .py ?',
        'choices': ['Python 2.7', 'Python 3.6', 'PyPy 2.7.13 (5.9.0)', 'PyPy 3.5.3 (5.10.0)'],
        'default': 1
    }
}

function fs_rmdir_r(filePath) {
    debug('fs_rmdir_r', filePath)
    if(!fs.existsSync(filePath)) return
    fs.readdirSync(filePath).forEach((file) => {
        let newPath = filePath + '/' + file
        if(fs.lstatSync(newPath).isDirectory()) fs_rmdir_r(newPath)
        else fs.unlinkSync(newPath)
    })
    fs.rmdirSync(filePath)
}

function checkDirectory(dirPath) {
    debug('checkDirectory', dirPath)
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dirPath)) {
            debug('directory path exist')
            if(fs.lstatSync(dirPath).isDirectory()) resolve()
            else reject(dirPath + 'is not a directory.')
        } else {
            debug('mkdir')
            fs.mkdirSync(dirPath);
            resolve()
        }
    })
}


function setCompiler(options, extname) {
    debug('setCompiler', extname)
    return new Promise((resolve, reject) => {
		let config_path = options['config-root']

        if (!fs.existsSync(config_path)) return reject('Directory path doesn\'t exist.')
        if (!fs.lstatSync(config_path).isDirectory()) return reject('Directory is a file.')

        let compilerPath = path.join(config_path, options['compiler-file'])
        let compilers = getCurrentCompiler(compilerPath)

        let question = []
        if (extname === undefined || extname === 'all') for (let ext in questions) question.push(questions[ext])
        else question.push(questions[extname])

        enquirer.ask(question).then((res) => {
            for (let key in res) compilers[key] = res[key];
            fs.writeFileSync(compilerPath, JSON.stringify(compilers, null, 4))
            console.log('Successful update config.')
            resolve()
        })
    })
}

function setCookie(options) {
    debug('setCookie')
    return new Promise((resolve, reject) => {
		let config_path = options['config-root']

        if (!fs.existsSync(config_path)) return reject('Directory path doesn\'t exist.')
        if (!fs.lstatSync(config_path).isDirectory()) return reject('Directory is a file.')

        let cookiePath = path.join(config_path, options['cookie-file'])

        if (fs.existsSync(cookiePath)){
            if (fs.lstatSync(cookiePath).isDirectory()) fs_rmdir_r(cookiePath)
            else fs.unlinkSync(cookiePath)
        }
        fs.writeFileSync(cookiePath, '')
        resolve()
    })
}

module.exports = (args, options, callback) => {
    debug(args)
	let configPath = options['config-root']
    if (args[0] === 'init') {
        waterfall([
            (next) => {
                if (fs.existsSync(configPath)) {
                    enquirer.ask([{
                        'type': 'confirm',
                        'name': 'reset',
                        'message': 'Config directory is already exists. Continue will lost files in it.',
                        'default': false
                    }]).then((res) => {
                        debug('directory exist, reset: ' + res.reset)
                        if (!res.reset) return next('Skipped')
                        fs_rmdir_r(configPath)
                        next()
                    })
                } else next()
            },
            (next) => {
                fs.mkdirSync(configPath);
                next()
            },
            (next) => setCookie(options).then(() => next()).catch((err) => next(err)),
            (next) => setCompiler(options, 'all').then(() => next()).catch((err) => next(err))
        ], (err, res) => {
            if (err) console.log(err)
            else console.log('Initialization finished.')
        })
    } else if (args[0] === 'cookie') {
        waterfall([
            (next) => checkDirectory(configPath).then(() => next()).catch((err) => next(err)),
            (next) => setCookie(configPath).then(() => next()).catch((err) => next(err))
        ], (err, res) => {
            if (err) console.error(err)
            else console.log('Reset cookie.')
			if (typeof(callback) === 'function') callback()
        })
    } else if (args[0] === 'compiler') {
        if (args[1] === undefined || args[1] === 'all' || questions[args[1]] !== undefined){
            waterfall([
                (next) => checkDirectory(configPath).then(() => next()).catch((err) => next(err)),
                (next) => setCompiler(configPath, args[1]).then(() => next()).catch((err) => next(err))
            ], (err, res) => {
                if (err) console.log(err)
                else console.log('Reset compiler.')
            })
        } else return console.error('usage: set compiler [all/c/cpp/py/...]')
    } else return console.error('usage: set <init/cookie/compiler>')
}
