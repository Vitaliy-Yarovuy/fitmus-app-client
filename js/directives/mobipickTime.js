app.directive('ngMobipickTime', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            //var eScope = scope.$eval(attrs.ngMobipickRoot) ? $rootScope : scope;
            $(element).mobipickTime({
            });
        }
    };
});