const admin = require('firebase-admin');
admin.initializeApp();



const copy = require('./copy');
const ps = require('./processSubmission');



exports.processSubmission = ps.processSubmission;
exports.makeCopy = copy.copyLayout;
