app.directive('ngExerciseImg', function($compile, $rootScope, connect) {
    return {
        scope: 'false',
        link: function(scope, $element, attrs) {
            var fakeExercise = {id: -1, img: "./img/mans/man.png"},
                exercisesUri = connect.getLocalExerciseUri(),
                exercise = scope.$eval(attrs.ngExerciseImg) || fakeExercise,
                src = exercisesUri[exercise.id] || exercise.img;
            $element.attr("src",src);
            var $src = $element.after('<span style="position:absolute;"></span>');
            $src.html(src);
            scope.$watch(attrs.ngExerciseImg, function(exercise){
                exercise = exercise || fakeExercise;
                var src = exercisesUri[exercise.id] || exercise.img;
                $element.attr("src",src);
                $src.html(src);
            })
        }
    };
});