const clientId = 'TKBXQ3ADZ2YR2QRFHETFVZM2C1NCOXOXHUXEN1H4PYQNFBQB';
const clientSecret = 'JBYDEL0BZ0H5JDADYANUGEW3VTKGYWC5YEEG0ENRZMJFEXGH';

const searchUrl = 'https://api.foursquare.com/v2/venues/search';
var locations = [];
var markers = [];
var map, infoWindow, service;
var viewModel = {
  locations: ko.observableArray([]),
  query: ko.observable('')
};

function generateSearchUrl(place) {
  let searchResultUrl = searchUrl;
  const {
    lng,
    lat,
    name
  } = place;

  return `${searchUrl}?ll=${lat},${lng}&client_id=${clientId}&client_secret=${clientSecret}&v=20170219&intent=match&name=${name}`;
}

function foursquareAPIError() {
  console.log('Something went wrong with Foursquare\'s API. Please try again later');
}

function getPlaceInformation(url) {
  return $.get(url);
}

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
  }, saveLocations);

  // callback to create markers once nearby places has been found
  function saveLocations(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        let place = results[i];
        locations.push(place);
        viewModel.locations.push(place);
        createMarker(place);
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
      let url = generateSearchUrl({
        name: place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });

      getPlaceInformation(url).then(function(result) {
        let venue = result.response.venues[0];
        place.formattedAddress = venue.location.formattedAddress;
        place.formattedNumber = venue.contact.formattedPhone;
        infoWindow.setContent('<h6>' + place.name + '</h6>' + '<p>' + place.formattedAddress.join('<br/>') + '</p>' + '<p>' + place.formattedNumber + '</p>');
        infoWindow.open(map, self);
      }, foursquareAPIError);

    });
  }
}

function foursquareAPIError() {
  console.log('Something went wrong with Foursquare\'s API. Please try again later');
}

function googleAPIError() {
  alert('Something went wrong while loading the Google API script. Please try again later.');
}

// wait until page is done loading before running this code
$(document).ready(function() {
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });



  viewModel.setMarker = function(data, event) {
    var context = ko.contextFor(event.target);
    var index = context.$index();
    var location = locations[index];
    let url = generateSearchUrl({
      name: location.name,
      lat: location.geometry.location.lat(),
      lng: location.geometry.location.lng()
    });
    location.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      location.marker.setAnimation(null);
    }, 2000);

    getPlaceInformation(url).then(function(result) {
      let venue = result.response.venues[0];
      location.formattedAddress = venue.location.formattedAddress;
      location.formattedNumber = venue.contact.formattedPhone;
      infoWindow.setContent('<h6>' + location.name + '</h6>' + '<p>' + location.formattedAddress.join('<br/>') + '</p>' + '<p>' + location.formattedNumber + '</p>');
      infoWindow.open(map, location.marker);
    }, foursquareAPIError);

  };

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