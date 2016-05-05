/**
 * Created by Garrett on 3/8/2016.
 */
var fs = require('fs');
var config = require('./config.json');
var de_async = require('deasync');
var ServiceNowConnector = require("./ServiceNowConnector.js");
var moment = require("moment");

var QuickBooks = require('node-quickbooks')

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
var hub = new ServiceNowConnector(config.cernaHubURL, config.cernaHubUsername, config.cernaHubPassword);


var timeEntries = false;
var done = false;
qbo.findTimeActivities({
    desc: 'MetaData.LastUpdatedTime',
    limit: 5,
    offset: 0
}, function(err, timeActivities) {
    timeEntries = timeActivities;
    done = true;
});

de_async.loopWhile(function(){return (!done);});

var i=0;


//noinspection JSUnresolvedVariable
var csv = this._jsonToCSV(timeEntries.QueryResponse.TimeActivity);
var fileName = "qbTimeCards_tmp.csv";

fs.writeFileSync(fileName, csv);
/*
timeEntries.QueryResponse.TimeActivity.forEach(function(timeEntry) {
    i = i+1;
    if(i== 1) {
        for(var x in timeEntry) {
            
        }
    }
    console.log(timeEntry.Description);
});
*/

//fs.writeFileSync("timecards.json", JSON.stringify(timestamps));