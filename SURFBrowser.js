/**
 * Created by Garrett on 3/8/2016.
 */
var Horseman = require("node-horseman");
var fs = require("fs");
var timestamps;
if(fs.existsSync("timestamps.json"))
    timestamps = require("./timestamps.json");
else
    timestamps = {};

var SURFBrowser = function () {
    // do we have an existing instance?
    if (typeof SURFBrowser.instance === 'object') {
        return SURFBrowser.instance;
    }

    // cache
    SURFBrowser.instance = this;
};

SURFBrowser.getInstance = function() {
    // do we have an existing instance?
    if (typeof SURFBrowser.instance === 'object') {
        return SURFBrowser.instance;
    }

    return new SURFBrowser();

};

SURFBrowser.prototype.setCredentials = function (username, password) {
    this.setUsername(username);
    this.setPassword(password);
};

SURFBrowser.prototype.setUsername = function (username) {
    this.username = username;
};

SURFBrowser.prototype.setPassword = function (password) {
    this.password = password;
};

SURFBrowser.prototype.grabTimeCards = function(callBackFunction) {
    var query = "https://surf.service-now.com/time_card_list.do?JSONv2&displayvalue=true";
    //noinspection JSUnresolvedVariable
    if(typeof timestamps.lastTimeCardGrab != "undefined") {
        //noinspection JSUnresolvedVariable
        query = query + "sysparm_query=sys_updated_on>="+timestamps.lastTimeCardGrab+" 00:00:00";
    }
    new Horseman()
        .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
        .log("About to grab Time Cards -- logging in")
        .open('https://surf.service-now.com/')
        .waitForSelector('#username')
        .log("At Login Page")
        .text('h1.headingText')
        .type('#username', SURFBrowser().username)
        .type('#password', SURFBrowser().password)
        .click("#submitButton")
        .waitForSelector('#mainBannerImage16')
        .wait(5000)
        .log("At SURF Home Page")
        .log("Logged In, now going to grab the time card list")
        .open(query)
        .wait(15000)
        .text('pre')
        .then(callBackFunction)
        .close();
};

SURFBrowser.prototype.grabDeployments = function(callBackFunction) {
    var query = "https://surf.service-now.com/u_deployment_list.do?JSONv2&displayvalue=true";
    //noinspection JSUnresolvedVariable
    if(typeof timestamps.lastDepartmentGrab != "undefined") {
        //noinspection JSUnresolvedVariable
        query = query + "sysparm_query=sys_updated_on>="+timestamps.lastDepartmentGrab+" 00:00:00";
    }
    new Horseman()
        .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
        .log("About to grab Deployments -- logging in")
        .open('https://surf.service-now.com/')
        .waitForSelector('#username')
        .log("At Login Page")
        .text('h1.headingText')
        .type('#username', SURFBrowser().username)
        .type('#password', SURFBrowser().password)
        .click("#submitButton")
        .waitForSelector('#mainBannerImage16')
        .wait(5000)
        .log("At SURF Home Page")
        .log("Logged In, now going to grab the deployment list")
        .open(query)
        .wait(15000)
        .text('pre')
        .then(callBackFunction)
        .close();
};

SURFBrowser.prototype.grabResourcePlans = function(callBackFunction) {
    var query = "https://surf.service-now.com/u_billing_rates_list.do?JSONv2&displayvalue=true";
    //noinspection JSUnresolvedVariable
    if(typeof timestamps.lastResourceGrab != "undefined") {
        //noinspection JSUnresolvedVariable
        query = query + "sysparm_query=sys_updated_on>="+timestamps.lastResourceGrab+" 00:00:00";
    }
    new Horseman()
        .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
        .log("About to grab Resource Plans -- logging in")
        .open('https://surf.service-now.com/')
        .waitForSelector('#username')
        .log("At Login Page")
        .text('h1.headingText')
        .type('#username', SURFBrowser().username)
        .type('#password', SURFBrowser().password)
        .click("#submitButton")
        .waitForSelector('#mainBannerImage16')
        .wait(5000)
        .log("At SURF Home Page")
        .log("Logged In, now going to grab the resource plan list")
        .open(query)
        .wait(15000)
        .text('pre')
        .then(callBackFunction)
        .close();
};
/**
 * @param timeCard                  TimeCard object with all the pertinent information about the time card record to submit.
 * @param callBackFunction          Function to call when finished
 * @param timeCard.account          Account name for time card.
 * @param timeCard.deployment       Deployment Number for time card.
 * @param timeCard.resourcePlan     Resource Plan Number for time card.
 * @param timeCard.sunday           Hours for Sunday for time card.
 * @param timeCard.sundayNotes      Notes for Sunday for time card.
 * @param timeCard.monday           Hours for Monday for time card.
 * @param timeCard.mondayNotes      Notes for Monday for time card.
 * @param timeCard.tuesday          Hours for Tuesday for time card.
 * @param timeCard.tuesdayNotes     Notes for Tuesday for time card.
 * @param timeCard.wednesday        Hours for Wednesday for time card.
 * @param timeCard.wednesdayNotes   Notes for Wednesday for time card.
 * @param timeCard.thursday         Hours for Thursday for time card.
 * @param timeCard.thursdayNotes    Notes for Thursday for time card.
 * @param timeCard.friday           Hours for Friday for time card.
 * @param timeCard.fridayNotes      Notes for Friday for time card.
 * @param timeCard.saturday         Hours for Saturday for time card.
 * @param timeCard.saturdayNotes    Notes for Saturday for time card.
 * @param debug                     Optional parameter, if specified it won't actually submit the timecard.
 */
SURFBrowser.prototype.insertTimeCard = function(timeCard, callBackFunction, debug) {
    if(typeof debug == "undefined")
        debug = false;
    if(!debug) {
        //Don't actually submit the time card.
        new Horseman()
            .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
            .viewport(1980,1080)
            .log("About to Insert Time Card -- logging in")
            .open('https://surf.service-now.com/')
            .waitForSelector('#username')
            .log("At Login Page")
            .text('h1.headingText')
            .type('#username', SURFBrowser().username)
            .type('#password', SURFBrowser().password)
            .click("#submitButton")
            .waitForSelector('#mainBannerImage16')
            .wait(5000)
            .log("At SURF Home Page")
            .log("Logged In, now going to insert the time card")
            .open("https://surf.service-now.com/time_card.do")
            .waitForSelector('#sys_display\\.time_card\\.u_account')
            .wait(5000)
            .click("#sys_display\\.time_card\\.u_account")
            .type("#sys_display\\.time_card\\.u_account", String(timeCard.account).trim())
            .keyboardEvent("keypress", 16777217)
            .wait(2000)
            .click("#sys_display\\.time_card\\.task")
            .type("#sys_display\\.time_card\\.task", String(timeCard.deployment).trim())
            .keyboardEvent("keypress", 16777217)
            .wait(2000)
            .click("#sys_display\\.time_card\\.u_billing_rate")
            .type("#sys_display\\.time_card\\.u_billing_rate", String(timeCard.resourcePlan).trim())
            .keyboardEvent("keypress", 16777217)
            .wait(1000)
            .click("#time_card\\.sunday")
            .wait(1000)
            .select("#time_card\\.u_work_location", "Remote")
            .wait(100)
            .click("#time_card\\.u_work_location")
            .wait(100)
            .click("#time_card\\.u_work_location")
            .wait(100)
            .select("#time_card\\.u_work_country", "US")
            .wait(100)
            .click("#time_card\\.u_work_country")
            .wait(100)
            .click("#time_card\\.u_work_country")
            .wait(100)
            .click("#time_card\\.sunday")
            .value("#time_card\\.sunday", timeCard.sunday)
            .click("#time_card\\.monday")
            .value("#time_card\\.monday", timeCard.monday)
            .click("#time_card\\.tuesday")
            .value("#time_card\\.tuesday", timeCard.tuesday)
            .click("#time_card\\.wednesday")
            .value("#time_card\\.wednesday", timeCard.wednesday)
            .click("#time_card\\.thursday")
            .value("#time_card\\.thursday", timeCard.thursday)
            .click("#time_card\\.friday")
            .value("#time_card\\.friday", timeCard.friday)
            .click("#time_card\\.saturday")
            .value("#time_card\\.saturday", timeCard.saturday)
            .click("#time_card\\.u_sunday_notes")
            .value("#time_card\\.u_sunday_notes", timeCard.sundayNotes)
            .click("#time_card\\.u_monday_notes")
            .value("#time_card\\.u_monday_notes", timeCard.mondayNotes)
            .click("#time_card\\.u_tuesday_notes")
            .value("#time_card\\.u_tuesday_notes", timeCard.tuesdayNotes)
            .click("#time_card\\.u_wednesday_notes")
            .value("#time_card\\.u_wednesday_notes", timeCard.wednesdayNotes)
            .click("#time_card\\.u_thursday_notes")
            .value("#time_card\\.u_thursday_notes", timeCard.thursdayNotes)
            .click("#time_card\\.u_friday_notes")
            .value("#time_card\\.u_friday_notes", timeCard.fridayNotes)
            .click("#time_card\\.u_saturday_notes")
            .value("#time_card\\.u_saturday_notes", timeCard.saturdayNotes)
            .wait(500)
            .click("#1acb2a93d46de1006f71c9dad778b517")
            .waitForNextPage()
            .waitForSelector('#sys_display\\.time_card\\.u_account')
            .wait(2000)
            .click("#submit_timecard")
            .waitForNextPage()
            .wait(2000)
            .then(callBackFunction)
            .close();
    }
    else {
        //Don't actually submit the time card.
        new Horseman()
            .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
            .viewport(1980,1080)
            .log("About to Insert Time Card -- logging in")
            .open('https://surf.service-now.com/')
            .waitForSelector('#username')
            .log("At Login Page")
            .text('h1.headingText')
            .type('#username', SURFBrowser().username)
            .type('#password', SURFBrowser().password)
            .click("#submitButton")
            .waitForSelector('#mainBannerImage16')
            .wait(5000)
            .log("At SURF Home Page")
            .log("Logged In, now going to insert the time card")
            .open("https://surf.service-now.com/time_card.do")
            .waitForSelector('#sys_display\\.time_card\\.u_account')
            .wait(5000)
            .screenshot("blank_time_card.png")
            .click("#sys_display\\.time_card\\.u_account")
            .type("#sys_display\\.time_card\\.u_account", String(timeCard.account).trim())
            .keyboardEvent("keypress", 16777217)
            .wait(2000)
            .click("#sys_display\\.time_card\\.task")
            .type("#sys_display\\.time_card\\.task", String(timeCard.deployment).trim())
            .keyboardEvent("keypress", 16777217)
            .wait(2000)
            .click("#sys_display\\.time_card\\.u_billing_rate")
            .type("#sys_display\\.time_card\\.u_billing_rate", String(timeCard.resourcePlan).trim())
            .keyboardEvent("keypress", 16777217)
            .wait(1000)
            .click("#time_card\\.sunday")
            .wait(1000)
            .select("#time_card\\.u_work_location", "Remote")
            .wait(100)
            .click("#time_card\\.u_work_location")
            .wait(100)
            .click("#time_card\\.u_work_location")
            .wait(100)
            .select("#time_card\\.u_work_country", "US")
            .wait(100)
            .click("#time_card\\.u_work_country")
            .wait(100)
            .click("#time_card\\.u_work_country")
            .wait(100)
            .click("#time_card\\.sunday")
            .value("#time_card\\.sunday", timeCard.sunday)
            .click("#time_card\\.monday")
            .value("#time_card\\.monday", timeCard.monday)
            .click("#time_card\\.tuesday")
            .value("#time_card\\.tuesday", timeCard.tuesday)
            .click("#time_card\\.wednesday")
            .value("#time_card\\.wednesday", timeCard.wednesday)
            .click("#time_card\\.thursday")
            .value("#time_card\\.thursday", timeCard.thursday)
            .click("#time_card\\.friday")
            .value("#time_card\\.friday", timeCard.friday)
            .click("#time_card\\.saturday")
            .value("#time_card\\.saturday", timeCard.saturday)
            .click("#time_card\\.u_sunday_notes")
            .value("#time_card\\.u_sunday_notes", timeCard.sundayNotes)
            .click("#time_card\\.u_monday_notes")
            .value("#time_card\\.u_monday_notes", timeCard.mondayNotes)
            .click("#time_card\\.u_tuesday_notes")
            .value("#time_card\\.u_tuesday_notes", timeCard.tuesdayNotes)
            .click("#time_card\\.u_wednesday_notes")
            .value("#time_card\\.u_wednesday_notes", timeCard.wednesdayNotes)
            .click("#time_card\\.u_thursday_notes")
            .value("#time_card\\.u_thursday_notes", timeCard.thursdayNotes)
            .click("#time_card\\.u_friday_notes")
            .value("#time_card\\.u_friday_notes", timeCard.fridayNotes)
            .click("#time_card\\.u_saturday_notes")
            .value("#time_card\\.u_saturday_notes", timeCard.saturdayNotes)
            .wait(500)
            .screenshot("filled_in_time_card.png")
            .click("#1acb2a93d46de1006f71c9dad778b517")
            .screenshot("saved_time_card.png")
            .waitForNextPage()
            .waitForSelector('#sys_display\\.time_card\\.u_account')
            .wait(2000)
            .screenshot("saved_time_card.png")
            .click("#submit_timecard")
            .waitForNextPage()
            .wait(2000)
            .screenshot("submitted_time_card.png")
            .then(callBackFunction)
            .close();
    }

};


if (typeof module === 'object')
    module.exports = SURFBrowser;