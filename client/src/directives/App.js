angular.module('recreate', [])

.directive('app', () => {
  return {
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    controller: function($http) {
      this.search = (location) => {
        console.log('here is the location:', location);
        let context = this;

        $http.post('/search', {location: location})

        .then((coords) => {
          console.log(coords);
        });

      };
    },
    templateUrl: 'client/src/templates/App.html'
  };
});