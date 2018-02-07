var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    password: {
       type: String,
       required: true,
    }
  });

  UserSchema.statics.authenticate = function(name, password, callback){
    User.findOne({name:name}).exec(function(error, user){
      if(error){
        return callback(error);
      }else if (!user){
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
        if(password === user.password){
          return callback(null, user);
        }else{
          return callback();
        }
     
    });
  }

 

  var User = mongoose.model('User', UserSchema);
  module.exports = User;