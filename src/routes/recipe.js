const express = require('express')
const Recipe = require('../models/Recipe')
const Image = require('../models/Image')
const User = require('../models/User')
const Counter = require('../models/Counter')
const expressAsyncHandler = require('express-async-handler')
const {isAuth, isAdmin } = require('../../auth')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Review = require('../models/Review')
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
// 서버에 이미지 저장
router.post('/upload', isAuth,upload.fields([{name:'recipeImage'},{name:'id'},{name:'finishedImgs'}]), expressAsyncHandler( async (req,res,next)=>{
    const recipeImages = req.files.recipeImage
    const finishedImages = req.files.finishedImgs
    const orders = req.body.id
    if(req.fileValidationError){
        res.json({code:400,message:req.fileValidationError})
    }else{
        const neworders = (orders.length>1 && orders.filter(a=>a!=='undefined')) || orders
        const cookingImgs = await Promise.allSettled(recipeImages && recipeImages.map((file,id)=>{
            const recipeImage = new Image({
                path: file.path.slice(7,file.path.length),
                order: neworders[id]
            })
            const newRecipeImage = recipeImage.save()
            return newRecipeImage
        })).catch(e=>{
            console.log(e)
        })
        const finishedImgs = await Promise.allSettled(finishedImages && finishedImages.map((file)=>{
            const finishedImage = new Image({
                path: file.path.slice(7,file.path.length)
            })
            const newFinishedImage = finishedImage.save()
            return newFinishedImage
        })).catch(e=>{
            console.log(e)
        })
        res.json({code:200 , cookingImgs,finishedImgs})
    }
}))

/* 레시피저장 */
router.post('/add-recipe',isAuth,expressAsyncHandler( async (req,res,next)=>{
    const user = await User.findOne({_id:req.user._id})
    await Counter.findOne({name:'counter'}).exec()
    .then(counter=>{
        let count = counter.recipeId
        const recipe = new Recipe({
            recipeTitle: req.body.recipeTitle,
            name: req.body.name,
            description: req.body.description,
            author: req.user._id,
            info: req.body.info,
            ingredients: req.body.ingredients,
            steps: req.body.steps,
            tip: req.body.tip,
            tag: req.body.tag,
            open: req.body.open,
            category: req.body.category,
            cookingImgs: req.body.cookingImgs,
            finishedImgs: req.body.finishedImgs,
            recipeId: count
        }).save()
        .catch(e => res.status(400).json({code:400,e}))
        .then((recipe)=>{
            user.recipes.push(recipe)
            user.save()
            Counter.updateOne({name:'counter'},{$inc:{recipeId:1}})
            .then(()=>{
                res.json({code:200,message:'레시피가 등록되었습니다.',recipe})
            })
        })
    })
}))

/* 레시피 추천 */
router.post('/recommend',isAuth,expressAsyncHandler(async(req,res,next)=>{
    const recipe = await Recipe.findOne({recipeId:req.body.id})
    if(recipe){
        recipe.recommended = recipe.recommended + req.body.num
        if(recipe.recommended < 0){
            recipe.recommended = 0
        }
        await recipe.save()
        res.json({success:true})
    }else{
        res.json({code:400,message:'오류발생',success:false})
    }
}))


/* 전체레시피 불러오기 */
router.get('/recipe-list',expressAsyncHandler(async (req,res,next)=>{
    let recipe = await Recipe.find({open:true}).populate('cookingImgs',['-_id','path','order']).populate('author','-_id').populate('finishedImgs','-_id').populate('reviews','-_id')
    let {type, situation, process, material,name,orderby} = req.query
    console.log(type,situation,process,material,name,orderby)
    /* query 조건부 필터링 */
    if(name !== undefined){
        recipe = recipe.filter(recipe=> recipe.name.includes(name))
    }

    if(type !== undefined && type !== '전체'){
        recipe = recipe.filter(recipe => recipe.category.includes(type))
    }
    
    if(situation !== undefined && situation !== '전체'){
        recipe = recipe.filter(recipe => recipe.category.includes(situation))
    }

    if(process !== undefined  && process !== '전체'){
        recipe = recipe.filter(recipe => recipe.category.includes(process))
    }

    if(material !== undefined && material !== '전체'){
        recipe = recipe.filter(recipe => recipe.category.includes(material))
    }
    if(orderby !== undefined && orderby !=='정렬초기화'){
        orderby === '조회수' ? orderby='viewership' : orderby='recommended'
        recipe = recipe.sort((recipe1,recipe2)=> recipe2[orderby] - recipe1[orderby])
    }
    if(recipe.length>0){
        res.send(recipe)
    }else{
        res.json({code:404,message:'공개된 레시피가 없습니다'})
    }
}))

/* 상세보기 클릭시 특정레시피 조회 및 조회수 증가 */
router.get('/:id',expressAsyncHandler(async(req,res,next)=>{
    const recipe = await Recipe.findOne({recipeId:req.params.id}).populate('cookingImgs',['-_id','path','order']).populate('author','-_id').populate('finishedImgs','-_id').populate({path:'reviews',populate:{path:'author'}})
    const review = await Review.find({recipe:recipe._id}).populate('author',['name'])
        if(recipe){
            recipe.viewership = recipe.viewership + 1
            await recipe.save()
            res.json({code:200, msg:'데이터를 불러왔습니다', recipe,review})
        }else{
            res.json({code:404,message:'페이지를 찾을 수 없습니다'})
        }
}))


module.exports = router