var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = module.exports = express();

//get the environment 
var environment = process.env.NODE_ENV || 'development';

//get config from the environment 
var config = require('./config/' + environment);

//store the config
app.set('config', config);

var server = app.listen(config.port, function () {
	console.log('listening on port ' + config.port);
});

//setup the socket.io listeners
var io = require('socket.io')(server);
var socketNamespaces = require('./sockets')(io, app);

//save the socket namespaces
app.set('socketNamespaces', socketNamespaces);

//create a session mysql store and save it in the app so that can be accessed from the other modules
var sessionStore = new MySQLStore({
	host: config.db.host,
	database: config.db.database,
	user: config.db.user,
	password: config.db.password,
	schema: {
		tableName: config.session.tableName
	}
});

app.set('sessionStore', sessionStore);

app.use(session({
	store: sessionStore,
	secret: config.session.secret,
	key: config.session.sessionId,
	resave: true,
	saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, '../public/img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static('./public'));

//routes
app.use('/', require('./routes/home'));
app.use('/lobby', require('./routes/lobby'));
app.use('/user', require('./routes/user'));
app.use('/game', require('./routes/game'));
app.use('/template', require('./routes/template'));

//catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

//error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	//render the error page
	res.status(err.status || 500);
	res.render('error');
});