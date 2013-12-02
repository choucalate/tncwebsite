/*
 * GET home page.
 */
var gallery = require('../models/picture');
var picture = gallery.picture;
var async = require('async');
var request = require('request');
exports.index = function (req, res) {
    res.render('index', {
        title: 'Express'
    })
};
exports.myGallery = function (cb) {
    //get like some links with a skip page
    picture.findLinks(limit, index, function (err, data) {
        cb(err, data);
    });
}

exports.saveAll = function (data, cb) {
    var picturesData = [];
    for (var i  = 0; i < data.photos.data.length; i++) {
        picturesData.push(data.photos.data[i]);
    }
    var next = data.photos.paging.next;
    var finished = false;
    async.whilst(function () {
        return !finished;
    }, function (callback) {
        request.get(next, function (err, resp, body) {
            if (err) return callback(err);
            var data = JSON.parse(body).data;
            if (data.length == 0) {
            	finished = true;
            	return callback();
            } else {
              next = JSON.parse(body).paging.next;
              for (var i  = 0; i < data.length; i++) {
                picturesData.push(data[i]);
              }
              //picturesData.push(data);
              return callback();
            } 
        });
    }, function (err) {
      //return console.log(JSON.stringify(picturesData, null, '\t'));
      savePics(picturesData, function(err) {
        return cb(err);
      });
    });

}

function savePics(data, cb) {
  async.each(data, function(item, callback) {
     picture.addPic(item, function(err, data) {
        callback(err, data);
     });
  }, function(err) {
    return cb(err);
  });
}