/**
 * Created by Garrett on 3/8/2016.
 */
//Load the fs & zombie modules
var fs = require('fs');
var Horseman = require("node-horseman");
var config = require('config.json');
//const Browser = require('zombie');


var SURFBrowser = require("./SURFBrowser");

var surf = new SURFBrowser();
surf.setCredentials(config.surfUsername, config.surfPassword);
surf.grabDeployments(processTimeCards);




function processTimeCards(text) {

    var auth = "Basic " + new Buffer(config.cernaHubUsername + ":" + config.cernaHubPassword).toString("base64");
    var request = require('request');

    request(
        {
                url : config.cernaHubURL+"sys_import.do?sysparm_import_set_tablename=u_import_deployment&sysparm_transform_after_load=true",
            headers : {
                "Authorization" : auth
            }
        },
        function (error, response, body) {
            // Do more stuff with 'body' here
        }
    );
    var req = request.post(url, function (err, resp, body) {
        if (err) {
            console.log('Error!');
        } else {
            console.log('URL: ' + body);
        }
    });
    var form = req.form();
    form.append('file', fs.createReadStream(filepath));

    fs.writeFile("deployments.csv", text);
    surf.close();
    /*
    var timecards = JSON.parse(text);
    timecards = timecards.records;
    console.log("Number of TimeCards Grabbed: "+timecards.length);
    console.log(timecards[0]);
    */
}