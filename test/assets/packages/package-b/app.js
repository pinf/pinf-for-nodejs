
require("require.async")(require);


exports.main = function(context, callback) {
	return require.async("./extra", function(EXTRA) {
		return EXTRA.main(context, callback);
	}, callback);
}
