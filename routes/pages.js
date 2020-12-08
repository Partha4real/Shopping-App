const express = require('express');
const Page = require('../models/page')
const router = express.Router();


//@desc     Home page
//@route    GET /
//@access   PUBLIC
router.get('/', async(req, res) => {
    try {
        let page = await Page.findOne({slug: 'home'});
            res.render('index', {
                title: page.title,
                content: page.content
            });
    } catch (err) {
        console.error(err)
    }
})

//@desc     website page page
//@route    GET /:slug
//@access   PUBLIC
router.get('/:slug', async(req, res) => {
    let slug = req.params.slug;
    try {
        let page = await Page.findOne({slug});
        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    } catch (err) {
        console.error(err)
    }
    
})




module.exports = router;