// const fs=require('fs')
// const user ='Prajwal'
// fs.writeFile('user-data.txt','Name:'+user,(err)=>{
//     if(err){
//         console.log(err)
//     }else{
//         console.log("Writing")
//     }
// })
const http=require('http')
const server=http.createServer((req,res)=>{
    console.log("INCOMING REQUEST")
    console.log(req.method,req.url)
    res.setHeader('Content-Type','text/plain')
    res.end("<h1>Success</h1>")
})
server.listen(5000)