$(document).ready(function (){
	
	//call the correct function depending on the body class
	window[$("body").attr("class")]();
	
	//call the "common" code
	common();
	
});