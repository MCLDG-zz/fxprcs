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

/* GET quantum FX order data */
router.get('/quantumFXOrder', function(req, res) {
    var db = req.db;
    var collection = db.get('quantumFXOrders');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});

/* GET quantum AC order data */
router.get('/quantumACOrder', function(req, res) {
    var db = req.db;
    var collection = db.get('quantumACOrders');
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
    var collection = db.get('quantumFXOrders');
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
 * Post FX data to Quantum. This must create two types of Quantum entries:
 *
 *  FX Deal Entry
 *  Actual Cashflow (AC) Entries (at least 2 - one for inflow, one for outflow)
 */
function addOrderToQuantum(orderData, db, fxOrderID) {

    //Firstly, get the next available Quantum ID
    var soap = require('soap');
    var url = 'http://223.197.29.89/TestWebService1/Service1.asmx?wsdl';

    soap.createClient(url, function(err, client) {
        client.GetDealSetNo(null, function(err, result) {
            if (err) {
                console.log("Error getting DealSet No from Quantum. Error code: " + err.response.statusCode + " error: " + err);
                return;
            }
            else {
                //Then construct the JSON message and post the order
                var dealSetNoResult = result.GetDealSetNoResult;
                var quantumFXOrder = constructQuantumFXDealObject(orderData, fxOrderID, dealSetNoResult);
                var quantumACOrders = constructQuantumACDealObjects(orderData, fxOrderID, dealSetNoResult);
                var soap = require('soap');
                var url = 'http://223.197.29.89/TestWebService1/Service1.asmx?wsdl';

                //Post the quantum record to our FX DB also
                var collection = db.get('quantumFXOrders');
                collection.insert(quantumFXOrder, function(err, result) {});

                //Post the quantum record to our AC DB also
                var collection = db.get('quantumACOrders');
                collection.insert(quantumACOrders, function(err, result) {});

                //Then post to Quantum
                //Remove the MongoDB _id key first - no need to store this
                delete quantumFXOrder._id;
                for (var i = 0; i < quantumACOrders.length; i++) {
                    delete quantumACOrders[i]._id;
                }
                soap.createClient(url, function(err, client) {
                    client.CreateFXDeal(quantumFXOrder, function(err, result) {
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
                            //if no errors, insert the AC deals into Quantum
                            else {
                                client.CreateACDeal(quantumACOrders[0], function(err, result) {
                                    if (err) {
                                        console.log("Error inserting first AC deal into Quantum. Error code: " + err.response.statusCode + " error: " + err);
                                    }
                                    else {
                                        /*
                                         * The Quantum web service may execute successfully but still not insert the
                                         * deal into Quantum. It is necessary to check the actual response - if the
                                         * response is not an empty string, there has been an error. The error
                                         * strings are not intuitive so it will be necessary to look at the Quantum
                                         * web service code to understand what the errors mean
                                         */
                                        if (result.CreateACDealResult != "") {
                                            console.log("Error inserting first AC deal into Quantum. Error code: " + result.CreateACDealResult);
                                        }
                                        else {
                                            client.CreateACDeal(quantumACOrders[1], function(err, result) {
                                                if (err) {
                                                    console.log("Error inserting second AC deal into Quantum. Error code: " + err.response.statusCode + " error: " + err);
                                                }
                                                else {
                                                    /*
                                                     * The Quantum web service may execute successfully but still not insert the
                                                     * deal into Quantum. It is necessary to check the actual response - if the
                                                     * response is not an empty string, there has been an error. The error
                                                     * strings are not intuitive so it will be necessary to look at the Quantum
                                                     * web service code to understand what the errors mean
                                                     */
                                                    if (result.CreateACDealResult != "") {
                                                        console.log("Error inserting second AC deal into Quantum. Error code: " + result.CreateACDealResult);
                                                    }
                                                }
                                            });

                                        }
                                    }
                                });

                            }
                        }
                    });
                });
            }
        });
    });
}

function constructQuantumFXDealObject(orderData, fxOrderID, dealSetNoResult) {
    var today = new Date();
    var todayStr = today.toISOString();
    var valueDate = new Date();
    var valueStr = new Date(valueDate.setDate(valueDate.getDate() + 2)).toISOString();

    var quantumFXOrder = {
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
    return quantumFXOrder;
}

/*
 * Create and return at least 2 AC entries - one for inflow and one for outflow. In 
 * the real DM2 there may be multiple AC deals - for bank charges and other entries
 */
function constructQuantumACDealObjects(orderData, fxOrderID, dealSetNoResult) {
    var quantumACOrders = [];
    var today = new Date();
    var todayStr = today.toISOString();
    var valueDate = new Date();
    var valueStr = new Date(valueDate.setDate(valueDate.getDate() + 2)).toISOString();

    var quantumACOrderInflow = {
        "DM2ACDealID": fxOrderID,
        "DealInstrument": "Withdrawal - Bank Cheque",
        "DM2CptyID": "80000003",
        "BUnitName": "Sydney Cash Unit",
        "MaturityDate": valueStr,
        "DealDate": todayStr,
        "ValueDate": valueStr,
        "Created": todayStr,
        "ExternalDealSetID": dealSetNoResult,
        "SettlementMethod": "Cash",
        "Curr": orderData.ticker.substr(0, 3),
        "Amount": orderData.currencyAmountToBuy * orderData.price,
        "DM2CptyBankID": "9100003",
        "BUnitBankAccountNo": "00002474472",
        "SettlementDate": valueStr
    };

    var quantumACOrderOutflow = {
        "DM2ACDealID": fxOrderID,
        "DealInstrument": "Withdrawal - Bank Cheque",
        "DM2CptyID": "80000003",
        "BUnitName": "Sydney Cash Unit",
        "MaturityDate": valueStr,
        "DealDate": todayStr,
        "ValueDate": valueStr,
        "Created": todayStr,
        "ExternalDealSetID": dealSetNoResult,
        "SettlementMethod": "Cash",
        "Curr": orderData.ticker.substr(3, 3),
        "Amount": orderData.currencyAmountToBuy * orderData.price * -1,
        "DM2CptyBankID": "9100003",
        "BUnitBankAccountNo": "00002474472",
        "SettlementDate": valueStr
    };

    quantumACOrders.push(quantumACOrderInflow);
    quantumACOrders.push(quantumACOrderOutflow);
    return quantumACOrders;
}

module.exports = router;