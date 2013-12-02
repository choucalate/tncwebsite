  var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId,
      async = require('async');

  var picSchema = new Schema({
      picId: String,
      pic_link: String,
      pic_source: String,
      height: Number,
      width: Number,
      images: [{
          height: Number,
          width: Number,
          source: String
      }],
      link: String,
      icon: String,
      likes: [String], //names
      tags: [String], //names
  });

  picSchema.statics.addPic = function (data, cb) {
    
      picture.find({
          picId: data.id
      }, function (err, result) {
          if (err) return cb("failed before locating id: " + err);
          if (result.length != 0) {
              var msg = "FOUND A DUPLICATE WITH THIS LINK: " + data.link;
              //console.log(msg);
              return cb(null, msg);
          } 
          //images array
          var images = [];
          for (i in data.images) {
              var sub = data.images[i];
              var image = {
                  height: sub.height,
                  width: sub.width,
                  source: sub.source
              };
              images.push(image);
          }
          //console.log("images: " + JSON.stringify(images, null, '\t'));

          //likes and tags
          var likes = [];
          if (data.likes) {
              for (i in data.likes.data)
                  likes.push(data.likes.data[i].name);
              //console.log("printing likes: " + JSON.stringify(likes, null, '\t'));  
          }

          var tags = [];
          if (data.tags) {
              for (i in data.tags.data)
                  tags.push(data.tags.data[i].name);
              //console.log("printing tags: " + JSON.stringify(tags, null, '\t'));
          }
          /*if(data.tags || data.likes)  
      console.log("^^ from data.id: " + data.link);
    return;*/
          var pic = new picture({
              picId: data.id,
              pic_link: data.picture,
              height: data.height,
              width: data.width,
              images: images,
              link: data.link,
              icon: data.icon,
              likes: likes,
              tags: tags
          });
          pic.save(function (err) {
              if (err) return cb(err);
              return cb(null, "success message");
          });
      });
  }

  picSchema.statics.findPicsFromAlbum = function (album_name, cb) {
      picture.find({
          album: album_name
      }, function (err, data) {
          cb(err, data);
      });
  }

  picSchema.statics.findAll = function (cb) {
      var q = picture.find({}).limit(20);
      q.execFind(function (err, data) {
          //     console.log(data);
          cb(null, data);
          /*console.log("length: " + data);
     if(err) cb(err);
     else cb(null, data);*/
      });
  }
  picSchema.statics.findLinks = function (limit, index, cb) {
      var q = picture.find({}).limit(limit).skip(index);
      q.execFind(function (err, data) {
          if (err) cb(err);
          var allLinks = [];
          for (i in data)
              allLinks.push(data[i]);
          cb(null, allLinks);
      });
  }

  picSchema.statics.findLimited = function (limit, index, cb) {
      var q = picture.find({}).limit(limit).skip(index);
      q.execFind(function (err, data) {
          if (err) cb(err);
          else cb(null, data);
      });
  }
  var picture = mongoose.model('picture', picSchema);
  exports.picture = picture;
   //exports.schema = peopleSchema;