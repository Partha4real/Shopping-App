const express = require('express');
const Category = require('../models/category');
const {isAdmin} = require('../config/auth');
const router = express.Router();


//@desc     category index
//@route    GEt /admin/pages
//@access   PRIVATE
router.get('/', isAdmin, async(req, res) => {
    try {
        let category = await Category.find();
        res.render('admin/categories', {
            Categories: category
        }) 
    } catch (err) {
        console.error(err);
    }   
});

//@desc     add category
//@route    GET /admin/categories/add-category
//@access   PRIVATE
router.get('/add-category', isAdmin, (req, res) => {
    const title = "";
    res.render('admin/add_category', {
        title: title,
    });
});

//@desc     add category
//@route    POST /admin/categories/add-category
//@access   PUBLIC
router.post('/add-category', async(req, res) => {
    const {title} = req.body;
    let errors =[];
    // check required fields
    if (!title) {
        errors.push({msg: 'Title Required'})
    }
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    if(errors.length >0)  {
        res.render('admin/add_category', {
            errors,
            title
        })
    } else {
        try {
            let category = await Category.findOne({slug: slug});
            if (category) {
                errors.push({msg: 'Category title exist, Choose another!'})
                res.render('admin/add_category', {
                    errors,
                    title
                })
            } else {
                const newCategory = new Category({
                    title,
                    slug
                });
                try {
                    newCategory.save();

                    Category.find((err, category) => {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.category = category;
                        }
                    });

                    req.flash('success_msg', 'Category Added');
                    res.redirect('/admin/categories');
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
});


//@desc     edit category
//@route    GET /admin/categories/edit-category/:id
//@access   PRIVATE
router.get('/edit-category/:id', isAdmin, async(req, res) => {
    console.log(req.params.id)
    try {
        let category = await Category.findById(req.params.id)
        
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    } catch (err) {
        console.error(err);
    }
    
});

//@desc     edit category
//@route    POST /admin/categories/edit-category/:id
//@access   PUBLIC
router.post('/edit-category/:id', async(req, res) => {
    const {title} = req.body;
    const id = req.params.id
    let errors =[];
    // check required fields
    if (!title) {
        errors.push({msg: 'Title Required'})
    }
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") {slug = title.replace(/\s+/g, '-').toLowerCase();}

    if(errors.length >0)  {
        res.render('admin/edit_page', {
            errors,
            title,
            id
        })
    } else {
        try {
            let category = await Category.findOne({slug: slug, _id: {'$ne':id}});  //ne  means not equal
            if (category) {
                errors.push({msg: 'Category title exists, Choose another!'})
                res.render('admin/edit_category', {
                    errors,
                    title,
                    id
                })
            } else {
                try {
                    category = await Category.findById(id)
                    category.title = title;
                    category.slug = slug;
                    try {
                        category.save();

                        Category.find((err, category) => {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.category = category;
                            }
                        });

                        req.flash('success_msg', 'Category Edited');
                        //res.redirect('/admin/categories');
                        res.redirect('admin/categories/edit-category/'+id);
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

//@desc     delete category
//@route    GET /admin/categories/delete-page/:id
//@access   PRIVATE
router.get('/delete-category/:id', isAdmin, async(req, res) => {
    try {
        let category = await Category.findByIdAndRemove(req.params.id);

        Category.find((err, category) => {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.category = category;
            }
        });

        req.flash('success_msg', 'Category Deleted');
        res.redirect('/admin/categories/');
    } catch (err) {
        console.error(err);
    }
    
});

module.exports = router;