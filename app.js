var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');
const https = require('https');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.send('hello world')
});

app.get('/getLatLong', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if(typeof req.query.address != 'undefined')
  {
     var url_address='https://maps.googleapis.com/maps/api/geocode/json?address='+req.query.address+'&key=AIzaSyD_TCbhc5ExsHmzAxfPTwgMcI9PWwj4W9M';
     https.request(url_address,function(res2)
      {
          res2.pipe(res);
      }).on('error', function(e) { res.sendStatus(500); }).end();
  }
  else{
    res.send('address not found');
  }
});

app.get('/getWeather', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if(typeof req.query.lat != 'undefined' && typeof req.query.lon != 'undefined')
  {
     url_weather = 'https://api.darksky.net/forecast/84644b796871ee1eda69d4714a5ae1b1/'+req.query.lat+','+req.query.lon;
     https.request(url_weather,function(res_w)
     {
          res_w.pipe(res)
     }).on('error', function(e) { res.sendStatus(500); }).end();
  }
  else{
    res.send('Latitude and longiture not found');
  }
});

app.get('/getWeatherbyTime', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if(typeof req.query.lat != 'undefined' && typeof req.query.lon != 'undefined' && typeof req.query.time != 'undefined')
  {
     url_weather = 'https://api.darksky.net/forecast/84644b796871ee1eda69d4714a5ae1b1/'+req.query.lat+','+req.query.lon+','+req.query.time
     https.request(url_weather,function(res_w)
     {
          res_w.pipe(res)
     }).on('error', function(e) { res.sendStatus(500); }).end();
  }
  else{
    res.send('Latitude or longitude or time not found');
  }
});

app.get('/autoComplete', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if(typeof req.query.input != 'undefined'){
     var url_address='https://maps.googleapis.com/maps/api/place/autocomplete/json?input='+req.query.input+'&types=(cities)&language=en&key=AIzaSyD_TCbhc5ExsHmzAxfPTwgMcI9PWwj4W9M';
     https.request(url_address,function(res2)
      {
          res2.pipe(res);
      }).on('error', function(e) { res.sendStatus(500); }).end();
  }
  else{
    res.send('address not found');
  }
});

app.get('/getStateSeal', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if(typeof req.query.state != 'undefined')
  {
     var url_address='https://www.googleapis.com/customsearch/v1?q=Seal%20of%20'+req.query.state+'%20State&cx=007210220323619127169:xmd73iq7dsp&imgSize=huge&imgType=news&num=1&searchType=image&key=AIzaSyD_TCbhc5ExsHmzAxfPTwgMcI9PWwj4W9M';
     https.request(url_address,function(res2)
      {
          res2.pipe(res);
      }).on('error', function(e) { res.sendStatus(500); }).end();
  }
  else{
    res.send('address not found');
  }
});

app.get('/getCityImages', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if(typeof req.query.address != 'undefined')
  {
     var url_address='https://www.googleapis.com/customsearch/v1?q='+req.query.address+'&cx=007210220323619127169:xmd73iq7dsp&imgSize=huge&imgType=news&num=8&searchType=image&key=AIzaSyD_TCbhc5ExsHmzAxfPTwgMcI9PWwj4W9M';
     https.request(url_address,function(res2)
      {
          res2.pipe(res);
      }).on('error', function(e) { res.sendStatus(500); }).end();
  }
  else{
    res.send('address not found');
  }
});

module.exports = app;
