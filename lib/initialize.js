const inquirer = require('inquirer')
const waterfall = require('async').waterfall
const fs = require('fs')

const getDefaultCompiler = require('./util.js').getDefaultCompiler

function fs_rmdir_r(filePath) {
    if(!fs.existsSync(filePath)) return
    fs.readdirSync(filePath).forEach((file) => {
        let newPath = filePath + '/' + file
        if(fs.lstatSync(newPath).isDirectory()) fs_rmdir_r(newPath)
        else fs.unlinkSync(newPath)
    })
    fs.rmdirSync(filePath)
}

function checkDirectory(dirPath) {
    return new Promise((resolve, reject) => {
        if(fs.existsSync(dirPath)) {
            if(fs.lstatSync(dirPath).isDirectory()) resolve()
            else reject(dirPath + 'is not a directory.')
        }
        else {
            fs.mkdirSync(dirPath);
            resolve()
        }
    })
}

function setConfig(dirPath) {
    return new Promise((resolve, reject) => {
        console.log("in promise")
        if(!fs.existsSync(dirPath)) return reject('Directory path doesn\'t exist.')
        if(!fs.lstatSync(dirPath).isDirectory()) return reject('Directory is a file.')
        console.log('finish if')
        let compilers = getDefaultCompiler()
        inquirer.prompt([{
            'type': 'rawlist',
            'name': 'cpp',
            'message': 'Which complier to complie file with .cpp ?',
            'choices': [
                'GNU GCC 5.1.0',
                'GNU GCC C11 5.1.0',
                'GNU G++ 5.1.0',
                'GNU G++11 5.1.0',
                'GNU G++14 6.4.0',
                'GNU G++17 7.2.0',
                'Clang++17 Diagnostics',
                'GNU C++17 Diagnostics (DrMemory)',
                'Microsoft Visual C++ 2010'
            ],
            'default': 3
        }, {
            'type': 'rawlist',
            'name': 'py',
            'message': 'Which complier to complie file with .py ?',
            'choices': [
                'Python 2.7',
                'Python 3.6',
                'PyPy 2.7.13 (5.9.0)',
                'PyPy 3.5.3 (5.10.0)'
            ],
            'default': 1
        }]).then((res) => {
            for(let key in res) compilers[key] = res[key];
            fs.writeFileSync(dirPath + '/config.json', JSON.stringify(compilers, null, 4))
            console.log('Successful update config.')
            resolve()
        })
    })
}

function setCookie(dirPath) {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(dirPath)) return reject('Directory path doesn\'t exist.')
        if(!fs.lstatSync(dirPath).isDirectory()) return reject('Directory is a file.')
        let cookiePath = dirPath + '/cookie.json'
        if(fs.existsSync(cookiePath)){
            if(fs.lstatSync(cookiePath).isDirectory())fs_rmdir_r(cookiePath)
            else fs.unlinkSync(cookiePath)
        }
        fs.writeFileSync(cookiePath, '')
        resolve()
    })
}

module.exports = (args) => {
    let dirPath = process.env.HOME + '/.codeforces-cli-tool'
    if(args[0] === 'cookie') {
        waterfall([
            (next) => checkDirectory(dirPath).then(() => next()).catch((err) => next(err)),
            (next) => setCookie(dirPath).then(() => next()).catch((err) => next(err))
        ], (err, res) => {
            if(err) console.log(err)
            else console.log('Reset cookie.')
        })
    }
    else if(args[0] === 'config') {
        waterfall([
            (next) => checkDirectory(dirPath).then(() => next()).catch((err) => next(err)),
            (next) => setConfig(dirPath).then(() => next()).catch((err) => next(err))
        ], (err, res) => {
            if(err) console.log(err)
            else console.log('Reset submit config.')
        })
    }
    else {
        waterfall([
            (next) => {
                if(fs.existsSync(dirPath)) {
                    inquirer.prompt([{
                        'type': 'confirm',
                        'name': 'reinit',
                        'message': 'Config directory is already exists. Continue will lost files in it.',
                        'default': false
                    }]).then((res) => {
                        if(!res.reinit) return next('Skipped')
                        fs_rmdir_r(dirPath)
                        next()
                    })
                }
            },
            (next) => {
                fs.mkdirSync(dirPath);
                next()
            },
            (next) => setCookie(dirPath).then(() => next()).catch((err) => next(err)),
            (next) => setConfig(dirPath).then(() => next()).catch((err) => next(err))
        ], (err, res) => {
            if(err) console.log(err)
            else console.log('Initialization finished.')
        })
    }
}
