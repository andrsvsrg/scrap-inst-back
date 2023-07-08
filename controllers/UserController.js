import UserModel from '../models/User.js'
import PostModel from '../models/Post.js'
import { getProfileApi, getProfileId, getProfileInfoOld } from '../helpers/requestToInstagramApi.js'
import { getPostInfoFromResponse, getUserInfoFromResponse } from '../helpers/getDataFromResponse.js'

export const getIdByUsername =  async(req,res) => {
  const accountName = req.params.accountName
  const response =  await getProfileId(accountName)
  if(response.id) {
    res.json(response)
    res.end()
  } else {
    res.json({ message : response.message })
    res.end()
  }
}

export const getAccountInfoOld =  async(req,res) => {
  const accountName = req.params.accountName
  const accountData = await getProfileInfoOld(accountName)
  console.log(accountData)
  if(accountData.status === 200) {
    res.json(accountData.data)
    res.end()
  } else {
    res.status(+accountData.response.status)
      .json({  data: accountData.response.data, status: accountData.response.status })
    res.end()
  }
}

export const getAccountInfoAndPosts = async (req, res) => {
  const accountName = req.params.accountName
  const accountData = await getProfileApi(accountName)
  if(accountData.status === 200) {
    const user = accountData?.data?.data?.user
    if(!user) {
      res.status(403)
      res.json({message: 'try later'})
      res.end()
      return
    }
    const userInfo = getUserInfoFromResponse(user)
    const isUserExist = await UserModel.findOne({userInstId: userInfo.userInstId})
    let userDoc
    if(isUserExist) {
      const {userInstId, ...newData } = userInfo
      userDoc =  await UserModel.findOneAndUpdate({ 'userInstId' :userInstId }, newData)
    } else {
      userDoc = new UserModel(userInfo)
      await userDoc.save()
    }


    const postsArray = accountData.data.data.user.edge_owner_to_timeline_media.edges || []
    const userObjId = userDoc._id.toString()
    const posts = getPostInfoFromResponse(postsArray, userObjId)

    for(let i=0;i< posts.length; i++) {
      const isIncludedPost = await PostModel.findOne({shortcode: posts[i].shortcode})
      if(isIncludedPost) {
        await PostModel.findOneAndUpdate({shortcode: posts[i].shortcode}, posts[i])
      } else {
        const postDoc = new PostModel(posts[i])
        await postDoc.save()
      }
    }


    const isUserExists = await UserModel.findOne({ 'userInstId' : userDoc.userInstId })
    if(isUserExists) {
      res.json({ user: userDoc._doc, posts })
      // res.json(accountData)
     } else {
      await userDoc.save()
      res.json({user: userDoc._doc, posts})
    }

    res.end()
  } else {
    res.json({ accountData })
    res.end()
  }
}