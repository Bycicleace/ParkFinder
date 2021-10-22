var parksArray = null;

$(document).foundation()



var stateAbb = {
  "Favorites": "Favorites",
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "District Of Columbia": "DC",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
}

// Use Imput to call first API
var firstAPICall =function(stateSearch){
// fetch(https://developer.nps.gov/api/v1/parks?api_key=CV0ig8nWQLFF65A4f4FNghhUov7ovwklkr4ybJ6E)

}



let map;


function initMap(lat, lon) {
  var mapCords = { lat: lat, lng: lon };
  var mapOptions = {
    backgroundColor: 'hsla(0, 0%, 0%, 0)',
    center: mapCords,
    zoom: 12,
  };
  map = new google.maps.Map(document.getElementById("map"), mapOptions);


  var mapOptions = {
    backgroundColor: 'hsla(0, 0%, 0%, 0)'
  };

  new google.maps.Marker({
    position: mapCords,
    map,
    title: "Hello",
  })
}


/* NPS API
 We want the following from the response
   data.id
   data.url
   data.fullName
   data.description
   data.latitude
   data.longitude
   data.contacts.phoneNumbers []
   data.contacts.emailAddresses []
*/

var baseURL = "https://developer.nps.gov/api/v1/"
var parksURL = baseURL + "parks?"
var npsAPIKey = "api_key=CV0ig8nWQLFF65A4f4FNghhUov7ovwklkr4ybJ6E"

function updateStateEl(state) {
  var currentStateEl = document.querySelector(".current-state");
  currentStateEl.textContent = state
}

function getParksByState(state) {
  parksArray = [];
  updateStateEl(state);
  fetch(parksURL + "stateCode=" + stateAbb[state] + "&" + npsAPIKey)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      for (var i = 0; i < data.data.length; i++) {
        // Empty arrays for phone and emails.
        newPhoneNumbers = [];
        newEmailAddresses = [];

        // Gather phone Numbers (Voice only)
        for (var j = 0; j < data.data[i].contacts.phoneNumbers.length; j++) {
          if (data.data[i].contacts.phoneNumbers[j].type === "Voice") {
            newPhoneNumbers.push(data.data[i].contacts.phoneNumbers[j].phoneNumber);
          }
        }

        // Gather email addresses
        for (var j = 0; j < data.data[i].contacts.emailAddresses.length; j++) {
          newEmailAddresses.push(data.data[i].contacts.emailAddresses[j].emailAddress);
        }

        // Check if favorite
        var isFavorite = false;
        if (favoriteParks.length > 0) {
          for (var j = 0; j < favoriteParks.length; j++) {
            if (data.data[i].id == favoriteParks[j].id) {
              isFavorite = true;
              j = favoriteParks.length
            }
          }
        }

        // Build simplified object.
        var currentPark = {
          id: data.data[i].id,                    // Park ID
          url: data.data[i].url,                  // Park URL Landing Page
          fullName: data.data[i].fullName,        // Park Name
          description: data.data[i].description,  // Park Description
          latitude: data.data[i].latitude,        // Park Latitude Coordinate
          longitude: data.data[i].longitude,      // Park Longitude Coordinate
          phoneNumbers: newPhoneNumbers,          // Park Phone Number array
          emailAddresses: newEmailAddresses,      // Park Email Address array
          isFavorite: isFavorite                  // Whether or not on favorites list
        };

        // Push to parks array.
        parksArray.push(currentPark);
      }
    })
    .catch(function (error) {
      console.log("There was an error: " + error);
    })

  return parksArray;
}

var stateSelectionEl = document.querySelector(".search-box-container")
var resultsEl = document.querySelector(".info-container")

var formatPhoneNumber = function (phoneNumber) {
  formattedPhoneNumber = String(phoneNumber).match(/\d{3}(?=\d{2,3})|\d+/g).join("-")
  return formattedPhoneNumber;
}

var displayParks = function () {
  resultsEl.innerHTML = ""
  parksArray.forEach(function (park) {
    var parkCardCell = document.createElement("div");
    var parkCard = document.createElement("div");
    var parkCardHeader = document.createElement("div");
    var parkCardContent = document.createElement("div");
    parkCardCell.className = "cell"
    parkCardCell.id = "state-cell"
    parkCard.className = "card";
    parkCard.setAttribute("data-park-id", park.id);
    parkCardHeader.id = park.id;
    parkCardContent.id = park.id;
    parkCardHeader.className = "card-divider";
    parkCardContent.className = "card-section";
    parkCardHeader.innerHTML = park.fullName;
    parkCardContent.textContent = park.description;

    var parkCardContact = document.createElement("div")
    parkCardContact.classList.add("contactTop")
    parkCardContact.id = park.id;

    // Only if there is a phone number, print
    if (park.phoneNumbers.length > 0) {
      var parkPhoneContainer = document.createElement("div");
      var parkPhone = document.createElement("a");
      parkPhoneContainer.textContent = "Phone Number: "
      parkPhoneContainer.classList.add("contactInfo");
      parkPhoneContainer.id = park.id;
      parkPhone.setAttribute("href", "tel:" + park.phoneNumbers[0]);
      parkPhone.textContent = formatPhoneNumber(park.phoneNumbers[0]);
      parkPhoneContainer.appendChild(parkPhone);
      parkCardContact.appendChild(parkPhoneContainer);
    }

    // Only if there is an email address, print
    if (park.emailAddresses.length > 0) {
      var parkEmail = document.createElement("a");
      var parkEmailContainer = document.createElement("div");
      parkEmailContainer.textContent = "Email Address: "
      parkEmailContainer.classList.add("contactInfo");
      parkEmailContainer.id = park.id;
      parkEmail.setAttribute("href", "mailto:" + park.emailAddresses)
      parkEmail.textContent = park.emailAddresses;
      parkEmailContainer.appendChild(parkEmail);
      parkCardContact.appendChild(parkEmailContainer);
    }

    // Add link to the park
    var siteLink= document.createElement("a");
    var siteLinkContainer = document.createElement("div");
    siteLinkContainer.textContent = "Visit Site: ";
    siteLinkContainer.classList.add("contactInfo");
    siteLinkContainer.id = park.id;
    siteLink.setAttribute("href", park.url);
    siteLink.setAttribute("target", "_blank");
    siteLink.textContent = park.fullName;
    siteLinkContainer.appendChild(siteLink);
    parkCardContact.appendChild(siteLinkContainer);

    parkCardContent.appendChild(parkCardContact);

    // Favorite button
    var favoriteButton = document.createElement("button");
    favoriteButton.classList.add("button");
    favoriteButton.id = park.id
    favoriteButton.setAttribute("type", "button");

    if (park.isFavorite) {
      favoriteButton.classList.add("remove-favorite");
      favoriteButton.textContent = "Remove from Favorites";
    } else {
      favoriteButton.classList.add("favorite-button");
      favoriteButton.textContent = "Add to Favorites";
    }
    
    parkCardContent.appendChild(favoriteButton);
    
    
    parkCard.appendChild(parkCardHeader);
    parkCard.appendChild(parkCardContent);
    parkCardCell.appendChild(parkCard);
    resultsEl.appendChild(parkCardCell);
  });
};



stateSelectionEl.addEventListener("click", function (event) {

  targetEl = event.target;
  if (targetEl.matches(".state")) {
    if (targetEl.textContent == "Favorites") {
      updateStateEl("Favorites");
      parksArray = favoriteParks;
    } else {
      getParksByState(targetEl.textContent);
    }
    i = 0
    var apiCallLoad = setInterval(function () {
      if (i > 20) {
        alert("The request timed out")
        clearInterval(apiCallLoad);
      } else if (parksArray.length === 0) {
        i = i + 1
      } else {
        displayParks();
        document.querySelector(".card-section").click();
        clearInterval(apiCallLoad);
      }
    }, 500);
  };
});

var currentSelection = null;
document.addEventListener('click', function (e) {
  if (e.target.className == 'card-section' || e.target.className == 'card-divider' || e.target.className == 'contactInfo') {
    if (document.querySelector(".selected-border")) {
      document.querySelector(".selected-border").classList.remove("selected-border");
    }
    var currentSelection = document.querySelector('div[data-park-id="' + e.target.id + '"]');
    currentSelection.classList.add("selected-border");

    for (var i = 0; i < parksArray.length; i++) {
      if (parksArray[i].id == e.target.id) {
        var parkLong = parseFloat(parksArray[i].longitude, 10);
        var parkLat = parseFloat(parksArray[i].latitude, 10);
        initMap(parkLat, parkLong);
      }
    }
  }
});

var favoriteParks = []
document.addEventListener('click',function(event){
  if (event.target.classList.contains("favorite-button")){
    for (var i = 0; i < parksArray.length; i++) {
  
      if (parksArray[i].id == event.target.id) {
        // Favorites List for display
        var favoritesNew = {
          id: parksArray[i].id,                    // Park ID
          url: parksArray[i].url,                  // Park URL Landing Page
          fullName: parksArray[i].fullName,        // Park Name
          description: parksArray[i].description,  // Park Description
          latitude: parksArray[i].latitude,        // Park Latitude Coordinate
          longitude: parksArray[i].longitude,      // Park Longitude Coordinate
          phoneNumbers: parksArray[i].phoneNumbers,          // Park Phone Number array
          emailAddresses: parksArray[i].emailAddresses,      // Park Email Address array
          isFavorite: true
        }
          favoriteParks.push(favoritesNew);
          localStorage.setItem("favorites",JSON.stringify(favoriteParks));
        }

    }
    var favButton = event.target;
    favButton.classList.remove("favorite-button");
    favButton.classList.add("remove-favorite");
    favButton.textContent = "Remove from Favorites";
  } else if (event.target.classList.contains("remove-favorite")) {
    for (var i = 0; i < favoriteParks.length; i++) {
      if (favoriteParks[i].id == event.target.id) {
        favoriteParks.splice(i,1);
        localStorage.setItem("favorites", JSON.stringify(favoriteParks));
      }
      if (document.getElementById("currentState").textContent == "Favorites") {
        parksArray = favoriteParks;
        displayParks();
      }
    }
    var favButton = event.target;
    favButton.classList.remove("remove-favorite");
    favButton.classList.add("favorite-button");
    favButton.textContent = "Add to Favorites";
  }
})

function LoadFavorites() {
  favoriteParks = JSON.parse(localStorage.getItem("favorites"));
  if (favoriteParks === null || favoriteParks.length == 0) {
    favoriteParks = [];
    document.querySelector("#MN").click();
  } else {
    document.querySelector("#favorites").click();
  }
}


LoadFavorites();