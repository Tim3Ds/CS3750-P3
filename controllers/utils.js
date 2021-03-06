var session = require('client-sessions');

/**
 * make sure a user is logged in before allowing them to continue
 * if not logged in, user is redirected back to the login page.
 */
module.exports.requireLogin = function(req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
};


/**
 * Given a user object:
 *  - Store the user object as a req.user
 *  - Make the user object available to templates as #{user}
 *  - Set a session cookie with the user object
 *
 *  @req - The http request object.
 *  @res - The http response object.
 *  @user - A user object.
 */
module.exports.createUserSession = function(req, res, user) {
  var cleanUser = {
    username: user.username,
    gameCode: user.gameCode,
  };

  req.session.user = cleanUser;
  req.user = cleanUser;
  res.locals.user = cleanUser;
};