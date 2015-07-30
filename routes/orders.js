var express = require('express');
var router = express.Router();

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

/* GET quantum order data */
router.get('/quantumorder', function(req, res) {
    var db = req.db;
    var collection = db.get('quantumorders');
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
    collection.insert(req.body, function(err, result) {
        if (err) return;
        addOrderToQuantum(req.body, db, result._id.toHexString());
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
 * Get Quantum dealset number
 */
function getQTDealset() {
    var soap = require('soap');
    var url = 'http://223.197.29.89/TestWebService1/Service1.asmx?wsdl';

    soap.createClient(url, function(err, client) {
        client.GetDealSetNo(null, function(err, result) {
            if (err)
                return;
            else
                return result;
        });
    });
}

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
        "BuyCurr": "EUR",
        "SellCurr": "ZAR",
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

    //Post the quantum record to our FX DB also
    var db = req.db;
    var collection = db.get('quantumorders');
    collection.insert(req.body, function(err, result) {});

    //Then post to Quantum
    soap.createClient(url, function(err, client) {
        client.CreateFXDeal(req.body, function(err, result) {
            res.send(result);
            res.end();
        });
    });
});

/*
 * Post FX data to Quantum
 */
function addOrderToQuantum(orderData, db, fxOrderID) {

    //Firstly, get the next available Quantum ID
    var soap = require('soap');
    var url = 'http://223.197.29.89/TestWebService1/Service1.asmx?wsdl';

    soap.createClient(url, function(err, client) {
        client.GetDealSetNo(null, function(err, result) {
            if (err)
                return;
            else {
                //Then construct the JSON message and post the order
                var dealSetNoResult = result.GetDealSetNoResult;
                var today = new Date();
                var todayStr = today.toISOString();
                var valueDate = new Date();
                var valueStr = new Date(valueDate.setDate(valueDate.getDate() + 2)).toISOString();

                var quantumOrder = {
                    "DM2FXDealID": fxOrderID,
                    "DealInstrument": "FX Spot",
                    "DM2CptyID": "80000003",
                    "BUnitName": "Sydney Cash Unit",
                    "MaturityDate": valueStr,
                    "DealDate": todayStr,
                    "ValueDate": valueStr,
                    "Created": todayStr,
                    "ExternalDealSetID": dealSetNoResult,
                    "BuyCurr": orderData.ticker.substr(0, 3),
                    "SellCurr": orderData.ticker.substr(3, 3),
                    "BuyAmount": orderData.currencyAmountToBuy,
                    "SellAmount": 1,
                    "ContractRate": 1.9,
                    "SpotRate": orderData.price,
                    "ForwardPoints": 0,
                    "DealerName": "Jakco Huang"
                };
                var soap = require('soap');
                var url = 'http://223.197.29.89/TestWebService1/Service1.asmx?wsdl';

                //Post the quantum record to our FX DB also
                var collection = db.get('quantumorders');
                collection.insert(quantumOrder, function(err, result) {});

                //Then post to Quantum
                //Remove the MongoDB _id key first - no need to store this
                delete quantumOrder._id;
                soap.createClient(url, function(err, client) {
                    client.CreateFXDeal(quantumOrder, function(err, result) {
                        if (err) {
                            console.log("Error inserting FX deal into Quantum. Error code: " + err.response.statusCode + " error: " + err);
                        }
                        else {
                            /*
                            * The Quantum web service may execute successfully but still not insert the
                            * deal into Quantum. It is necessary to check the actual response - if the
                            * response is not an empty string, there has been an error. The error
                            * strings are not intuitive so it will be necessary to look at the Quantum
                            * web service code to understand what the errors mean
                            */
                            if (result.CreateFXDealResult != "") {
                                console.log("Error inserting FX deal into Quantum. Error code: " + result.CreateFXDealResult);
                            }
                        }
                    });
                });
            }
        });
    });
}

module.exports = router;