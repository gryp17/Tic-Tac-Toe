var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
	
	//access the global config
	console.log(req.app.get("config"));
	
	res.render("index", { title: "Express" });
});

module.exports = router;
