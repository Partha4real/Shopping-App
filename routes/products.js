const express = require('express');
const fs = require('fs-extra');
const Product = require('../models/product');
const Category = require('../models/category');
const router = express.Router();


//@desc     all products
//@route    GET /products/all-products
//@access   PUBLIC
router.get('/all-products', async(req, res) => {
    try {
        let product = await Product.find();
        res.render('all_products', {
            title: 'All Products',
            product: product
        });
    } catch (err) {
        console.error(err)
    }
})

//@desc     products by category 
//@route    GET /products/:category
//@access   PUBLIC
router.get('/:category', async(req, res) => {
    const slug = req.params.category;
    try {
        let category = await Category.findOne({slug});
        try {
            let product = await Product.find({category: slug});
            console.log(product)
                res.render('category_products', {
                    title: category.title,
                    product: product
                });
        } catch (err) {
            console.error(err)
        }
    } catch (err) {
        console.error(err)
    }
})

//@desc     products details 
//@route    GET /products/:category/:product
//@access   PUBLIC
router.get('/:category/:product', async(req, res) => {
    let galleryImage = null;
    let loggedIn = (req.isAuthenticated()) ? true : false;
    try {
        let product = await Product.findOne({slug: req.params.product});
        let galleryPath = 'public/uploads/'+product.category+'/'+product.title+'/gallery'
        fs.readdir(galleryPath, (err, files) => {
            if (err) {
                console.log(err)
            } else {
                galleryImage = files;
                res.render('product_details', {
                    title: product.title,
                    product: product,
                    galleryImage: galleryImage,
                    loggedIn: loggedIn
                });
            }
        })
    } catch (err) {
        console.error(err)
    }
})














module.exports = router;