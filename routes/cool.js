var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/cool', function(req, res, next) {
    res.send('show cool page');
    // res.render('cool', { title: 'My Express' })
});

module.exports = router;
