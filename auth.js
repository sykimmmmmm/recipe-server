const config = require('./config')
const jwt = require('jsonwebtoken')

const generateToken = (user)=>{
    return jwt.sign({
        _id:user._id,
        name:user.name,
        isAdmin: user.isAdmin,
        userId:user.userId,
        createAt:user.createdAt,
    },config.JWT_SECRET,{
        expiresIn:'1d',
        issuer:"jwt"
    })
}

const isAuth = (req,res,next)=>{
    const bearerToken = req.headers.authorization
    if(!bearerToken){
        return res.status(401).json({message:'Token is not supplied!'})
    }else{
        const token = bearerToken.slice(7,bearerToken.length)
        jwt.verify(token,config.JWT_SECRET,(err,userInfo)=>{
            if(err&& err.name === 'TokenExpiredError'){
                return res.status(419).json({
                    code:419, message:'Token expired!'
                })
            }else if(err){
                return res.status(401).json({
                    code:401, message:'Invalid Token!'
                })
            }
            req.user = userInfo
            next()
        })
    }
}

const isAdmin = (req,res,next)=>{
    if(req.user && req.user.isAdmin){
        return next()
    }else{
        return res.status(401).json({
            code:401, message:'You are not Valid Admin user'
        })
    }
}

module.exports = {generateToken,isAuth,isAdmin}