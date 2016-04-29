/**
 * Created by Garrett on 3/8/2016.
 */
var fs = require('fs');
var config = require('./config.json');
var de_async = require('deasync');
var SURFBrowser = require("./SURFBrowser");
var ServiceNowConnector = require("./ServiceNowConnector.js");
var moment = require("moment");
var timestamps;
if(fs.existsSync("timestamps.json"))
    timestamps = require("./timestamps.json");
else
    timestamps = {};
var currentDate = String(moment.format('YYYY-MM-DD'));

//Used for de_async purposes
var numDone = 0;

//Initialize CernaHub connector
var hub = new ServiceNowConnector(config.cernaHubURL, config.cernaHubUsername, config.cernaHubPassword);

//Initialize SURFBrowser
var surf = new SURFBrowser();
surf.setCredentials(config.surfUsername, config.surfPassword);

//Grab the Deployments and upload to CernaHub
surf.grabDeployments(function(text) {
    hub.postJSONToImportSet("u_import_deployment",text);
    numDone++;
    timestamps.lastDeploymentGrab = currentDate;
});
de_async.loopWhile(function(){return (numDone < 1);});

//Grab the Resource Plans and upload to CernaHub
surf.grabResourcePlans(function(text) {
    console.log("Processing Resource Plans");
    hub.postJSONToImportSet("u_import_resource_plans", text);
    numDone++;
    timestamps.lastResourceGrab = currentDate;
});
de_async.loopWhile(function(){return (numDone < 2);});

//Grab the Time Cards and upload to CernaHub
surf.grabTimeCards(function(text) {
    console.log("Processing Time Cards");
    hub.postJSONToImportSet("u_import_time_cards_from_surf", text);
    numDone++;
    timestamps.lastTimeCardGrab = currentDate;
});
de_async.loopWhile(function(){return (numDone < 3);});

fs.writeFileSync("timecards.json", JSON.stringify(timestamps));