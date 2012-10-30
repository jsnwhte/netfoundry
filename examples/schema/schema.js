var netfoundry = require('../../netfoundry.js');
var util = require('util');
var URI1 = 'http://foo.com/contact/1';

netfoundry.config.dbStateSchemas['contact'] = {'name': String, 'email': String};

netfoundry.initialize(run);

function run() {
	var node = new netfoundry.NodeState({uri:URI1,type:'contact'});
	node.setState({name:'Jason White',email:'jason@netfoundry.org'});
	node.save(function(err) {
		netfoundry.NodeState.load(URI1, function(err, updatedNode) {
			console.log(updatedNode.state); //{ email: 'jason@netfoundry.org', name: 'Jason White' }
			process.exit();
		});
	});
}

