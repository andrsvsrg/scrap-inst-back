import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import {PostController, UserController} from './controllers/index.js'
import path from 'path'
import fetch from 'node-fetch'
import fs from 'fs'
const app = express()



// const url = 'https://scontent-iev1-1.cdninstagram.com/v/t50.2886-16/55948865_378311699425814_4899253638142798209_n.mp4?efg=eyJ2ZW5jb2RlX3RhZyI6InZ0c192b2RfdXJsZ2VuLjcyMC5mZWVkLmRlZmF1bHQiLCJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSJ9&_nc_ht=scontent-iev1-1.cdninstagram.com&_nc_cat=102&_nc_ohc=xawV9Ulp3QMAX_Do6N5&edm=AOQ1c0wBAAAA&vs=18032080198107070_1712506711&_nc_vs=HBksFQAYJEdFRzJWUU1XYW5XT0VsZ0JBSUdwQ3Y0NXBmMURia1lMQUFBRhUAAsgBABUAGCRHSS1uV2dNbTdvemlfbThCQUtBVklHN1psLUJVYmtZTEFBQUYVAgLIAQAoABgAGwGIB3VzZV9vaWwBMBUAACbIrpin%2BbG5PxUCKAJDMywXQDQFHrhR64UYEmRhc2hfYmFzZWxpbmVfMV92MREAdeoHAA%3D%3D&_nc_rid=62acb3abcd&ccb=7-5&oh=00_AfDtjpAh8kXso5tIupPkN7_EOqx8mh2UHHrBgl10fuwN7w&oe=64ADF394&_nc_sid=8b3546'
// downloadFile(url, join(__dirname, '/tmp/img.mp4'))
//   .then(()=>console.log('OK'))
//   .catch(err=>console.error(err));


mongoose.connect(
  'mongodb+srv://admin:admin3213@cluster.x6jnnhk.mongodb.net/inst?retryWrites=true&w=majority'
).then(() =>  console.log('connect with db - OK'))
  .catch((e) => console.log(e.message))


const tmpFolderPath = path.join(process.cwd(), "tmp");



app.use(express.json())
app.use(cors())
app.use("/tmp", express.static(tmpFolderPath));
app.use(express.urlencoded({
  extended: true
}))

const PORT = 3001

app.get('/api/get-id/:accountName', UserController.getIdByUsername)  // no needed db
app.get('/api/user-old/:accountName', UserController.getAccountInfoOld)
app.get('/api/user/:accountName', UserController.getAccountInfoAndPosts)  // db+ todo totalPosts, videoPlayCount, commentCount
app.get('/api/p/:shortCode', PostController.getDetailedInfoAboutPost)  // todo db
app.post('/api/posts/', PostController.getListPostByUserId)  //  db+  , todo validation req body


app.listen(PORT, () => {
  console.log(`Server has been started on port ${PORT}`)
})








// for test
// import PostModel from './models/Post.js'
// async function deletePostsByAuthorId(id) {
//   await PostModel.deleteMany({author: id})
// }
// deletePostsByAuthorId('64a97407c0aca37564f5478b')





