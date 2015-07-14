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

/* Update balance */
router.post('/updatebalance', function(req, res) {
    var db = req.db;
    var collection = db.get('userbalance');
    collection.findAndModify(req.body._id, { $set: { cashbalance : '55'}}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});    

/* GET watchlist data */
router.get('/watchlist', function(req, res) {
    var db = req.db;
    var collection = db.get('userwatchlist');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/* GET notification data */
router.get('/notification', function(req, res) {
    var db = req.db;
    var collection = db.get('usernotifications');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * POST to notifications.
 */
router.post('/addnotification', function(req, res) {
    var db = req.db;
    var collection = db.get('usernotifications');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;
module.exports = router;