const express = require('express')
const User = require('../models/User')
const expressAsyncHandler = require('express-async-handler')
const { generateToken, isAuth, isAdmin } = require('../../auth')
const Counter = require('../models/Counter')
const Review = require('../models/Review')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Recipe = require('../models/Recipe')
const upload = multer({
    storage: multer.diskStorage({
        destination: function( req, file, cb){
            cb(null,'public/uploads/')
        },
        filename: function(req, file, cb){
            const ext = path.extname(file.originalname)
            const filename = path.basename(btoa(file.originalname),ext)+'_'+ Date.now() + ext
            cb(null, filename)
        }
    }),
    fileFilter: function(req,file,cb){
            const typeArray = file.mimetype.split('/')
            const fileType = typeArray[0]
            if(fileType === 'image'){
                cb(null,true)
            }else{
                req.fileValidationError = 'jpg,png,jpeg,gif,webp등 이미지파일만 업로드가능합니다'
                cb(null,false)
            }
        }
    }
)

/* 중복유저확인 */
router.post('/confirmUser',expressAsyncHandler( async(req,res,next)=>{
    const user = await User.findOne({userId:req.body.userId})
    if(user){
        res.json({code:409,msg:'중복된 아이디입니다'})
    }else{
        res.json({code:200,msg:'사용가능한 아이디입니다'})
    }
}))


/* 회원가입 */
router.post('/register',expressAsyncHandler(async(req,res,next)=>{
    const user = await User.findOne({userId:req.body.userId})
    if(user){
        res.status(409).json({code:409,msg:'이미 있는 사용자입니다'})
    }else{
        await Counter.findOne({name:'counter'}).exec()
        .then(counter=> {
            let count = counter.userId
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                userId: req.body.userId,
                password: req.body.password,
                order:count    
            }).save()
            .catch(e=>res.status(400).json({code:400, msg:'정보가 없습니다'}))
            .then((user)=>{
                Counter.updateOne({name:'counter'},{$inc:{userId:1}})
                .then(()=>{
                    res.json({code:200,msg:'회원님의 가입을 환영합니다',user})
                })
                // .catch((e)=>{
                //     res.status(400).json({code:400,msg:'정보가 없습니다'})
                // })
            })
        })
    }
}))

/* 로그인 */
router.post('/login',expressAsyncHandler( async(req,res,next)=>{
    if(!req.body.userId){
        res.json({code:404,message:'아이디를 입력해주세요'})
    }
    if(!req.body.password){
        res.json({code:404,message:'비밀번호를 입력해주세요'})
    }
    const loginUser = await User.findOne({
        userId: req.body.userId,
        password: req.body.password
    })
    if(!loginUser){
        res.json({
            code:401, message:'아이디 혹은 비밀번호를 확인해주세요'
        })
    }else{
        const { name, userId, isAdmin, createdAt } = loginUser
        res.json({
            code:200,
            token: generateToken(loginUser),
            name,userId,isAdmin,createdAt
        })
    }
}))

/* 마이페이지 */
router.get('/mypage/:id',expressAsyncHandler(async(req,res,next)=>{
    console.log(req.params)
    const user = await User.findOne({userId:req.params.id}).populate({path:'recipes',populate:{path:'reviews'}}).populate({path:'recipes',populate:{path:'finishedImgs'}}).populate({path:'reviews',populate:{path:'recipe',populate:{path:'finishedImgs'}}})
    if(user){
        res.json({code:200,message:'success',user})
    }else{
        res.json({code:404,message:'해당 유저를 찾을 수 없습니다'})
    }
}))


/* 리뷰작성 */
router.post('/review',isAuth,upload.single('img'),expressAsyncHandler(async(req,res,next)=>{
    const user = await User.findOne({_id:req.user._id})
    const recipe = await Recipe.findOne({_id:req.body.recipeId})
    const review = new Review({
        author:req.user._id,
        recipe:req.body.recipeId,
        body:req.body.body,
        rating:req.body.rating,
        img:req.file? req.file.path.slice(7,req.file.path.length) : null
    })
    const newReview = await review.save()
    if(newReview){
        user.reviews.push(newReview)
        await user.save()
        recipe.reviews.push(newReview)
        await recipe.save()
        res.json({code:200, message:'리뷰를 저장했습니다',newReview})
    }else{
        res.json({code:400, message:'리뷰 저장에 실패했습니다'})
    }
}))

module.exports = router