var express = require('express');
var router = express.Router();
var Bing = require('node-bing-api')({ accKey: "ecbad7d82338422eb761c1b8249218e1" });
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_SEARCH_URI);
var Schema = mongoose.Schema;

var searchSchema = new Schema({
  searchParam: String,
  when: String
});

var Search = mongoose.model('Search', searchSchema);

router.get('/', function(req, res) {

  res.render("index");
})

/* GET home page. */
router.get('/api/imagesearch/:search', function(req, res) {
  var search = req.params.search;
  var currentDate = new Date;
  var searchObj = { searchParam: search, when: currentDate };
  var data = new Search(searchObj).save(function(err, doc) {
    if(err){res.json(err)}
  })
  let completeList = [];
  Bing.images(search, {
    top: req.param("offset") || 10
  }, function(err, response, body) {
    if(err)console.log(err);
    var list = body.value;
    for(var i=0; i < list.length; i++) {
      var searchItem =
      { url: list[i].webSearchUrl,
        snippet: list[i].name,
        thumbnail: list[i].thumbnailUrl,
        context: list[i].hostPageDisplayUrl
      };
      completeList.push(searchItem);
    };
    res.json(completeList);
    console.log()
  });
});

router.get('/api/latest/imagesearch', function(req, res) {
  var searchHistory = [];
  var searchItem = {}
  Search.find({}, function(err, docs) {
    if(err){
      throw err
    }
    else {
      for(var i=docs.length-1 ; i>=0; i--) {
        searchHistory.push(
          { term: docs[i].searchParam, when: docs[i].when }
        );
      }
    }

    res.send(searchHistory);
  })
})

module.exports = router;
