const fs = require('fs')

const compilerOptions = require('./compilerOptions.js')

module.exports = {
    'getHeader': (oo) => {
        return Object.assign({
            'Host': 'codeforces.com',
            // 'Connection:' 'keep-alive',
            // 'Cache-Control': 'max-age=0',
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
        }, oo)
    },
    'getCompilerId': (compiler) => {
        return compilerOptions.comp2id[compiler]
    },
    'getCurrentCompiler': (compilerPath) => {
        let defaultCompiler = compilerOptions.ext2comp
        let original = {}
        if (fs.existsSync(compilerPath)) original = JSON.parse(fs.readFileSync(compilerPath, 'ascii'))
        for (let key in defaultCompiler) if(original[key] === undefined) original[key] = defaultCompiler[key]
        return original
    },
    'colorOptions': {
        'reset': '\x1b[0m',
        'bright': '\x1b[1m',
        'dim': '\x1b[2m',
        'underscore': '\x1b[4m',
        'blink': '\x1b[5m',
        'reverse': '\x1b[7m',
        'hidden': '\x1b[8m',

        'black': '\x1b[30m',
        'red': '\x1b[31m',
        'green': '\x1b[32m',
        'yellow': '\x1b[33m',
        'blue': '\x1b[34m',
        'magenta': '\x1b[35m',
        'cyan': '\x1b[36m',
        'white': '\x1b[37m',

        'bgBlack': '\x1b[40m',
        'bgRed': '\x1b[41m',
        'bgGreen': '\x1b[42m',
        'bgYellow': '\x1b[43m',
        'bgBlue': '\x1b[44m',
        'bgMagenta': '\x1b[45m',
        'bgCyan': '\x1b[46m',
        'bgWhite': '\x1b[47m'
    }
}
