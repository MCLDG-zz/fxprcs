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

/* GET order data */
router.get('/pendingorder', function(req, res) {
    var db = req.db;
    var collection = db.get('pendingorders');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * POST to userorder.
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

/*
 * POST to pendingorder.
 */
router.post('/addpendingorder', function(req, res) {
    var db = req.db;
    var collection = db.get('pendingorders');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * Delete pendingorder.
 */
router.post('/delpendingorder', function(req, res) {
    var db = req.db;
    var collection = db.get('pendingorders');
    collection.remove({_id: req.body._id}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;