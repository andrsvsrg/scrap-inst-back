import { getPostsList, getPostDetail } from '../helpers/requestToInstagramApi.js'
import { getPostInfoFromResponse } from '../helpers/getDataFromResponse.js'
import UserModel from '../models/User.js'
import PostModel from '../models/Post.js'
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

  let userObjId
  if(userDoc) {
    userObjId = userDoc._id.toString()
  }


  const posts = getPostInfoFromResponse(postsArray, userObjId )
  for(let i = 0; i < posts.length; i++) {
    const isPostExist = await PostModel.findOne({shortcode:posts[i].shortcode })
    if(isPostExist) {
      await PostModel.findOneAndUpdate({shortcode:posts[i].shortcode }, posts[i])
    } else {
      const postDoc = new PostModel(posts[i])
      await postDoc.save()
    }
  }


  if(postsData.status === 'ok') {
    res.json({...postsData.data.user.edge_owner_to_timeline_media ,edges:posts})
    // res.json(postsData)
    res.end()
  } else {
    res.status(+postsData.response.status)
      .json({  data: postsData.response.data, status: postsData.response.status })
    res.end()
  }
}