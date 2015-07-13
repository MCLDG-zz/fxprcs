var express = require('express');
var router = express.Router();

/* GET balance data */
router.get('/balance', function(req, res) {
    var db = req.db;
    var collection = db.get('userbalance');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

module.exports = router;