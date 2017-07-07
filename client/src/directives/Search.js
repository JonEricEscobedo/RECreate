angular.module('recreate')

.directive('search', () => {
  return {
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'client/src/templates/Search.html'
  };
});