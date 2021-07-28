const http = require('http')
const express = require('express')

const {hello, sendPosts} = require('./functions')

// app => application
// Backend 단에서 돌아갈 application

const app = express()
app.get('/', hello)
app.get('/products', hello, sendPosts)

app.get('/', (req, res) => {

    console.log('WOW / ENDPOINT')
    res.status(200).json({message : '/ endpoint 실행 됨'})
})

const server = http.createServer(app)

const PORT = 8000
server.listen(PORT, () => {
    console.log(`${PORT} on!`)
})