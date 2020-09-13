const jwt=require('jsonwebtoken');
const config=require('config');
const jwtOpr ={
    
    generateToken(userId){
    var token=jwt.sign({userId},
        config.get('jwtSecret'),
        {expiresIn:'1h'});
        return token;
    },
    verifyToken(token){
        var decodedToken=jwt.verify(token,config.get('jwtSecret'));
        
    }
}

module.exports=jwtOpr;