const mongoose = require('mongoose')
const { Schema } = mongoose
const {Types:{ObjectId}} = Schema

const commentSchema = new Schema({
    title:{
        type: String,
        required: true,
    },
    body:{
        type: String,
        required: true
    },
    author:{
        type: ObjectId,
        ref: 'User',
        required: true
    },
    recipe:{
        type: ObjectId,
        ref:'Recipe',
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    lastModifiedAt:{
        type:Date,
        default: Date.now
    },
    originComment:{
        type: ObjectId,
        ref:'Comment'
    }
})

const Comment = mongoose.model('Comment',commentSchema)
module.exports = Comment