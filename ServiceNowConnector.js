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
    this.CREATE = "CREATE";
    this.UPDATE = "UPDATE";
    this.SINGLE = "SINGLE";
    this.QUERY = "QUERY";
    this.DELETE = "DELETE";
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
    var fileName = importSetName+"_tmp.csv";

    fs.writeFileSync(fileName, csv);

    result = this._postFileToImportSet(importSetName, fileName);
    if(result !== false)
        console.log("Successfully posted "+importSetName);
    fs.unlinkSync(fileName);
    return result;
};


ServiceNowConnector.prototype.getSingleRecord = function(table, recordID) {
    return this._makeJSONCall(table, this.SINGLE, recordID);
};

ServiceNowConnector.prototype.getRecords = function(table, query) {
    if(typeof query == "undefined")
        query = "";
    return this._makeJSONCall(table, this.QUERY, false, query);
};

ServiceNowConnector.prototype.createRecord = function(table, data) {
    return this._makeJSONCall(table, this.CREATE, false, false, data);
};

ServiceNowConnector.prototype.updateRecord = function(table, recordID, data) {
    var query = "sysparm_sys_id="+recordID;
    return this._makeJSONCall(table, this.UPDATE, false, query, data);
};

ServiceNowConnector.prototype.deleteRecord = function(table, recordID) {
    return this._makeJSONCall(table, this.DELETE, recordID);
};

ServiceNowConnector.prototype._makeJSONCall = function(table, type, sys_id, query, data) {

    var url = table+".do?JSONv2";
    if(typeof data == "undefined") {
        data = {};
    }
    if(typeof data != "object") {
        return false;
    }

    if(type == this.CREATE) {
        data.sysparm_action = "insert";
        url = url + "&sysparm_action=insert";
    }
    else if(type == this.UPDATE) {
        data.sysparm_action = "update";
        url = url + "&sysparm_action=update";

        if(typeof query != "undefined" && query != "") {
            data.sysparm_query = query;
        }
        else return false;
    }
    else if(type == this.DELETE) {
        data.sysparm_action = "deleteRecord";
        url = url + "&sysparm_action=deleteRecord";

        if(typeof sys_id != "undefined" && sys_id != "") {
            data.sysparm_sys_id = sys_id;
        }
        else return false;
    }
    else if(type == this.SINGLE) {
        data.sysparm_action = "get";
        data.displayvalue = "all";
        url = url + "&sysparm_action=get";

        if(typeof sys_id != "undefined" && sys_id != "") {
            data.sysparm_sys_id = sys_id;
        }
        else return false;
    }
    else if(type == this.QUERY) {
        data.sysparm_action = "getRecords";
        data.displayvalue = "all";
        url = url + "&sysparm_action=getRecords";

        if(typeof query != "undefined" && query != "") {
            data.sysparm_query = query;
        }
        else return false;
    }

    var response = this._post(this.url + url, {
        username: this.username,
        password: this.password,
        data: data
    });

    try {
        response = JSON.parse(String(response));
    }
    catch(e) {
        console.log("ERROR: JSON Parse of ServiceNow JSONv2 Query failed. -- "+e);
        console.log(String(response));
        return false;
    }


    if(typeof response.error != "undefined") {
        console.log("ERROR: "+response.error);
        return false;
    }
    else { //noinspection JSUnresolvedVariable
        if(typeof response.records == "undefined") {
                console.log("ERROR: No records elements found.");
                return false;
            }
    }

    //noinspection JSUnresolvedVariable
    return response.records;

};

if (typeof module === 'object')
    module.exports = ServiceNowConnector;