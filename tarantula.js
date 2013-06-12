var Tarantula = require('tarantula'),
    fs = require('fs');

/*var start_page = 'https://wiki.piratenpartei.de/BE:Gebietsversammlungen/Friedrichshain-Kreuzberg/Antragsportal',
	path = '/BE:Gebietsversammlungen/Friedrichshain-Kreuzberg/Antragsportal/',
    event = 'GVFK2012.1';*/

var start_page = 'http://wiki.piratenpartei.de/BE:Gebietsversammlungen/Treptow-K%C3%B6penick/Antragsportal',
    path = '/BE:Gebietsversammlungen/Treptow-K%C3%B6penick/Antragsportal/',
    event = 'GVTK2013.1';

RegExp.quote = function(str) {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
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
    }
}

var motions = [], 
    motionsIDs = [],
	brain = {

    politeness: 200,

    shouldVisit: function(uri) {
    	var re = new RegExp(RegExp.quote(path+event),"");
        return uri.match(re);
    },

    visit : function(request, response, body, $) {
        console.log(request.uri);
        if(request.uri != start_page) {
            var motion = new Motion(),
                idRegEx = new RegExp(RegExp.quote(event)+"\/(.*?)_","");
        
            motion.url = request.uri;
            match = request.uri.match(idRegEx);
            motion.id = match ? match[1] : 'fail';
            match = body.match(/<span class=\"mw-headline\" id=\"Antragstitel\">\s*?[\s\S]*?<\/span><\/h3>\s*?<p>([\s\S]*?)\n<\/p>\s*?(?=<h3>)/m);
            motion.title = match ? match[1] : 'fail';
            match = body.match(/<span class=\"mw-headline\" id=\"Antragsteller\">\s*?[\s\S]*?<\/span><\/h3>\s*?<p>([\s\S]*?)\n<\/p>\s*?(?=<h3>)/m);
            motion.author = match ? match[1] : 'fail';
            match = body.match(/<span class=\"mw-headline\" id=\"Antragstyp\">\s*?[\s\S]*?<\/span><\/h3>\s*?<p>([\s\S]*?)\n<\/p>\s*?(?=<h3>)/m);
            motion.type = match ? match[1] : 'fail';
            match = body.match(/<span class=\"mw-headline\" id=\"Antragstext\">\s*?[\s\S]*?<\/span><\/h3>\s*?<div style=\"background-color:#ddd;padding:23px\">\n([\s\S]*?)?\n<\/div>\n\s*?(?=<h3>)/m);
            motion.text = match ? match[1] : 'fail';
            console.log(motion.text);
            match = body.match(/<span class=\"mw-headline\" id=\"Anmerkungen\">\s*?[\s\S]*?<\/span><\/h3>\s*?([\s\S]*?)?\n\s*?(?=<h3>)/m);
            motion.remarks = match ? match[1] : 'fail';

            if(motionsIDs.indexOf(motion.id) == -1) {
                motions.push(motion);
                motionsIDs.push(motion.id);
            }
            
        }
        //console.log(body);

        //var matches = body.match(/===(.*)===[\s\S]*?(.*)^==/);




    },

    debug: false
};

var tarantula = new Tarantula(brain);

tarantula.on('done', function() {
    console.log('done, found '+ motions.length + ' motions for #'+event);

    

    // export as json
    var json = JSON.stringify(motions);
    fs.writeFile('out/'+event+'-'+Math.floor(Date.now() / 1000)+'.json', json, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 

});



tarantula.start([start_page]);