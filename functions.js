const hello = (req, res, next) => {

    console.log('WOW / ENDPOINT')
    res.status(200).json({message : '/ endpoint 실행 됨'})
    next()
}

const sendPosts = (req, res) => {
        res.status(200).json({
            
            products: [
                {
                    id: 1,
                    title: "node",
                    description: "node.js is awesome"
                }, 
                {
                    id: 2,
                    title: "express",
                    description: "express is a server-side framework for node.js"
                },
            ]
        }
      )
     
  }


module.exports = {
    hello,
    sendPosts,
}