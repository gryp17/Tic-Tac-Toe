var express = require("express");
var router = express.Router();
var md5 = require("md5");
var multipart = require("connect-multiparty");

var middleware = require("../middleware");

var UserModel = require("../models/user");

/**
 * Home page
 */
router.get("/", function (req, res, next) {
	res.render("index");
});

/**
 * Ajax login
 */
router.post("/login", function (req, res, next) {
	var userModel = new UserModel();

	userModel.findByUsername(req.body.username, function (err, result) {
		if (err) {
			return next(err);
		}

		if (result) {

			if (result.password !== md5(req.body.password)) {
				res.send("Wrong username or password");
			} else {
				delete result.password;
				req.session.user = result;
				res.send({user: result});
			}

		} else {
			res.send("Wrong username or password");
		}
	});
});

/**
 * Logout
 */
router.get("/logout", function (req, res, next) {
	req.session.destroy(function () {
		res.redirect("/");
	});
});

/**
 * Ajax signup
 * calls the multipart middleware in order to parse the multipart form data
 * calls the checkSignupData in order to validate the username/password
 * finally calls the uploadAvatar middleware that uploads the avatar and saves the avatar filename in the req.files.avatar.uploadedTo field
 */
router.post("/signup", multipart(), middleware.checkSignupData, middleware.uploadAvatar, function (req, res, next) {
	var userModel = new UserModel();

	var data = req.body;

	//create the new user
	userModel.create(data.username.trim(), data.password.trim(), req.files.avatar.uploadedTo, function (err, userInstance) {
		if (err) {
			return next(err);
		}

		//log in the newly created user
		delete userInstance.password;
		req.session.user = userInstance;
		res.send({user: userInstance});
	});

});

module.exports = router;
