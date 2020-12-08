const express = require('express');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session'); 
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const connectDB = require('./config/db');

// express init
const app = express();

// config
dotenv.config({path: './config/config.env'});

// connect DB
connectDB();

// body-parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// express-session
app.use(session({
    name: 'Shopping Cart',
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    expires: new Date(Date.now() + (30 * 86400 * 1000)),
    //cookie: {secure: true},   //not requires
    store: new MongoStore( {
        mongooseConnection: mongoose.connection,
        autoRemove:'disabled'
    },
    (err)=>{
        console.log(err || 'Connected To MongoStore');
    })
}));



// connect flash
app.use(flash());

// global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


// get page model
const Page = require('./models/page');

// get all pages to pass to header.ejs
Page.find().sort({sorting: 1}).exec((err, page) => {
    if (err) {
        console.log(err);
    } else {
        app.locals.page = page;
    }
});

// get category model
const Category = require('./models/category');

// get all categories to pass to header.ejs
Category.find((err, category) => {
    if (err) {
        console.log(err);
    } else {
        app.locals.category = category;
    }
});

// passport config
require('./config/passport')(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// session cart whis is a array that holds objects(products) ** to make it available in each GET request
app.get('*', (req, res, next) => {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;  // if the user is logged in we have access to user or NULL
    next();
})

// morgan
app.use(morgan('dev'));

// public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Layout
//app.use(expressLayout);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('layout_register', 'layout_login');

// routes
app.use('/', require('./routes/pages'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/user', require('./routes/user'));
app.use('/admin/pages', require('./routes/admin_pages'));
app.use('/admin/categories', require('./routes/admin_categories'));
app.use('/admin/products', require('./routes/admin_products'));

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server Running At ' +PORT));



