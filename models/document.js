var mongoose = require('mongoose');

var DocumentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    file_path: {
      type: String,
      required: true
    },
    file_icon:{
      type:String,
      required: true
    },
    grade:{
      type:String,
      required: true
    }
  });

  var Document = mongoose.model('Document', DocumentSchema);
  module.exports = Document;