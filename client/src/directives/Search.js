angular.module('recreate')

.directive('search', () => {
  return {
    scope: {
      search: '<'
    },
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    controller: function() {
      this.onClick = () => {
        this.search(this.query);
      };
    },
    templateUrl: 'client/src/templates/Search.html'
  };
});