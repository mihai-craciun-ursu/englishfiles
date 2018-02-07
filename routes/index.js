var express = require('express');
var router = express.Router();
var fs = require('fs');
var Document = require('../models/document');
var BlogPost = require('../models/blogPosts');
var User = require('../models/user');

//var User = require('../models/user');


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
        return res.render('blog-single-post', {blogPost: blogPost[0]});
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


      
        images.forEach(function (image){
          fs.unlink('./public' + image, function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully
            console.log('File deleted!');
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

    fs.readdirSync("public/uploads/blog").forEach(file => {
      if(sampleFile instanceof Array){
        sampleFile.forEach(function (fileUpload){
          if(file == fileUpload.name){
            fileUpload.name = (Math.floor(Math.random()*50000)+1).toString() + fileUpload.name;
          }
        });
      }else{
        
        if(file == sampleFile.name){
          sampleFile.name = (Math.floor(Math.random()*50000)+1).toString() + sampleFile.name;
        }
      }
    });

    
    if(sampleFile instanceof Array){
      sampleFile.forEach(function (file){
        console.log(file);
        file.mv('public/uploads/blog/'+file.name, function(err) {
            //TODO: handle error
        });
        files_paths.push('/uploads/blog/'+file.name);
      });
    }else{
      sampleFile.mv('public/uploads/blog/'+sampleFile.name, function(err) {
        //TODO: handle error
      });
      files_paths.push('/uploads/blog/'+sampleFile.name);
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
    let fileIcon;
    //console.log(typeof sampleFile);


    fs.readdirSync("public/uploads").forEach(file => {
      if(file == sampleFile.name){
          sampleFile.name = (Math.floor(Math.random()*50000)+1).toString() + sampleFile.name;
        }
      
    });


    sampleFile.mv('public/uploads/'+sampleFile.name, function(err) {
        //TODO: handle error
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
      file_path: 'uploads/'+sampleFile.name,
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