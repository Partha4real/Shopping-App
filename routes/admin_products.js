const express = require('express');
const fs = require('fs-extra');
const Product = require('../models/product');
const Category = require('../models/category');
const multer =require('multer');
const {upload} = require('../middleware/multer');
const {uploadGallary} =require('../middleware/gallaryUpload');
const {isAdmin} = require('../config/auth');
const router = express.Router();


//@desc     product index
//@route    GET /admin/pages
//@access   PRIVATE
router.get('/', isAdmin, async(req, res) => {
    let count;
    try {
        let product = await Product.count();
        count = product;
        try {
            let product = await Product.find();
            res.render('admin/products', {
                Products: product,
                Count: count
            })
        } catch (err) {
            console.error(err);
        }  
    } catch (err) {
        console.error(err);
    }   
   
});

//@desc     add product
//@route    GET /admin/products/add-product
//@access   PRIVATE
router.get('/add-product', isAdmin, async(req, res) => {
    const title = "";
    const desc = "";
    const price = "";
    try{
        let category = await Category.find()
        res.render('admin/add_product', {
            title,
            Categories: category,
            desc,
            price
        });
    } catch(err) {
        console.error(err);
    }
});

//@desc     add product
//@route    POST /admin/products/add-product
//@access   PUBLIC
router.post('/add-product', upload.single('image'), async(req, res) => {
    const {title, desc, price, category} = req.body;
    
    // check if image is present or not
    const image = typeof req.file !== "undefined" ? req.file.filename : "";

    let errors =[];

    // check required fields
    if (!title || !desc) {
        errors.push({msg: 'Title and Description Required'})
    }

    // validate price
    // if (isNaN(price) == true || price<0){
    //     errors.push({msg: 'Price should be integer.'})
    // }

    let slug = title.replace(/\s+/g, '-').toLowerCase();

    if(errors.length >0)  {
        try{
            let category = await Category.find()
            res.render('admin/add_product', {
                errors,
                title,
                desc,
                Categories: category,
                price
            });
        } catch(err) {
            console.error(err);
        }
    } else {
        try {
            let product = await Product.findOne({slug: slug});
            if (product) {
                errors.push({msg: 'Product title exists, Choose another!'})
                res.render('admin/add_product', {
                    errors,
                    title,
                    desc,
                    Categories: category,
                    price
                });
            } else { 
                let price2 = parseFloat(price).toFixed(2);
                const newProduct = new Product({
                    title,
                    slug, 
                    desc,
                    price: price2,
                    category: category,
                    image
                });
                try {
                    newProduct.save();
                    req.flash('success_msg', 'Product Added');
                    res.redirect('/admin/products');
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
});



//@desc     edit product
//@route    GET /admin/products/edit-product/:id
//@access   PRIVATE
router.get('/edit-product/:id', isAdmin, async(req, res) => {
    // let error;
    // if(req.session.error) error = req.session.error;
    // req.session.error = null
    try {
        let category = await Category.find()
        try {
            let product = await Product.findById(req.params.id);
            let uploadsGallary = 'public/uploads/'+product.category+'/'+product.title+'/gallery';
            let uploadImages = null;
            fs.readdir(uploadsGallary, (err, files) => {
                if(err) {
                    console.log(err);
                } else {
                    uploadImages = files;
                    console.log(uploadImages);
                    res.render('admin/edit_product', {
                        //error: 'Product title exists, choose another!',
                        title: product.title,
                        desc: product.desc,
                        Categories: category,
                        category: product.category.replace(/\s+/g, '-').toLowerCase(),
                        price: parseFloat(product.price).toFixed(2),
                        image: product.image,
                        uploadImages: uploadImages,
                        id: product._id
                    });
                }

            })
        } catch (err) {
            console.error(err);
            res.redirect('/admin/products');
        }
    } catch (err) {
        console.error(err);
    }
    
});

//@desc     edit product
//@route    POST /admin/products/edit-product/:id
//@access   PUBLIC
router.post('/edit-product/:id', upload.single('image'), async(req, res) => {
    const {title, desc, price, category, pimage} = req.body;
    const id = req.params.id;
    // check if image is present or not
    const image = typeof req.file !== "undefined" ? req.file.filename : "";

    let errors =[];

    // check required fields
    if (!title || !desc) {
        errors.push({msg: 'Title and Description Required'})
    }

    // validate price
    // if (isNaN(price) == true || price<0){
    //     errors.push({msg: 'Price should be integer.'})
    // }

    let slug = title.replace(/\s+/g, '-').toLowerCase();

    if(errors.length >0)  {
        // req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' +id, {
            errors,
        });
    } else {
        try {
            let product = await Product.findOne({slug: slug, _id: {'$ne':id}});
            if (product)  {
                errors.push({msg: 'Title exists, choose another!'});
                res.redirect('/admin/products/edit-product/' +id);
            } else {
                try {
                    let product = await Product.findById(id);
                    product.title = title;
                    product.slug = slug;
                    product.desc = desc;
                    product.price = parseFloat(price).toFixed(2);
                    product.category = category;
                    if (image != ""){
                        product.image = image;
                    }
                   
                    try {
                        product.save();
                        if (image != "") {
                            if (pimage != "") {
                                fs.remove('public/uploads/'+category+'/'+title+'/'+pimage, (err) => {
                                    if (err) console.log(err)
                                })
                            }
                        }
                        req.flash('success_msg', 'Product Edited');
                        res.redirect('/admin/products/edit-product/' +id);
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

//@desc     product image from gallery (upload gallary image)
//@route    POST /admin/products/product-gallery/:category/:title
//@access   PUBLIC
router.post('/product-gallery/:category/:title',  uploadGallary.array('file'), async(req, res) => {   
    res.sendStatus(200);
   
});

//@desc     delete galary image
//@route    GET /admin/products/delete-image/:category/:title/:image
//@access   PRIVATE
router.get('/delete-image/:category/:title/:image', isAdmin, async(req, res) => {
    const {category, title, image} = req.params;
    const gallery = `./public/uploads/${category}/${title}/gallery/${image}`;
    const thumbs = `./public/uploads/${category}/${title}/thumbs/${image}`;
    console.log(req.query.id)
    fs.remove(gallery, (err) => {
        if (err) {
            console.log(err);
        } 
        else {
            //delete this when thumbs is done
            req.flash('success_msg', 'Imade Deleted');
            res.redirect('/admin/products/edit-product/' +req.query.id);

        }
    })
    
});

//@desc     delete product
//@route    GET /admin/products/delete-product/:id
//@access   PRIVATE
router.get('/delete-product/:id', isAdmin, async(req, res) => {
    const{category, title} = req.query;
    const id = req.params.id
    console.log(category, title, id);
    const path = `./public/uploads/${category}/${title}`;
    try {
        fs.remove(path);
        try {
            let product = await Product.findByIdAndRemove(id);
            req.flash('success_msg', 'Product Deleted');
        
            res.redirect('/admin/products/');
        } catch (err) {
            console.error(err);
        }
    } catch (err) {
        console.error(err)
    }
});

module.exports = router;
