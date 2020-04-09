const express = require('express');
const router = express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

const jwtMiddleware = require('../../middleware/jwtMiddleware');

//Getting token from frontend and verifying user
router.get('/', jwtMiddleware, async (req, res) => {
    try {
        const doc = await User.findById(req.user.id);
        const { name, email, avatar, date } = doc;
        const user = { name, email, avatar, date };
        res.json({ user });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

//Login Route
router.post('/', [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').exists()],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { email, password } = req.body;
            //check if user already exists
            let user = await User.findOne({ email: email });
            if (!user) {
               return  res.status(400).json({
                    errors: [{ msg: 'Invalid Credentials' }]
                });
            }
            
            const isValid=bcrypt.compare(password,user.password);
            if(!isValid){
                return  res.status(400).json({
                    errors: [{ msg: 'Invalid Credentials' }]
                });
            }

            //return jwt token
            const payload = {
                user: {
                    id: user.id
                }
            };
            jwt.sign(payload,
                config.get('jwtSecret'),
                { expiresIn: '1h' },
                (err, token) => {
                    if (err)
                        throw err;
                    res.json({ token });
                });
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server error');
        }
    });



module.exports = router;