var app = angular.module('angularTraining', []);
app.directive('username', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(username) {
                if (username.length >= 4) {
                    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)?$/.test(username)) {
                        ctrl.$setValidity('username', true);
                        ctrl.$setValidity('minlength', true);
                        return username;
                    } else {
                        ctrl.$setValidity('minlength', true);
                        ctrl.$setValidity('username', false);
                        return undefined;
                    }
                } else {
                    ctrl.$setValidity('username', true);
                    ctrl.$setValidity('minlength', false);
                    return undefined;
                }
            });
        }
    }
});
app.directive('age', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(age) {
                if (age >= 18 && age <= 65) {
                    ctrl.$setValidity('age', true);
                    return age;
                } else {
                    ctrl.$setValidity('age', false);
                    return undefined;
                }
            });
        }
    }
});
app.directive('date', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(date) {
                if (/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(date)) {
                    ctrl.$setValidity('date', true);
                    return date;
                } else {
                    ctrl.$setValidity('date', false);
                    return undefined;
                }
            });
        }
    }
});