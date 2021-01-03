const express = require('express');
const router = express.Router()
var User = require("../models/userM");
const session = require("express-session")
const mongoSessisonStore = require("connect-mongo")(session);
const validator = require("express-validator");
const mongoose = require("mongoose");


router.use(
    session({
      store: new mongoSessisonStore({ mongooseConnection: mongoose.connection }),
      saveUninitialized: true,
      resave: true,
      secret: "Epslion's super secret",
      cookie: { maxAge: 30 * 60 * 1000 },
    })
);

//================== Log In Http ==================//

//========= Log In Render Page =========//

router.get('/login' , (req,res) =>{
         var err = ""
       res.render('logIn' , {err : err })
    
})
//=====================================//

//========= Log In Form Action =========//
router.post(('/sessions'),(req, res) => {

    User.authenticate(
        req.body.email,
        req.body.password,
        (err, user) => {
        if (err) {
          console.log("Authentication error: ", err);
          res.render('logIn', { err })
          res.status(500)
         
        } else {
          req.session.userId = user._id;
          res.render("main", { user , id: req.session.userId });
        
        }
      });


})
//====================================//

//============================================//

//================Freelancer Profile============

router.get("/profile", (req, res) => {
  console.log("From Login/Signup req.session.userId: ", req.session.userId);
  User.findOne({ _id: req.session.userId })
    .then((currentUser) => {
      res.render("profile", { user: currentUser });
    })
    .catch((err) => console.log("Error: User not found ", err));
});
//================Seeker Profile============
router.get("/SeekerProfile", (req, res) => {
  console.log("From Login/Signup req.session.userId: ", req.session.userId);
  User.findOne({ _id: req.session.userId })
    .then((currentUser) => {
      res.render("SeekerProfile", { user: currentUser });
    })
    .catch((err) => console.log("Error: User not found ", err));
});
router.use("/protected-profile", (err, req, res, next) => {
  console.log(err);
  res.redirect("/login");
});

//======================main 
router.get('/main' , (req,res) =>{

  res.render('main' , {user: null})

})

//================Sign out=============
router.get("/logout" ,(req, res) => {
  req.session.userId = null;
  res.redirect("/main");
  
})

function checkSignIn(req, res, next) {
    // if the user is logged in, just go onto the router with the netxt() keyword
    if (req.session.userId) {
      next();
    } else {
      const err = new Error("You are not logged in!");
      next(err);
    }
  
}

//-----------------------------------

router.get('/' , (req,res) =>{

    var id = req.session.userId;
    User.findById(id)
    .then((findUser)=>{


        res.render('index' , {findUser})


        
    }).catch(err =>{ console.log(err)})
    
})

//------------------SIGNUP-----------------

router.get('/signup' , (req,res) =>{

    res.render('signUp')
})

router.post('/users' ,(req, res) => {
    console.log("req.body.type:  ",req.body.type)
    User.createSecure(
        req.body.name,
        req.body.email,
        req.body.password,
        req.body.img,
        req.body.type,
        (err, newUser) => {

        var id = req.session.userId;
        console.log("newUser: ", newUser);
        console.log("user Id: ",id)

       User.findById(id)
       .then((user)=>{
       res.redirect('/logIn')
   
           
       }).catch(err =>{ console.log(err)})
      });

})

   
module.exports = router;