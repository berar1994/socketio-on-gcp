var http = require('http');
var express = require('express');
var request = require('request');

var app = express();
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  getExternalIp(function (externalIp) {
    res.render('index.jade', {externalIp: externalIp});
  });
});

// [START external_ip]
// In order to use websockets on App Engine, you need to connect directly to
// application instance using the instance's public external IP. This IP can
// be obtained from the metadata server.
var METADATA_NETWORK_INTERFACE_URL = 'http://metadata/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip';

function getExternalIp (cb) {
  var options = {
    url: METADATA_NETWORK_INTERFACE_URL,
    headers: {
      'Metadata-Flavor': 'Google'
    }
  };

  request(options, function (err, resp, body) {
    if (err || resp.statusCode !== 200) {
      console.log('Error while talking to metadata server, assuming localhost');
      return cb('localhost');
    }
    return cb(body);
  });
}
// [END external_ip]

// Additionally listen for non-websocket connections on the default App Engine
// port 8080. Using http.createServer will skip express-ws's logic to upgrade
// websocket connections.
var server = http.createServer(app).listen(process.env.PORT || '8080', function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]


// setup new webserver for socket.io listening on 65080
var app_chat = require('express')();
var server1 = require('http').Server(app_chat);
var io = require('socket.io')(server1);
server1.listen(65080);

io.on('connection', function (socket) {
  console.log('user connected');

  setTimeout(()=> {
    socket.emit('event', {data: 'Working'});
  }, 2000);
});