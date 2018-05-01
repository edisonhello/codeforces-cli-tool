const request = require('request')

module.exports = (args) => {
    if( args.length === 0 ) return
    
    let header = {
        'Host': 'codeforces.com',
        // 'Connection': 'keep-alive',
        // 'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        // 'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
    }


    let cookiejar = request.jar()
    let opts = {
        'headers': header,
        'url': 'http://codeforces.com/enter',
        'jar': cookiejar,
        'timeout': 30000
    }

    console.log(opts)
    request.get(opts, (err, res, body) => {
        console.log("aaaa")
        console.log(err, res, body)
    })
}
