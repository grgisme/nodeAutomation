var fs = require('fs');
var rest = require('restler');
var converter = require('json-2-csv');
var de_async = require('deasync');
var mime = require('mime');

/*
 * @param this.username
 */
function ServiceNowConnector(url, username, password) {
    this.setCredentials(username, password);
    this.setURL(url);
}

ServiceNowConnector.prototype.setCredentials = function (username, password) {
    this.username = username;
    this.password = password;
};

ServiceNowConnector.prototype.setURL = function (url) {
    this.url = url;
};

ServiceNowConnector.prototype._jsonToCSV = function(theArray) {
    var done = false;
    var data = false;
    converter.json2csv(theArray, function cb(err, res) { data = res; done = true; }, { "checkSchemaDifferences": false, "emptyFieldValue": "" });
    de_async.loopWhile(function(){return !done;});
    return data;
};

ServiceNowConnector.prototype._post = function(url, options) {
    var postDone = false;
    var postResponse = false;
    rest.post(url, options)
        .on("complete", function(data) {
            postDone = true;
            postResponse = data;
        });
    de_async.loopWhile(function(){return !postDone;});
    return postResponse;
};

ServiceNowConnector.prototype._postFileToImportSet = function(importSetName, fileName) {

    var stats = fs.statSync(fileName);
    var mimeType = mime.lookup(fileName);
    return this._post(this.url+"/sys_import.do?sysparm_import_set_tablename="+importSetName+"&sysparm_transform_after_load=true", {
        multipart: true,
        username: this.username,
        password: this.password,
        data: {
            'uploadfile': rest.file(fileName, null, stats.size, null, mimeType)
        }
    });
};

ServiceNowConnector.prototype.postJSONToImportSet = function(importSetName, text) {
    var result;
    try {
        result = JSON.parse(text);
    }
    catch(err) {
        console.log("ERROR: "+importSetName+" will not be processed properly due to JSON parsing error.");
        fs.writeFileSync(importSetName+"_json.json", text);
        return false;
    }
    //var objArray = normalizeJSON(result.records);


    //noinspection JSUnresolvedVariable
    var csv = this._jsonToCSV(result.records);

    fs.writeFileSync(fileName, csv);

    result = this._postFileToImportSet(importSetName, fileName);
    if(result !== false)
        console.log("Successfully posted "+importSetName);
    fs.unlinkSync(fileName);
    return result;
};


if (typeof module === 'object')
    module.exports = ServiceNowConnector;