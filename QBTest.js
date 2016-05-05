/**
 * Created by Garrett on 3/8/2016.
 */
var fs = require('fs');
var config = require('./config.json');
var de_async = require('deasync');
var ServiceNowConnector = require("./ServiceNowConnector.js");
var moment = require("moment");

var QuickBooks = require('node-quickbooks');

var DEBUG = true;
var sandbox = "";
if(DEBUG) {
    sandbox = "sandbox_";
}

var qbo = new QuickBooks(config.qbConsumerKey,
                            config.qbConsumerSecret,
                            config.qbAuthToken,
                            config.qbAuthSecret,
                            config.qbRealmID,
                            false, // don't use the sandbox (i.e. for testing)
                            false); // turn debugging on


var timestamps;
if(fs.existsSync("timestamps.json"))
    timestamps = require("./timestamps.json");
else
    timestamps = {};
var currentDate = String(moment().format('YYYY-MM-DD'));

//Used for de_async purposes
var numDone = 0;

//Initialize CernaHub connector
var hub = new ServiceNowConnector(config[sandbox+"cernaHubURL"], config[sandbox+"cernaHubUsername"], config[sandbox+"cernaHubPassword"]);


var done = false;
var csv;
var fileName;

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
csv = hub._jsonToCSV(timeEntries.QueryResponse.TimeActivity);
fileName = "qbTimeCards_tmp.csv";

//fs.writeFileSync(fileName, csv);


//fs.writeFileSync("timestamps.json", JSON.stringify(timestamps));