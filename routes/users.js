var express = require('express');
var router = express.Router();

/* GET balance data */
router.get('/balance', function(req, res) {
    var db = req.db;
    var collection = db.get('userbalance');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});

/* Update balance */
router.post('/updatebalance', function(req, res) {
    var db = req.db;
    var id = req.body._id;
    var body = req.body;
    delete body._id;

    var collection = db.get('userbalance');
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

/*
 * Get weather data. I used this for testing that nodejs could access an XML web service
 */
router.get('/getweather', function(req, res) {
    var soap = require('soap');
    var url = 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?wsdl';
    var args = {
        ZIP: req.query.ZIP
    };

    soap.createClient(url, function(err, client) {
        client.GetCityWeatherByZIP(args, function(err, result) {
            console.log("GetCityWeather args are: " + args);
            console.log("GetCityWeather err is: " + err);
            console.log(result);
            var response = {
                city: result.GetCityWeatherByZIPResult.City,
                state: result.GetCityWeatherByZIPResult.State,
                temp: result.GetCityWeatherByZIPResult.Temperature
            };
            res.send(result);
            res.end();
        });
    });
});

/*
 * Quantum Web Services
 *
 * Data is sent/retrieve from Quantum using SOAP web services. I use the node-soap
 * package to handle the calling of a SOAP web service and the translation of
 * JSON-<XML.
 *
 * See https://github.com/vpulim/node-soap for details
 */
 
/*
 * Get Quantum dealset number
 */
router.get('/getQTDealset', function(req, res) {
    var soap = require('soap');
    var url = 'http://223.197.29.89/TestWebService1/Service1.asmx?wsdl';
    var args = {};

    soap.createClient(url, function(err, client) {
        client.GetDealSetNo(null, function(err, result) {
            res.send(result);
            res.end();
        });
    });
});

/*
 * Use a GET to send FX data to Quantum - this is used to test QT is working
 */
router.get('/postQTFXDeal', function(req, res) {
    var soap = require('soap');
    var url = 'http://223.197.29.89/TestWebService1/Service1.asmx?wsdl';
    //var args = {ZIP: req.query.ZIP};
    var args = {
        "DM2FXDealID": "300000001",
        "DealInstrument": "FX Spot",
        "DM2CptyID": "80000003",
        "BUnitName": "Sydney Cash Unit",
        "MaturityDate": "2015-07-29T09:30:10",
        "DealDate": "2015-07-29T09:30:10",
        "ValueDate": "2015-07-29T09:30:10",
        "Created": "2015-07-29T09:30:10",
        "ExternalDealSetID": "590478",
        "BuyCurr": "AUD",
        "SellCurr": "NZD",
        "BuyAmount": 100,
        "SellAmount": 110,
        "ContractRate": 1.9,
        "SpotRate": 1.8,
        "ForwardPoints": 0,
        "DealerName": "Jakco Huang"
    };

    console.log("postQTFXDeal args are: " + args);

    soap.createClient(url, function(err, client) {
        client.CreateFXDeal(args, function(err, result) {
            res.send(result);
            res.end();
        });
    });
});

/*
 * Post FX data to Quantum
 */
router.post('/postQTFXDeal', function(req, res) {
    var soap = require('soap');
    var url = 'http://223.197.29.89/TestWebService1/Service1.asmx?wsdl';

    soap.createClient(url, function(err, client) {
        client.CreateFXDeal(req.body, function(err, result) {
            res.send(result);
            res.end();
        });
    });
});

module.exports = router;