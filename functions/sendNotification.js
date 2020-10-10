const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* admin is initialised in index.js*/
let db = admin.firestore();


exports.sendNotification = functions
  .region('asia-east2')
  .firestore
  .document('NotificationQueue/{notificationid}')
  .onCreate((snapshot, context) => 
  { 
  	
  	console.log("Ready to Send Notification")
  	return 0
  	
  });

  

