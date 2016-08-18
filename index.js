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

app.get("/fitbit/subscription/webhook", function (request, response) {
  console.log('Fitbit Subscription Webhook');

  console.log('request: ');
  console.log(request);

  console.log('verify param');
  console.log(request.query.verify);
  // Verify code
  // TODO: fork fitbit-node, add subscription stuff, submit PR back to fitbit-node
  var incomingVerificationCode = request.query.verify;
  if (incomingVerificationCode == process.env.FITBIT_CLIENT_SECRET) {
    // TODO: Handle incoming subscription notification
    response.status(204).send({});
  } else {
    response.status(404).send({});
  }
});

// TODO: Delete Subscription

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
