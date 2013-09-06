
require("require.async")(require);


exports.main = function(options, callback) {
	return require.async("./extra", function(EXTRA) {
		return EXTRA.main(options, callback);
	}, callback);
}
