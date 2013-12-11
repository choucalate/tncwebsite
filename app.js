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

// Configuration for everyauth
//THIS IS CALLED WHEN /AUTH/FACEBOOK GETS CALLED
everyauth
    .facebook
    .appId(conf.client_id)
    .appSecret(conf.client_secret)
    .scope(conf.scope)
    .fields('picture')
    .handleAuthCallbackError(function (req, res) {
        // If a user denies your app, Facebook will redirect the user to
        // /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
        console.log("there's been an error");
    })
    .findOrCreateUser(function (session, accessToken, accessTokenExtra, fbUserMetadata) {
        // console.log("find or create user");
        graph.setAccessToken(accessToken);
        graph.get('me/?fields=photos', function (err, data) {
            if(err) return console.log("err: " + err);

            routes.saveAll(data, function(error) {
              if(err) return console.log(JSON.stringify(err, null, '\t'));
              console.log("finished");
              return;
            })
        });
        var user = {
            id: 0,
            'facebook': fbUserMetadata
        };

        return user;
    })
    .redirectPath('/');

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
  res.render('demo.jade', {
 title: "John | Home"
  })
});

app.get('/gallery', function(req, res) {
  picture.findLimited(200, 0, function(err, data) {
    res.render('index.jade', {
      title: "John | Gallery",
      arr: data
    });
  }); 
});

app.get('/resume', function(req, res) {

    res.render('resume.jade', {
      title: "John | Resume"
    });

});
app.get('/projects', function(req, res) {
    res.render('projects.jade', {
      title: "John | Project"
    });
});

app.get('/pictures', function(req, res) {
  picture.findLimited(100, 0, function(err, data) {

    var items = "";

    res.render('index.jade', {
      title: "WHOO",
      myitems: items,
      arr: data
    });
  }); 
});

app.get('/portfolio/index', function(req, res) {
    res.render('portindex.jade', {
      title: "Portfolio | Home",
      task: "Building Your Own Website"
    });
});

app.get('/portfolio/fb', function(req, res) {
    res.render('fbauth.jade', {
      title: "Portfolio | FB",
      task: "Setting up Facebook Integration"
    });
});

app.get('/portfolio/node', function(req, res) {
    res.render('nodestart.jade', {
      title: "Portfolio | node",
      task: "Setting up NodeJs"
    });
});

app.get('/portfolio/client', function(req, res) {
    res.render('client.jade', {
      title: "Portfolio | client",
      task: "Building the Client Side"
    });
});

app.get('/portfolio/server', function(req, res) {
    res.render('server.jade', {
      title: "Portfolio | Server",
      task: "Building the Server"
    });
});

app.get('/portfolio/heroku', function(req, res) {
    res.render('heroku.jade', {
      title: "Portfolio | Heroku",
      task: "Deploying with Heroku"
    });
});

app.get('/about', function(req, res) {
  res.render('about.jade', {
    title: "Portfolio | About Me",
    task: "About Me :)"
  })
});

app.get('/links', function(req, res) {
  res.render('links.jade', {
    title: "Portfolio | Links",
    task: "Some Interesting Links"
  })
});

app.get('/reviews', function(req, res) {
  res.render('reviews.jade', {
    title: "Portfolio | Reviews",
    task: "Reviews"
  })
});




app.listen(port, function () {
    console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});