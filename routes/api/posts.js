const express = require('express')
const router = express.Router()
const {check,validationResult} = require('express-validator')
const auth = require('../../midleware/auth')
const Posts = require('../../models/Posts')
const User = require('../../models/User')
router.get('/',auth,async (req,res)=>{
    try{
        const posts = await Posts.find().sort({date:-1})
        res.json(posts)
    }catch(error){

    }
})
router.get('/:id',auth,async (req,res)=>{
    try {
        const posts = await Posts.findById(req.params.id)
        if(!posts){
            res.status(400).json({msg:"posts not found"})
        }
        res.json({posts})
    } catch (error) {
        console.log(error.message)
        if(error.kind==='ObjectId'){
            res.status(400).json({msg:"posts not found"})
        }
        res.status(500).json({msg:'server error'})
    }
})
router.post('/',[auth,
    [
        check('text','Text is required').not().isEmpty()

    ]
],
async (req,res)=>{
   try{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    console.log('finding user info')
    const user = await User.findById(req.user.id).select('-password')
    console.log('printing user info: '+user.name)
    const newPost = new Posts({
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id

    })

    const post = await newPost.save()
    res.json(post)
   }catch(err){
       console.log(err.message)
       res.status(500).json({msg:'server error'})
   }
})

router.delete('/:id',auth,async (req,res)=>{
    try{
        const post = await Posts.findById(req.params.id)
        if(!post){
            res.status(400).json({msg:"posts not found"})
        }
        if(post.user.toString()!==req.user.id){
            res.status(401).json({msg:'user not authorized'})
        }

        await post.remove()
        res.json({msg:'post removed'})
    }catch(err){
        console.log(error.message)
        if(error.kind==='ObjectId'){
            res.status(400).json({msg:"posts not found"})
        }
        res.status(500).json({msg:'server error'})
    }
})

router.put('/like/:id',auth,async (req,res)=>{
   try{
    const post = await Posts.findById(req.params.id)
    if(post.likes.filter(like=>like.user.id===req.user.id).length>0){
        res.status(401).json({msg:'Post already liked'})
    }
    post.likes.unshift(req.user.id)
    await post.save()
    res.json(post.likes)
   }catch(err){
       res.status(500).json({msg:"Server error"})
   }
})


router.put('/unlike/:id',auth,async (req,res)=>{
    try{
     const post = await Posts.findById(req.params.id)
     if(post.likes.filter(like=>like.user.toString()===req.user.id).length===0){
         res.status(401).json({msg:'Post not liked yet'})
     }
     const removeIndex = post.likes.map(like=>like.user.toString()).indexOf(req.user.id)
     post.likes.splice(removeIndex,1)
     await post.save()
     res.json(post.likes)
    }catch(err){
        res.status(500).json({msg:"Server error"})
    }
 })


router.post('/comment/:id',[auth,
    [
        check('text','Text is required').not().isEmpty()

    ]
],
async (req,res)=>{
   try{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    console.log('finding user info')
    const user = await User.findById(req.user.id).select('-password')
    const post = await Posts.findById(req.params.id)
    console.log('printing user info: '+user.name)
    const newComment = {
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
    }

    post.comments.unshift(newComment)
    post.save()
    res.json(post)
    
   }catch(err){
       console.log(err.message)
       res.status(500).json({msg:'server error'})
   }
})
module.exports = router;