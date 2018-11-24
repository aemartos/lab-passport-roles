
const express = require("express");
const userRoutes = express.Router();
const {isLoggedIn} = require('../middlewares/isLogged');
const {roleCheck} = require('../middlewares/roleCheck');
const User = require("../models/User");
const bcrypt = require("bcryptjs");


userRoutes.get('/users/:userId/profile', isLoggedIn('/login'), (req, res, next) => {
  const canEdit = req.user.role == 'Boss' || req.user._id.equals(req.params.userId) ? true : false;
  User.findById(req.params.userId).then(profileUser => {
    res.render('users/profile',{profileUser, canEdit})
  }).catch((error)=> {
    console.log(`Can't show user profile`)
    res.render('/users');
  });
});

userRoutes.get('/users/add', [isLoggedIn('/login'), roleCheck(["Boss"])], (req, res, next) => {
  res.render('users/add');
});

userRoutes.post('/users/add', [isLoggedIn('/login'), roleCheck(["Boss"])], (req, res, next) => {
  const salt = bcrypt.genSaltSync(10);
  const hashPass = bcrypt.hashSync(req.body.password, salt);
  const user = {
    username: req.body.username,
    role: req.body.role,
    password: hashPass
  };
  if (user.username === "" || user.role === "None" || user.password === "") {
    req.flash('error', "Indicate username, role and password");
    res.redirect("/users/add");
    return;
  }
  User.create(user).then(user => {
    console.log(`Created user: ${user._id} ${user.username} with ${user.role} role"`);
    res.redirect('/users');
  })
  .catch((error)=> {
    console.log(error);
    res.render('users/add');
  });
});

userRoutes.get('/users/:userId/delete', [isLoggedIn('/login'), roleCheck(["Boss"])], (req,res) => {
  User.findByIdAndDelete(req.params.userId).then(()=> {
    res.redirect('/users');
  })
  .catch((error)=> {
    console.log(`Can't delete user`)
    res.redirect('/users');
  });
});

userRoutes.get('/users/:userId/edit', isLoggedIn('/login'), (req,res) => {
  User.findById(req.params.userId).then(user => {
    if(req.user._id.equals(req.params.userId) || req.user.role == 'Boss') {
      res.render('users/edit', {user});
    }
  }).catch((error)=> {
    console.log(error);
    req.flash('error',`You are not allowed to edit this profile`);
    res.render(`users/${req.params.userId}/profile`);
  });
});

userRoutes.post('/users/:userId/edit', isLoggedIn('/login'), (req,res) => {
  const salt = bcrypt.genSaltSync(10);
  const hashPass = bcrypt.hashSync(req.body.password, salt);
  const user = {
    username: req.body.username,
    role: req.body.role,
    password: hashPass
  };
  const userId = req.params.userId;
  User.findByIdAndUpdate(userId, user).then(() => {
    res.redirect(`/users/${userId}/profile`);
    //res.redirect('/users');
  });
});

module.exports = userRoutes;
