// Initialize Firebase
var config = {
    apiKey: "AIzaSyDathxgWcLUpFeWAOwcgKf4sA8wYNf9VFo",
    authDomain: "pvraab-trainscheduler.firebaseapp.com",
    databaseURL: "https://pvraab-trainscheduler.firebaseio.com",
    projectId: "pvraab-trainscheduler",
    storageBucket: "pvraab-trainscheduler.appspot.com",
    messagingSenderId: "1035348700427"
};
firebase.initializeApp(config);

var provider = new firebase.auth.GoogleAuthProvider();

function googleSignin() {
    firebase.auth()

        .signInWithPopup(provider).then(function (result) {
            var token = result.credential.accessToken;
            var user = result.user;

            console.log(token)
            console.log(user)

            // Replace login screen with main app window
            window.location.replace("./main.html")

        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            console.log(error.code)
            console.log(error.message)
        });
}

function googleSignout() {
    firebase.auth().signOut()

        .then(function () {
            console.log('Signout Succesfull')
        }, function (error) {
            console.log('Signout Failed')
        });
}