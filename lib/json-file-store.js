
// TODO: Move into own project at `github.com/cadorn/json-file-store`.

const PATH = require("path");
const FS = require("fs-extra");


var JsonFileStore = exports.JsonFileStore = function(file, options) {
    if (!(this instanceof exports.JsonFileStore))
        return new exports.JsonFileStore(file, options);

    this.file = file;
    this.options = options || {};
    if (typeof this.options.throwOnNoExist === "undefined") {
        this.options.throwOnNoExist = true;
    }

    this.data = {};
}

JsonFileStore.prototype.exists = function() {
    return FS.existsSync(this.file);
};

JsonFileStore.prototype.getFile = function() {
    return this.file;
}

JsonFileStore.prototype.init = function() {
    if(this.exists()) {
        throw new Error("Store exists. Cannot initialize store at: " + this.file);
    }
    this.data = {};
    this.save(true);
};

JsonFileStore.prototype.set = function() {
    if(arguments.length==1) {
        this.data = arguments[0];
    } else
    if(arguments.length==2) {
        var data = this.get(arguments[0], true, true);
        data[0][data[1]] = arguments[1];
    } else {
        throw new Error("Invalid argument count: " + arguments.length);
    }
    this.dirty = true;
    this.save();
};

JsonFileStore.prototype.remove = function(keysPath) {
    var data = this.get(keysPath, false, true);
    if(!data) {
        return false;
    }
    delete data[0][data[1]];
    this.dirty = true;
    this.save();
    return true;
};

exports.getFromObject = function(obj, keysPath, createObjects, returnWithKey) {
    if (!obj) {
        return null;
    }
    if(!keysPath) {
        return obj;
    }
    var keys = [];
    keysPath.forEach(function(key) {
        if(Array.isArray(key)) {
            keys.push(key.join(""));
        } else {
            keys.push(key);
        }
    });
    var data = obj,
        key;
    while(true) {
        if(keys.length==1 && returnWithKey===true) {
            return [data, keys.shift()];
        }
        if(keys.length==0) break;
        key = keys.shift();
        if(!data[key]) {
            if(createObjects===true) {
                data[key] = {};
            } else {
                return null;
            }
        }
        data = data[key];
    }
    return data;
}

JsonFileStore.prototype.get = function(keysPath, createObjects, returnWithKey) {
    this.load();
    return exports.getFromObject(this.data, keysPath, createObjects, returnWithKey);
};

JsonFileStore.prototype.has = function(keysPath) {
    return (this.get(keysPath)!==null);
};


JsonFileStore.prototype.hasFileChanged = function() {
    if(!this.exists()) return false;
    return !(""+this.fileMtime == ""+FS.statSync(this.file).mtime);
}

JsonFileStore.prototype.load = function(force) {
    if(this.dirty && !force) {
        throw new Error("Cannot load store. Unsaved data present.");
    }
    if(!this.exists()) {
        if (this.options.throwOnNoExist) {
            throw new Error("Cannot load store. Store does not exist on disk at: " + this.file);
        }
        return;
    }
    if(this.hasFileChanged()) {
        var json = false;
        try {
            json = FS.readFileSync(this.file).toString();
            this.data = JSON.parse(json);
        } catch(e) {
            console.error("JSON STRING", json);
            throw new Error("Error parsing JSON from file: " + this.file);
        }
        this.fileMtime = FS.statSync(this.file).mtime;
    }
    this.dirty = false;
};

JsonFileStore.prototype.save = function(force) {
    if(!this.exists() && !force) {
        throw new Error("Cannot save store. Store does not exist on disk at: " + this.file);
    }
    if(this.hasFileChanged() && !force) {
        throw new Error("Cannot save store. Data changed on disk: "+this.file);
    }
    if(!this.dirty && !force) return;
    if(!FS.existsSync(PATH.dirname(this.file))) FS.mkdirsSync(PATH.dirname(this.file));
    var data = JSON.stringify(this.data, null, 4);
    if (FS.existsSync(this.file)) {
        if (FS.readFileSync(this.file).toString() === data) {
            this.dirty = false;
            return;
        }
    }
    FS.writeFileSync(this.file, data);
    this.fileMtime = FS.statSync(this.file).mtime;
    this.dirty = false;
};
