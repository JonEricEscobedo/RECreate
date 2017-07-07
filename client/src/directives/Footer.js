angular.module('recreate')

.directive('footer', () => {
  return {
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'client/src/templates/Footer.html'
  };
});