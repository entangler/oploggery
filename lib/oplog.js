var connect = require('./connect'),
    util = require('./util'),
    getTimestamp = util.getTimestamp;

module.exports = function(options, done) {
    connect({
        client: options.client,
        uri: options.uri
    }, function(err, db) {
        var useMasterOplog = options.useMasterOplog || false,
            collection = 'oplog.' + (useMasterOplog ? '$main' : 'rs');

        if (err) {
            console.log(err);
            return done(err);
        }

        db.collection(collection, function(err, oplog) {
            if (err) {
                return done(err);
            }

            oplog.find({}, {
                ts: 1
            }).sort({
                $natural: -1
            }).limit(1).toArray(function(err, data) {
                var connOpts,
                    lastOplogTime,
                    timeQuery;

                if (err) {
                    return done(err);
                }

                connOpts = {
                    tailable: true,
                    awaitdata: true,
                    oplogReplay: true,
                    numberOfRetries: -1
                };

                try {
                    lastOplogTime = data[0].ts;
                } catch (e) {
                    lastOplogTime = undefined;
                }
                timeQuery = {
                    $gt: lastOplogTime || getTimestamp()
                };

                cursor = oplog.find({
                    ts: timeQuery
                }, connOpts);
                stream = cursor.stream();

                done(null, stream, db);
            });
        });
    });
};