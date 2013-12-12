app.directive('ngExternalLink', function() {
    return {
        restrict: 'A',
        link: function(scope, $element, attrs) {
            $element.on("click",function(e){
                window.open($element.attr("href"),'_system', 'location=yes');
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        }
    };
});