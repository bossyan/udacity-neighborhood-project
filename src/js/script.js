var locations = [];
var markers = [];
var map, infoWindow, service;
var viewModel = {
  locations: ko.observableArray([]),
  query: ko.observable('')
};

// initialize the map
function initMap() {
  var work = {
    lat: 37.787403,
    lng: -122.403295
  };

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: work
  });

  infoWindow = new google.maps.InfoWindow();

  service = new google.maps.places.PlacesService(map);

  // search for nearby places
  service.nearbySearch({
    location: work,
    radius: 500,
    type: ['store']
  }, callback);

  // callback to create markers once nearby places has been found
  function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        locations.push(results[i]);
        viewModel.locations.push(results[i]);
        createMarker(results[i]);
      }
    }
  }

    // create markers on the map
  function createMarker(place) {
    var self;
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      title: place.name,
      animation: google.maps.Animation.DROP
    });
    marker.addListener('click', toggleBounce);

    place.marker = marker;

    // toggle bounce when the marker is clicked
    function toggleBounce(data) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 2000);
    }

    // onclick listener to show info window when the marker is clicked,
    google.maps.event.addListener(marker, 'click', function() {
      self = this;
      infoWindow.setContent('<h6>' + place.name + '</h6>' + '<p>' + place.vicinity + '</p>');
      infoWindow.open(map, self);
    });
  }
}

function setMarker(data, event) {
  var context = ko.contextFor(event.target);
  var index = context.$index();
  var location = locations[index];
  infoWindow.setContent('<h6>' + location.name + '</h6>' + '<p>' + location.vicinity + '</p>');
  infoWindow.open(map, location.marker);
  location.marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() {
    location.marker.setAnimation(null);
  }, 2000);
}

function getMarker(item) {
  for (var i = 0; i < markers.length; i++) {
    if (item.id === markers[i].id) {
      markers[i].marker;
    }
  }
}


// wait until page is done loading before running this code
$(document).ready(function() {
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });
  
  // search functionality
  viewModel.search = function(value) {
    viewModel.locations.removeAll();
    for (var location in locations) {
      if (typeof value === 'undefined' || locations[location].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        viewModel.locations.push(locations[location]);
      }
    }

  };
  viewModel.search();
  viewModel.query.subscribe(viewModel.search);
  ko.applyBindings(viewModel);

});