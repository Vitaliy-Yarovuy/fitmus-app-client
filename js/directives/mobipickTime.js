app.directive('ngMobipickTime', function($rootScope) {
    return {
        restrict: 'A',
        /**
         * link method of angular directive
         * @param scope
         * @param element
         * @param attrs
         */
        link: function(scope, element, attrs) {
            //var eScope = scope.$eval(attrs.ngMobipickRoot) ? $rootScope : scope;
            $(element).mobipickTime({
                buttonTheme: "a",
                popup: {
                    theme: "b"
                }
            });
        }
    };
});