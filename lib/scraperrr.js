var Tarantula = require('tarantula'),
    fs = require('fs'),
    schemaEnv = require('schema')();

exports.init = function(config, outputFile) {

    // validate config

    if(!config) {
        console.error("Configuration is empty.");
        return;
    }

    if(!config.start_page) {
        console.error("No start_page defined in configuration.");
        return;
    }

    if(!config.contexts || config.contexts.length < 1) {
        console.error("No contexts defined in configuration.");
        return;
    }

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

                        console.error("Warning: Data field \""+ field.name + "\" may not be undefined or empty in "+motion.url+"!");
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
                // In this case, we do not need to visit any detail pages of a specific context
                var context = this.detectContext(config, uri);
                if(context && !context.detail) return false;
                var re = new RegExp(context.detailUrl, "");
                return uri.match(re);
            },

            detectContext: function(config, uri) {
                for (var i in config.contexts) {
                    // first we detect the context
                    var context = config.contexts[i],
                        re = new RegExp(context.regexContext, "");

                    // based on the given regular expression
                    // we try to detect to which context the url belongs

                    if(uri.match(re)) {
                        return context;
                    }
                }
                return undefined;
            },

            visit : function(request, response, body, $) {

                // the website we visit can be of any context
                var context = this.detectContext(config, request.uri);

                if(request.uri != context.start_page) {

                    this.createMotion(context, body, request.uri);

                } else {

                    // all motions are on the same page
                    // split into blocks
                    if(context.regexMotion) {
                        var motionBlocks = body.split(new RegExp(context.regexMotion, ""));

                        // parse each block

                        for (var i = 1; i < motionBlocks.length; i++) {

                            this.createMotion(context, motionBlocks[i], request.uri);

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
                start_pages = [],
                tarantula = new Tarantula(this.brain);
            tarantula.on('done', function() { return scope.brain.onComplete();} );

            if(config.start_page){
                start_pages.push(config.start_page);
            } else {
                start_pages = config.start_pages;
            }
            tarantula.start(start_pages);
        }

    };
};

exports.validate = function(json, schema) {

    var schema = schemaEnv.Schema.create(schema),
        validation = schema.validate(json);

    if(validation.isError()) {
        for(var i in validation.errors) {
            //console.log(validation.errors[i]);
            console.log("Error occured near "+validation.errors[i].path+", wrong "+ validation.errors[i].attribute)
        }
    }

}
