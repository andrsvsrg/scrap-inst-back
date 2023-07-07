// const user = response.data.user
// const userModel = {
//   userInstId: user.id,   // string
//   username: user.username,  // string
//   biography: user.biography,  // string
//   followed: user.edge_followed_by.count,  // number
//   follow: user.edge_follow.count,  // number
//   fullName: user.full_name,  // string
//   categoryName: user.category_name, // string
//   profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url, // URL
//   bioLinks: user.bio_links.map((link) => link.url).filter((e) => e)  // URL
// }

import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  userInstId: {
    type: String,
    required: true,
    unique:true
  },
  username: {
    type: String,
    required: true,
    unique:true
  },
  biography: String,
  followed:{
    type: Number,
    default: 0,
  },
  follow: {
    type: Number,
    default: 0,
  },
  fullName: String,
  categoryName:  String,
  profilePicUrl: String,
  bioLinks: Array
} )

export default mongoose.model('User', UserSchema)