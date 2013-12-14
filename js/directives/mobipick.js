app.directive('ngMobipick', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var eScope = scope.$eval(attrs.ngMobipickRoot) ? $rootScope : scope;
            $(element).mobipick(scope.$eval(attrs.ngMobipick))
                .parents(".ui-btn").on("click",function(){
                    $(element).click();
                    return false;
                });
            eScope.$watch(attrs.ngModel,function(newDate){
                $(element).mobipick({
                    date:newDate
                });
            });
            $(element).on("change",function(){
                eScope[attrs.ngModel] = $(element).val();
                eScope.$apply();
            });
        }
    };
});