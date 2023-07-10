import UserModel from '../models/User.js'
import PostModel from '../models/Post.js'
import {
  getPostInfoFromResponse,
  getProfileApi,
  getProfileId,
  getProfileInfoOld,
  getUserInfoFromResponse
} from '../utils/index.js'


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
    const postsArray = accountData.data.data.user.edge_owner_to_timeline_media.edges || []
    const posts = getPostInfoFromResponse(postsArray, userInfo.userInstId)

    // download all content and update links
    const {newUserInfo, newPosts} = await downloadContent(userInfo, posts)
    console.log(newUserInfo)
    console.log(newPosts)

    const isUserExist = await UserModel.findOne({userInstId: userInfo.userInstId})
    let userDoc
    if(isUserExist) {
      const {userInstId, ...newData } = userInfo
      userDoc =  await UserModel.findOneAndUpdate({ 'userInstId' :userInstId }, newData)
    } else {
      userDoc = new UserModel(userInfo)
      await userDoc.save()
    }




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
    res.status(404).json({ message:accountData.message , status: accountData.status })
    res.end()
  }
}

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




// const url = 'https://scontent-iev1-1.cdninstagram.com/v/t50.2886-16/55948865_378311699425814_4899253638142798209_n.mp4?efg=eyJ2ZW5jb2RlX3RhZyI6InZ0c192b2RfdXJsZ2VuLjcyMC5mZWVkLmRlZmF1bHQiLCJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSJ9&_nc_ht=scontent-iev1-1.cdninstagram.com&_nc_cat=102&_nc_ohc=xawV9Ulp3QMAX_Do6N5&edm=AOQ1c0wBAAAA&vs=18032080198107070_1712506711&_nc_vs=HBksFQAYJEdFRzJWUU1XYW5XT0VsZ0JBSUdwQ3Y0NXBmMURia1lMQUFBRhUAAsgBABUAGCRHSS1uV2dNbTdvemlfbThCQUtBVklHN1psLUJVYmtZTEFBQUYVAgLIAQAoABgAGwGIB3VzZV9vaWwBMBUAACbIrpin%2BbG5PxUCKAJDMywXQDQFHrhR64UYEmRhc2hfYmFzZWxpbmVfMV92MREAdeoHAA%3D%3D&_nc_rid=62acb3abcd&ccb=7-5&oh=00_AfDtjpAh8kXso5tIupPkN7_EOqx8mh2UHHrBgl10fuwN7w&oe=64ADF394&_nc_sid=8b3546'
// downloadFile(url, join(__dirname, '/tmp/img.mp4'))
//   .then(()=>console.log('OK'))
//   .catch(err=>console.error(err));
async function downloadContent(userInfo, posts) {
  await downloadFile(userInfo.profilePicUrl, join(__dirname,'..', `/tmp/account_page/${userInfo.userInstId}.jpg`))
  userInfo.profilePicUrl = join('http://localhost:3001/', `/tmp/account_page/${userInfo.userInstId}.jpg`)
  for(let i = 0; i< posts.length ; i++) {
    await  downloadFile(posts[i].displayUrl, join(__dirname, '..', `/tmp/account_page/${posts[i].shortcode}.jpg`))
    posts[i].displayUrl = join( 'http://localhost:3001/',`/tmp/account_page/${posts[i].shortcode}.jpg`)
  }

  return {newUserInfo: userInfo , newPosts : posts}


  function downloadFile(url, path) {
    return fetch(url).then(res => {
      res.body.pipe(fs.createWriteStream(path));
    });
  }

}