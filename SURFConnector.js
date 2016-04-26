/**
 * Created by Garrett on 3/8/2016.
 */
//Load the fs & zombie modules
var fs = require('fs');
var config = require('./config.json');
//var request = require('request');
var rest = require('restler');
var tmp = require('tmp');
//const Browser = require('zombie');


var SURFBrowser = require("./SURFBrowser");

var surf = new SURFBrowser();
surf.setCredentials(config.surfUsername, config.surfPassword);
surf.grabDeploymentsCSV(processDeployments);




function processDeployments(text) {
    postToImportSet("u_import_deployment",text);
}

function textToFile(text, fileName) {
    return fs.writeFileSync(fileName, text);
}

function postToImportSet(importSetName, text) {

    var tmpobj = tmp.fileSync();
    var fileName = tmpobj.name;
    textToFile(text, fileName);
    fs.writeFileSync("deployments.csv", text);

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
    /*
     var timecards = JSON.parse(text);
     timecards = timecards.records;
     console.log("Number of TimeCards Grabbed: "+timecards.length);
     console.log(timecards[0]);
     */
}