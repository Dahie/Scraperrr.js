var Tarantula = require('tarantula'),
    fs = require('fs');

exports.init = function(config, outputFile) {
    return {

        brain: {

            config: config,
            outputFile: outputFile,
            motions: [],
            motionsIDs: [],
            output: undefined,

            politeness: config.politeness,

            parseMotion: function(config, motion, body) {
                // iterate over all fields in config.data
                for (var i in config.data) {
                    // get the meta data of the field
                    var field = config.data[i];

                    // if it is a regex, perform it on the body
                    if(field.regex) {

                        match = body.match(new RegExp(field.regex, 'm'));
                        // and save in the target object under the given name
                        motion[field.name] = match ? match[1] : undefined;

                    }

                    if(field.required && !motion[field.name]) {

                        console.error("Data field \""+ field.name + "\" may not be undefined or empty in "+motion.url+"!");
                        if(config.debug) {
                            console.log("Regular expression: " + field.regex);
                            console.log("Error string:\n" + body);
                        }
                        

                    }
                }
            },

            createMotion: function (config, body, uri) {
                var motion = {},
                    idRegEx = new RegExp(config.regexIdUrl, "");

                motion.url = uri;

                match = uri.match(idRegEx);
                motion.id = match ? match[1] : undefined;

                this.parseMotion(config, motion, body);

                // check if we already know this motion id
                // if so, we do not need to proceed and skip
                if(motion.id && this.motionsIDs.indexOf(motion.id) == -1 && motion.id != '&nbsp;') {

                    this.motions.push(motion);
                    this.motionsIDs.push(motion.id);
                    if(this.debug) {
                        console.log(motion);
                    } else {
                        process.stdout.write(".");
                    }
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
                    if(config.regexMotion) {
                        var motionBlocks = body.split(new RegExp(config.regexMotion, ""));

                        // parse each block

                        for (var i = 1; i < motionBlocks.length; i++) {

                            this.createMotion(config, motionBlocks[i], request.uri);

                        }
                    }

                    

                }

            },

            onComplete: function() {
                if(!config.debug) {
                    process.stdout.write("\n");
                }
                console.log('Done, found '+ this.motions.length + ' motions for #'+config.event);

                // sort motions
                this.motions.sort(this.sortByID);

                // export as json
                this.output = JSON.stringify(this.motions);
                this.exportJSON(this.outputFile);
            },

            sortByID: function(compA, compB) {
                return (compA.id < compB.id) ? -1 : (compA.id > compB.id) ? 1 : 0;
            },

            exportJSON: function(outputFile) {
                outputFile = outputFile || 'out/'+config.event+'-'+Math.floor(Date.now() / 1000)+'.json';
                fs.writeFile(outputFile, this.output, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log('The file was saved in '+ outputFile);
                    }
                });
            },

            debug: config.debug
        },
        run: function() {
            var scope = this,
                tarantula = new Tarantula(this.brain);
            tarantula.on('done', function() { return scope.brain.onComplete();} );
            tarantula.start([config.start_page]);
        }

    };
};


