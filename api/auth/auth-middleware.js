const jwt = require('jsonwebtoken');
const secrets = require('../../config/secrets');

module.exports = (req,res,next) =>{
    console.log(req.headers)
    const [directive, token] = req.headers.authorization.split(' ');
    if(!directive || directive !== 'bearer'){
        res.status(401).json({error:"with directive in auth middleware"})
    }

    if(token){
        jwt.verify(token, secrets.jwtSecret, (err, decodedToken)=>{
            if(err){
                res.status(401).json({message:"You shall not pass!", reason:err.message})
            }else{
        req.decodedJwt = decodedToken;
        console.log(decodedToken);
        next();
    }
        })
    }else{
        res.status(401).json({message:"no token found"})
    }
};