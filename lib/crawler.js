


var Crawler = require("simplecrawler");

var start_page = 'https://wiki.piratenpartei.de/BE:Gebietsversammlungen/Friedrichshain-Kreuzberg/Antragsportal';
var crawler = Crawler.crawl(start_page);

var conditionID = crawler.addFetchCondition(function(parsedURL) {
    return parsedURL.path.match(/Antragsportal$/i);
});

crawler.on("fetchcomplete",function(queueItem, responseBuffer, response){
    console.log("Completed fetching resource:",queueItem.url);
    //console.log(queueItem);
    //console.log(responseBuffer),
    //console.log(response);
});