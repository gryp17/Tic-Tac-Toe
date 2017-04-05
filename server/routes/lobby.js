var express = require("express");
var path = require("path");
var router = express.Router();
var middleware = require("../middleware");

//lobby home
router.get("/", middleware.isLoggedIn, function (req, res, next) {
	var scriptName = path.basename(__filename);
	res.render("lobby", {
		script: scriptName,
		user: req.session.user
	});
});

module.exports = router;
