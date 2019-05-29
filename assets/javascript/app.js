// HTML for Bootcamp Homework #7
// Paul Raab
// Raab Enterprises LLC
// 4/20/2019
// Building a Train Scheduler
// 
// ToDo
// As table grows what do we do with the div below. Either add a
//  scrollbar, push lower div down, or something else

// Wait for document to finish loading
$(document).ready(function () {

    var firstTime;
    var freq;
    var nextArrival;
    var minutesAway;
    var isUpdate = false;
    var uid = null;

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

    $("#googleSignout").on("click", function (event) {

        // Stop default form behavior
        event.preventDefault();

        firebase.auth().signOut()
            .then(function () {
                // Replace login screen with main app window
                window.location.replace("./index.html")

            }, function (error) {
                console.log('Signout Failed')
            });
    });

    // Handle an onclick event on the Train Admin submit/update button
    $("#add-train-btn").on("click", function () {

        // Stop default form behavior
        event.preventDefault();

        // Grabs user input from add/update form
        var name = $("#name-input").val().trim();
        var destination = $("#destination-input").val().trim();
        var time = $("#time-input").val().trim();
        var freq = $("#freq-input").val().trim();

        // Update a row
        if (isUpdate) {

            var updateTrain = {
                name: name,
                destination: destination,
                time: time,
                freq: freq
            };

            var updates = {};
            updates[uid] = updateTrain;
            firebase.database().ref().update(updates);

        }

        // Creates local "temporary" object for holding train data
        else {

            var newTrain = {
                name: name,
                destination: destination,
                time: time,
                freq: freq
            };

            // Uploads train data to the database
            database.ref().push(newTrain);
        }

        isUpdate = false;
        $("#trainForm").text("Add Train");
        $("#add-train-btn").text("Add Train");

        // Clears all of the text-boxes
        $("#name-input").val("");
        $("#destination-input").val("");
        $("#start-input").val("");
        $("#freq-input").val("");
    });

    database.ref().on("child_added", function (childSnapshot) {
        // Store everything into a variable.
        var key = childSnapshot.key;
        var name = childSnapshot.val().name;
        var destination = childSnapshot.val().destination;
        firstTime = childSnapshot.val().time;
        freq = childSnapshot.val().freq;

        // Compute time values
        computeTime();

        // Create update and remove buttons
        var updateButton = $("<button>").html("<span class='glyphicon glyphicon-edit'>U</span>").addClass("updateButton").attr("data-key", key);
        var removeButton = $("<button>").html("<span class='glyphicon glyphicon-remove'>R</span>").addClass("removeButton").attr("data-key", key);

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
        newRow.attr("data-key", key);

        // Append the new row to the table
        $("#train-table > tbody").append(newRow);
    });

    // Update the train table view after a DB change - all except add
    function updateTrains() {

        // Empty table except for header row
        // https://stackoverflow.com/questions/370013/jquery-delete-all-table-rows-except-first
        $("#train-table").find("tr:gt(0)").remove();

        // Loop through the current train data and
        // create new rows in the table
        database.ref().once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                // Store everything into a variable.
                var key = childSnapshot.key;
                var name = childSnapshot.val().name;
                var destination = childSnapshot.val().destination;
                firstTime = childSnapshot.val().time;
                freq = childSnapshot.val().freq;

                // Compute time values
                computeTime();

                // Create update and remove buttons
                var updateButton = $("<button>").html("<span class='glyphicon glyphicon-edit'>U</span>").addClass("updateButton").attr("data-key", key);
                var removeButton = $("<button>").html("<span class='glyphicon glyphicon-remove'>R</span>").addClass("removeButton").attr("data-key", key);

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
                newRow.attr("data-key", key);

                // Append the new row to the table
                $("#train-table > tbody").append(newRow);

            });
        });
    }

    // When a child removed update the train table
    database.ref().on("child_removed", function (childSnapshot) {
        updateTrains();
    });

    // When a child updated update the train table
    database.ref().on("child_changed", function (childSnapshot) {
        updateTrains();
    });

    // Compute train times using moment.js
    function computeTime() {

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");

        // Current Time
        var currentTime = moment();

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

        // Time apart (remainder)
        var tRemainder = diffTime % freq;

        // Minute Until Train
        minutesAway = freq - tRemainder;

        // Next Train
        nextArrival = moment().add(minutesAway, "minutes");
        nextArrival = moment(nextArrival).format("HH:mm");
    }

    // Variable mainIntervalObj will hold the setInterval 
    // to update train arrivals
    var mainClockRunning = false;
    var mainIntervalObj = null;

    // Start the timer
    function startTimer() {
        if (!mainClockRunning) {
            // Use mainIntervalObj to hold the setInterval to 
            // update the train arrivals every minute - we check every 5 seconds
            mainIntervalObj = setInterval(incrementArrival, 5000);
            mainClockRunning = true;
        }
    }

    // Update arrival times
    function incrementArrival() {

        // Run through each row
        $('#train-table tr').each(function (i, row) {
            if (!($(row)[0].cells[0].innerText.trim() === "Train Name")) {

                firstTime = $(row)[0].cells[2].textContent;
                freq = $(row)[0].cells[3].textContent;
                computeTime();
                $(row)[0].cells[4].textContent = nextArrival;
                $(row)[0].cells[5].textContent = minutesAway;
            }
        });

    }

    // Handle table cell button clicks
    $(document).on("click", ".removeButton", removeRow);
    $(document).on("click", ".updateButton", updateRow);

    // Remove a row from the train table - update the DB - refresh the page
    function removeRow() {
        console.log("Remove row ");
        console.log($(this).attr("data-key"));
        database.ref().child($(this).attr("data-key")).remove();
        reload_page();
    };

    // Update a row in the train table - update the DB - refresh the page
    function updateRow() {
        isUpdate = true;
        $("#trainForm").text("Update Train");
        $("#add-train-btn").text("Update Train");
        var thisKey = $(this).attr("data-key");
        uid = thisKey;
        $('#train-table tr').each(function (i, row) {
            if (i > 0) {
                if ($(this).attr("data-key") === thisKey) {
                    $("#name-input").val($(row)[0].cells[0].innerText.trim());
                    $("#destination-input").val($(row)[0].cells[1].innerText.trim());
                    $("#time-input").val($(row)[0].cells[2].innerText.trim());
                    $("#freq-input").val($(row)[0].cells[3].innerText.trim());
                }
            }
        });
    };

    // Reload the page
    function reload_page() {
        window.location.reload();
    }

});