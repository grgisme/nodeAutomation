/**
 * Created by Garrett on 3/8/2016.
 */
var Horseman = require("node-horseman");

var SURFBrowser = function () {
    // do we have an existing instance?
    if (typeof SURFBrowser.instance === 'object') {
        return SURFBrowser.instance;
    }

    this.browser = new Horseman({"timeout": 30000});
    this.loggedIn = false;

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
    this.username = username;
    this.password = password;
};

SURFBrowser.prototype.setUsername = function (username) {
    this.username = username;
};

SURFBrowser.prototype.setPassword = function (password) {
    this.password = password;
};

SURFBrowser.prototype.login = function() {

    //if(this.username == undefined || this.username == "" || this.password == undefined || this.password == "")
    //    return false;

    return new Promise( function( resolve, reject ){
        return SURFBrowser().browser
            .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
            .on('resourceError', function(resourceError) { console.log(resourceError.errorString); console.log(resourceError.url); })
            .on('timeout', function(msg){ console.log(msg); })
            .on('loadFinished', function(status) { console.log(status); })
            .open('https://surf.service-now.com/')
            .waitForSelector('#username')
            .log("At Login Page")
            .screenshot("loginpage.png")
            .text('h1.headingText')
            .type('#username', SURFBrowser().username)
            //.keyboardEvent("keypress", 16777217)
            .type('#password', SURFBrowser().password)
            .click("#submitButton")
            .waitForSelector('#mainBannerImage16')
            .wait(5000)
            .log("At SURF Home Page")
            .screenshot("homepage.png")
            .then(SURFBrowser().markLoggedIn)
            .then( resolve );
    });
};

SURFBrowser.prototype.grabTimeCards = function(callBackFunction) {
    this.browser
        .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
        .open('https://google.com/')
        .then(this.login)
        .open("https://surf.service-now.com/time_card_list.do?JSONv2")
        .waitForNextPage()
        .wait(5000)
        .text()
        .then(callBackFunction);
};

SURFBrowser.prototype.grabDeployments = function(callBackFunction) {
    this.browser
        .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
        .open('https://google.com/')
        .then(this.login)
        .open("https://surf.service-now.com/u_deployment_list.do?JSONv2")
        .waitForNextPage()
        .wait(5000)
        .text()
        .then(callBackFunction);
};

SURFBrowser.prototype.grabDeploymentsCSV = function(callBackFunction) {
    this.browser
        .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
        .open('https://google.com/')
        .then(this.login)
        .open("https://surf.service-now.com/u_deployment_list.do?CSV")
        .waitForNextPage()
        .wait(25000)
        .text()
        .then(callBackFunction);
};

SURFBrowser.prototype.grabResourcePlans = function(callBackFunction) {
    this.browser
        .userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
        .open('https://google.com/')
        .then(this.login)
        .open("https://surf.service-now.com/u_billing_rates_list.do?JSONv2")
        .waitForNextPage()
        .wait(5000)
        .text()
        .then(callBackFunction);
};

SURFBrowser.prototype.markLoggedIn = function() {
    this.loggedIn = true;
};

SURFBrowser.prototype.close = function() {
    this.browser.close();
};


if (typeof module === 'object')
    module.exports = SURFBrowser;