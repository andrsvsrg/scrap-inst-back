import express from 'express'
import mongoose from 'mongoose'

import {PostController, UserController} from './controllers/index.js'

const app = express()

mongoose.connect(
  'mongodb+srv://admin:admin3213@cluster.x6jnnhk.mongodb.net/inst?retryWrites=true&w=majority'
).then(() =>  console.log('connect with db - OK'))
  .catch((e) => console.log(e.message))


app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

const PORT = 3000

app.get('/api/get-id/:accountName', UserController.getIdByUsername)  // no needed db
app.get('/api/user-old/:accountName', UserController.getAccountInfoOld)
app.get('/api/user/:accountName', UserController.getAccountInfoAndPosts)  // db+
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





