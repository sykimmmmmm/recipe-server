const express = require('express')
const app = express()
const userRouter = require('../src/routes/users')
const recipeRouter = require('../src/routes/recipe')
const mongoose = require('mongoose')
const config = require('../config')
const cors = require('cors')
const logger = require('morgan')
const path = require('path')

const publicPath = path.join(__dirname, '/public')

const corsOption = {
    origin:'*',
    credentials: true
}

app.use(cors(corsOption))
app.use(express.json())
app.use(logger('tiny'))
app.use(express.static(publicPath))
mongoose.connect(config.MONGODB_URL)
.then(()=>console.log('연동성공'))
.catch(e => console.log(`연동 실패 ${e}`))
app.use('/users',userRouter)
app.use('/recipes',recipeRouter)


app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(config.PORT,()=>{
    console.log(`this Port is ${config.PORT}`)
})
