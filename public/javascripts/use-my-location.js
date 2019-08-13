// function geoFindMe(e) {
// 	e.preventDefault();
// }

// $('#find-me').click('on', function() {
// 	const status = $('#status');
// 	const locationInput = $('#location');

// 	function success(position) {
// 		const longitude = position.coords.longitude;
// 		const latitude = position.coords.latitude;

// 		status.textContent = '';
// 		locationInput.value = `[${longitude}, ${latitude}]`;
// 	}

// 	function error() {
// 		status.textContent = 'Unable to retrieve your location.'
// 	}

// 	if (!navigator.geolocation) {
// 		status.textContent = 'Geolocation is not supportive in your browser!';
// 	} else {
// 		status.textContent = 'Locating...';
// 		navigator.geolocation.getCurrentPosition(success, error);
// 	}
// });

$('#find-me').click('on', function() {
	getLocation();
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    // x.innerHTML = "Geolocation is not supported by this browser.";
    $('#status').val('Geolocation is not supported by this browser.');
  }
}

function showPosition(position) {
  	const longitude = position.coords.longitude;
	const latitude = position.coords.latitude;
	$('#location').val(`[${longitude}, ${latitude}]`);
}
