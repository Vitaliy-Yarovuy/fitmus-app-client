(function(global){
//    var LocalFileSystem = function() {
//    };
//    LocalFileSystem.TEMPORARY = 0; //temporary, with no guarantee of persistence
//    LocalFileSystem.PERSISTENT = 1; //persistent

    var fUtils = {
        getContentDirectory: function(cb){
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
                console.log(fileSystem.name);
                console.log(fileSystem.root.name);
            }, function(event){
                console.log(event.target.error.code);
            });
        }
    };
    global.fUtils = fUtils;
})(window);