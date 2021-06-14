const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bicrypt = require('bcryptjs')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const config = require('config')
router.post('/',[
    check('name','Name is required').not().isEmpty(),
    check('email','Please include valid imail').isEmail(),
    check('password',"Password should be minimum 6 chars").isLength({min:6})    
],async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {name,email,password} = req.body
    try{
        let user = await User.findOne({email})
    if(user){
        return res.status(400).json({errors:[{msg:"User already exist"}]})
    }

    const avatar = await gravatar.url(email,{
        s:'200',
        r:'pg',
        d:'mm'
    })

    user = new User({
        name,
        email,
        password,
        avatar
    })

   
    const salt = await bicrypt.genSalt(10)
    user.password = await bicrypt.hash(password,salt)
    await user.save()

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