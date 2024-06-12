const mongoose = require('mongoose')
const {Schema} = mongoose
const { Types: { ObjectId } } = Schema

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    userId:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    recipes:[{type:ObjectId,ref:'Recipe'}],
    comments:[{type:ObjectId, ref:'Comment'}],
    reviews:[{type:ObjectId, ref:'Review'}],
    createdAt:{
        type: Date,
        default: Date.now
    },
    lastModifiedAt:{
        type: Date,
        default: Date.now
    },
    order:{
        type:Number,
        default:0
    }
})


const User = mongoose.model('User',userSchema)
module.exports = User