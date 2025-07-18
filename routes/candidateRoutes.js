const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('../auth/jwt');

//check role
const checkAdminRole = async (userId)=>{
    try{
        const user = await User.findById(userId);
        return user.role === 'admin';
    }catch(err){
        return false;
    }
}
//Post route to add a candidate
router.post('/', jwtAuthMiddleware,async (req,res)=>{
    try{
        if(!await checkAdminRole(req.user.id)) 
            return res.status(403).json({message:"User has not Admin role"})
        //Assuming the request body contains the candidate data
        const data = req.body;
        //Create a new Candidate document using the Mongoose model
        const newCandidate = new Candidate(data);

        //Save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response});
    }catch(err){
        console.log(err);
         res.status(500).json({error:"Invternal Server Error"});
    }
})

//change Candidate Details
router.put('/:candidateId', jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)) 
            return res.status(403).json({message:"User has not Admin role"})
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData,{
            new :true, //Return the updated document
            runValidators:true, //  Run Mongoose validation
        });

        if(!response){
            return res.status(404).json({error:"Candidate not found!"})
        }
        console.log("Candidate Data Updated")
        res.status(200).json(response);

    }catch(err){
        console.log(err);
         res.status(500).json({error:"Invternal Server Error"});
    }
})


router.delete('/:candidateId', jwtAuthMiddleware, async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)) 
            return res.status(403).json({message:"User has not Admin role"})
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndDelete(candidateId);

        if(!response){
            return res.status(404).json({error:"Candidate not found!"})
        }
        console.log("Candidate Deleted")
        res.status(200).json(response);

    }catch(err){
        console.log(err);
         res.status(500).json({error:"Invternal Server Error"});
    }
})

//--> need to implement the profile picture ( multer)


//lets start voting
router.post('/vote/:candidateId',jwtAuthMiddleware, async (req,res)=>{
//no admin can vote
//user can only vote
candidateId = req.params.candidateId;
userId = req.user.id;

try{
    //Find the Candidate document with the specified candidateId;
    const candidate = await Candidate.findById(candidateId);
    if(!candidate){
        return res.status(404).json({message:"Candidate not found!"})
    }
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message:"User not found!"})
    }
    if(user.isVoted){
        return res.status(404).json({message:"You have already voted!"})
    }
    if(user.role === 'admin'){
        return res.status(404).json({message:"Admin is not allowed to vote!"})
    }

    //Update the Candidate document to record the vote
    candidate.votes.push({user:userId});
    candidate.voteCount++;
    await candidate.save();

    // update the user document 
    user.isVoted = true;
    await user.save();

    res.status(200).json({message:"Vote recorded Successfully"});
}catch(err){
    console.log(err);
    res.status(500).json({error:"Invternal Server Error"});
}
})

//voteCount 

router.get('/vote/count', async (req,res)=>{
    try{
        //Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount:'desc'});

        //Map the candidate to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }
        })
        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Invternal Server Error"});
    }
})

//list of Candidate
router.get('/candidate', async(req,res)=>{
    try{
        //list of candidates
        const candidate = await Candidate.find()
        const candidates = candidate.map((data)=>{
            return {
                name:data.name,
                party:data.party,
            }
        })
        return res.status(200).json(candidates);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Invternal Server Error"});
    }
})
module.exports = router;