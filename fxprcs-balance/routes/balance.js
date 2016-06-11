var appRouter = function(app) {


app.get('/', function(req, res) {
    res.send("Hello World");
});

/* GET balance data */
app.get('/balance', function(req, res) {
    var db = req.db;
    var collection = db.get('userbalance');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

app.post("/balance", function(req, res) {
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
}
module.exports = appRouter;
