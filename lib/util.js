const compilerOptions = require('./compilerOptions.js')

module.exports = {
    'getHeader': () => {
        return {
            'Host': 'codeforces.com',
            // 'Connection:' 'keep-alive',
            // 'Cache-Control': 'max-age=0',
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
        }
    },
    'getDefaultCompiler': () => {
        return compilerOptions.ext2comp
    },
    'getCompilerId': (compiler) => {
        return compilerOptions.comp2id[compiler]
    }
}
