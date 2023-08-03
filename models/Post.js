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
  displayUrlD: {
    type: String,
    required: true,
  },
  timestamps:{
    type: Number,
    required: true,
  },
  author:{
    type: 'String',
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