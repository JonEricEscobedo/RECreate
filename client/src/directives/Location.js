angular.module('recreate')

.directive('location', () => {
  return {
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'client/src/templates/Location.html'
  };
});