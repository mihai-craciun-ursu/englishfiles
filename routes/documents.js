var express = require('express');
var router = express.Router();
var fs = require('fs');
var Document = require('../models/document');
var del = require('node-delete');
//var User = require('../models/user');


//GET documents
router.get('/', function(req, res) {
    let { grade } = req.query;
    
    //! TODO: Handle if invalid querry or no querry at all
    let allDocuments;
    let secondaryGrade;

    if(!grade){
      Document.find(function(err, documents){
        if(err){
          console.log("EROARE WAI")
        }else{
          return res.render('documents', { documents: documents});
        }
      }).sort({_id:-1});
    }else{

    if(parseInt(grade)<=8 && parseInt(grade)>=5){
      secondaryGrade = 1;
    }else if(parseInt(grade)<=12 && parseInt(grade)>=9){
      secondaryGrade = 2;
    }

    Document.find({grade: ["0", grade, secondaryGrade]}, function(err, documents){
      if(err){
        console.log("EROARE WAI")
      }else{
        return res.render('documents', { documents: documents});
      }
    }).sort({_id:-1});

  }
    

  });


    //GET documents/id

    router.get('/:id', function(req, res, next) {
        var { id } = req.params;
        Document.find({_id: id}, function(err, documents){
          if(err){
            console.log("ceva eroare")
          }else{
            var tester = {
              isDocument: documents[0].file_type === 'document',
              isImage: documents[0].file_type === 'image',
              isVideo: documents[0].file_type === 'video',
              isArchive: documents[0].file_type === 'archive',
              isAudio: documents[0].file_type === 'audio'
            }
            console.log(documents[0]);
            return res.render('documents-single-post', {document: documents[0], tester: tester});
          }
        });
    
      });

  //GET documents/id/delete
  router.get('/:id/delete', function(req, res, next) {
    var { id } = req.params;

    if(!req.session.userId){
      var err = new Error("You are not authorized to view this page.");
      err.status = 403;
      return next(err);
    }

    Document.find({_id: id}, function(err, documents){
      if(err){
        console.log("ceva eroare")
      }else{
        var doc = documents[0];

        fs.unlink('./public/uploads/' + doc.file_path.substr(8), function (err) {
          if (err) throw err;
          // if no error, file has been deleted successfully
          console.log('File deleted!');
        }); 

        Document.findByIdAndRemove(id, (err, todo) => {  
          return res.redirect('/documents');
      });
    }
  });

  });

module.exports = router;