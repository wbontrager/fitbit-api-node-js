var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();

var FitbitApiClient = require("fitbit-node");
var client = new FitbitApiClient(process.env.FITBIT_CLIENT_ID, process.env.FITBIT_CLIENT_SECRET);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});

// Fitbit API Authorization
var authorizeCallbackUrl = "https://hidden-reef-88758.herokuapp.com/oauth/fitbit/callback";
var accessCallbackUrl = authorizeCallbackUrl;
app.get("/oauth/fitbit/authorize", function (req, res) {
  console.log('Fitbit authorization started');
  res.redirect(client.getAuthorizeUrl('activity profile sleep social', authorizeCallbackUrl));
});

app.get("/oauth/fitbit/callback", function (req, res) {
  console.log('Fitbit callback hit');
  client.getAccessToken(req.query.code, accessCallbackUrl).then(function (result) {
    console.log('  Fitbit callback getAccessToken success');
    client.get("/profile.json", result.access_token).then(function (results) {
      console.log('    Fitbit callback get profile success');
      console.log('    result: ' + results);
      res.send(results[0]);
    });
  }).catch(function (error) {
    console.log('  Fitbit callback getAccessToken error');
    res.send(error);
  });
});

app.get("/fitbit/callback_2", function (req, res) {
  console.log('Fitbit callback 2 hit');
  response.send("callback 2" + cool());
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
