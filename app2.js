
/**
 * Module dependencies.
 */

var express = require('express')
  , connect = require('connect')
  //, user   = require('./routes/user')
  , path   = require('path');
  // , helenus = require('helenus');

var app = module.exports = express();

// var pool =  new helenus.ConnectionPool({
//   hosts: [ 'localhost:9160'],
//   keyspace: 'webinar',
//   cqlVersion: '3.0.0'
// });
// Configuration

// pool.connect(function(err, keyspace) {
//   if(err) {
//     console.log("ERR: " + err);
//   }

  app.configure(function(){
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
  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
    app.use(express.errorHandler());
  });


// Creating a new connection pool.
// var PooledConnection = require('cassandra-client').PooledConnection;
var hosts = ['localhost:9042'];
// var connection_pool = new PooledConnection({'hosts': hosts, 'keyspace': 'Keyspace1'});
// module.exports.cp = connection_pool;
// Writing
// Reading
  // Routes
var cql = require('node-cassandra-cql');
var client = new cql.Client({hosts: hosts, keyspace: 'mykeyspace'});
client.connect(function established(err){if (err) console.log(err);
else console.log('Connection with Cassandra established');});


  app.get('/', function(req, res) { 
    var select = "SELECT * FROM users";
    client.execute(select,function(err, users) {
      if (err) console.log("lookup failed");
      else console.log("got result " + JSON.stringify(users, null, '\t'));
      users = users || [];
      res.render("admin", {title: "Users", users: users});
    });
  });

  app.post('/', function(req, res) {
    var insert = "UPDATE Keyspace1 SET first_name=? AND last_name=? WHERE email=?", 
    params = [req.body.first_name, req.body.last_name, req.body.email];
    console.log("params : " + JSON.stringify(params, null, '\t'));

    client.execute(insert,params, function(err) {
      if(err) {
        return console.log("err: " + err);
      }
      req.redirect('/');
    });
  });

  // app.delete('/', routes.delete);

  app.listen(3000, function(){
    console.log("Express server listening on port %d in %s mode");
  });
// });