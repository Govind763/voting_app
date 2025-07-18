const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('./../auth/jwt');

router.post('/signup', async (req,res)=>{
try{
    const data = req.body;//Asuming the request body contains the person data
    //Create a new User document using the Mongoose model
    const newUser = new User(data);

    //Save the new person to the database
    const response = await newUser.save();
    console.log('data saved');

    const payload = {
        id:response.id
    }
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);

    res.status(200).json({response:response,token:token});
}catch(err){
    console.log(err);
    res.status(500).json({error:"Invternal Server Error"});
}
})

//Login Route
// --> have to check only on admin type can be created
router.post('/login', async(req,res)=>{
    try{
        //Extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        //Find the user by userName
        const user = await User.findOne({aadharCardNumber:aadharCardNumber})

        //If user does not exist or password does not match, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:"Invalid aadharCardNumber or password"})
        }

        //generate Token
        const payload ={
            id:user.id
        }
        const token = generateToken(payload);
        //return token as response
        res.json(token);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Invternal Server Error"});
    }
})

//Profile Route
router.get('/profile', jwtAuthMiddleware, async (req,res)=>{
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.log(err);
         res.status(500).json({error:"Invternal Server Error"});
    }
})

//change user Password
router.put('/profile/password',jwtAuthMiddleware, async(req,res)=>{
    try{
        const userId = req.user.id;
        const {currentPassword,newPassword} = req.body;
        //Finding the user by userID
        const user = await User.findById(userId);
 //If user does not exist or password does not match, return error
        if( !(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:"Invalid aadharCardNumber or password"})
        }

        //Update the user's password
        user.password = newPassword;
        await user.save();
        console.log("Password updated");
        res.status(200).json({message:"Password Updated Successfully"})

    }catch(err){
        console.log(err);
         res.status(500).json({error:"Invternal Server Error"});
    }
})

module.exports = router;