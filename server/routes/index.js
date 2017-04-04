var express = require("express");
var path = require("path");
var router = express.Router();

var UserModel = require("../models/user");

//home page
router.get("/", function (req, res, next) {
	var scriptName = path.basename(__filename);
	res.render("index", {
		script: scriptName
	});
});

//ajax login
router.post("/login", function (req, res, next) {
	var userModel = new UserModel(req.app.get("config"));

	userModel.find(req.body.username, req.body.password, function (err, result) {
		if (err) {
			return next(err);
		}

		if (result) {
			req.session.user = result;
			res.send("OK " + JSON.stringify(result));
		} else {
			res.send("invalid credentials");
		}
	});
});

//logout
router.get("/logout", function (req, res, next){
	req.session.destroy(function (){
		res.redirect("/");
	});
});

module.exports = router;
