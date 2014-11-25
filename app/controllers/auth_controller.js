var _ = require('lodash');
var PasswordResetException = require('../lib/password_reset_exception');

module.exports = function(app) {
  var User = app.Models.User;
  var FPR  = app.Models.ForgotPasswordRequests;

  return {
    authenticate: function (req, res, next) {
      User.signIn(req.body)
        .then(function(user) {
          if(user) {
            res.json(user);
          } else {
            res.statusCode = 403;
          }
        })
        .catch(next);
    },

    authorize: function(req, res, next) {
      if (app.shouldSkip(req.path, 'authorize')) {
        next();
      } else {
        User.checkToken(req.get('User-Token'))
          .then(function(user) {
            if (user) {
              req.user = user;
            } else {
              res.statusCode = 403;
            }
          })
          .done(next, next);
      }
    },

    signUp: function(req, res, next) {
      User.signUp(req.body)
        .then(function(user) {
          if(user) {
            res.json(user);
          } else {
            res.statusCode = 422;
          }
        })
        .catch(next);
    },

    forgotPassword: function(req, res, next) {
      FPR.sendRequest(req.body)
        .then(function() {
          res.status(200).end();
        })
        .catch(next);
    },

    changePassword: function(req, res, next) {
      User.changePassword(req.body)
        .then(function() {
          res.status(200).end();
        })
        .catch(function(err) {
          if (err instanceof PasswordResetException){
            res.status(403).send(err.message);
          } else {
            res.status(500).send(err.message);
          }
        });
    }
  }
}