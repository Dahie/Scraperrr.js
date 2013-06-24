var myEnv = require('schema')();


exports.validate = function(json, schema) {

		var schema = myEnv.Schema.create(schema),
		    validation = schema.validate(json);

		if(validation.isError()) {
			for(var i in validation.errors) {
				//console.log(validation.errors[i]);
				console.log("Error occured near "+validation.errors[i].path+", wrong "+ validation.errors[i].attribute)
			}
		}

}