var sys = require('sys'),
   http = require('http');

var io = require("socket.io"),
    express = require("express");

var redis = require("redis-client"),
    client = redis.createClient();

function publish(channel, data) {
  client.publish('juggernaut', JSON.stringify({channel: channel, data: data}));
}

client.on("error", function (err) {
    console.log("Error " + err);
});

var app = express.createServer();

app.get('/', function(req, res){
  res.render('index.ejs');
});

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyDecoder());
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
  app.set('view options', { layout: false });
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.listen(8000);

// Juggernaut.listen(app);
var socket = io.listen(app);

socket.on('connection', function(client){
  sys.puts("Someone connected");

  client.on('message', function(message) { 
    sys.puts('Message: ' + message);
    publish('main', message);
  })
  client.on('disconnect', function(){ })
});

sys.puts('Server running at http://127.0.0.1:8000/');
