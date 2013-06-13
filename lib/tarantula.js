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


// read config
var configFile = "examples/lptsh132_config.json";
fs.readFile(configFile, 'utf8', function (err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }
 
    var config = JSON.parse(data),
        motions = [],
        motionsIDs = [],
    	brain = {

        politeness: 200,

        shouldVisit: function(uri) {
            // some portals have all pages on one page.
            // In this case, we do not need to visit any detail pages
            if(!config.detail) return false;
        	var re = new RegExp(config.detailUrl, "");
            return uri.match(re);
        },

        visit : function(request, response, body, $) {
            console.log(request.uri);
            if(request.uri != config.start_page) {
                var motion = new Motion(),
                    idRegEx = new RegExp(config.regexIdUrl, "");
            
                motion.url = request.uri;
                match = request.uri.match(idRegEx);
                motion.id = match ? match[1] : undefined;
                match = body.match(new RegExp(config.regexID, 'm'));
                motion.id = match ? match[1] : undefined;

                // check if we already know this motion id
                // if so, we do not need to proceed and skip
                if(motion.id && motionsIDs.indexOf(motion.id) == -1 && motion.id != '&nbsp;') {

                    match = body.match(new RegExp(config.regexTitle, 'm'));
                    motion.title = match ? match[1] : undefined;

                    match = body.match(new RegExp(config.regexAuthor, 'm'));
                    motion.author = match ? match[1] : undefined;
                    
                    match = body.match(new RegExp(config.regexType, 'm'));
                    motion.type = match ? match[1] : undefined;

                    match = body.match(new RegExp(config.regexTopic, 'm'));
                    motion.topic = match ? match[1] : undefined;
                    
                    match = body.match(new RegExp(config.regexText, 'm'));
                    motion.text = match ? match[1] : undefined;
                    
                    match = body.match(new RegExp(config.regexRemarks, 'm'));
                    motion.remarks = match ? match[1] : undefined;

                    motions.push(motion);
                    motionsIDs.push(motion.id);
                    console.log(motion);
                }

            }

        },

        debug: false
    };

    var tarantula = new Tarantula(brain);

    tarantula.on('done', function() {
        console.log('Done, found '+ motions.length + ' motions for #'+config.event);


        // TODO sort motions

        // export as json
        var json = JSON.stringify(motions),
            outFile = 'out/'+config.event+'-'+Math.floor(Date.now() / 1000)+'.json';
        fs.writeFile(outFile, json, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log('The file was saved in '+ outFile);
            }
        }); 

    });

    tarantula.start([config.start_page]);

});



