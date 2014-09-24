var Oploggery, EventEmitter = require('events').EventEmitter,
    oplog = require('./oplog'),
    formats = require('./formats'),
    util = require('./util'),
    walk = util.walk,
    convertObjectID = util.convertObjectID;

function applyDefaults(options) {
    options.uri = options.uri || false;
    options.client = options.client || false;
    options.onError = options.onError || function(err) {
        console.log('Oploggery error: ', err);
    };
    return options;
}

Oploggery = (function() {
    Oploggery.prototype.status = 'connecting';
    Oploggery.prototype.watching = [];

    function Oploggery(options) { // jshint ignore:line
        this.options = applyDefaults(options);
        this.channel = new EventEmitter();

        this.channel.on('error', this.options.onError);
        this.channel.on('connected', function() {
            this.status = 'connected';
        }.bind(this));

        oplog({
            client: options.client,
            uri: options.uri,
            useMasterOplog: options.useMasterOplog
        }, function(err, stream, db) {
            if (err) {
                return this.channel.emit('error', err);
            }

            this.stream = stream;
            this.db = db;
            this.channel.emit('connected');
        }.bind(this));
    }

    Oploggery.prototype.ready = function(done) {
        var isReady = this.status === 'connected';
        if (isReady) {
            done();
        } else {
            this.channel.once('connected', done);
        }
    };

    Oploggery.prototype.watch = function(collection, notify) {
        collection = collection || 'all';
        notify = notify || console.log;

        this.ready(function() {
            var watcher = function(data) {
                var channel, event, formatter, relevant;

                relevant = (collection === 'all') || (data.ns === collection);
                if (!relevant) {
                    return;
                }

                channel = collection ? "change:" + collection : 'change';
                formatter = formats[this.options.format] || formats.raw;
                event = formatter(data);
                if (this.options.convertObjectIDs === true) {
                    event = walk(event, convertObjectID);
                }
                return this.channel.emit(collection, event);
            }.bind(this);
            this.stream.on('data', watcher);
            this.watching[collection] = watcher;

        }.bind(this));
        return this.channel.on(collection, notify);
    };

    Oploggery.prototype.stop = function(collection) {
        collection = collection = 'all';
        this.channel.removeAllListeners(collection);
        this.stream.removeListener('data', this.watching[collection]);
        delete this.watching[collection];
    };

    Oploggery.prototype.stopAll = function() {
        var collection;
        for (collection in this.watching) {
            this.stop(collection);
        }
    };

    return Oploggery;
})();

module.exports = Oploggery;