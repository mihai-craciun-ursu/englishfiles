var mongoose = require('mongoose');

var BlogSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    images_path: {
      type: [String],
      required: true
    }

  });

  var BlogPost = mongoose.model('BlogPost', BlogSchema);
  module.exports = BlogPost;