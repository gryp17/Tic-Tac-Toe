var express = require("express");
var router = express.Router();
var middleware = require("../middleware");

/**
 * Game home
 */
router.get("/", middleware.isLoggedIn, function (req, res, next) {
	res.render("game", {
		user: req.session.user
	});
});

module.exports = router;
