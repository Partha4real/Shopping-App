const express = require('express');
const Product = require('../models/product')
const router = express.Router();
const config = require('../Paytm/config');
const checksum_lib = require('../paytm/checksum');

//@desc     add product to cart
//@route    GET /cart/add/:product
//@access   PUBLIC
router.get('/add/:product', async(req, res) => {
    const slug = req.params.product;
    try {
        let product = await Product.findOne({slug: slug});
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                quantity: 1,
                price: parseFloat(product.price).toFixed(2),
                image: `/uploads/${product.category}/${product.title}/${product.image}`
            });
        } else {
            let cart = req.session.cart;
            let newItem = true;

            for(let i =0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].quantity++;
                    newItem= false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    quantity: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: `/uploads/${product.category}/${product.title}/${product.image}`
                })
            }
        }
        console.log(req.session.cart);
        req.flash('success_msg', 'Product added to cart');
        res.redirect('back');  //redirected to previous request
    } catch (err) {
        console.error(err)
    }
});


//@desc     checkout page
//@route    GET /cart/checkout
//@access   PUBLIC
router.get('/checkout', async(req, res) => {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });    
    }
});

//@desc     update product checkout
//@route    GET /cart/update/:product
//@access   PUBLIC
router.get('/update/:product', async(req, res) => {
    const slug = req.params.product;
    let cart = req.session.cart;
    let action = req.query.action;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].quantity++;
                    break;
                case "remove":
                    cart[i].quantity--;
                    if (cart[i].quantity < 1) cart.splice(i, 1);

                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) delete req.session.cart;
                    break;
                default:
                    console.log('Update problem')
                    break;
            }
            break;
        }
    }
    req.flash('success_msg', 'Cart updated');
    res.redirect('/cart/checkout'); 
});

//@desc     clear cart
//@route    GET /cart/checkout
//@access   PUBLIC
router.get('/clear', async(req, res) => {
    req.flash('success_msg', 'Cart cleared');
    res.redirect('/cart/checkout'); 
});

//@desc     payment
//@route    GET /cart/payment
//@access   PUBLIC
router.get('/payment', async(req, res) => {
    console.log(req.user);
    var paymentDetails = {
        amount: req.query.amount,
        customerId: req.user.username,
        customerEmail: req.user.email,
        customerPhone: '7406167090'
    }
    if(!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
        res.status(400).send('Payment failed')
    } else {
        var params = {};
        params['MID'] = config.PaytmConfig.mid;
        params['WEBSITE'] = config.PaytmConfig.website;
        params['CHANNEL_ID'] = 'WEB';
        params['INDUSTRY_TYPE_ID'] = 'Retail';
        params['ORDER_ID'] = 'TEST_'  + new Date().getTime();
        params['CUST_ID'] = paymentDetails.customerId;
        params['TXN_AMOUNT'] = paymentDetails.amount;
        params['CALLBACK_URL'] = 'http://localhost:5000/callback';
        params['EMAIL'] = paymentDetails.customerEmail;
        //params['MOBILE_NO'] = paymentDetails.customerPhone;
    
    
        checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
            var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
            // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
    
            var form_fields = "";
            for (var x in params) {
                form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
            }
            form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
    
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
            res.end();
        });
    }
});

module.exports = router;