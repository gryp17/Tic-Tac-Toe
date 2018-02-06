var express = require("express");
var router = express.Router();
var middleware = require("../middleware");

/**
 * Lobby home
 */
router.get("/", middleware.isLoggedIn, function (req, res, next) {	
	res.render("lobby", {
		myUser: req.session.user
	});
});

module.exports = router;
