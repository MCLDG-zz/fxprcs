var express = require('express');
var router = express.Router();

/* GET order data */
router.get('/order', function(req, res) {
    var db = req.db;
    var collection = db.get('userorders');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * POST to addorder.
 */
router.post('/addorder', function(req, res) {
    var db = req.db;
    var collection = db.get('userorders');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;