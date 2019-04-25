// HTML for Bootcamp Homework #7
// Paul Raab
// Raab Enterprises LLC
// 4/20/2019
// Building a Train Scheduler
// I am doing this in JavaScript to refresh my memory. JQuery 
// is easier but JavaScript is closer to the DOM
// 
// ToDo
// As table grows what do we do with the div below. Either add a
//  scrollbar, push lower div down, or something else

// Javascript version of wait for document to be ready
document.addEventListener("DOMContentLoaded", function (event) {

    console.log("Doc ready event" + event);

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

    var database = firebase.database();

    // Handle an onclick event on the Train Admin submit button
    $("#add-train-btn").on("click", function () {

        // Stop default form behavior
        event.preventDefault();

        // Grabs user input
        var name = $("#name-input").val().trim();
        var destination = $("#destination-input").val().trim();
        var time = $("#time-input").val().trim();
        var freq = $("#freq-input").val().trim();

        // Creates local "temporary" object for holding train data
        var newTrain = {
            name: name,
            destination: destination,
            time: time,
            freq: freq
        };

        // Uploads train data to the database
        database.ref().push(newTrain);

        alert("Employee successfully added");

        // Clears all of the text-boxes
        $("#name-input").val("");
        $("#destination-input").val("");
        $("#start-input").val("");
        $("#freq-input").val("");
    });

    database.ref().on("child_added", function(childSnapshot) {
        console.log(childSnapshot.val());
      
        // Store everything into a variable.
        var name = childSnapshot.val().name;
        var destination = childSnapshot.val().destination;
        var time = childSnapshot.val().time;
        var freq = childSnapshot.val().freq;
      
        // // Prettify the employee start
        // var empStartPretty = moment.unix(empStart).format("MM/DD/YYYY");
      
        // // Calculate the months worked using hardcore math
        // // To calculate the months worked
        // var empMonths = moment().diff(moment(empStart, "X"), "months");
        // console.log(empMonths);
      
        // // Calculate the total billed rate
        // var empBilled = empMonths * empRate;
        // console.log(empBilled);
      
        // Create the new row
        var newRow = $("<tr>").append(
          $("<td>").text(name),
          $("<td>").text(destination),
          $("<td>").text(time),
          $("<td>").text(freq)
        );
      
        // Append the new row to the table
        $("#train-table > tbody").append(newRow);
      });
      
});