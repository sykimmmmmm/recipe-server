const mongoose = require('mongoose')
const { Schema } = mongoose
const { Types: { ObjectId, Mixed}} = Schema

const recipeSchema = new Schema({
    category: {
        type: Mixed,
        required: true
    },
    recipeTitle:{
        type: String,
        required: true,
        trim:true
    },
    name:{
        type: String,
        required: true,
        trim:true
    },
    description:{
        type: String,
        required: true
    },
    author:{
        type: ObjectId,
        ref: "User"
    },
    info:{
        type: Mixed,
        required: true
    },
    ingredients:{
        type: Mixed,
        required: true
    },
    steps:{
        type: Mixed,
    },
    viewership:{
        type: Number,
        default:0
    },
    wishlisted:{
        type: Number,
        default:0
    },
    recommended:{
        type:Number,
        default:0
    },
    cookingImgs:[{type:ObjectId,ref:"Image"}],
    finishedImgs:[{type:ObjectId,ref:"Image"}],
    open:{
        type: Boolean,
        default : false,
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    lastModifiedAt:{
        type: Date,
        default: Date.now
    },
    reviews:[{type:ObjectId, ref:'Review'}],
    recipeId:{
        type:Number,
        default:1
    }
})

const Recipe = mongoose.model('Recipe',recipeSchema)
module.exports = Recipe 