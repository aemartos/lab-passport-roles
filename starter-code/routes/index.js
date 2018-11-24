const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middlewares/isLogged');
const {roleCheck} = require('../middlewares/roleCheck');
const User = require('../models/User');
const Course = require('../models/Course');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/users', isLoggedIn('/login'), (req,res) => {
  const canSee = req.user.role == 'Boss' || req.user.role == 'TA' || req.user.role == 'Developer' ? true : false;
  const BOSS = req.user.role == 'Boss' ? true : false;
  User.find({role: 'Student'}, (err, students) => {
    User.find({role: {$ne: 'Student'}}, (err, users) => {
      res.render('users', {students, users, canSee, BOSS});
    });
  });
});

router.get('/courses', isLoggedIn('/login'), (req,res) => {
  const TA = req.user.role == 'TA' ? true : false;
  Course.find((err, courses) => {
    res.render('courses', {courses, TA});
  });
});

router.get('/main', isLoggedIn('/login'), (req,res) => {
  res.render('main');
});


// router.get('/iamboss',(req,res) => {
//   req.flash('error','You are boss now');
//   req.user.role = "Boss";
//   req.user.save().then( () => {
//     res.redirect('/');
//   });
// });


module.exports = router;
