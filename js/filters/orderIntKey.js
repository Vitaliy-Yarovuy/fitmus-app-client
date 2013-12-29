/**
 * angular filter that sort and add offset (using in array of numbers)
 */
app.filter('orderIntKey', function() {
    return function( items, offset ) {
        var filtered = [];
        offset = offset || 0;
        _.forEach(items, function(item, key) {
            filtered[parseInt(key) + offset] = item;
        });
        return filtered;
    };
});