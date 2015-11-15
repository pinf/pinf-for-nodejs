
exports.main = function (callback) {

    const COMMON = require("common/helpers");

    return COMMON.loadTemplate("hello", function (err, tpl) {
        if (err) return callback(err);

        var rendered = tpl.render({
            "foo": "bar"
        });

        return callback(null, rendered);
    });
}
