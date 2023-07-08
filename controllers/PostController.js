import { getPostsList, getPostDetail } from '../helpers/requestToInstagramApi.js'
import { getPostInfoFromResponse } from '../helpers/getDataFromResponse.js'
import UserModel from '../models/User.js'
import User from '../models/User.js'
export const getDetailedInfoAboutPost = async(req,res) => {
  const shortCode = req.params.shortCode
  const postData = await getPostDetail(shortCode)
  if(postData.status === 200) {
    res.json(postData.data)
    res.end()
  } else {
    res.status(postData.response.status)
      .json({ data: postData.response.data, status: postData.response.status })

    res.end()
  }
}

export const getListPostByUserId = async(req,res) => {
  const {userId, posts_after = '', posts_count = 12} = req.body
  console.log(userId, posts_after , posts_count)
  const postsData = await getPostsList(userId, posts_after, posts_count)
  const postsArray = postsData.data.user.edge_owner_to_timeline_media.edges
  const userDoc = await UserModel.findOne({userInstId:userId.toString() })
  console.log(await UserModel.findById('64a54e2f9cce57ba851714c6'))
  let userObjId
  if(userDoc) {
    console.log(userDoc._id.toString())
    userObjId = userDoc._id.toString()
  }

  const posts = getPostInfoFromResponse(postsArray, userObjId )
  if(postsData.status === 'ok') {
    res.json(posts)
    res.end()
  } else {
    res.status(+postsData.response.status)
      .json({  data: postsData.response.data, status: postsData.response.status })
    res.end()
  }
}