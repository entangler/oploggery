module.exports = function(options, done) {
    var uri = options.uri || undefined,
        client = options.client || undefined,
        mongodb,
        MongoClient;

    var openLocalDb = function() {
        var db;

        if (!client) {
            return done(new Error('No MongoClient defined.'));
        }

        try {
            db = client.db('local');
        } catch (err) {
            return done(err);
        }

        console.log('Got local DB');
        done(null, db);
    };

    if (!uri && !client) {
        return done(new Error('You must provide a connection url or an already established MongoDB MongoClient.'));
    }

    if (!client) {
        mongodb = require('mongodb');
        MongoClient = mongodb.MongoClient;

        client = new MongoClient();
        client.connect(uri, {
            db: {
                w: 1
            }
        }, function(err) {
            if (err) {
                return done(err);
            }
            console.log('Connected to database');
            openLocalDb();
        });
    } else {
        openLocalDb();
    }
};