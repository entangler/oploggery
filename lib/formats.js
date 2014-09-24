var getDate, mapOp;

getDate = require('./util').getDate;

mapOp = {
    n: 'noop',
    i: 'insert',
    u: 'update',
    d: 'delete'
};

module.exports = {
    raw: function(data) {
        return data;
    },

    pretty: function(data) {
        return {
            timestamp: getDate(data.ts),
            operation: mapOp[data.op] || data.op,
            namespace: data.ns,
            operationId: data.h,
            targetId: (data.o2) ? data.o2._id : ((data.o) ? data.o._id || null : null),
            criteria: data.o2 ? data.o2 : null,
            data: data.o
        };
    },

    normal: function(data) {
        var targetId, oplist, i, op, path;

        targetId = (data.o2) ? data.o2._id : ((data.o) ? data.o._id || null : null);
        if (data.o) {
            delete data.o._id;
        }

        switch (data.op) {
            case 'i':
                oplist = [{
                    operation: 'set',
                    id: targetId,
                    path: '.',
                    data: data.o
                }];
                break;
            case 'u':
                var filteredData = [];
                for (i in data.o) {
                    if (i[0] !== '$') {
                        filteredData.push(i);
                    }
                }

                if (filteredData.length > 0) {
                    oplist = [{
                        operation: 'set',
                        id: targetId,
                        path: '.',
                        data: data.o
                    }];
                } else {
                    oplist = [];
                    for (op in data.o) {
                        args = data.o[op];
                        operation = op.slice(1);
                        for (path in args) {
                            oplist.push({
                                operation: operation,
                                id: targetId,
                                path: path,
                                data: args[path]
                            });
                        }
                    }
                }
                break;
            case 'd':
                oplist = [{
                    operation: 'unset',
                    id: targetId,
                    path: '.'
                }];
        }

        return {
            timestamp: getDate(data.ts),
            oplist: oplist,
            namespace: data.ns,
            operationId: data.h
        };
    }
};