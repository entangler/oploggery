var Oploggery = require('../index.js');

var oplogger = new Oploggery({
    uri: 'mongodb://localhost:27017/hrDataTest'
});
oplogger.watch('test.users', function(data) {
    console.log(data);
});