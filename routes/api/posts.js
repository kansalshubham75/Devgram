const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
//Create a post
router.post('/', [jwtMiddleware, [
    check('text', 'Text is Required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }
    try {
        const user = await User.findById(req.user.id);
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newPost.save();

        res.json({ post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

//Get all Posts
router.get('/', jwtMiddleware, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

//Get post by id
router.get('/:id', jwtMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post Not Found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

//Delete a post
router.delete('/:id', jwtMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.json({ msg: 'Post not found' });
        }
        //check if post is of the user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        await post.remove();
        res.json({ msg: 'Post Removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

//Updating Likes
router.put('/like/:id', jwtMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //check if post already liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post already Liked' });
        }
        post.likes.push({ user: req.user.id });
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

//Unlike a post
router.put('/unlike/:id', jwtMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //check if post already liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post not been Liked' });
        }
        const removeIdx = post.likes.findIndex(like => like.user === req.user.id);
        post.likes.splice(removeIdx, 1);
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

//Add a comment
router.post('/comment/:id', [jwtMiddleware, [
    check('text', 'Text is Required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }
    try {
        const user = await User.findById(req.user.id);
        const post = await Post.findById(req.params.id);
        const newComm = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.push(newComm);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

//Delete a comment
router.delete('/comment/:id/:comment_id', jwtMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const post = await Post.findById(req.params.id);
        // console.log(req.params.comment_id);
        if (!post) {
            return res.status(404).json({ msg: 'Post does not exist' });
        }
        const commentIdx = post.comments.findIndex(comment => comment._id === req.params.comment_id);
        if (commentIdx === -1) {
            return res.status(404).json({ msg: 'Comment not found' });
        }
        const comment = post.comments[commentIdx];
        if (comment.user.toString() !== req.user.id) {
            return res.status(400).json({ msg: 'Not authorized' });
        }
        post.comments.splice(commentIdx, 1);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});
module.exports = router;