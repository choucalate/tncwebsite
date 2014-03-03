/**
 * Module dependencies.
 */
var express = require('express'),
    routes = require('./routes'),
    everyauth = require('everyauth'),
    conf = require('./myconfig'),
    graph = require('fbgraph'),
    picture = require('./models/picture').picture,
    mongoose = require('mongoose'),
    connect = require('connect')
    port = (process.env.PORT || 8080);




var app = express();

/*ADD THE MONGODB*/
var uristring = process.env.MONGOHQ_URL ||
                process.env.MONGOLAB_URI ||
                'mongodb://localhost/picGallery1';

//mongoose conneecting string logging to the out
mongoose.connect(uristring, function(err, res) {
  if(err) {
     console.log("ERROR occurred connecting to :" + uristring + '. ' + err);
  } else {
     console.log("MONGO connected! here: " + uristring);

  }
});

//the db connection on error or opened 
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log("MONGO open!");
});

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {
        layout: false
    });
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "shhhhhhhhh!"
    }));
    app.use(connect.static(__dirname + '/public'));
    app.use(everyauth.middleware());
});

app.configure('development', function () {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
  console.log("COMING IN HERE");
  res.render('tnc.jade', {
 title: "John | Home"
  })
});




app.listen(port, function () {
    console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});
