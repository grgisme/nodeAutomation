/**
 * Created by Garrett on 3/8/2016.
 */
//Load the fs & zombie modules
var fs = require('fs');
var config = require('./config.json');
//var request = require('request');
var rest = require('restler');
var tmp = require('tmp');
var converter = require('json-2-csv');
var deasync = require('deasync');
//const Browser = require('zombie');
var done = false;
var data;
var numDone = 0;


var SURFBrowser = require("./SURFBrowser");

var surf = new SURFBrowser();
surf.setCredentials(config.surfUsername, config.surfPassword);
surf.grabDeployments(processDeployments);
deasync.loopWhile(function(){if(numDone < 1) return false; else return true;});
surf.grabResourcePlans(processResourcePlans);
deasync.loopWhile(function(){if(numDone < 2) return false; else return true;});
surf.grabTimeCards(processTimeCards);
deasync.loopWhile(function(){if(numDone < 3) return false; else return true;});
surf.close();


function processDeployments(text) {
    console.log("Processing Deployments");
    postJSONToImportSet("u_import_deployment",text);
}

function processResourcePlans(text) {
    console.log("Processing Resource Plans");
    postJSONToImportSet("u_import_resource_plans", text);
}

function processTimeCards(text) {
    console.log("Processing Time Cards");
    console.log("Doing nothing to process Time Cards for now.");
    //postJSONToImportSet("u_import_resource_plans", text);
    numDone++;
}

function textToFile(text, fileName) {
    return fs.writeFileSync(fileName, text);
}

function json2csv(theArray) {

    converter.json2csv(theArray, function cb(err, res) { data = res; done = true; }, { "checkSchemaDifferences": false });
    deasync.loopWhile(function(){return !done;});
    return data;
}

function postJSONToImportSet(importSetName, text) {

    var result = JSON.parse(text);
    //var objArray = normalizeJSON(result.records);


    var csv = json2csv(result.records);

    var fileName = importSetName+"_tmp.csv";
    textToFile(csv, fileName);

    fs.stat(fileName, function(err, stats) {
        rest.post(config.cernaHubURL+"/sys_import.do?sysparm_import_set_tablename="+importSetName+"&sysparm_transform_after_load=true", {
            multipart: true,
            username: config.cernaHubUsername,
            password: config.cernaHubPassword,
            data: {
                'uploadfile': rest.file(fileName, null, stats.size, null, 'text/csv')
            }
        }).on("complete", function(data) {
            fs.unlinkSync(fileName);
            numDone++;
        });
    });
}