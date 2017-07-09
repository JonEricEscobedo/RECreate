angular.module('recreate', [])

.directive('app', () => {
  return {
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    controller: function($http) {
      this.camps;

      this.search = (location) => {
        // console.log('here is the location:', location);
        let context = this;

        $http.post('/search', {location: location})
        .then((campgrounds) => {
          // context.camps.push(campgrounds.data);
          context.camps = campgrounds.data;
          console.log(context.camps);
        })
        .catch((error) => {
          console.error('There was an error handling the last request:', error);
        });

      };
    },
    templateUrl: 'client/src/templates/App.html'
  };
});