const mongoose = require('mongoose')
const { Schema } = mongoose
const { Types: { ObjectId }} = Schema

const reviewSchema = new Schema({
    body:{
        type:String,
        required: true
    },
    author:{
        type: ObjectId,
        ref:'User'
    },
    recipe:{
        type: ObjectId,
        ref:'Recipe'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    lastModifiedAt:{
        type: Date,
        default: Date.now
    },
    rating:{
        type: Number,
        required: true
    },
    img:{
        type:String
    }
})

const Review = mongoose.model('Review',reviewSchema)
module.exports = Review