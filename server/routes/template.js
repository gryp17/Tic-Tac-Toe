var express = require('express');
var fs = require('fs');
var router = express.Router();

/**
 * /template/:template AJAX route
 * It redirects all /template/:template requests to the /views/components/:template path
 */
router.get('/:template', function (req, res, next) {
	
	var viewsDir = req.app.get('views');
	var componentsFolder = 'components';
	var template = req.params.template;
	var extension = req.app.get('view engine');
	
	var filePath = viewsDir+'/'+componentsFolder+'/'+template+'.'+extension;
	
	fs.readFile(filePath, function (err, html) {
		if (err) {
			return res.send('Template not found.');
		}

		res.send(html);
	});		
});

module.exports = router;
