/**
 * Created by Garrett on 3/8/2016.
 */
//Load the fs & zombie modules
var fs = require('fs');
var config = require('./config.json');
var de_async = require('deasync');
var SURFBrowser = require("./SURFBrowser");
var ServiceNowConnector = require("./ServiceNowConnector.js");

//Initialize CernaHub connector
var hub = new ServiceNowConnector(config.cernaHubURL, config.cernaHubUsername, config.cernaHubPassword);

var timeCards = hub.getRecords("time_card", "u_surf_synced=false^u_submitted=false^u_project.u_direct=false^u_user.u_surf_username!=''^u_user.u_surf_password_decrypted!=''");

if(timeCards !== false) {
    console.log("Found "+timeCards.length+" time cards.");
    if(timeCards.length == 0) {
        console.log("Debug output:");
        for(var x in timeCards)
            console.log(x+": "+timeCards[x]);
    }
    for(var i=0; i<timeCards.length; i++) {
        var timeCard = timeCards[i];
        //noinspection JSUnresolvedVariable
        var user = hub.getSingleRecord("sys_user", timeCard.user);
        if(user === false) {
            console.log("Error: User record not successfully grabbed. Time card being skipped.");
            continue;
        }
        user = user[0];
        //Submit the time cards we found...
        //noinspection JSUnresolvedVariable
        var timeCardObj = {
            "account": timeCard.dv_u_project,
            "deployment": timeCard.dv_u_deployment,
            "resourcePlan": timeCard.dv_u_resource_plan,
            "sunday": timeCard.sunday,
            "monday": timeCard.monday,
            "tuesday": timeCard.tuesday,
            "wednesday": timeCard.wednesday,
            "thursday": timeCard.thursday,
            "friday": timeCard.friday,
            "saturday": timeCard.saturday,
            "sundayNotes": timeCard.u_sunday_notes,
            "mondayNotes": timeCard.u_monday_notes,
            "tuesdayNotes": timeCard.u_tuesday_notes,
            "wednesdayNotes": timeCard.u_wednesday_notes,
            "thursdayNotes": timeCard.u_thursday_notes,
            "fridayNotes": timeCard.u_friday_notes,
            "saturdayNotes": timeCard.u_saturday_notes
        };
        var tcDone = false;
        //Initialize SURFBrowser
        var surf = new SURFBrowser();
        //noinspection JSUnresolvedVariable
        surf.setCredentials(user.u_surf_username, user.u_surf_password_decrypted);
        surf.insertTimeCard(timeCardObj, function() {
            console.log("Time Card Submitted");
            tcDone = true;
        }, true);
        de_async.loopWhile(function(){//noinspection JSReferencingMutableVariableFromClosure
            return !tcDone;
        });
        //Flag time card as updated.
        //noinspection JSUnresolvedVariable
        hub.updateRecord("time_card", timeCard.sys_id, {
            "u_submitted": "true",
            "u_surf_submitted": "true"
        });
    }
}
else {
    console.log("Error occurred, no time cards processed.");
}
