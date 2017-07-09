angular.module('recreate')

.directive('camplist', () => {
  return {
    scope: {
      camps: '<'
    },
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    controller: function() {

    },
    templateUrl: 'client/src/templates/CampList.html'
  };
});