/**
 * Created by Garrett on 3/8/2016.
 */
//Load the fs & zombie modules
var fs = require('fs');
var config = require('./config.json');
var de_async = require('deasync');
var SURFBrowser = require("./SURFBrowser");
var ServiceNowConnector = require("./ServiceNowConnector.js");

//Used for de_async purposes
var numDone = 0;

//Initialize SURFBrowser
var surf = new SURFBrowser();
surf.setCredentials(config.surfUsername, config.surfPassword);


/**
 * @param timeCard                  TimeCard object with all the pertinent information about the time card record to submit.
 * @param callBackFunction          Function to call when finished
 * @param timeCard.account          Account name for time card.
 * @param timeCard.deployment       Deployment Number for time card.
 * @param timeCard.resourcePlan     Resource Plan Number for time card.
 * @param timeCard.sunday           Hours for Sunday for time card.
 * @param timeCard.sundayNotes      Notes for Sunday for time card.
 * @param timeCard.monday           Hours for Monday for time card.
 * @param timeCard.mondayNotes      Notes for Monday for time card.
 * @param timeCard.tuesday          Hours for Tuesday for time card.
 * @param timeCard.tuesdayNotes     Notes for Tuesday for time card.
 * @param timeCard.wednesday        Hours for Wednesday for time card.
 * @param timeCard.wednesdayNotes   Notes for Wednesday for time card.
 * @param timeCard.thursday         Hours for Thursday for time card.
 * @param timeCard.thursdayNotes    Notes for Thursday for time card.
 * @param timeCard.friday           Hours for Friday for time card.
 * @param timeCard.fridayNotes      Notes for Friday for time card.
 * @param timeCard.saturday         Hours for Saturday for time card.
 * @param timeCard.saturdayNotes    Notes for Saturday for time card.
 */
var timeCard = {
    "account": "Walt Disney Company",
    "deployment": "DPLY0040582",
    "resourcePlan": "RPN0081733",
    "sunday": 1,
    "monday": 1,
    "tuesday": 1,
    "wednesday": 1,
    "thursday": 1,
    "friday": 1,
    "saturday": 1,
    "sundayNotes": "Testing Note",
    "mondayNotes": "Testing Note",
    "tuesdayNotes": "Testing Note",
    "wednesdayNotes": "Testing Note",
    "thursdayNotes": "Testing Note",
    "fridayNotes": "Testing Note",
    "saturdayNotes": "Testing Note"
};

surf.insertTimeCard(timeCard, function() {
    console.log("Time Card Submitted");
    numDone++;
});
de_async.loopWhile(function(){return (numDone < 1);});