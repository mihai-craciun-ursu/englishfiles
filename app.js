var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var del = require('node-delete');
var app = express();


//mongodb connection
mongoose.connect("mongodb://mihai234:mihaiyin2@ds217898.mlab.com:17898/englishfiles");
//mongoose.connect("mongodb://localhost:27017/englishfiles");


//sessions
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUninitialized: false
}));

app.use(function(req, res, next){
  res.locals.currentUser = req.session.userId;
  next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
var docRoutes = require('./routes/documents');

app.use('/', routes);
app.use('/documents', docRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




// listen on port 8080
app.listen(8080, function () {
  console.log('Express app listening on port 8080');
});