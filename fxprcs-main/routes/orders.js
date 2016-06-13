var http = require('http');
var express = require('express');
var router = express.Router();
var soap = require('soap');
var request = require('request');
var kafka = require('kafka-node'),
     Producer = kafka.Producer,
     client = new kafka.Client('104.155.239.44:2181'),
     producer = new Producer(client);

/* GET order data */
router.get('/order', function(req, res) {
    console.log("getting orders: ");
    var req_balance = http.get({
                host: 'web-order',
                port: 80,
                path: '/order'
        }, function(response) {
                var data = "";
                console.log("get order successful: " + response);
                response.on('data', function(chunk) {
                        data += chunk;
                });

                response.on('error', function(error) {
                        console.log("Response error on http get order" + error);
                });

                response.on('end', function() {
                        console.log("getting order complete: " + data);
                        if (data.length > 0) {
                                try {
                                        var data_object = JSON.parse(data);
                                }
                                catch (e) {
                                        console.log("getting order - error: " + e);
                                        return;
                                }
                                console.log("order: " + data_object);
                                res.json(data_object);
                        }
                });
        });
        req_balance.on('error', function(e) {
                console.log("HTTP get request error retrieving order: " + e);
        });
});

/* GET pending order data */
router.get('/pendingorder', function(req, res) {
    console.log("getting pending orders: ");
    var req_balance = http.get({
                host: 'web-order',
                port: 80,
                path: '/pendingorder'
        }, function(response) {
                var data = "";
                console.log("get pending order successful: " + response);
                response.on('data', function(chunk) {
                        data += chunk;
                });

                response.on('error', function(error) {
                        console.log("Response error on http get pending order" + error);
                });

                response.on('end', function() {
                        console.log("getting pending order complete: " + data);
                        if (data.length > 0) {
                                try {
                                        var data_object = JSON.parse(data);
                                }
                                catch (e) {
                                        console.log("getting pending order - error: " + e);
                                        return;
                                }
                                console.log("pending order: " + data_object);
                                res.json(data_object);
                        }
                });
        });
        req_balance.on('error', function(e) {
                console.log("HTTP get request error retrieving pending order: " + e);
        });
});
/*
 * POST to userorder.
 */
router.post('/addorder', function(req, res) {
    console.log("posting order: ");

  request({
      url: "http://web-order:80/order",
      method: "POST",
      json: true,   // <--Very important!!!
      body: req.body
  }, function (error, response, body){
      console.log(response);
  });
});

/*
 * POST to pendingorder.
 */
router.post('/addpendingorder', function(req, res) {
    console.log("posting pending order: ");

  request({
      url: "http://web-order:80/pendingorder",
      method: "POST",
      json: true,   // <--Very important!!!
      body: req.body
  }, function (error, response, body){
      console.log(response);
  });
});

/*
 * Delete pendingorder.
 */
router.post('/delpendingorder', function(req, res) {
    console.log("del pending order: ");

  request({
      url: "http://web-order:80/pendingorder",
      method: "DELETE",
      json: true,   // <--Very important!!!
      body: req.body
  }, function (error, response, body){
      console.log(response);
  });
});

module.exports = router;
