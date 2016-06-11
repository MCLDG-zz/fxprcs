var http = require('http');
var express = require('express');
var router = express.Router();

/* GET balance data */
router.get('/balance', function(req, res) {
    var db = req.db;
    var collection = db.get('userbalance');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
    console.log("getting balance: ");
    res.json('{"_id":"5757a5f7a0649ce3d54585c9","username":"Server","cashbalance":10000,"assetvalue":0,"netunsettled":0}');
    var req = http.get({
                host: '159.122.251.69',
                port: 3001,
                path: '/balance'
        }, function(response) {
                response.setEncoding('utf8');
                var data = "";

                response.on('data', function(chunk) {
                        data += chunk;
                });

                response.on('error', function(error) {
                        console.log("Response error on http get balance" + error);
                });

                response.on('end', function() {
                        if (data.length > 0) {
                                try {
                                        var data_object = JSON.parse(data.substring(3));
                                }
                                catch (e) {
                                        return;
                                }
				console.log("balance: " + data_object);
                                res.json(data_object);
                        }
                });
        });
        req.on('error', function(e) {
                console.log("HTTP get request error retrieving balance: " + e);
        });
});

module.exports = router;
