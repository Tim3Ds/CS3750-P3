var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  var noUser = {
    username: 'No User',
  };

  if(req.user == null){
    req.user = noUser;
  }
  res.render('questions', {
    userName: req.user.username
  });
});

router.get('/create', function(req, res, next) {
  var noUser = {
    username: 'No User',
  };

  if(req.user == null){
    req.user = noUser;
  }
  res.render('createQuestion', {
    userName: req.user.username
  });
});



module.exports = router;
