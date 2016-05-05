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
var currentDate = String(moment().format('YYYY-MM-DD'));

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




var QuickBooks = require('node-quickbooks');
var qbo = new QuickBooks(config.qbConsumerKey,
    config.qbConsumerSecret,
    config.qbAuthToken,
    config.qbAuthSecret,
    config.qbRealmID,
    false, // don't use the sandbox (i.e. for testing)
    false); // turn debugging on
var done = false;

//First sync the Employees
var employees = false;
done = false;
qbo.findEmployees({
    desc: 'MetaData.LastUpdatedTime'
}, function(err, theEmployees) {
    employees = theEmployees;
    done = true;
});

de_async.loopWhile(function(){return (!done);});

//noinspection JSUnresolvedVariable
hub.postArrayToImportSet("u_import_qb_employees",employees.QueryResponse.Employee);



//Next Sync the Customer Accounts

var customers = false;
done = false;
qbo.findCustomers({
    desc: 'MetaData.LastUpdatedTime'
}, function(err, theCustomers) {
    customers = theCustomers;
    done = true;
});

de_async.loopWhile(function(){return (!done);});

//noinspection JSUnresolvedVariable
hub.postArrayToImportSet("u_import_qb_customers",customers.QueryResponse.Customer);


//Now sync the Time Cards
var timeEntries = false;
done = false;
qbo.findTimeActivities({
    desc: 'MetaData.LastUpdatedTime'
}, function(err, timeActivities) {
    timeEntries = timeActivities;
    done = true;
});

de_async.loopWhile(function(){return (!done);});

//noinspection JSUnresolvedVariable
hub.postArrayToImportSet("u_import_qb_time_cards",timeEntries.QueryResponse.TimeActivity);

fs.writeFileSync("timestamps.json", JSON.stringify(timestamps));