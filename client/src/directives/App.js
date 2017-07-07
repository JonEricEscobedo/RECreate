angular.module('recreate', [])

.directive('app', () => {
  return {
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'client/src/templates/App.html'
  };
});