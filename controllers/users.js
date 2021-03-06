var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , passport = require('passport');

// Get login page
exports.login = function(req, res){
  console.log("req.query.postauth in exports.login= " + req.query.postAuthDestination);
  res.render('users/login', { postAuthDestination : req.query.postAuthDestination || "" });
}

// Get dashboard
exports.dashboard = function(req, res){
  res.render('users/dashboard');
}

// Authenticate user
exports.authenticate = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { 
      req.flash('error', info.message);
      return res.redirect(req.body.postAuthDestination ? '/login?postAuthDestination='+req.body.postAuthDestination : '/login');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect(req.body.postAuthDestination ? req.body.postAuthDestination : '/dashboard');
    });
  })(req, res, next);
}

// Get registration page
exports.register = function(req, res){
  res.render('users/registration', {user: new User({})});
}

// Log user out and redirect to home page
exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
}

// Account page
exports.account = function(req,res){
  res.render('users/account');
}

// List all users
exports.list = function(req, res, next){
  User.find(function(err,users){
    if(err) return next(err);
    res.render('users/index',{
      users:users
    });
  });
}

// Update user
exports.update = function(req, res, next){
  var user = req.user;

  console.log("req.body: " + JSON.stringify(req.body,null,'\t'));
  // remove password attribute from form if not changing
  if (!req.body.password) delete req.body.password;
  // ensure valid current password
  user.validPassword(req.body.currentPassword, function(err, isMatch){
    if(err) return next(err);
    if(isMatch) return updateUser();
    else return failedPasswordConfirmation();
  });
  // Handle correct current password and changes to user
  function updateUser(){
    // use save instead of update to trigger 'save' event for password hashing
    user.set(req.body);
    user.save(function(err, user){
      
      // Uniqueness and Save Validations
      
      if (err && err.code == 11001){
        var duplicatedAttribute = err.err.split("$")[1].split("_")[0];
        req.flash('error', "That " + duplicatedAttribute + " is already in use.");
        return res.redirect('/account');
      }
      if(err) return next(err);
      
      // User updated successfully, redirecting
      
      req.flash('success', "Account updated successfully.");
      return res.redirect('/account');
    });
  }
  // Handle incorrect current password entry
  function failedPasswordConfirmation(){
    req.flash('error', "Incorrect current password.");
    return res.redirect("/account");
  }
}

exports.profile_update = function(req, res, next) {
  var user = req.user;
  var data = req.body;
  User.findOne({username: user.username}, function(err, doc) {
      // here if the data elements coming in are set, then we set them into the document user
    if(data.profile_pic) doc.profile_url = data.profile_pic;
    if(data.status) doc.status = data.status;
    if(data.about) doc.about = data.about;
    if(data.youtube_links) {
      if (!doc.youtube_links) { doc.youtube_links = []; }
      // if it doesn't contain the word youtube... get rid of it
      if (data.youtube_links.indexOf("youtube.com") == -1) {
        // console.log(" this is an error...");
        // var err= 'not a valid youtube link: ' + data.youtube_links;
        // req.flash('error', "FAILURE..");
        // res.redirect('/editsetting');
        // // req.flash('error', "FAILURE2..");
        // // next(err);

        // return;
      }

      doc.youtube_links.push(data.youtube_links);
    }

    console.log("JSON from profupdate: " + JSON.stringify(req.body, null, '\t') + "\n" + JSON.stringify(doc, null, '\t'))

    doc.save(function(err) { 
      if(err) {
        req.flash('error', "error while saving your data");
        next(err);
      } else {
        req.flash('success', "Account updated successfully");
        res.redirect('/profile');
      }
     });
  });
}

// Create user
exports.create = function(req, res, next){
  console.log("JSON from create: " + JSON.stringify(req.body, null, '\t'))
  var newUser = new User(req.body);
  newUser.save(function(err, user){
    
    // Uniqueness and save validations
    
    if (err && err.code == 11000){
      var duplicatedAttribute = err.err.split("$")[1].split("_")[0];
      req.flash('error', "That " + duplicatedAttribute + " is already in use.");
      return res.render('users/registration', {user : newUser, errorMessages: req.flash('error')});
    }
    if(err) return next(err);
    
    // New user created successfully, logging In
    
    req.login(user, function(err) {
      if (err) { return next(err); }
      req.flash('success', "Account created successfully!");
      return res.redirect('/dashboard');
    });
  });
}

// Validations for user objects upon user update or create
exports.userValidations = function(req, res, next){
  console.log("JSON from user valid: " + JSON.stringify(req.body, null, '\t'))
  var creatingUser = req.url == "/register";
  var updatingUser = !creatingUser; // only to improve readability
  req.assert('email', 'You must provide an email address.').notEmpty();
  req.assert('firstName', 'First Name is required.').notEmpty();
  req.assert('lastName', 'Last Name is required.').notEmpty();
  req.assert('email', 'Your email address must be valid.').isEmail();
  req.assert('username', 'Username is required.').notEmpty();
  if(creatingUser || (updatingUser && req.body.password)){
    req.assert('password', 'Your password must be 6 to 20 characters long.').len(6, 20);
  }
  var validationErrors = req.validationErrors() || [];
  if (req.body.password != req.body.passwordConfirmation) validationErrors.push({msg:"Password and password confirmation did not match."});
  if (validationErrors.length > 0){
    validationErrors.forEach(function(e){
      req.flash('error', e.msg);
    });
    // Create handling if errors present
    if (creatingUser) return res.render('users/registration', {user : new User(req.body), errorMessages: req.flash('error')});
    // Update handling if errors present
    else return res.redirect("/account");
  } else next();
}

// Get password reset request
exports.reset_password = function(req, res){
  res.render('users/reset_password');
}

// Process password reset request
exports.generate_password_reset = function(req, res, next){
  // Validations
  req.assert('email', 'You must provide an email address.').notEmpty();
  req.assert('email', 'Your email address must be valid.').isEmail();
  var validationErrors = req.validationErrors() || [];
  if (validationErrors.length > 0){
    validationErrors.forEach(function(e){
      req.flash('error', e.msg);
    });
    return res.redirect("/reset_password");
  }
  // Passed validations
  User.findOne({email:req.body.email}, function(err, user){
    if(err) return next(err);
    if(!user){
      // Mimic real behavior if someone is attempting to guess passwords
      req.flash('success', "You will receive a link to reset your password at "+req.body.email+".");
      return res.redirect('/');
    }
    user.generatePerishableToken(function(err,token){
      if(err) return next(err);
      // Generated reset token, saving to user
      user.update({
        resetPasswordToken : token,
        resetPasswordTokenCreatedAt : Date.now()
      }, function(err){
        if(err) return next(err);
        // Saved token to user, sending email instructions
        res.mailer.send('mailer/password_reset', {
            to: user.email,
            subject: 'Password Reset Request',
            username: user.username,
            token: token,
            urlBase: "http://"+req.headers.host+"/password_reset"
          }, function(err) {
            if(err) return next(err);
            // Sent email instructions, alerting user
            req.flash('success', "You will receive a link to reset your password at "+req.body.email+".");
            res.redirect('/');
          });
      });
    });
  });
}

// Get password reset page
exports.password_reset = function(req, res, next){
  res.render("users/password_reset", {token : req.query.token, username : req.query.username});
}

// Verify passport reset and update password
exports.process_password_reset = function(req, res, next){
  User.findOne({username:req.body.username}, function(err, user){
    if(err) return next(err);
    if(!user){
      req.flash('error', "Password reset token invalid.");
      return res.redirect("/");
    }
    var tokenExpiration =  6 // time in hours
    if(req.body.token == user.resetPasswordToken && Date.now() < (user.resetPasswordTokenCreatedAt.getTime() + tokenExpiration * 3600000)){
      // Token approved, on to new password validations
      req.assert('password', 'Your password must be 6 to 20 characters long.').len(6, 20);
      var validationErrors = req.validationErrors() || [];
      if (req.body.password != req.body.passwordConfirmation) validationErrors.push({msg:"Password and password confirmation did not match."});
      if (validationErrors.length > 0){
        validationErrors.forEach(function(e){
          req.flash('error', e.msg);
        });
        return res.render('users/password_reset', {errorMessages: req.flash('error'), token : req.body.token, username : req.body.username});
      }
      // Passed new password validations, updating password
      user.set(req.body);
      user.save(function(err, user){
        if(err) return next(err);
        // Password updated successfully, logging In
        req.login(user, function(err) {
          if (err) { return next(err); }
          req.flash('success', "Password updated successfully, you are now logged in.");
          return res.redirect('/dashboard');
        });
      });
    } else {
      req.flash('error', "Password reset token has expired.");
      return res.redirect("/");
    }
  });
}

exports.editsettings= function(req, res, next) {
  res.render('users/editsettings');
}

exports.myprofile = function(req, res, next) {
  console.log("RENDERING USERS PROFILE: " + JSON.stringify(req.user, null, '\t'));
  res.render('users/profile', {
    user: req.user
  });
}


exports.save_jam = function(req, res, next) {
  console.log("SAVING JAM ROUTE");
  console.log("result: " + JSON.stringify(req.body));

  
  var user = req.body.user_name;
  var title = req.body.song_title;
  var old_data = req.body.data;

  if (!user || !title || !old_data) {
    res.status(400).json({ error: 'something is wrong' });
    return;
  }

  console.log("NOW FINDING USER: " + user);
  User.findOne({username: user}, function(err, doc) {
    if(err || !doc) {
      res.status(400).json({ error: 'something is wrong' });
      return;
    }
    console.log("no errors and doc is found");
    if (!doc.jams) {
      doc.jams = [];
    }

    for(var i = 0; i < doc.jams.length; i++) {
      if (doc.jams[i].song_title === title) {
        console.log("TITLE MATCHES... " + title);
        res.status(400).json({ error: 'already got this sound before'});
        return;
      } 
    }

    // time to convert all the data
    var result = {
      song_title: title,
      data: []
    };

    old_data.forEach(function(val) {
      result.data.push({
        "offset": parseInt(val.offset),
        "sound": val.sound
      })
    });
    console.log("The data: " + JSON.stringify(result, null , "\t"));
    doc.jams.push(result);

    doc.save(function(err) { 
      if(err) {
        res.status(400).json({ error: 'something is wrong' });
        return;
      } else {
        res.end(JSON.stringify({"result": "success"}));
      }
     });
  });  
}

exports.list_user_jams = function(req, res, next) {
  if(!req.params.user) {
    res.end("no jams for this user");
    return;
  }
  console.log("listing all jams for user: " + req.params.user);
  User.findOne({username: req.params.user}, function(err, doc) {
    if(err || !doc) {
      res.status(400).json({ error: 'no jams found' });
      return;
    }
    res.end(JSON.stringify(doc.jams, null, '\t'));
  })
  
}