var express = require("express");
var router = express.Router();
var middleware = require("../middleware");

/**
 * Game home
 */
router.get("/", middleware.isLoggedIn, function (req, res, next) {
	
	//check if there is a game that this user belongs to
	var lobbyNamespace = req.app.get("socketNamespaces").lobby;
	var game = lobbyNamespace.findGameByUserId(req.session.user.id, "active");
	
	if(game){
		res.render("game", {
			user: req.session.user,
			game: game
		});
	}else{
		res.redirect("/lobby");
	}
	
});

module.exports = router;
