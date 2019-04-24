const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Category=require('../../models/Category');
const fs=require('fs');
const {isEmpty,uploadDir}=require('../../helpers/upload-helper');
const {userAuthenticated}=require('../../helpers/authentication');

router.all("/*",userAuthenticated,(req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get("/", (req, res) => {
  Post.find({})
  .populate('category')
    .then(posts => {
      res.render("admin/posts", { posts });
    })
    .catch(err => {
      res.send("Something went wrong");
    });
});

router.get('/my-posts',(req,res)=>{
  Post.find({user:req.user.id}).populate('category')
    .then(posts=> {
      res.render("admin/posts/my-posts", { posts });
    })
}) 

router.get("/create", (req, res) => {
    Category.find({}).then(categories=>{      
    res.render("admin/posts/create",{categories});
  })
});

router.post("/create", (req, res) => {

  let filename='';
  if(!isEmpty(req.files)){
    let file=req.files.file;
    filename=Date.now()+'-'+file.name;

    file.mv('./public/uploads/'+filename,(err)=>{
      if(err) throw err;
    })
  }
 
  let allowComments = true;
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newPost = new Post({
    user:req.user.id,
    title: req.body.title,
    status: req.body.status,
    allowComments,
    category:req.body.category,
    body: req.body.body,
    file:filename
  });

  newPost.save().then(savedPost => {

    req.flash("success_message",`Post ${savedPost.title} was created successfully`);
      res.redirect("/admin/posts");
    })
    .catch(err => {
      console.log(err);
    });
});

router.get("/edit/:id", (req, res) => {
  Post.findOne({ _id: req.params.id }).then(post => {
    Category.find({}).then(categories=>{      
      res.render("admin/posts/create",{categories});
    })
    res.render("admin/posts/edit", { post,categories });
  });
});

router.put("/edit/:id", (req, res) => {
  Post.findById({ _id: req.params.id }).then(post => {
    let allowComments=true;
    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }
    post.user=req.user.id;
    post.title = req.body.title;
    post.status = req.body.status;
    post.body = req.body.body;
    post.category=req.body.category;
    post.allowComments = allowComments;

    if(!isEmpty(req.files)){
      let file=req.files.file;
      filename=Date.now()+'-'+file.name;
      post.file=filename;
      file.mv('./public/uploads/'+filename,(err)=>{
        if(err) throw err;
      })
    }
    

      post.save().then(updatedPost => {
        req.flash("success_message",'Post was successfully updated');
        res.redirect("/admin/posts/my-posts");
    });
  });
});

router.delete('/:id',(req,res)=>{
    Post.findOne({_id:req.params.id}).populate('comments')
    .then(post=>{
      fs.unlink(uploadDir+post.file,err=>{
      
          if(!post.comments.length<1){
            post.comments.forEach(comment=>{
              comment.remove();
            })
          }
        post.remove().then(postRemoved=>{
          req.flash("success_message",'Post was successfully deleted');
          res.redirect('/admin/posts/my-posts');
        })
      })
    })
})

 



module.exports = router;