app.directive('ngChoseUnit', function($compile, $rootScope) {

    function setData(scope,path,value){
        var key,
            pathEls = path.split("."),
            element = scope;
        while(pathEls.length > 1 && element){
            element = element[pathEls.shift()];
        }
        while(pathEls.length > 1 ){
            key = pathEls.shift();
            element[key] = {};
            element = element[key];
        }
        element[pathEls.shift()] = value;
        scope.$apply();
    }

    return {
        scope: 'false',
        link: function(scope, $element, attrs) {
            var data, keys;

            scope.$watchCollection("["+attrs.ngChoseUnit+", "+attrs.ngChoseUnitData+"]", function(values){
                var selected,
                    id = (values[0] || scope.$eval(attrs.ngChoseUnit) || 1).toString();
                data = values[1] || scope.$eval(attrs.ngChoseUnitData);
                if(data){
                    keys = Object.keys(data);
                    selected = data[id];
                    $element.css("background",selected.color);
                    $element.html(selected.sym);
                }
            });
            $element.on("click",function(){
                var id = scope.$eval( attrs.ngChoseUnit).toString(),
                    index = keys.indexOf(id) + 1;
                setData(scope, attrs.ngChoseUnit,keys[index%keys.length]);
            });
        }
    };
});