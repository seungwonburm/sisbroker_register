const http = require('http')
const { sendPosts } = require('./sendPosts')

const server = http.createServer((req, res)=> {
    const {url,method} = req;
    console.log('서버 작동')
    console.log(url, method)
  
    res.setHeader('Content-Type', 'application/json')

    if (url === '/users/signup' && method == 'POST') userSignup()
    if (url === '/users/login' && method === 'POST') userSignin()
    if (url === '/products' && method ==='GET') {
        sendPosts(res)
        return;
    }
    res.end(JSON.stringify({ message: '응답 되었습니다.]'}))
})

const PORT = 8000
server.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`)
}) 