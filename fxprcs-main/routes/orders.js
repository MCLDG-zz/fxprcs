var express = require('express');
var router = express.Router();
var soap = require('soap');
var kafka = require('kafka-node'),
     Producer = kafka.Producer,
     client = new kafka.Client('104.155.239.44:2181'),
     producer = new Producer(client);

/* GET order data */
router.get('/order', function(req, res) {
    var db = req.db;
    var collection = db.get('userorders');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});

/* GET pending order data */
router.get('/pendingorder', function(req, res) {
    var db = req.db;
    var collection = db.get('pendingorders');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});

/*
 * POST to userorder.
 */
router.post('/addorder', function(req, res) {
    var db = req.db;
    var collection = db.get('userorders');

    //publish to kafka
    kafka_payload = [
        { topic: 'fxorder', messages: req.body, partition: 0 },
    ];
    producer.send(kafka_payload, function(err, data){
      console.log(data)
    });

    collection.insert(req.body, function(err, result) {
        if (err) return;
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
    });
});

/*
 * POST to pendingorder.
 */
router.post('/addpendingorder', function(req, res) {
    var db = req.db;
    var collection = db.get('pendingorders');
    collection.insert(req.body, function(err, result) {
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
    });
});

/*
 * Delete pendingorder.
 */
router.post('/delpendingorder', function(req, res) {
    var db = req.db;
    var collection = db.get('pendingorders');
    collection.remove({
        _id: req.body._id
    }, function(err, result) {
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
    });
});

module.exports = router;
