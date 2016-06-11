var http = require('http');
var request = require('request');
var express = require('express');
var router = express.Router();

/* GET balance data */
router.get('/balance', function(req, res) {
//    var db = req.db;
//    var collection = db.get('userbalance');
//    collection.find({}, {}, function(e, docs) {
//        res.json(docs);
//    });
console.log("getting balance: ");
    var req_balance = http.get({
                host: '159.122.251.69',
                port: 3001,
                path: '/balance'
        }, function(response) {
                var data = "";
		console.log("get balance successful: " + response);
                response.on('data', function(chunk) {
			console.log("getting balance part: " + chunk);
                        data += chunk;
                });

                response.on('error', function(error) {
                        console.log("Response error on http get balance" + error);
                });

                response.on('end', function() {
			console.log("getting balance complete: " + data);
                        if (data.length > 0) {
                                try {
                                        var data_object = JSON.parse(data);
                                }
                                catch (e) {
					console.log("getting balance - error: " + e);
                                        return;
                                }
                                console.log("balance: " + data_object);
                                res.json(data_object);
                        }
                });
        });
        req_balance.on('error', function(e) {
                console.log("HTTP get request error retrieving balance: " + e);
        });
});

/* Update balance */
router.post('/updatebalance', function(req, res) {
    console.log("posting balance: ");

  request({
      url: "http://159.122.251.69:3001/balance",
      method: "POST",
      json: true,   // <--Very important!!!
      body: req.body
  }, function (error, response, body){
      console.log(response);
  });
});

/* GET news */
router.get('/news', function(req, res) {
    console.log("getting news ");
    var req_news = http.get({
                host: '159.122.251.69',
                port: 5000,
                path: '/news'
        }, function(response) {
                var data = "";
                console.log("get news successful: " + response);
                response.on('data', function(chunk) {
                        data += chunk;
                });

                response.on('error', function(error) {
                        console.log("Response error on http get news" + error);
                });

                response.on('end', function() {
                        console.log("getting news complete: " + data);
                        if (data.length > 0) {
                                try {
                                        var data_object = JSON.parse(data);
                                }
                                catch (e) {
                                        console.log("getting news - error: " + e);
                                        return;
                                }
                                console.log("news: " + data_object);
                                res.json('[' + data_object + ']');
                        }
                });
        });
        req_balance.on('error', function(e) {
                console.log("HTTP get request error retrieving news: " + e);
        });
});

/* GET watchlist data */
router.get('/watchlist', function(req, res) {
    var db = req.db;
    var collection = db.get('userwatchlist');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});

/*
 * Update watchlist - this is a Mongo update, where we
 * update the entire watchlist document. This can be used
 * for adding or removing watchlist items
 */
router.post('/updatewatchlist', function(req, res) {
    var db = req.db;
    var id = req.body._id;
    var body = req.body;
    delete body._id;

    var collection = db.get('userwatchlist');
    collection.findAndModify({
            "_id": id
        }, {
            "$set": body
        },
        function(err, result) {
            res.send(
                (err === null) ? {
                    msg: ''
                } : {
                    msg: err
                }
            );
        });
});


/* GET notification data */
router.get('/notification', function(req, res) {
    var db = req.db;
    var collection = db.get('usernotifications');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});

/*
 * POST to notifications.
 */
router.post('/addnotification', function(req, res) {
    var db = req.db;
    var collection = db.get('usernotifications');
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
 * Delete notification.
 */
router.post('/delnotification', function(req, res) {
    var db = req.db;
    var collection = db.get('usernotifications');
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
