const express = require('express');
const Page = require('../models/page');
const {isAdmin} = require('../config/auth');
const router = express.Router();


//@desc     pages index
//@route    GET /admin/pages
//@access   PRIVATE
router.get('/', isAdmin, async(req, res) => {
    try {
        let page = await Page.find().sort({sorting: 1});
        res.render('admin/pages', {
            Pages: page
        });
    } catch (err) {
        console.error(err);
    }    
});

//@desc     add page
//@route    GET /admin/pages/add-page
//@access   PRIVATE
router.get('/add-page', isAdmin, (req, res) => {
    const title = "";
    const slug = "";
    const content = "";
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

//@desc     add page
//@route    POST /admin/pages/add-page
//@access   PUBLIC
router.post('/add-page', async(req, res) => {
    const {title, content} = req.body;
    let errors =[];
    // check required fields
    if (!title || !content) {
        errors.push({msg: 'Title and Content Required'})
    }
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") {slug = title.replace(/\s+/g, '-').toLowerCase();}

    if(errors.length >0)  {
        res.render('admin/add_page', {
            errors,
            title,
            slug, 
            content
        })
    } else {
        try {
            let page = await Page.findOne({slug: slug});
            if (page) {
                errors.push({msg: 'Page slug exists, Choose another!'})
                res.render('admin/add_page', {
                    errors,
                    title,
                    slug, 
                    content
                })
            } else {
                const newPage = new Page({
                    title,
                    slug, 
                    content,
                    sorting: 100
                });
                try {
                    newPage.save();
                    Page.find().sort({sorting: 1}).exec((err, page) => {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.page = page;
                        }
                    });
                    req.flash('success_msg', 'Page Added');
                    res.redirect('/admin/pages');
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
});

// sort pages function
async function sortPages(ids, callback) {
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        const id = ids [i];
        count++;

        try {
            let page = await Page.findById(id)
            page.sorting = count;
            ++count;
            if (count>= ids.length) {
                callback();
            }
            try {
                page.save();
            } catch (err) {
                console.error(err);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
//@desc     REORDER PAGES
//@route    POST /admin/pages/reorder-page
//@access   PUBLIC
router.post('/reorder-page', (req, res) => {
    //console.log(req.body);
    let ids = req.body['id[]'];

    sortPages(ids, () => {
        Page.find().sort({sorting: 1}).exec((err, page) => {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.page = page;
            }
        });
    })
});

//@desc     edit page
//@route    GET /admin/pages/edit-page/:id
//@access   PRIVATE
router.get('/edit-page/:id', isAdmin, async(req, res) => {
    try {
        let page = await Page.findById(req.params.id)
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    } catch (err) {
        console.error(err);
    }
    
});

//@desc     edit page
//@route    POST /admin/pages/edit-page/:id
//@access   PUBLIC
router.post('/edit-page/:id', async(req, res) => {
    const {title, content} = req.body;
    const id = req.params.id;
    let errors =[];
    // check required fields
    if (!title || !content) {
        errors.push({msg: 'Title and Content Required'})
    }
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") {slug = title.replace(/\s+/g, '-').toLowerCase();}

    if(errors.length >0)  {
        res.render('admin/edit_page', {
            errors,
            title,
            slug, 
            content,
            id
        })
    } else {
        try {
            let page = await Page.findOne({slug: slug, _id: {'$ne':id}});  //ne  means not equal
            if (page) {
                errors.push({msg: 'Page slug exists, Choose another!'})
                res.render('admin/edit_page', {
                    errors,
                    title,
                    slug, 
                    content,
                    id
                })
            } else {
                try {
                    page = await Page.findById(id)
                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    try {
                        page.save();
                        Page.find().sort({sorting: 1}).exec((err, page) => {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.page = page;
                            }
                        });
                        req.flash('success_msg', 'Page Edited');
                        res.redirect('/admin/pages');
                        //res.redirect('admin/pages/edit-page/'+id);
                    } catch (err) {
                        console.error(err);
                    }
                } catch (err) {
                    console.error(err);
                }
                
            }
        } catch (err) {
            console.error(err);
        }
    }
});

//@desc     delete page
//@route    GET /admin/pages/delete-page/:id
//@access   PRIVATE
router.get('/delete-page/:id', isAdmin, async(req, res) => {
    try {
        let page = await Page.findByIdAndRemove(req.params.id);
        Page.find().sort({sorting: 1}).exec((err, page) => {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.page = page;
            }
        });
        req.flash('success_msg', 'Page Deleted');
        res.redirect('/admin/pages/');
    } catch (err) {
        console.error(err);
    }
    
});

module.exports = router;