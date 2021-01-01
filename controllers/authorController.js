const Author = require('../models/author');
const Book = require('../models/book');
const async = require('async');
const {body, validationResult } = require('express-validator')

// Display list of all Authors
exports.author_list = (req, res, next) => {

    Author.find().sort([['family_name', 'ascending']]).exec(function (err, list_authors) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('author_list', { title: 'Author List', author_list: list_authors})
    })

};

// Display detail page for a specidic Aythor.

// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
              .exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });

};


// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form', { title: 'Create Author'})
};

// Handle Author create on POST.
exports.author_create_post = [
    // Validate and  santise fields
    body('first_name').trim().isLength({ min: 1}).escape().withMessage('First name must be specified.').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'), body('family_name').trim().isLength({ min: 1}).escape().withMessage('Family name must be specifed').isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'), body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitizarion
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if there are errors
        if (!errors.isEmpty()) {
            // render form again
            res.render('author_form', {title: 'Create Author', author: req.body, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid

            // Create an author object

            const author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                }
            );

            author.save(function(err) {
                if (err) { return next(err) }
                // Successful = redirect to new author

                res.redirect(author.url)
            })
        }
    }
]

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id}).exec(callback)
        }
    },
        function(err, results) {
            if (err) {return next(err)}
            if (results.author===null){
                // No author available
                res.redirect('/catalog/authors')
            }
            // Successful
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books:results.authors_books})
        } 
    
    )

};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({'author': req.body.authorid}).exec(callback)
        },
    },
    function(err, results) {
        if (err) {return next(err)};

        if (results.authors_books.length > 0) {
            // this means authors do have books
            // cannot delete
            // render same way as GET 
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books});
            return;
        }

        else {
            // Author has no books and free to delete
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err) }

                res.redirect('/catalog/authors')
            })
        }
    }
    )
};

// Display Author update form on GET.
exports.author_update_get = function(req, res, next) {

    Author.findById(req.params.id, function(err, author) {
        if (err) {return next(err)}
        if (author===null) {
            let err = new Error('Author not found');
            err.status = 404;
            return next(err)
        }

        res.render('author_form', {title: 'Update author'})
    })

};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    body('first_name').trim().isLength({ min: 1}).escape().withMessage('First name must be specified.').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'), body('family_name').trim().isLength({ min: 1}).escape().withMessage('Family name must be specifed').isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'), body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitizarion
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // if there are errors
        if (!errors.isEmpty()) {
            // render form again
            res.render('author_form', {title: 'Create Author', author: req.body, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid

            // Create an author object

            const author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death,
                    _id: req.params.id
                }
            );

            Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
                if (err) {return next(err)}
                res.redirect(theauthor.url)
            })
        }
    }
};