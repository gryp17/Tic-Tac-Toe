var express = require("express");
var router = express.Router();
var md5 = require("md5");

var UserModel = require("../models/user");

//home page
router.get("/", function (req, res, next) {
	res.render("index");
});

//ajax login
router.post("/login", function (req, res, next) {
	var userModel = new UserModel();

	userModel.findByUsername(req.body.username, function (err, result) {
		if (err) {
			return next(err);
		}

		if (result) {
			
			if(result.password !== md5(req.body.password)){
				res.send("Wrong username or password");
			}else{
				delete result.password;
				req.session.user = result;
				res.send({user: result});
			}
			
		} else {
			res.send("Wrong username or password");
		}
	});
});

//logout
router.get("/logout", function (req, res, next){
	req.session.destroy(function (){
		res.redirect("/");
	});
});

//signup
router.post("/signup", function (req, res, next){
	var userModel = new UserModel();
	
	if(!req.body.username || req.body.username.trim() === ""){
		res.send("Username is required");
	}
	
	if(req.body.username.length > 20){
		res.send("The username is too long");
	}
	
	if(!req.body.password || req.body.password.trim() === ""){
		res.send("Password is required");
	}
	
	if(req.body.password !== req.body.repeatPassword){
		res.send("The passwords don't match");
	}
	
	//check if the username is in use
	userModel.findByUsername(req.body.username.trim(), function (err, result) {
		if (err) {
			return next(err);
		}
		
		if(result){
			res.send("The username is taken");
		}else{
			//create the new user
			userModel.create(req.body.username.trim(), req.body.password.trim(), function (err, userInstance){
				if (err) {
					return next(err);
				}

				//log in the newly created user
				delete userInstance.password;
				req.session.user = userInstance;
				res.send({user: userInstance});
			});
		}
	});	
	
});

module.exports = router;
