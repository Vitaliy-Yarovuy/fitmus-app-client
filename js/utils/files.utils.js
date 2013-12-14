(function(global){

    var fUtils = {
        rootPath: null,
        getFileSystem: function(cb){
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
                cb(null,fileSystem);
            }, function(event){
                cb(event.target.error.code, null);
            });
        },
        getRootPath: function(fileSystem, cb){
            var that = this;
            if(this.rootPath){
                cb(null, this.rootPath);
                return;
            }
            fileSystem.root.getFile("dummy.html", {create: true, exclusive: false},
                function gotFileEntry(fileEntry){
                    that.rootPath = fileEntry.fullPath.replace("dummy.html","");
                    fileEntry.remove();
                    cb(null, that.rootPath);
                }
            );
        },
        downloadFile: function(url, dest, cb){
            var fileTransfer = new FileTransfer();
            fileTransfer.download(url, dest,
                function(theFile) {
                    cb(null, theFile.toURI());
                },
                function(error) {
                    console.log("upload error code: " + error.code);
                    cb(error.code, null);
                }
            );
        }
    };
    global.fUtils = fUtils;
})(window);