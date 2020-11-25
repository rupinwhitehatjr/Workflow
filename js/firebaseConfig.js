var firebaseConfig = {
    apiKey: "AIzaSyDKEEwYE0xq_Pb4RXyEjxQR_XnNS04kMgY",
    authDomain: "renamingfilesforquiz.firebaseapp.com",
    databaseURL: "https://renamingfilesforquiz.firebaseio.com",
    projectId: "renamingfilesforquiz",
    storageBucket: "renamingfilesforquiz.appspot.com",
    messagingSenderId: "770560109780",
    appId: "1:770560109780:web:b1df2f0b63dd95f0885f41"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  //console.log(location.hostname)
  localhostnames=["localhost", "127.0.0.1"]
  isPresentInLH=localhostnames.indexOf(location.hostname)
  //console.log(isPresentInLH)
  if (isPresentInLH!=-1) {
    console.log("localhost")
    db.useEmulator(location.hostname, 8081);
  }