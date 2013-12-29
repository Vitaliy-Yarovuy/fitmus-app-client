'use strict';

app.factory('connect',function ($rootScope){
    var rootUrl = "http://dev.fitmus.com/api/v3/",
        rand = Math.random(),
        app_id = "1",
        app_key = "1",
        app_sign = "1",//md5(app_id + app_key);
        sourcePath,
        exerciseSources = {},
        forceToUpdate = false,
        defaultSettings = {
            is_show_time: true,
            is_auto_update: true,
            weight_unit: 1,
            distance_unit: 1
        },
        userData = {
            user: null,
            data: null,
            train: null,
            note: null,
            settings: defaultSettings
        }, loginListeners = [];

    /**
     * user settings
     * @type {{is_show_time: boolean, is_auto_update: boolean, weight_unit: number, distance_unit: number}}
     */
    $rootScope.settings = defaultSettings;

    function censor(censor) {
        var i = 0;
        return function(key, value) {
            if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
                return '[Circular]';
            if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
                return '[Unknown]';
            ++i; // so we know we aren't using the original object anymore
            return value;
        }
    }


    localStorage["console-log"] = "";
    /**
     * override log function to save log data in localStorage
     */
    console.log = (function(oldFunc){
        return function(){
            var args = [].slice.call(arguments),
                strArgs = JSON.stringify(args,censor(args));
            localStorage["console-log"] += "|" + strArgs;
            //$.ajax("http://192.168.1.95:3000/log?" +strArgs);
            oldFunc.apply(this, args);
        };
    })(console.log);

    /**
     * save user data to localStorage
     */
    function saveToLocalStorage(){
        window.localStorage["fitmus-app-user-data"] = JSON.stringify(_.cloneCleaner(userData));
    }

    /**
     * load user data from  localStorage
     */
    function loadFromLocalStorage(){
        if(window.localStorage["fitmus-app-user-data"]){
            userData = JSON.parse(window.localStorage["fitmus-app-user-data"]);
            if(!userData.settings){
                userData.settings = defaultSettings;
            }
        }
    }

    /**
     * save link to exercise image that save on device to localStorage
     */
    function saveExerciseUri(){
        window.localStorage["fitmus-app-exercises"] = JSON.stringify(_.cloneCleaner(exerciseSources));
    }

    /**
     * load link to exercise image that save on device from localStorage
     */
    function loadExerciseUri(){
        if(window.localStorage["fitmus-app-exercises"]){
            exerciseSources = JSON.parse(window.localStorage["fitmus-app-exercises"]);
        }
    }

    /**
     * show info message for user
     * @param messages
     */
    function showInfo(messages){
        _.each(messages,function(message){
            alert(message);
        });
    }

    /**
     * make "get" request to get json with all needed credentials
     * @param url
     * @param callback
     */
    function getJSON(url,callback){
        if(!userData.user){
            callback({
                message: "неавторизированный доступ"
            },null);
            return ;
        }
        $.getJSON(rootUrl + url,{
            app_id: app_id,
            app_sign: app_sign,
            user_id: userData.user.id,
            token: userData.user.token
        }).done(function(data){
            showInfo(data.info);
            callback(data.error,data.data);
        }).fail(function(jqXHR, textStatus, errorThrown){
            callback({
                message: errorThrown
            },null);
        });
    }

    /**
     * make "POST" request to post json with all needed credentials
     * @param url
     * @param data
     * @param callback
     */
    function postJSON(url,data,callback){
        if(!userData.user){
            callback({
                message: "неавторизированный доступ"
            },null);
            return ;
        }
        var url = rootUrl + url + "?" + $.param({
            app_id: app_id,
            app_sign: app_sign,
            user_id: userData.user.id,
            token: userData.user.token
        });
        $.ajax({
            url:url,
            type:"POST",
            data: data,//{ data:JSON.stringify(data) },
            //contentType:"application/json; charset=utf-8",
            dataType:"json"
        }).done(function(data){
            callback(data.error,data.data);
        }).fail(function(jqXHR, textStatus, errorThrown){
            callback({
                message: errorThrown
            },null);
        });
    }

    /**
     * download image exercise and save it on device on "sourcePath" holder
     * @param id_exercise
     * @param cb
     */
    function downloadSource(id_exercise, cb){
        var exercise = userData.data.exercise[id_exercise];
        var run = function(){
            fUtils.downloadFile(exercise.img + "?"+rand, sourcePath + id_exercise + ".jpg", function(err, uri){
                if(err){
                    cb(null);
                    return
                }
                setTimeout(function(){
                    exerciseSources[id_exercise] = uri;
                    saveExerciseUri();
                    cb(null);
                },300);
            });
        };
        if(!exercise ){
            cb(null);
            return;
        }
        if(exerciseSources[exercise]){
            var img = document.createElement("img");
            img.onerror = run;
            img.onload = function(){cb(null)};
            img.src = exerciseSources[exercise];
            return;
        }
        run();
    }

    /**
     * begin download exercise images
     * @param data
     */
    function startDownloadSource(data){
        fUtils.getFileSystem(function(err, fileSystem){
            if(err){
                console.log("getFileSystem",err);
                return ;
            }
            fUtils.getRootPath(fileSystem,function(err, path){
                if(err){
                    console.log("getRootPath",err);
                    console.log(err);
                    return ;
                }
                sourcePath = path + "fitmus/res/excs/";
                console.log("getRootPath",sourcePath);
                var keys = Object.keys(data.exercise);
                setTimeout(function(){
                    async.eachSeries(keys,downloadSource,function(err){
                        console.log("downloadSource end",err);
                        return ;
                    });
                },0);
            })
        });
    }

    /**
     * mark data to control it changed
     * @param collection
     * @returns {*}
     */
    function markRecord(collection){
        _.forEach(collection,function(item){
            item.$$_status = "sync";
        });
        return collection;
    }

    return {
        /**
         * return exercise image source collection
         * @returns {{}}
         */
        getLocalExerciseUri: function(){
           return exerciseSources;
        },
        /**
         * check app login state
         * @returns {boolean}
         */
        isLogin: function(){
            loadFromLocalStorage();
            loadExerciseUri();
            $rootScope.settings = userData.settings;
            return !!userData.user;
        },
        /**
         * add listener on on login event
         * @param callback
         */
        onLogin:function(callback){
            loginListeners.push(callback);
        },
        /**
         * login app
         * @param login
         * @param pass
         * @param callback
         */
        login: function (login, pass, callback){
            $.getJSON(rootUrl+"login/",{
                app_id: app_id,
                app_sign: app_sign,
                login:login,
                passwd:pass
            }).done(function(data){
                userData.user = data.data;
                userData.user.pass = pass;
                saveToLocalStorage();
                callback(data.error,data.data);
                loginListeners.forEach(function(callback){
                    callback(null,data.data);
                });
            }).fail(function(jqXHR, textStatus, errorThrown){
                callback({
                  message: errorThrown
                },null);
            });
        },
        /**
         * logout app
         * @param callback
         */
        logout: function (callback){
            userData = {
                user: null,
                data: null,
                train: null,
                note: null
            };
            saveToLocalStorage();
            callback && callback();
        },
        /**
         * get data from server or cached data (it include exercise, mode, musclegroup, musclegroup_exercise, units)
         * @param callback
         */
        getData: function(callback){
            if(userData.data && !navigator.onLine &&  !userData.settings.is_auto_update && !forceToUpdate){
                startDownloadSource(userData.data||{});
                callback(null, userData.data);
                return;
            }
            getJSON("syncdata/",function(err, data){
                startDownloadSource(data||{});
                userData.data = data;
                callback(err, data);
            });
        },
        /**
         * get train from server or cached data
         * @param callback
         */
        getTrain: function(callback){
            if(userData.train && !navigator.onLine && !userData.settings.is_auto_update && !forceToUpdate){
                callback(null, userData.train);
                return;
            }
            getJSON("train/",function(err, data){
                data = markRecord(data||{});
                userData.train = data;
                callback(err, data);
            });
        },
        /**
         * get note from server or cached data
         * @param callback
         */
        getNote: function(callback){
            if(userData.note && !navigator.onLine && !userData.settings.is_auto_update && !forceToUpdate){
                callback(null, userData.note);
                return;
            }
            getJSON("note/",function(err, data){
                data = markRecord(data||{});
                userData.note = data;
                callback(err, data);
            });
        },
        /**
         * get all user data that can get from server or cached data
         * @param callback
         */
        getAll:function(callback){
            async.parallel({
                data: this.getData,
                train: this.getTrain,
                note: this.getNote
            },function(err,data){
                console.log(data);
                saveToLocalStorage();
                $rootScope.musclegroups = data.data.musclegroup;
                $rootScope.exercises = data.data.exercise;
                $rootScope.musclegroup_exercises = data.data.musclegroup_exercise;
                $rootScope.units = data.data.units;
                $rootScope.mode = data.data.mode;
                $rootScope.mode_names = Object.keys(data.data.mode);
                callback(err,data);
            });
        },
        /**
         * put data to save on server and update on client
         * @param callback
         */
        sync: function(callback){
            forceToUpdate = true;
            async.parallel({
                note: function(cb){
                    var toUpdate = {};
                    _.forEach(userData.note, function(item, key){
                        if(item.$$_status == "updated"){
                            this[key] = item;
                        }
                    },toUpdate);
                    postJSON("note/",{ data: _.cloneCleaner(toUpdate)},function(err, data){
                        markRecord(data);
                        userData.note = data;
                        cb(err, data);
                    });
                },
                train: function(cb){
                    var toUpdate = {};
                    _.forEach(userData.train, function(item, key){
                        if(item.$$_status == "updated"){
                            this[key] = item;
                        }
                    },toUpdate);
                    postJSON("train/",{ data: _.cloneCleaner(toUpdate)},function(err, data){
                        markRecord(data);
                        userData.train = data;
                        cb(err, data);
                    });
                }
            },function(err, data){
                forceToUpdate = false
                $rootScope.$broadcast('sync', true);
                saveToLocalStorage();
                callback(err,data);
            });
        }
    };
});