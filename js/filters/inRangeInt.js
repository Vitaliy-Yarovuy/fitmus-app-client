/**
 * angular filter that checks on entering into an array
 */
app.filter('inRangeInt', function() {
    return function( items, range ) {
        var filtered = [];
        range && _.forEach(items, function(item, key) {
            if( range.indexOf(parseInt(key)) != -1 ) {
                filtered.push(item);
            }
        });
        return filtered;
    };
});