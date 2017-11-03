var express = require('express');
var request = require('request');
var mongoose= require('mongoose');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

var options = { server: { socketOptions: {connectTimeoutMS: 30000 } }};
mongoose.connect('mongodb://noel:azerty@ds141351.mlab.com:41351/openweatherapp', options , function(err) {
  console.log(err);
});

var citySchema = mongoose.Schema({
    name: String,
    desc: String,
    icon: String,
    temp_min: String,
    temp_max: String,
    position: Number
});
var cityModel = mongoose.model('city', citySchema);

var cityList = [];

app.get('/', function (req, res) {
  var query = cityModel.find();
  query.sort({position: 1});
  query.exec(function (err, datas) {
     res.render('index', {cityList: datas});
  })
});

app.get('/add', function (req, res) {

  request("http://api.openweathermap.org/data/2.5/weather?q="+req.query.city+"&appid=9b754f1f40051783e4f72c176953866e&units=metric&lang=fr", function(error, response, body) {
     body = JSON.parse(body);
     //var city = {timestamp: Date.now(), name: body.name, desc: body.weather[0].description, icon: "http://openweathermap.org/img/w/"+body.weather[0].icon+".png", temp_min: body.main.temp_min+"°C", temp_max: body.main.temp_max+"°C"};
     //cityList.push(city);
     console.log(body);
     var query = cityModel.find();
     query.sort({position: 1});
     query.exec(function (err, datas) {

        var nexPosition = 1;
        if(datas.length>0) {
          nexPosition = datas[datas.length-1].position + 1;
        }

        var city = new cityModel ({
          name: body.name,
          desc: body.weather[0].description,
          icon: "http://openweathermap.org/img/w/"+body.weather[0].icon+".png",
          temp_min: body.main.temp_min+"°C",
          temp_max: body.main.temp_max+"°C",
          position: nexPosition
        });
       city.save(function (error, city) {
        console.log(error);
        console.log(city);
        var query = cityModel.find();
        query.sort({position: 1});
        query.exec(function (err, datas) {
           res.render('index', {cityList: datas});
        })
       });
     })
  });

});

app.get('/delete', function (req, res) {
  //cityList.splice(req.query.position,1);
  cityModel.remove({ _id: req.query.id}, function(error) {
    var query = cityModel.find();
    query.sort({position: 1});
    query.exec(function (err, datas) {
       res.render('index', {cityList: datas});
    })
  });

});

app.get('/update', function (req, res) {
  var sortList = JSON.parse(req.query.sortlist);
  console.log(sortList);
  //var cityListTmp = [];
  for(var i=0; i<sortList.length; i++) {

    cityModel.update({ _id: sortList[i]}, { position: i });
    /*for(var j=0; j<cityList.length; j++){
      if(sortList[i] == cityList[j].timestamp){
        cityListTmp.push(cityList[j]);
      }
    }*/
  }
  //cityList = cityListTmp;
  res.send({result : true});
});

app.listen(8080, function () {
  console.log("Server listening on port 8080");
});
