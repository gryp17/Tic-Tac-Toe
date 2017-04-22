var express = require("express");
var router = express.Router();
var _ = require("lodash");
var multipart = require("connect-multiparty");

var UserModel = require("../models/user");
var middleware = require("../middleware");

/**
 * Update avatar
 */
router.post("/updateAvatar", middleware.isLoggedIn, multipart(), function (req, res, next) {
	var userModel = new UserModel();

	//mock the req.body adding the logged in username (this is required by the uploadAvatar middleware)
	req.body = {
		username: req.session.user.username
	};

	//check/upload the avatar file
	middleware.uploadAvatar(req, res, function (err) {

		//update the avatar in the database
		userModel.update(req.session.user.id, {avatar: req.files.avatar.uploadedTo}, function (err, result) {
			if (err) {
				return res.send("Failed to update the avatar");
			}

			//update the session variable				
			req.session.user.avatar = req.files.avatar.uploadedTo;

			//update the user avatar in the connectedUsers list and send an event to all connected users
			var lobby = req.app.get("socketNamespaces").lobby;
			lobby.connectedUsers[req.session.user.id].avatar = req.files.avatar.uploadedTo;
			lobby.emit("updateUsersList", _.values(lobby.connectedUsers));

			//send the updated avatar to the front end
			res.send({
				avatar: req.files.avatar.uploadedTo
			});
		});

	});

});

module.exports = router;
