const express = require('express')
const auth = require('../../midleware/auth')
const User = require('../../models/User')
const { check, validationResult } = require('express-validator');
const bicrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const router = express.Router()
router.get('/',auth, async (req,res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.log(err.message)
        res.status(500).json({msg:"Server internal error"})
    }
})

router.post('/',[
   
    check('email','Please include valid imail').isEmail(),
    check('password',"Password is required").exists()   
],async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {email,password} = req.body
    try{
        let user = await User.findOne({email})
    if(!user){
        return res.status(400).json({errors:[{msg:"Invalid credentials"}]})
    }
    const isMatched = bicrypt.compare(password,user.password)
    if(!isMatched){
        return res.status(400).json({errors:[{msg:"Invalid credentials"}]})
    }
    const payload = {
        user: {
          id : user.id
         }
      }

      jwt.sign(payload,
        config.get('jwtSecret'),
        {expiresIn:3600},
        (err,token)=>{
        if(err) throw err;
        res.json({token})
        console.log("sending token")
      })
    
    }catch(err){
        console.log(err)
        res.status(500).json({error:[{msg:'Internal server error'}]})
    }

});

module.exports = router;