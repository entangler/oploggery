var Oploggery = require('../index.js');

var oplogger = new Oploggery({
    uri: 'mongodb://localhost:27017/test'
});
oplogger.watch();