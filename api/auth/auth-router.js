const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = require('../../config/secrets');

const Users = require('../users/users-model');
const {isValid} = require('../users/user-service');

router.post('/register', (req,res)=>{
    const creds = req.body;
    
    if(isValid(creds)){
        const rounds = process.env.BCRYPT_ROUNDS || 8;
        const hash = bcrypt.hashSync(creds.password, rounds)
        creds.password = hash;

        Users.add(creds)
        .then(user =>{
            res.status(201).json({data:user})
        })
        .catch(err =>{
            res.status(500).json({message:"error in adding new user to database", reason:err.message})
        })
    }else{
        res.status(400).json({mesasge:"please provide a valid username and password to register"})
    }
})

router.post('/login', (req,res)=>{
    const {username, password }= req.body;
    if(isValid(req.body)){
        console.log(req.body)
        Users.findBy({username:username})
        .then(([user])=>{
            if(user && bcrypt.compareSync(password, user.password)){
                const token = generateToken(user);
                res.status(200).json({
                    message:`welcome ${user.username}`,
                    token
                })
            }else{
                res.status(401).json({message:"invalid credentials, YOU SHALL NOT PASS"})
            }
        })
        .catch(err =>{
            res.status(500).json({message:"error in logging into server", reason:err})
        })
    }else{
        res.status(400).json({message:"please provide a valid username and password"})
    }
})

function generateToken(user){
    const payload = {
        subject: user.id,
        username: user.username,
        department: user.department
    };
    const options = {
        expiresIn:'2h'
    };
    return jwt.sign(payload, secret.jwtSecret, options)
}
module.exports = router;