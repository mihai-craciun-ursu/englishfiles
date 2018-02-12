var express = require('express');
var router = express.Router();
var fs = require('fs');
var randomstring = require('randomstring');
var AWS = require('aws-sdk');
var Document = require('../models/document');
var BlogPost = require('../models/blogPosts');
var User = require('../models/user');


//configure file storage
AWS.config.update({accessKeyId: 'J_CKT_TFWQPFECGCMKBG', secretAccessKey: 'AThHyIJZGGL8CeJt60GXyzje_aIhKXgtysm4AQ=='});
var ep = new AWS.Endpoint('cellar.services.clever-cloud.com');
var s3 = new AWS.S3({ endpoint: ep, signatureVersion: 'v2' });


router.get('/mihaiyin2', function(req, res, next) {
  var {username} = req.query;
  var {password} = req.query;
  if(username && password){
    console.log('ceva');
    var userData = {
      name: username,
      password: password,
    };
    User.create(userData, function(error, user){
      if(error){
        return next(error);
      }else{
        return res.redirect('/');
      }
    });
  }
});

//get LOGOUT
router.get('/logout', function(req, res, next) {
  if(req.session){
    //delete session object
    req.session.destroy(function(err){
      if(err){
        return next(err);
      } else {
        return res.redirect('/');
      }
    })
  }
});


router.post('/login', function(req, res, next) {

  if(req.body.name && req.body.password){
    User.authenticate(req.body.name, req.body.password, function(error, user){
      if(error || !user){
        var err = new Error('Wrong name or password');
        err.status = 401;
        return next(err);
      } else{
        req.session.userId = user._id;
        return res.redirect('/');
      }
    });

  }else{
    var err = new Error("Email and password required");
    err.status = 401;
    next(err);
  }

});


//GET index
  router.get('/', function(req, res, next) {

    Document.find(function(err, documents){
      if(err){
        console.log("EROARE WAI")
      }else{
        return res.render('index', { documents: documents});
      }
    }).sort({_id:-1}).limit(5);
  });


//GET login
  router.get('/login', function(req, res, next) {
    return res.render('login', { title: 'Home' });
  });

//POST login
  router.post('/login', function(req, res, next){
    return res.send("Ceva");
  });


//GET about
  router.get('/about', function(req, res, next) {
    return res.render('about', { title: 'Home' });
  });



//GET contact
  router.get('/contact', function(req, res, next) {
    return res.render('contact', { title: 'Home' });
  });




//TODO - GET blog single post
router.get('/blog-single-post', function(req, res, next) {
  return res.render('blog-single-post', { title: 'Home' });
});

//GET add new document
router.get('/add', function(req, res, next) {
  if(!req.session.userId){
    var err = new Error("You are not authorized to view this page.");
    err.status = 403;
    return next(err);
  }

return res.render('add-new-doc', { title: 'Home' });

});



  //GET blog
  router.get('/blog', function(req, res, next) {
    
    BlogPost.find(function(err, blogPosts){
      if(err){
        console.log("EROARE WAI")
      }else{
        blogPosts.forEach(function (blogPost){
          blogPost.description = blogPost.description.substring(0,300);
        });
        // blogPosts.description = blogPosts.description.substring(0,100);
        return res.render('blog', {blogPosts: blogPosts});
      }
    }).sort({_id:-1});

  });

  //GET blog/id
  router.get('/blog/:id', function(req, res, next){
    var { id } = req.params;
    BlogPost.find({_id:id}, function(err,blogPost){
      if(err){
        console.log("EROARE WAI")
      }else{
        setTimeout(function (){

          return res.render('blog-single-post', {blogPost: blogPost[0]});
        
        }, 2000);
        
      }
    });
  
  });

  //DELETE POST
router.get('/blog/:id/delete', function(req, res, next) {
  var { id } = req.params;

  if(!req.session.userId){
    var err = new Error("You are not authorized to view this page.");
    err.status = 403;
    return next(err);
  }

  BlogPost.find({_id: id}, function(err, blogPost){
    if(err){
      console.log("ceva eroare")
    }else{
      var blog = blogPost[0];
      var images = blog.images_path;
      let params;

      
        images.forEach(function (image){
          params = {
            Bucket: 'docsss', 
            Delete: { // required
              Objects: [ // required
                {
                  Key: image.slice(-32) // required
                }
              ],
            },
          };
          
          s3.deleteObjects(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
          });

        });
      
    }
    BlogPost.findByIdAndRemove(id, (err, todo) => {  
      return res.redirect('/blog');
    });
  });
});



  //GET /add-blog
  router.get('/add-blog', function(req, res, next){
    if(!req.session.userId){
      var err = new Error("You are not authorized to view this page.");
      err.status = 403;
      return next(err);
    }
    return res.render('add-blog');
  });



  //POST /add-blog 
  router.post('/add-blog', function(req, res, next){
    if(!req.session.userId){
      var err = new Error("You are not authorized to view this page.");
      err.status = 403;
      return next(err);
    }


    let formFields = req.body;
    let sampleFile = req.files.file;
    let files_paths = [];
    let params;
    let randomname;

    
    if(sampleFile instanceof Array){
      sampleFile.forEach(function (file){
        randomname = randomstring.generate();

        params = {
            Body: file.data,
            ContentType:file.mimetype,
            Bucket: 'docsss',
            Key: randomname,
            ACL: 'public-read'
            };
          
            s3.putObject(params, function (err, data) {
            if (!err) {
              console.log("Object is public at https://cellar.services.clever-cloud.com/" +
              params.Bucket + "/" + params.Key);
            }else console.log(err);
          });
          files_paths.push('https://cellar.services.clever-cloud.com/docsss/'+randomname);
      });
    }else{
      randomname = randomstring.generate();
  
      params = {
        Body: sampleFile.data,
        ContentType:sampleFile.mimetype,
        Bucket: 'docsss',
        Key: randomname,
        ACL: 'public-read'
        };
       
        s3.putObject(params, function (err, data) {
        if (!err) {
          console.log("Object is public at https://cellar.services.clever-cloud.com/" +
          params.Bucket + "/" + params.Key);
        }else console.log(err);
      });
      files_paths.push('https://cellar.services.clever-cloud.com/docsss/'+randomname);
    }

    let blogPost = {
      name: formFields.name,
      description: formFields.description,
      images_path: files_paths
    };

    
    
    BlogPost.create(blogPost, function(error, user, next){
      if(error){
        return next(error);
      }else{
        return res.redirect('/blog');
      }
    });

  });

//POST /add (document)
  router.post('/add', function(req, res, next) {
    if(!req.session.userId){
      var err = new Error("You are not authorized to view this page.");
      err.status = 403;
      return next(err);
    }

    let formFields = req.body;
    let sampleFile = req.files.file;
    let randomname;
    if(sampleFile.mimetype == 'application/octet-stream'){
      randomname = randomstring.generate(29) + ".rar";
      console.log(randomname);
    }else randomname = randomstring.generate();

    let fileIcon;
    //console.log(typeof sampleFile);

    var params = {
      Body: sampleFile.data,
      ContentType:sampleFile.mimetype,
      Bucket: 'docsss',
      Key: randomname,
      ACL: 'public-read'
      };
     
      s3.putObject(params, function (err, data) {
      if (!err) {
        console.log("Object is public at https://cellar.services.clever-cloud.com/" +
        params.Bucket + "/" + params.Key);
      }else console.log(err);
    });


    switch(formFields.file_type){
      case "document":{
        fileIcon = "images/document.jpg";
        break;
      }
      case "image":{
        fileIcon = "images/image.jpg";
        break;
      }
      case "audio":{
        fileIcon = "images/audio.jpg";
        break;
      }
      case "video":{
        fileIcon = "images/video.jpg";
        break;
      }
      case "archive":{
        fileIcon = "images/archive.jpg";
        break;
      }
    }

    var doc = {
      name: formFields.name,
      description: formFields.description,
      file_type: formFields.file_type,
      file_path: 'https://cellar.services.clever-cloud.com/docsss/'+randomname,
      file_icon: fileIcon,
      grade: formFields.grade
    };

    Document.create(doc, function(error, user){
      if(error){
        return next(error);
      }else{
        return res.redirect('/documents');
      }
    });

  });




module.exports = router;