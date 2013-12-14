app.directive('ngExerciseImg', function($compile, $rootScope, connect) {
    return {
        scope: 'false',
        link: function(scope, $element, attrs) {
            var exercisesUri = connect.getLocalExerciseUri();
            var exercise = scope.$eval(attrs.ngExerciseImg) || {id: -1, img: "./img/mans/man.png"};
            var src = exercisesUri[exercise.id] || exercise.img;
            $element.attr("src",src);
            scope.$watch(attrs.ngExerciseImg, function(exercise){
                var src = exercisesUri[exercise.id] || exercise.img;
                $element.attr("src",src);
            })
        }
    };
});