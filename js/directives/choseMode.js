app.directive('ngChoseMode', function($compile, $rootScope) {

    return {
        scope: 'false',
        link: function(scope, element, attrs) {
            $(element).find("[ng-next-mode]").on("click",function(){
                var train = scope.$eval(attrs.ngChoseMode);
                var nodeIndex = $rootScope.mode_names.indexOf(train.mode);
                train.mode = $rootScope.mode_names[++nodeIndex%$rootScope.mode_names.length];
                scope.$apply();
            });
            var $EColor = $(element).find("[ng-color-mode]");
            scope.$watch(attrs.ngChoseMode+".mode",function(newMode){
                $rootScope.mode && $rootScope.mode[newMode] && $EColor.css("color",$rootScope.mode[newMode].color);
            })
        }
    };
});