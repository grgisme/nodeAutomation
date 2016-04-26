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


var SURFBrowser = require("./SURFBrowser");

var surf = new SURFBrowser();
surf.setCredentials(config.surfUsername, config.surfPassword);
surf.grabDeployments(processDeployments);
//surf.grabDeploymentsCSV(processDeploymentsCSV);




function processDeployments(text) {
    console.log("Made it to the callback function.");
    postJSONToImportSet("u_import_deployment",text);
    surf.close();
}
function processDeploymentsCSV(text) {
    console.log("Made it to the callback function.");
    postCSVToImportSet("u_import_deployment",text);
    surf.close();
}

function normalizeJSON(theArr) {
    var keys = [];
    for(var i=0; i<theArr.length; i++) {
        var obj = theArr[i];
        for(var x in obj) {
            if(keys.indexOf(x) < 0)
                keys.push(x);
        }
    }
    for(var j=0; j<theArr.length; j++) {
        var theObj = theArr[j];
        for(var k in keys) {
            if(typeof theObj[k] == "undefined") {
                theObj[k] = "";
            }
        }
    }
    return theArr;
}

function textToFile(text, fileName) {
    return fs.writeFileSync(fileName, text);
}

function postCSVToImportSet(importSetName, csv) {
    var tmpobj = tmp.fileSync();
    var fileName = tmpobj.name;
    textToFile(csv, fileName);
    fs.writeFileSync("deployments.csv", csv);

    fs.stat(fileName, function(err, stats) {
        rest.post(config.cernaHubURL+"/sys_import.do?sysparm_import_set_tablename="+importSetName+"&sysparm_transform_after_load=true", {
            multipart: true,
            username: config.cernaHubUsername,
            password: config.cernaHubPassword,
            data: {
                'uploadfile': rest.file(fileName, null, stats.size, null, 'text/csv')
            }
        }).on("complete", function(data) {
            console.log(data);
        });
    });
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
        });
    });
    /*
     var timecards = JSON.parse(text);
     timecards = timecards.records;
     console.log("Number of TimeCards Grabbed: "+timecards.length);
     console.log(timecards[0]);
     */
}