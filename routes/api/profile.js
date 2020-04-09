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
    try {
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
        // console.log(req.user.id);
        const doc = await Profile.findOne({ user: req.user.id }).populate('users', ['name', 'avatar']);
        // console.log(doc);
        if (!doc) {
            res.status(400).json({ msg: 'Profile Not found' });
        }
        res.json({ doc });
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});

//Get all profiles
router.get('/', async (req, res) => {
    try {
        let profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json({ profiles });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//Get a profile by userId
router.get('/user/:userId', async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.params.userId }).populate('user', ['name', 'avatar']);
        if (!profile) {
            res.status(400).json({ msg: 'User Profile does not exist' });
        }
        res.json({ profiles });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//Delete a profile,user,and posts
router.delete('/', jwtMiddleware, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id });

        await User.findByIdAndRemove({ _id: req.user.id });

        res.json({ msg: 'User Removed Successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//Adding profile Experience
router.post('/experience',
    [jwtMiddleware,
        [check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From is required').not().isEmpty()
        ]], async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
            }
            const {
                title,
                company,
                location,
                from,
                to,
                current,
                description
            } = req.body;
            const exp = {
                title,
                company,
                location,
                from,
                to,
                current,
                description
            };
            try {
                const profile = await Profile.findOne({ user: req.user.id });
                profile.experience.push(exp);
                await profile.save();
                res.json({ profile });
            } catch (err) {
                console.error(err.message);
                res.status(500).json({ msg: 'Server Error' });
            }
        });

//Remove an experience
router.delete('/experience/:exp_id', jwtMiddleware, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        var idx = profile.experience.findIndex(exp => exp._id === req.params.exp_id);

        profile.experience.splice(idx, 1);

        await profile.save();

        res.json({ profile });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

//Add Education
router.post('/education',
    [jwtMiddleware,
        [check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('from', 'From is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty()
        ]], async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
            }
            
            const {
                school,
                degree,
                fieldofstudy,
                from,
                to,
                current,
                description
            } = req.body;
            
            const edu = {
                school,
                degree,
                fieldofstudy,
                from,
                to,
                current,
                description
            };
            try {
                const profile = await Profile.findOne({ user: req.user.id });
                profile.education.push(edu);
                await profile.save();
                res.json({ profile });
            } catch (err) {
                console.error(err.message);
                res.status(500).json({ msg: 'Server Error' });
            }
        });

//Remove an education
router.delete('/education/:edu_id', jwtMiddleware, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        var idx = profile.education.findIndex(edu => edu._id === req.params.edu_id);

        profile.education.splice(idx, 1);

        await profile.save();

        res.json({ profile });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});
module.exports = router;