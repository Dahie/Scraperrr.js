var Tarantula = require('tarantula'),
    fs = require('fs');

/* helper */

RegExp.quote = function(str) {
    str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    return str;
};

var Motion = function() {
    return {
        id: undefined,
        title: undefined,
        summary: undefined,
        text: undefined,
        topic: undefined,
        type: undefined,
        tags: undefined,
        url: undefined,
        remarks: undefined,
        author: undefined
    };
};


var Scraperrr = function(config) {
    return {

        brain: {

            config: config,
            motions: [],
            motionsIDs: [],

            politeness: 200,

            parseMotion: function(config, motion, body) {
                match = body.match(new RegExp(config.regexTitle, 'm'));
                motion.title = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexAuthor, 'm'));
                motion.author = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexType, 'm'));
                motion.type = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexTopic, 'm'));
                motion.topic = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexSummary, 'm'));
                motion.summary = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexText, 'm'));
                motion.text = match ? match[1] : undefined;

                match = body.match(new RegExp(config.regexRemarks, 'm'));
                motion.remarks = match ? match[1] : undefined;
            },

            createMotion: function (config, body, uri) {
                var motion = new Motion(),
                    idRegEx = new RegExp(config.regexIdUrl, "");

                motion.url = uri;

                match = uri.match(idRegEx);
                motion.id = match ? match[1] : undefined;
                match = body.match(new RegExp(config.regexID, 'm'));
                motion.id = match ? match[1] : undefined;

                // check if we already know this motion id
                // if so, we do not need to proceed and skip
                if(motion.id && this.motionsIDs.indexOf(motion.id) == -1 && motion.id != '&nbsp;') {

                    this.parseMotion(config, motion, body);

                    this.motions.push(motion);
                    this.motionsIDs.push(motion.id);
                    //console.log(motion);
                }
            },

            shouldVisit: function(uri) {
                // some portals have all pages on one page.
                // In this case, we do not need to visit any detail pages
                if(!config.detail) return false;
                var re = new RegExp(config.detailUrl, "");
                return uri.match(re);
            },

            visit : function(request, response, body, $) {
                if(request.uri != config.start_page) {

                    this.createMotion(config, body, request.uri);

                } else {

                    // all motions are on the same page
                    // split into blocks

                    var motionBlocks = body.split(new RegExp(config.regexMotion, ""));

                    // parse each block

                    for (var i = 1; i < motionBlocks.length; i++) {

                        this.createMotion(config, motionBlocks[i], request.uri);

                    }

                }

            },

            onComplete: function() {
                console.log('Done, found '+ this.motions.length + ' motions for #'+config.event);

                // sort motions
                this.motions.sort(this.sortByID);

                // export as json
                this.exportJSON();
            },

            sortByID: function(compA, compB) {
                return (compA.id < compB.id) ? -1 : (compA.id > compB.id) ? 1 : 0;
            },

            exportJSON: function() {
                var json = JSON.stringify(this.motions),
                    outFile = 'out/'+config.event+'-'+Math.floor(Date.now() / 1000)+'.json';
                fs.writeFile(outFile, json, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log('The file was saved in '+ outFile);
                    }
                });
            },

            debug: true
        },
        tarantula: undefined,
        run: function() {
            var scope = this;
            this.tarantula = new Tarantula(this.brain);
            this.tarantula.on('done', function() { return scope.brain.onComplete();} );
            this.tarantula.start([config.start_page]);
        }

    };
};


// read config
//var configFile = "examples/gvli121_config.json";
var configFile = "examples/gvtk131_config.json";
fs.readFile(configFile, 'utf8', function (err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }

    var config = JSON.parse(data),
        scraperrr = new Scraperrr(config);
    scraperrr.run();

});



