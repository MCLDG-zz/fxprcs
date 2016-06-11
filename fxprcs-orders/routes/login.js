var express = require('express');
var router = express.Router();

/* Login */
router.post('/auth', function(req, res) {
    var db = req.db;
    var email = req.body.useremail;
    var password = req.body.password;

    var collection = db.get('userlogin');
    collection.findOne({
            email: email
        },
        function(err, result) {
            res.send(
                (err == null && result && result.password == password) ? {
                    msg: "Success",
                    email: result.email,
                    role: result.role,
                    username: result.username
                } : {
                    msg: "Failed"
                }
            );
        });
});

module.exports = router;