const mongoose = require('mongoose')
const {Schema} = mongoose

const counterSchema = new Schema({
    name:{type:String},
    recipeId:{
        type:Number,
        default:1
    },
    userId:{
        type:Number,
        default:1
    }
}
)

const Counter = mongoose.model('Counter',counterSchema)

module.exports = Counter