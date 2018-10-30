const Axios = require('axios');
const { db } = require('../utils/firestore');

const ENVIRONMENT_VARIABLES = db.collection('environment_variables');
const RECAPTCHA = ENVIRONMENT_VARIABLES.doc('RECAPTCHA');

// fetches secret server-side recaptcha key from Firestore
getSecretKey = function getSecretKey(callback) {
  RECAPTCHA.get().then(doc => callback(doc.data().SECRET_KEY)).catch((error) => {
    callback(error);
  });
};

// validates response (one-time token generated by user's completetion of captcha)
// callback(true) if valid, callback(false) if invalid
exports.validateRecaptcha = function validateRecaptcha(response, callback) {
  if (!response) {
    return callback(false);
  }
  getSecretKey((secret) => {
    Axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`, {}, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(res => callback(res.data.success)).catch((err) => {
      console.log(err);
      return callback(false);
    });
  });
};
