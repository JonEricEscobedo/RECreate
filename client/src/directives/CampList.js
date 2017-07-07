angular.module('recreate')

.directive('camplist', () => {
  return {
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'client/src/templates/CampList.html'
  };
});