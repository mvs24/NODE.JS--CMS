const express=require('express');
const router=express.Router();
const Post=require('../../models/Post');
const faker=require('faker');
const {userAuthenticated}=require('../../helpers/authentication');
const Comment=require('../../models/Comment');
const Category=require('../../models/Category');
const User=require('../../models/User');




router.all('/*',userAuthenticated,(req,res,next)=>{
    req.app.locals.layout='admin';
    next();
}) 

router.get('/',(req,res)=>{
    Post.countDocuments().then(postCount=>{
        Comment.countDocuments().then(commentCount=>{
            Category.countDocuments().then(categoryCount=>{
                User.countDocuments().then(userCount=>{
                     res.render('admin/index', {postCount,commentCount,categoryCount,userCount});  
                })
            })
        })
    });
}); 

router.post('/generate-fake-posts',(req,res)=>{
    for(let i=0;i<req.body.amount;i++){
        let post=new Post();
        post.title=faker.name.title();
        post.status="public";
        post.allowComments=faker.random.boolean();
        post.body=faker.lorem.sentence();
        post.slug=faker.name.title();
        post.save().then((savedPost) => {
            res.redirect('/admin/posts');
        }).catch((err) => {
            console.log(err);
        });
    }
})




module.exports=router;