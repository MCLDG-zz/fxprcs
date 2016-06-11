//This script loads initial data into Mongodb
db = db.getSiblingDB('fxdealing'); 
load('data/countryToCurrency.js');
load('data/userlogin.js');
load('data/userbalance.js');
load('data/watchlist.js');
