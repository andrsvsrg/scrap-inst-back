import express from 'express'
import mongoose from 'mongoose'


import { getAccountInfoAndPosts, getAccountInfoOld, getIdByUsername } from './controllers/UserController.js'
import { getDetailedInfoAboutPost, getListPostByUserId } from './controllers/PostController.js'

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

app.get('/api/get-id/:accountName', getIdByUsername)  // no needed db
app.get('/api/user-old/:accountName', getAccountInfoOld)
app.get('/api/user/:accountName', getAccountInfoAndPosts)  // db+
app.get('/api/p/:shortCode', getDetailedInfoAboutPost)  // todo db
app.post('/api/posts/', getListPostByUserId)  //  db+


app.listen(PORT, () => {
  console.log(`Server has been started on port ${PORT}`)
})














