(function(global){

    var fUtils = {
        getContentDirectory: function(cb){
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
                alert(fileSystem.name);
                alert(fileSystem.root.name);
            }, function(event){
                alert(event.target.error.code);
            });
        }
    };
    global.fUtils = fUtils;
})(window);