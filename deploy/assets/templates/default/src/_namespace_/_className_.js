(function(){

	// Library depencencies
	var Application = include('springroll.Application');

	/**
	*  The main class of _name_
	*  @class _className_
	*  @extends springroll.Application
	*/
	var _className_ = function(options)
	{
		Application.call(this, options);
	};

	// Extend the base game class
	var p = _className_.prototype = Object.create(Application.prototype);

	// Assign to namespace
	namespace('_namespace_')._className_ = _className_;
	
}());