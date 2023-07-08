import axios from 'axios'

const proxy = {
  host: '160.153.0.8',
  port: 80,
  protocol: 'http'
};

const axiosInstance = axios.create({
  proxy: proxy,
});


export async function getProfileApi(accountName) {
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

    return e
  }
}

export async function getPostsList(userId, posts_after = '', posts_count = 12) {
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

export async function getProfileInfoOld(profileName) {
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

export async function getProfileId(profileName) {
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

export async function getPostDetail(shortCode) {
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