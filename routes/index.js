var express = require("express");
var path = require("path");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
	
	//access the global config
	console.log(req.app.get("config"));
	
	var scriptName = path.basename(__filename);
	res.render("index", {
		script: scriptName,
		title: "Express"
	});
});

module.exports = router;
