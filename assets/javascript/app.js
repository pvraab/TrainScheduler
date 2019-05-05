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
        console.log("Added");
        console.log(childSnapshot.val());

        // Store everything into a variable.
        var key = childSnapshot.key;
        console.log("Key " + key);
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

        console.log("Update trains");

        // Empty table except for header row
        // https://stackoverflow.com/questions/370013/jquery-delete-all-table-rows-except-first
        $("#train-table").find("tr:gt(0)").remove();

        // Loop through the current train data and
        // create new rows in the table
        database.ref().once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                console.log(childKey);
                console.log(childData);

                // Store everything into a variable.
                var key = childSnapshot.key;
                console.log("Key " + key);
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

    database.ref().on("child_removed", function (childSnapshot) {
        console.log("Removed");
        console.log(childSnapshot.val());
        console.log(childSnapshot.key);
        updateTrains();
    });

    database.ref().on("child_changed", function (childSnapshot) {
        console.log("Updated");
        console.log(childSnapshot.val());
        console.log(childSnapshot.key);
        updateTrains();
    });

    // Compute train times
    function computeTime() {
        // console.log("In computeTime " + firstTime);

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
        // console.log(firstTimeConverted);

        // Current Time
        var currentTime = moment();
        // console.log("CURRENT TIME: " + moment(currentTime).format("HH:mm"));

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // console.log("DIFFERENCE IN TIME: " + diffTime);

        // Time apart (remainder)
        var tRemainder = diffTime % freq;
        // console.log(tRemainder);

        // Minute Until Train
        minutesAway = freq - tRemainder;
        // console.log("MINUTES TILL TRAIN: " + minutesAway);

        // Next Train
        nextArrival = moment().add(minutesAway, "minutes");
        nextArrival = moment(nextArrival).format("HH:mm");
        // console.log("ARRIVAL TIME: " + nextArrival);
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
        // console.log("In incrementArrival");

        //run through each row
        $('#train-table tr').each(function (i, row) {
            // console.log($(row));
            // console.log($(row)[0].cells[0].innerHTML);
            if (!($(row)[0].cells[0].innerText.trim() === "Train Name")) {

                firstTime = $(row)[0].cells[2].textContent;
                freq = $(row)[0].cells[3].textContent;
                computeTime();
                $(row)[0].cells[4].textContent = nextArrival;
                $(row)[0].cells[5].textContent = minutesAway;
            }
        });

    }

    // This function will replace display whatever image it's given
    // in the 'src' attribute of the img tag.
    function displayImage() {
        $("#wrapper").css('background-image', 'url("' + images[count] + '")');
    }

    $(document).on("click", ".removeButton", removeRow);
    $(document).on("click", ".updateButton", updateRow);

    function removeRow() {
        console.log("Remove row ");
        console.log($(this).attr("data-key"));
        database.ref().child($(this).attr("data-key")).remove();
        reload_page();
    };

    function updateRow() {
        isUpdate = true;
        $("#trainForm").text("Update Train");
        $("#add-train-btn").text("Update Train");
        console.log("Update row ");
        console.log($(this).attr("data-key"));

        var thisKey = $(this).attr("data-key");
        uid = thisKey;
        $('#train-table tr').each(function (i, row) {
            console.log(i);
            console.log(row);
            if (i > 0) {
                console.log($(this).attr("data-key"));

                if ($(this).attr("data-key") === thisKey) {
                    $("#name-input").val($(row)[0].cells[0].innerText.trim());
                    $("#destination-input").val($(row)[0].cells[1].innerText.trim());
                    $("#time-input").val($(row)[0].cells[2].innerText.trim());
                    $("#freq-input").val($(row)[0].cells[3].innerText.trim());
                }
            }
        });

        // database.ref().child($(this).attr("data-key")).remove();
        // reload_page();
    };

    function reload_page() {
        console.log("reload");
        window.location.reload();
    }

});