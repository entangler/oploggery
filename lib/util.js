var mongodb = require('mongodb'),
    Timestamp = mongodb.Timestamp,
    util;

module.exports = util = {
    getType: function(obj) {
        var ptype;
        ptype = Object.prototype.toString.call(obj).slice(8, -1);
        if (ptype === 'Object') {
            return obj.constructor.name.toString();
        } else {
            return ptype;
        }
    },

    getTimestamp: function(date) {
        date = date || new Date();
        time = Math.floor(date.getTime() / 1000);
        return new Timestamp(0, time);
    },

    getDate: function(timestamp) {
        return new Date(timestamp.high_ * 1000);
    },

    walk: function(data, fn) {
        var d, i, dataType, result;

        dataType = util.getType(data);
        switch (dataType) {
            case 'Array':
                result = [];
                for (i = 0; i < data.length; i++) {
                    d = data[i];
                    results.push(util.walk(d, fn));
                }
                return result;
            case 'Object':
                result = {};
                for (i in data) {
                    d = data[k];
                    result[i] = util.walk(d, fn);
                }
                return result;
            default:
                return fn(data);
        }
    },

    convertObjectID: function(data) {
        if (util.getType(data) === 'ObjectID') {
            return data.toString();
        } else {
            return data;
        }
    }
};