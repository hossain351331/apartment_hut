const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const auth = require('../../midleware/auth')
const Profile = require("../../models/Profile")
const { check,validationResult } = require('express-validator')
const { response } = require('express')

router.get('/me',auth, async (req,res)=>{
    
    try{
        const profile =  await Profile.findOne({user:req.user.id})

        if(!profile){
            return res.status(400).json({msg:"Profile not found for this user"})
        }
        res.json(profile)
    }catch(err){
        console.log(err.message)
        res.status(500).json({msg:"Server error"})
    }
    
})
router.delete('/',auth, async (req,res)=>{
    
    try{
        await Profile.findOneAndDelete({user:req.user.id})
        await User.findOneAndDelete({_id:req.user.id})
       
        res.json({msg:'User removed'})
    }catch(err){
        console.log(err.message)
        res.status(500).json({msg:"Server error"})
    }
    
})
router.get('/', async (req,res)=>{
    
    try{
        const profile =  await Profile.find().populate('user',['name','avatar'])

        if(!profile){
            return res.status(400).json({msg:"Profile not found for this user"})
        }
        res.json(profile)
    }catch(err){
        console.log(err.message)
        res.status(500).json({msg:"Server error"})
    }
    
})
router.get('/user/:user_id', async (req,res)=>{
    
    try{
        const profile =  await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar'])

        if(!profile){
            return res.status(400).json({msg:"Profile not found"})
        }
        res.json(profile)
    }catch(err){
        console.log(err.message)
        if(err.kind=='ObjectId'){
            return res.status(400).json({msg:"Profile not found"})
        }
        res.status(500).json({msg:"Server error"})
    }
    
})
router.put('/experience',[auth,[
    check('title','title is required').not().isEmpty(),
    check('company','company is required').not().isEmpty(),
    check('fromDate','from date is required').not().isEmpty()
]],async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(500).json({errors:errors.array()})
    }
    const {title,company,location,fromDate,to,current,description} = req.body
    const newExp = {
        title,
        company,
        location,
        fromDate,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({user:req.user.id})
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({msg:'server error'})
    }

})
router.delete('/experience/:exp_id',auth, async (req,res)=>{
    
    try{
        const profile = await Profile.findOne({user:req.user.id})
        const removedIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removedIndex,1)
        await profile.save()

       
        res.json(profile)
    }catch(err){
        console.log(err.message)
        res.status(500).json({msg:"Server error"})
    }
    
})
router.post('/',[auth,
   [
    check('status','status is required').not().isEmpty(),
    check('skills','Skill is required').not().isEmpty()
   ]
],async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(500).json({errors:errors.array()})
    }

    const {company,website,location,bio,status,githubusername,skills,youtube,facebook,twitter,linkedin} = req.body

    const profileFileds={}
    profileFileds.user=req.user.id
    if(company) profileFileds.company = company
    if(website) profileFileds.website = website
    if(location) profileFileds.location = location
    if(bio) profileFileds.bio = bio
    if(status) profileFileds.status = status
    if(githubusername) profileFileds.githubusername = githubusername
   
    if(skills){
        profileFileds.skills = skills.split(',').map(skill=>skill.trim())
    }
    console.log(profileFileds.skills)
    profileFileds.social = {}
    if(youtube) profileFileds.social.youtube = youtube
    if(facebook) profileFileds.social.facebook = facebook
    if(twitter) profileFileds.social.twitter = twitter
    if(linkedin) profileFileds.social.linkedin = linkedin


    try{
        let profile = await Profile.findOne({user:req.user.id})
        if(profile){
            profile = await Profile.findOneAndUpdate({user:req.user.id},{$set:profileFileds},{new: true})
            console.log("profile updated")
            return res.json(profile)
        }

        profile = new Profile(profileFileds)
        

        res.json(profile)
        
    }catch(err){

        console.log(err.message)
        res.status(500).json({msg:"server error"})
    }

    

    
    
})

module.exports = router;