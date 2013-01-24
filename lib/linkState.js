
module.exports = LinkState;

function LinkState(arg) 
{
	var _self = this;
	
	this.type = null;
	this.linkUri = null;
	this.direction = null;
	this.state = new Object();
	this.createdDate = new Date();
	this.modifiedDate = new Date();
	
	var argType = typeof(arg);
	switch (argType)
	{
		case 'string':
		case 'object':
			_hydrate(arg);
			break;
		
		case 'undefined':
			break;
		
		default:
			throw 'unsupported constructor parameter type: ' + argType;
	}

	this.setState = function(state) {
		_self.state = state;
		_self.modifiedDate = new Date();
	}
	
	function _hydrate(arg) {
		var obj = arg;
		if (typeof(arg) == 'string') {
			obj = JSON.parse(arg);
		}	

		for (var prop in obj) {
			switch (prop)
			{
				case 'linkUri':
					_self.linkUri = obj.linkUri;
					break;
				
				case 'direction':
					_self.direction = obj.direction;
					break;
					
				case 'state':
					_self.state = obj.state;
					break;
				
				case 'createdDate':
					_self.createdDate = obj.createdDate;
					break;
				
				case 'modifiedDate':
					_self.modifiedDate = obj.modifiedDate;
					break;
				
				case 'type':
					_self.type = obj.type;
					break;
			}
		}
	}	
}