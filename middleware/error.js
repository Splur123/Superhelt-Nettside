// Middleware for handling validation errors
exports.validationErrorHandler = (req, res, next) => {
    // Check for validation errors (used with express-validator)
    const errors = req.validationErrors();
    
    if (errors) {
        req.flash('error_msg', errors.map(err => err.msg));
        return res.redirect('back');
    }
    
    next();
};

// Middleware for handling 404 errors
exports.notFoundHandler = (req, res, next) => {
    const error = new Error('Siden ble ikke funnet');
    error.status = 404;
    next(error);
};

// Middleware for handling all other errors
exports.errorHandler = (err, req, res, next) => {
    res.status(err.status || 500);
    res.render('pages/error', {
        title: 'En feil har oppstått',
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};
