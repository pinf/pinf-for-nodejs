
require("require.async")(require);

exports.load = function (name, callback) {

    return require.async("./tpl/" + name, function (api) {

    	return callback(null, api);
    }, callback);
}
