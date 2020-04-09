const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcryptjs = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
// const jwtOpr = require('../../middleware/jwt');

//Registration route
router.post('/', [check('name', 'Name is Required').not().isEmpty(),
check('email', 'Please include a valid email').isEmail(),
check('password', 'Minimum password length is 6').isLength({ min: 6 })],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { name, email, password } = req.body;
            //check if user already exists
            let user = await User.findOne({ email: email });
            if (user) {
                res.status(400).json({
                    errors: [{ msg: 'User already exists' }]
                });
            }
            //get gravatar url
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });
            user = new User({
                name,
                email,
                avatar,
                password
            });

            //encrypt pass
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(password, salt);
            await user.save();
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