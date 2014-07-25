
const VFS = require("pinf-vfs");

for (var name in VFS) {
	exports[name] = VFS[name];
}
