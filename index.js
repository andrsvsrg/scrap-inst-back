import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv';


import './cron/croneDeleteTmpFiles.js'
import {PostController, UserController} from './controllers/index.js'

const app = express()
dotenv.config();

mongoose.connect(process.env.MONGOBD_URI)
  .then(() =>  console.log('connect with db - OK'))
  .catch((e) => console.log(e.message))

const tmpFolderPath = path.join(process.cwd(), "tmp");

app.use(express.json())
app.use(cors())
app.use("/tmp", express.static(tmpFolderPath));
app.use(express.urlencoded({
  extended: true
}))


app.get('/test', (req, res) => res.send('Hi, server started'))
app.get('/api/get-id/:accountName', UserController.getIdByUsername)  // no needed db
app.get('/api/user-old/:accountName', UserController.getAccountInfoOld)
app.get('/api/user/:accountName', UserController.getAccountInfoAndPosts)  // db+ todo totalPosts, videoPlayCount, commentCount
app.post('/api/user/download', UserController.sendJsonToClient )
app.get('/api/p/:shortCode', PostController.getDetailedInfoAboutPost)  // todo db
app.post('/api/posts/', PostController.getListPostByUserId)  //  db+  , todo validation req body


app.listen(process.env.PORT, () => {
  console.log(`Server has been started on port ${process.env.PORT}`)
})








// for test
// import PostModel from './models/Post.js'
// async function deletePostsByAuthorId(id) {
//   await PostModel.deleteMany({author: id})
// }
// deletePostsByAuthorId('64a97407c0aca37564f5478b')





