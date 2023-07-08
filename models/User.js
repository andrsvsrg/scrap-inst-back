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
  isVerified: {
    type:Boolean,
    default: false
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