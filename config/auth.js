exports.isUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('error_msg', 'Please login!')
        res.redirect('/user/login');
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && res.locals.user.admin == 1) {
        next();
    } else {
        req.flash('error_msg', 'Please login as admin!')
        res.redirect('/user/login');
    }
}