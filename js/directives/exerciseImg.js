app.directive('ngExerciseImg', function($compile, $rootScope, connect) {
    return {
        scope: 'false',
        link: function(scope, $element, attrs) {
            var fakeExercise = {id: -1, img: "./img/mans/man.png"},
                exercisesUri = connect.getLocalExerciseUri(),
                exercise = scope.$eval(attrs.ngExerciseImg) || fakeExercise,
                src = exercisesUri[exercise.id] || exercise.img;
            $element.attr("src",src);
            $element.addAfter("")
            scope.$watch(attrs.ngExerciseImg, function(exercise){
                exercise = exercise || fakeExercise;
                var src = exercisesUri[exercise.id] || exercise.img;
                $element.attr("src",src);
            })
        }
    };
});