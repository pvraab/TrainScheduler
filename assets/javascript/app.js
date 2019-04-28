// HTML for Bootcamp Homework #7
// Paul Raab
// Raab Enterprises LLC
// 4/20/2019
// Building a Train Scheduler
// 
// ToDo
// As table grows what do we do with the div below. Either add a
//  scrollbar, push lower div down, or something else

// Javascript version of wait for document to be ready
document.addEventListener("DOMContentLoaded", function (event) {

    console.log("Doc ready event" + event);

    var firstTime;
    var freq;
    var nextArrival;
    var minutesAway;

    // Start timer
    startTimer();

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

        alert("Train successfully added");

        // Clears all of the text-boxes
        $("#name-input").val("");
        $("#destination-input").val("");
        $("#start-input").val("");
        $("#freq-input").val("");
    });

    var index = 0;
    database.ref().on("child_added", function (childSnapshot) {
        console.log(childSnapshot.val());

        // Store everything into a variable.
        var name = childSnapshot.val().name;
        var destination = childSnapshot.val().destination;
        firstTime = childSnapshot.val().time;
        freq = childSnapshot.val().freq;

        // Compute time values
        computeTime();

        // Create update and remove buttons
        var updateButton = $("<button>").html("<span class='glyphicon glyphicon-edit'>U</span>").addClass("updateButton").attr("data-index", index);
        var removeButton = $("<button>").html("<span class='glyphicon glyphicon-remove'>R</span>").addClass("removeButton").attr("data-index", index);

        // Create the new row
        var newRow = $("<tr>").append(
            $("<td>").text(name),
            $("<td>").text(destination),
            $("<td>").text(firstTime),
            $("<td>").text(freq),
            $("<td>").text(nextArrival),
            $("<td>").text(minutesAway),
            $("<td>").html(updateButton),
            $("<td>").html(removeButton)
        );

        index++;

        // Append the new row to the table
        $("#train-table > tbody").append(newRow);
    });

    function computeTime() {
        console.log("In computeTime " + firstTime);

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
        console.log(firstTimeConverted);

        // Current Time
        var currentTime = moment();
        console.log("CURRENT TIME: " + moment(currentTime).format("HH:mm"));

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);

        // Time apart (remainder)
        var tRemainder = diffTime % freq;
        console.log(tRemainder);

        // Minute Until Train
        minutesAway = freq - tRemainder;
        console.log("MINUTES TILL TRAIN: " + minutesAway);

        // Next Train
        nextArrival = moment().add(minutesAway, "minutes");
        nextArrival = moment(nextArrival).format("HH:mm");
        console.log("ARRIVAL TIME: " + nextArrival);
    }

    // Variable mainIntervalObj will hold the setInterval 
    // to update train arrivals
    var mainClockRunning = false;
    var mainIntervalObj = null;

    // Start the timer
    function startTimer() {
        if (!mainClockRunning) {
            // Use mainIntervalObj to hold the setInterval to 
            // update the train arrivals every minute
            mainIntervalObj = setInterval(incrementArrival, 5000);
            mainClockRunning = true;
        }
    }

    // Update arrivals
    function incrementArrival() {
        console.log("In incrementArrival");

        //run through each row
        $('#train-table tr').each(function (i, row) {
            console.log($(row));
            console.log($(row)[0].cells[0].innerHTML);
            if (!($(row)[0].cells[0].innerText.trim() === "Train Name")) {

                firstTime = $(row)[0].cells[2].textContent;
                freq = $(row)[0].cells[3].textContent;
                computeTime();
                $(row)[0].cells[4].textContent = nextArrival;
                $(row)[0].cells[5].textContent = minutesAway;
            }
            index++;
        });

    }

    // This function will replace display whatever image it's given
    // in the 'src' attribute of the img tag.
    function displayImage() {
        $("#wrapper").css('background-image', 'url("' + images[count] + '")');
    }

});