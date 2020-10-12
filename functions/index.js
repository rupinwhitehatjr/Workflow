const admin = require('firebase-admin');
admin.initializeApp();



const copy = require('./copy');
const ps = require('./processSubmission');
const notification = require('./sendNotification');



exports.processSubmission = ps.processSubmission;
exports.makeCopy = copy.copyLayout;
exports.sendNotification = notification.sendNotification;


