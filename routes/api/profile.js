const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const jwtMiddleware = require('../../middleware/jwtMiddleware');

//Create/Update Profile
router.post('/', [jwtMiddleware, [
    check('status', 'Status Is Required').not().isEmpty(),
    check('skills', 'Skills Are Required').not().isEmpty()
]], async (req, res) => {
    try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
    }

    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
        profileFields.githubusername = req.body.githubusername;
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',').map(skill => skill.trim());
    }
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    
        let profile = await Profile.findOne({ user: req.user.id });
        //Update if profile already present
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true });   //returns updated doc instead of old one(default)

            return res.json({ profile });
        } else {
            profile = new Profile(profileFields);
            await profile.save();
            res.json({ profile });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }

});
//Get user Profile
router.get('/me', jwtMiddleware, async (req, res) => {
    try {
        const doc = Profile.findById(req.user.id).populate('users', ['name', 'avatar']);
        if (!doc) {
            res.status(400).json({ msg: 'Profile Not found' });
        }
        res.json({ doc });
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});



module.exports = router;