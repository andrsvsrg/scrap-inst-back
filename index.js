import express from 'express'
import axios from 'axios'
import mongoose from 'mongoose'

import UserModel from './models/User.js'
import PostModel from './models/Post.js'

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

app.get('/api/get-id/:accountName', async(req,res) => {
  const accountName = req.params.accountName
  const response =  await getProfileId(accountName)
  if(response.id) {
    res.json(response)
    res.end()
  } else {
    res.json({ message : response.message })
    res.end()
  }
})

app.get('/api/user-old/:accountName', async(req,res) => {
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
})


app.get('/api/user/:accountName', async (req, res) => {
  const accountName = req.params.accountName
  const accountData = await getProfileApi(accountName)
  console.log(accountData)
  if(accountData.status === 200) {
    // create User Model
    const user = accountData?.data?.data?.user
    if(!user) {
      res.status(403)
      res.json({message: 'try later'})
      res.end()
      return
    }
    const userDoc = new UserModel({
        userInstId: user.id,
        username: user.username,
        biography: user.biography,
        followed: user.edge_followed_by.count,
        follow: user.edge_follow.count,
        fullName: user.full_name,
        categoryName: user.category_name,
        profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url,
        bioLinks: user.bio_links.map((link) => link.url).filter((e) => e)
    })
   // create Posts Model

    const posts = accountData.data.data.user.edge_owner_to_timeline_media.edges.map((p) => {
      return {
        typename: p.node.__typename, // string
        shortcode: p.node.shortcode,  // string
        displayUrl: p.node.display_url,  // string
        timestamps: p.node.taken_at_timestamp,  // number
        videoUrl: p.node.video_url || "",  // string
        videoViewCount: p.node.video_view_count || 0, // number
        likes: p.node.edge_liked_by.count || 0, // number
        isVideo: p.node.is_video  , // boolean
        edgeChildren: p.node.edge_sidecar_to_children?.edges?.map((child) => {
          return {
            typename: child.node.__typename,
            shortcode: child.node.shortcode,
            displayUrl: child.node.display_url,
            isVideo: child.node.is_video ,
            videoUrl: child.node.video_url || "",
            videoViewCount: child.node.video_view_count || 0
          }
        }) || [] ,
        author: userDoc._id.toString()
      }
    })

    for(let i=0;i< posts.length; i++) {
      const isIncludedPost = await PostModel.findOne({shortcode: posts[i].shortcode})
      if(isIncludedPost) {
        await PostModel.findOneAndUpdate({shortcode: posts[i].shortcode}, posts[i])
      } else {
        const postDoc = new PostModel(posts[i])
        await postDoc.save()
      }
    }


    const isIncludedUser = await UserModel.findOne({ 'userInstId' : userDoc.userInstId })
    if(isIncludedUser) {
      const {_id,userInstId, ...newData } = userDoc._doc
      await UserModel.findOneAndUpdate({ 'userInstId' :userInstId }, newData)

      res.json({ user: userDoc._doc, posts })
    } else {
      await userDoc.save()
      res.json({user: userDoc._doc, posts})
    }

    res.end()
  } else {
    res.json({ accountData })
    res.end()
  }
})

app.get('/api/p/:shortCode', async(req,res) => {
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
})

app.post('/api/posts/', async(req,res) => {
  const {userId, posts_after = '', posts_count = 12} = req.body
  console.log(userId, posts_after , posts_count)
  const postsData = await getPostsList(userId, posts_after, posts_count)
  console.log(postsData)
  if(postsData.status === 'ok') {
    res.json(postsData.data.user)
    res.end()
  } else {
    res.status(+postsData.response.status)
      .json({  data: postsData.response.data, status: postsData.response.status })
    res.end()
  }
})

app.listen(PORT, () => {
  console.log(`Server has been started on port ${PORT}`)
})
const proxy = {
  host: '160.153.0.8',
  port: 80,
  protocol: 'http'
};

const axiosInstance = axios.create({
  proxy: proxy,
});

async function getProfileApi(accountName) {
  console.log(accountName)
  try {
    const response =  await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${accountName}`, {
      method: 'GET',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        'Referer':`https://www.instagram.com/${accountName}/`,
        'X-Csrftoken':'2zdOt8PhbRWNZOaZKs82OhlSg3e0f7dv',
        'X-Requested-With':'XMLHttpRequest',
        "x-web-device-id": "393C8C78-8350-486D-92C9-F518D4B075A6",
        "x-ig-app-id": "936619743392459",
        'x-asbd-id':  "129477",
        "Cookie": 'mid=ZITpgwALAAGtg2AK33vWsZTTphz8; ig_did=ED6A7D36-D871-4BDD-A898-1CC4D2DD71CC; ig_nrcb=1; datr=4sSFZJ0uzPKH3CidBonEV-VH; fbm_124024574287414=base_domain=.instagram.com; ds_user_id=4834774180; csrftoken=OHf1Vk8MJGFQpYRUFrMQszz3T4QbVnNs;  sessionid=4834774180%3Abj5BG4TN9gSndT%3A7%3AAYdhiwDYyn3WOL56Y7jD0OG1ZBzRtd727RX4aRi8zA;',
      }
      //   {
      //   'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      //   'Referer':`https://www.instagram.com/${accountName}/`,
      //   'X-Csrftoken':'2zdOt8PhbRWNZOaZKs82OhlSg3e0f7dv',
      //   'authority': 'www.instagram.com',
      //   'Cookie': 'csrftoken=2zdOt8PhbRWNZOaZKs82OhlSg3e0f7dv; ig_did=393C8C78-8350-486D-92C9-F518D4B075A6;',
      //   'accept': '*/*',
      //   'x-asbd-id':  "129477",
      //   "x-ig-app-id": "936619743392459",
      //   "x-web-device-id": "393C8C78-8350-486D-92C9-F518D4B075A6",
      //   'X-Requested-With':'XMLHttpRequest',
      // }
    })
    // console.log(response.data)
    return {data: response.data , status:response.status}
  }catch(e) {
    console.log(e)
    return e.message
  }
}

async function getPostsList(userId, posts_after = '', posts_count = 12) {
  try {
    const response = await axios.get(`https://www.instagram.com/graphql/query/?query_hash=7ea6ae3cf6fb05e73fcbe1732b1d2a42&variables={"id":"${userId}","first":"${posts_count}","after":"${posts_after}","include_reel":"true"}`, {
      method: 'GET',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Cookie": 'mid=ZITpgwALAAGtg2AK33vWsZTTphz8; ig_did=ED6A7D36-D871-4BDD-A898-1CC4D2DD71CC; ig_nrcb=1; datr=4sSFZJ0uzPKH3CidBonEV-VH; fbm_124024574287414=base_domain=.instagram.com; ds_user_id=4834774180; csrftoken=OHf1Vk8MJGFQpYRUFrMQszz3T4QbVnNs;  sessionid=4834774180%3Abj5BG4TN9gSndT%3A7%3AAYdhiwDYyn3WOL56Y7jD0OG1ZBzRtd727RX4aRi8zA;',
      }
    })
    return response.data
  } catch(e) {
    return e
  }

}

async function getProfileInfoOld(profileName) {
  console.log(profileName)
  try {
    const response =  await axios.get(`https://www.instagram.com/${profileName}/?__a=1&__d=dis`, {
      method: 'GET',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Cookie": 'mid=ZITpgwALAAGtg2AK33vWsZTTphz8; ig_did=ED6A7D36-D871-4BDD-A898-1CC4D2DD71CC; ig_nrcb=1; datr=4sSFZJ0uzPKH3CidBonEV-VH; fbm_124024574287414=base_domain=.instagram.com; ds_user_id=4834774180; csrftoken=OHf1Vk8MJGFQpYRUFrMQszz3T4QbVnNs;  sessionid=4834774180%3Abj5BG4TN9gSndT%3A7%3AAYdhiwDYyn3WOL56Y7jD0OG1ZBzRtd727RX4aRi8zA;',
      }
    })
    return {data: response.data , status:response.status}
  }catch(e) {
    return e
  }
}

async function getProfileId(profileName) {
  console.log(profileName)
  try {
    const response =  await axios.get(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${profileName}&rank_token=0.3953592318270893&count=1`, {
      method: 'GET',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Cookie": 'mid=ZITpgwALAAGtg2AK33vWsZTTphz8; ig_did=ED6A7D36-D871-4BDD-A898-1CC4D2DD71CC; ig_nrcb=1; datr=4sSFZJ0uzPKH3CidBonEV-VH; fbm_124024574287414=base_domain=.instagram.com; ds_user_id=4834774180; csrftoken=OHf1Vk8MJGFQpYRUFrMQszz3T4QbVnNs;  sessionid=4834774180%3Abj5BG4TN9gSndT%3A7%3AAYdhiwDYyn3WOL56Y7jD0OG1ZBzRtd727RX4aRi8zA;',
      }
    })
    const id = response?.data?.users[0]?.user?.pk

    return id ? { id } : {data: response.data }
  }catch(e) {
    return e
  }
}

async function getPostDetail(shortCode) {
  try {
      let response =  await axios.get(`https://www.instagram.com/graphql/query/?query_hash=9f8827793ef34641b2fb195d4d41151c&variables={"shortcode":"${shortCode}","child_comment_count":3,"fetch_comment_count":40,"parent_comment_count":24,"has_threaded_comments":true}`,{
      method: 'GET',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Cookie": 'mid=ZITpgwALAAGtg2AK33vWsZTTphz8; ig_did=ED6A7D36-D871-4BDD-A898-1CC4D2DD71CC; ig_nrcb=1; datr=4sSFZJ0uzPKH3CidBonEV-VH; fbm_124024574287414=base_domain=.instagram.com; ds_user_id=4834774180; csrftoken=OHf1Vk8MJGFQpYRUFrMQszz3T4QbVnNs;  sessionid=4834774180%3Abj5BG4TN9gSndT%3A7%3AAYdhiwDYyn3WOL56Y7jD0OG1ZBzRtd727RX4aRi8zA;',
      }
    })

    return {data: response.data , status:response.status}
  }catch(e) {
    return e
  }
}



