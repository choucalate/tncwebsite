var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10;

var SongSchema = new Schema({ 
  song_title: String,
  data: [{
    "sound": String,
    "offset": Number
  }]
});

var UserSchema = new Schema({
  createdAt : { type: Date, default: Date.now },
  username : { type: String, required: true, index: { unique: true } },
  firstName : { type: String, required: true, index : { unique: false } },
  lastName : { type: String, required: true, index: { unique: false } },
  email : { type: String, required: true, index: { unique: true } },
  password : { type: String, required: true },
  resetPasswordToken : { type: String, required: false },
  profile_url: {type: String, required: false},
  status: {type: String, required: false},
  about: {type: String, required: false},
  resetPasswordTokenCreatedAt : { type: Date },
  youtube_links: {type: [String], required: false},
  jams: [SongSchema]
});


UserSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.validPassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.methods.generatePerishableToken = function(cb){
  var user = this;
  var timepiece = Date.now().toString(36);
  var preHash = timepiece + user.email;
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return cb(err);
    // hash the token along with our new salt
    bcrypt.hash(preHash, salt, function(err, hash) {
      if (err) cb(err);
      else cb(null,hash);
    });
  });
}

UserSchema.methods.updateEditSettings = function(data, cb) {
  UserSchema.findOne({username: data.username}, function(err, doc) {
    // here if the data elements coming in are set, then we set them into the document user
    if(data.profile_pic) doc.profile_url = data.profile_pic;
    if(data.status) doc.status = data.status;
    if(data.about) doc.about = data.about;
    if(data.youtube_links) doc.youtube_links = data.youtube_links;

    doc.save(function(err) { 
      cb(err);
    });
  })
}

module.exports = mongoose.model('User', UserSchema);