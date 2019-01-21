var http = require('http');
var express = require('express');
var Session = require('express-session');
const {google} = require('googleapis');

const ClientId = "*.apps.googleusercontent.com";
const ClientSecret = "*";
const RedirectionUrl = "*";

const scopes = [
  'https://www.googleapis.com/auth/webmasters.readonly',
];

const oauth2Client = new google.auth.OAuth2(
  ClientId,
  ClientSecret,
  RedirectionUrl
);

//starting the express app
var app = express();

//using session in express
app.use(Session({
  secret: 'your-random-secret-19890913007',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static('public'));

app.get("/", function (req, res) {
  // var url = getAuthUrl();
  let url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
  
    // If you only need one scope you can pass it as a string
    scope: scopes
  });
  res.send(`<h1>Authentication using google oAuth</h1>
    <a href="${url}">Login</a>`)
});

app.get("/saveOAuth2", async function (req, res) {
  if (!req.query.code) {
    let html = `<h1>Code not found</h1> <a href="/">Go to init page</a>`
    res.send(html)
  }

  let code = req.query.code
  const {tokens} = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens);

  let session = req.session
  session["tokens"] = tokens

  res.send(`
    <h3>Login successful!!</h3>
    <a href="/pages">Go to details page</a>
  `);
});

app.get("/pages", function (req, res) {
  res.send("TODO")
})

function body (title, content) {
  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title}</title>

    <link rel="stylesheet" type="text/css" href="/style.css">
  </head>
  <body>
    <div class="content">${content}</div>
  </body>
  </html>
  `
  
  return html
}

app.get("/data", function (req, res) {
  let session = req.session
  let key = session["tokens"].access_token
  var request = require("request")
  
  var options = { method: 'POST',
    url: 'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fdesarrolloactivo.com%2F/searchAnalytics/query',
    auth: {
      'bearer': key
    },
    headers: {
      'cache-control': 'no-cache',
      'Content-Type': 'application/json'
    },
    body: {
      startDate: '2018-12-01',
      endDate: '2018-12-31',
      dimensions: [ 'page' ],
      fields: [ 'responseAggregationType', 'rows' ]
    },
    json: true
  }
  
  request(options, function (error, response, body) {
    if (error) {
      res.send("Error")
    }

    res.send(JSON.stringify(body))
  });
})

var port = 3000;
var server = http.createServer(app);
server.listen(port);
server.on('listening', function () {
  console.log(`listening to ${port}`);
});

function getOAuthClient () {
  return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
}
