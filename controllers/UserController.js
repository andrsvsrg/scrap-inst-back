import UserModel from '../models/User.js'
import PostModel from '../models/Post.js'
import {
  getPostInfoFromResponse,
  getProfileApi,
  getProfileId,
  getProfileInfoOld,
  getUserInfoFromResponse
} from '../utils/index.js'

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

    const isUserExist = await UserModel.findOne({userInstId: newUserInfo.userInstId})
    let userDoc
    if(isUserExist) {
      const {userInstId, ...newData } = newUserInfo
      userDoc =  await UserModel.findOneAndUpdate({ 'userInstId' :userInstId }, newData)
    } else {
      userDoc = new UserModel(newUserInfo)
      await userDoc.save()
    }

    for(let i=0;i< newPosts.length; i++) {
      const isIncludedPost = await PostModel.findOne({shortcode: newPosts[i].shortcode})
      if(isIncludedPost) {
        await PostModel.findOneAndUpdate({shortcode: newPosts[i].shortcode}, newPosts[i])
      } else {
        const postDoc = new PostModel(newPosts[i])
        await postDoc.save()
      }
    }

    if(isUserExist) {
      res.json({ user: userDoc._doc, posts })
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

async function downloadContent(userInfo, posts) {
  await downloadFile(userInfo.profilePicUrl, join(__dirname,'..', `/tmp/account_page/${userInfo.userInstId}.jpg`))
  userInfo.profilePicUrlD = join('http://localhost:3001/', `/tmp/account_page/${userInfo.userInstId}.jpg`)

  for(let i = 0; i< posts.length ; i++) {
    await  downloadFile(posts[i].displayUrl, join(__dirname, '..', `/tmp/account_page/${posts[i].shortcode}.jpg`))
    posts[i].displayUrlD = join( 'http://localhost:3001/',`/tmp/account_page/${posts[i].shortcode}.jpg`)
  }
  return {newUserInfo: userInfo , newPosts : posts}


  function downloadFile(url, path) {   // maybe transfer to utils
    if(fs.existsSync(path)) {
      return
    }
    fetch(url)
      .then(res => {
        if (!res.ok) {
          console.error(`Failed to download file from ${url}, status: ${res.status}`)
          return
        }
        res.body.pipe(fs.createWriteStream(path))
      })
      .catch(error => {
        console.error(`Error downloading file from ${url}: ${error}`)
      })
  }
}

export async function sendJsonToClient(req, res) {
  let {selectedUserFields, selectedPostFields, numbersOfPosts , userInstId} = req.body
  console.log({selectedUserFields, selectedPostFields, numbersOfPosts , userInstId})
  const json = {}
  if(!userInstId) {
    res.status(404).json({message: 'user not found'})
  }
  try {
    selectedUserFields = selectedUserFields ? selectedUserFields : []
    selectedPostFields = selectedPostFields ? selectedPostFields : []
    numbersOfPosts = numbersOfPosts ? +numbersOfPosts : 0
    if(selectedUserFields.length !== 0) {
      const user = await UserModel.findOne({userInstId})
      json.userInfo = {}
      selectedUserFields.forEach((field) => {
        json.userInfo[field] = user._doc[field]
      })
    }
    if(selectedPostFields.length !== 0 && numbersOfPosts !== 0) {
      const posts = await PostModel.find({author:userInstId})
      json.posts = []
      if(numbersOfPosts <= posts.length) {
        posts.splice(0,numbersOfPosts).forEach((post) => {
          const jsonPost = {}
          selectedPostFields.forEach((field) => {
            jsonPost[field] = post[field]
          })

          json.posts.push(jsonPost)
        })
      }
    }

    const pathToTmpJson = join(__dirname, '..', `tmp/jsons/${userInstId}.json`)
    const jsonData = JSON.stringify(json)
    fs.writeFile(pathToTmpJson, jsonData, (err) => {
      if (err) {
        console.error('Ошибка при создании файла:', err);
        return res.status(500).send('Ошибка при создании файла');
      }

      fs.readFile(pathToTmpJson, (err, data) => {
        if (err) {
          console.error('Ошибка при чтении файла:', err);
          return res.status(500).send('Ошибка при чтении файла');
        }

        res.setHeader('Content-disposition', `attachment; filename=${userInstId}.json`);
        res.setHeader('Content-type', 'application/json');
        res.send(data);
      });
    });

  } catch(e){
    console.error(e.message)
    res.status(500).send({message: e.message })
  }
}