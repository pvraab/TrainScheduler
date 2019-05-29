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

var googleProvider = new firebase.auth.GoogleAuthProvider();
var gitHubProvider = new firebase.auth.GithubAuthProvider();

// Google signin
function googleSignin() {
    firebase.auth()

        .signInWithPopup(googleProvider).then(function (result) {
            var token = result.credential.accessToken;
            var user = result.user;

            // Put in local storage
            localStorage.setItem("type", "google");

            // Replace login screen with main app window
            window.location.replace("./main.html")

        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error.code)
            console.log(error.message)
        });
}

// GitHub signin
function gitHubSignin() {
    firebase.auth().signInWithPopup(gitHubProvider)

        .then(function (result) {
            var token = result.credential.accessToken;
            var user = result.user;

            console.log(token)
            console.log(user)

            // Put in local storage
            localStorage.setItem("type", "gitHub");

            // Replace login screen with main app window
            window.location.replace("./main.html")

        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            console.log(error.code)
            console.log(error.message)
        });
}

// Easy signin
function easySignin() {

    // Put in local storage
    localStorage.setItem("type", "easy");

    // Replace login screen with main app window
    window.location.replace("./main.html")
}