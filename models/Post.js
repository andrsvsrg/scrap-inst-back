import mongoose from 'mongoose'


const PostSchema = new mongoose.Schema({
  typename: {
    type: String,
    required: true,
  },
  shortcode: {
    type: String,
    required: true,
    unique:true
  },
  displayUrl: {
    type: String,
    required: true,
  },
  timestamps:{
    type: Number,
    required: true,
  },
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  videoUrl:  {
    type:String,
    required: false
  },
  videoViewCount: {
    type: Number,
    required: false
  },
  likes: Number,
  isVideo: {
    type: Boolean,
    default: false,
  } ,
  edgeChildren: {
    type: Array,
    default: []
  }
})

export default mongoose.model('Post', PostSchema)