const exchangeAPIKey = "10a0a9e87b4e3dfb6a11dfe5";
var currencyVariable;
var currencyData;

//clear local storage when button is pressed
var clearSearchHistory = function () {
    localStorage.clear();
    searchHistory = [];
    $('#search-history-list').empty();
}

var displayBudgetCard = function () {
    $('#budget-input').addClass('is-block')
}

var displayLocationCards = function (budgetNumbersObject) {
    $('#location-section').addClass('is-flex')
    console.log('object', budgetNumbersObject)
    //Loop over cards in location-section and display none if flight price exceeds entireBudget
    for (i = 0; i < $('#location-section').children('div').length; i++) {
        // get flight price from h4 element in card.
        var flightPrice = $($($($('#location-section').children('div')[i]).children('div')[0]).children('div')[1]).children('h4')[0].innerText.split('$')[1]
        // var budgetForFlight = entireBudget-foodNumber-activitiesNumber
        if (flightPrice > budgetNumbersObject.budgetForFlight) {
            $($('#location-section').children('div')[i]).addClass("display-none")
        }
    }
}

//changes span element to display the location that was searched for
var displayDesiredDestination = function () {
    $("#destination-text").text("You are going to " + $('#input-bar').val().trim().charAt(0).toUpperCase() + $('#input-bar').val().trim().slice(1) + " from " + $('#origin-bar').val().trim().toUpperCase() + ".")
}

//pushes the location that was searched for to local storage with "search-history" key
var desiredDestinationStorage = function () {
    //Define array for searchHistory, populates from localStorage if localStorage contains "search-history, otherwise empty array"
    var searchHistory = JSON.parse(localStorage.getItem("search-history")) || [];
    if($('#origin-bar').val()!=='' && $('#input-bar').val()!=='') {
        var historyEntry = { origin: $('#origin-bar').val().trim(), destination: $('#input-bar').val().trim() }
        searchHistory.push(historyEntry)
        localStorage.setItem("search-history", JSON.stringify(searchHistory));
        populateSearchHistory();
    }
    else {
        populateSearchHistory();
    }
}

// first deletes all elements in the dropdown menu, then repopulates the dropdown menu from searchHistory array
var populateSearchHistory = function () {
    //declare searchHistory array and populate from search-history in local storage, otherwise empty array
    var searchHistory = JSON.parse(localStorage.getItem("search-history")) || [];
    $('#search-history-list').empty();
    //Loop through searchHistory array to create buttons for previously searched cities. Add event listeners to the buttons to trigger API calls and change searched text
    for (var i = 0; i < searchHistory.length; i++) {
        const capitalizedOrigin = String(searchHistory[i].origin).toUpperCase();
        const capitalizedDestination = String(searchHistory[i].destination).charAt(0).toUpperCase() + String(searchHistory[i].destination).slice(1);
        //button for each searchHistory item, contains event listener on click 
        var searchedLocation = $('<button/>', {
            text: capitalizedOrigin + " to " + capitalizedDestination,
            class: "button is-info dropdown item",
            click: function () {
                $('#input-bar').val($(this).text().split(" to ")[1]);
                $('#origin-bar').val($(this).text().split(" to ")[0]);
                $("#destination-text").text("You are going from " + $(this).text() + ". Please select your travel dates and continue.")
            }
        });
        $('#search-history-list').append(searchedLocation);
    }
    var historyClear = $('<button/>', {
        text: "Clear Search History",
        class: "button is-warning navbar-item",
        click: function () {
            clearSearchHistory();
        }
    });
    $('#search-history-list').append(historyClear);
}

//turn input into country code and run convertToCurrencyVariable
var convertCountryInput = function (dataCurr) {
    var desiredLocation = $('#input-bar').val().trim();
    //loop through iso.js to find matching object 
    for (i = 0; i < currencyCodesArray.length; i++) {
        var grabbedName = currencyCodesArray[i].Entity
        //If desired location pulled from user input is included in the entity string in the massive currency codes array in iso.js
        if (grabbedName.toLowerCase().includes(desiredLocation.toLowerCase())) {
            //declare variable with country code = to user input
            var countryCode = currencyCodesArray[i].AlphabeticCode
            //add it to data obj
            dataCurr.currency_code = countryCode
            //convert conversion rate object to array
            var dataArray = dataCurr.conversion_rates
            var resultArray = Object.entries(dataArray);
            //add it to object as well
            dataCurr.array_conversion_rates = resultArray
            convertToCurrencyVariable(dataCurr);
            convertToCountryCode(dataCurr);
            break;
        }
    }
}

//select the conversion rate using the converted currency code
var convertToCurrencyVariable = function (dataCurr) {
    //loop through the array and find the matching country code, then grab the conversion rate
    for (i = 0; i < dataCurr.array_conversion_rates.length; i++) {
        if (dataCurr.currency_code == dataCurr.array_conversion_rates[i][0]) {
            currencyVariable = dataCurr.array_conversion_rates[i][1]
            dataCurr.desiredConversion = currencyVariable
            break;
        }
    }
}


//convert user input country to country code for flight api call
var convertToCountryCode = function (dataCurr) {
    var desiredLocation = $('#input-bar').val().trim();
    //for the sake of when things exist, here I am declaring a few variables to pass as arguments into flightAPIcall
    var originAirportCode = $('#origin-bar').val().trim().toUpperCase();
    var leaveDate = $('#date-bar-depart').val()
    var returnDate = $('#date-bar-return').val()




    for (i = 0; i < countryCodesArray.length; i++) {
        if (countryCodesArray[i].name.toLowerCase().includes(desiredLocation.toLowerCase())) {
            var countryCode = countryCodesArray[i].code;


            callFlightAPI(countryCode, dataCurr, originAirportCode, leaveDate, returnDate);
            break;
        }
    }
}

//makes card to display budget in converted currency
var convertedBudgetCard = function (budgetNumbersObject) {
    $("#converted-budget").addClass("is-flex");
    $("#budget-input").removeClass("is-flex");
    $("#budget-input").addClass("is-hidden");
    var budgetForFlight = Number(entireBudget - (foodNumber + activitiesNumber));


    var totalBudget = budgetNumbersObject.entireBudget * currencyVariable;

    $("#total-span").text(new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyData.currency_code }).format(totalBudget));
    $("#food-span").text(new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyData.currency_code }).format(budgetNumbersObject.foodNumber * currencyVariable));
    $("#activity-span").text(new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyData.currency_code }).format(budgetNumbersObject.activitiesNumber * currencyVariable));
    $("#flight-span").text("USD $" + (budgetNumbersObject.budgetForFlight).toFixed(2));

}

//budget math function
var budgetMath = function () {
    entireBudget = Number($('#entire-budget-input').val());
    foodNumber = Number($('#food-input').val());
    activitiesNumber = Number($('#activities-input').val());

    var budgetForFlight = Number(entireBudget - (foodNumber + activitiesNumber));
    var budgetNumbersObject = { entireBudget: entireBudget, foodNumber: foodNumber, activitiesNumber: activitiesNumber, budgetForFlight: budgetForFlight };

    displayLocationCards(budgetNumbersObject);
    convertedBudgetCard(budgetNumbersObject);

    //$('#budget-text').text('Great! That leaves $' + budgetForFlight + ' for your flight.')

}

var createCards = function (dataFlight, dataCurr) {

    for (i = 0; i < dataFlight.Carriers.length; i++) {
        var quoteID = dataFlight.Quotes[i].OutboundLeg.DestinationId
        //loop through the places array to convert destination ID into text
        for (k = 0; k < dataFlight.Places.length; k++) {
            if (dataFlight.Places[k].PlaceId == quoteID) {
                quoteID = dataFlight.Places[k].CityName;
            }
        }

        //make the main card div
        var card = $('<div>').addClass('card column location-card is-one-third is-full-mobile mb-4');
        //make the card-content div
        var cardContent = $('<div>').addClass('card-content');
        //make the media div
        var mediaDiv =$('<div>') .addClass('media is-flex is-justify-content-center');
        // make the media-left div
        var mediaLeftDiv = $('<div>').addClass('media-left');
        //make the figure element
        var figure = $('<figure>').addClass('image is-48x48');
        //make the media content div
        var mediaContent = $('<div>').addClass('media-content');
        //make the title using quoteID which is the city name of destination airport
        var title = $('<p>').addClass('title is-3').text(quoteID);
        //make the content div 
        var contentDiv = $('<div>').addClass('content');
        //make the h4's that hold flight price
        var h4Price = $('<h4>').text('Price of Flight: $' + dataFlight.Quotes[i].MinPrice);
        var h4Carrier = $("<h4>").text("Carrier: " + dataFlight.Carriers[i].Name);

        // displays if the flight is Direct or not.
        if (dataFlight.Quotes[i].Direct) {
            var h4DirFlight = $("<h4>").text("This Flight is direct.")
        } else {
            var h4DirFlight = $("<h4>").text("This Flight is NOT direct.")
        }

        //append h4's to contentDiv
        contentDiv.append(h4Price);
        contentDiv.append(h4Carrier);
        contentDiv.append(h4DirFlight);
        //append image to figure
        // figure.append(image);
        //append figure to mediaLeftDiv
        mediaLeftDiv.append(figure);
        //append p to mediaContent
        mediaContent.append(title);
        //append mediacontent and medialeft to mediaDiv
        mediaDiv.append(mediaLeftDiv);
        mediaLeftDiv.append(mediaContent);
        //append mediaDiv and content to cardContent
        cardContent.append(mediaDiv);
        cardContent.append(contentDiv);
        //append cardContent to card
        card.append(cardContent);
        //append card to page
        $('#location-section').append(card)
    }
}

//API Calls
var callFlightAPI = function (countryCode, dataCurr, originAirportCode, leaveDate, returnDate) {

    var destinationCountryCode = countryCode
    var originAirportCode = originAirportCode
    //url variables
    var originPlace = originAirportCode + '-sky'
    var destinationPlace = destinationCountryCode + '-sky'

    //API call for flight data
    fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/${originPlace}/${destinationPlace}/${leaveDate}?inboundpartialdate=${returnDate}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
            "x-rapidapi-key": "66c69d12e4msh8b9325bed3418c9p1018dbjsn8cf4ae03c51f"
        }
    })
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (dataFlight) {
                    //if No Flights, Modal Shows
                    if (dataFlight.Quotes.length === 0) {
                        $('#no-flights-modal').addClass('is-block')
                    }

                    console.log('dataFlight', dataFlight)
                    createCards(dataFlight, dataCurr);
                })
            }
            else {
                //404 Error 
                if (response.status == 404) {
                    $('#not-found-error-modal').addClass('is-block')

                    //429 Too Many Requests Error 
                } else if (response.status == 429) {
                    $('#requests-error-modal').addClass('is-block')

                    //Bad Request Error    
                } else if (response.status == 400) {
                    $('#bad-request-error-modal').addClass('is-block')
                }
            }
            //clear input-bar
        })
        .then(function () {
            $('#input-bar').val('')
            $('#origin-bar').val('')
        })
        .catch(function (response) {
            console.error('error', response);
        })
}

var callCurrAPI = function () {
    //API call for currency conversion
    fetch(`https://v6.exchangerate-api.com/v6/${exchangeAPIKey}/latest/USD`)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (dataCurr) {
                    currencyData = dataCurr;
                    convertCountryInput(dataCurr)
                }
                )
            } else {                    // Error Handling
                //404 Error 
                if (response.status == 404) {
                    $('#not-found-error-modal').addClass('is-block')

                    //Bad Request Error    
                } else if (response.status == 400) {
                    $('#bad-request-error-modal').addClass('is-block')
                }
            }
        })
}

//check if the checkbox is checked...wait what? This is going to verify whether or not it's checked, and add 'visited' to localstorage
var validateCheckbox = function () {
    if (document.getElementById('start-checkbox').checked) {
        localStorage.setItem('FlightRouletteVisited', 'visited')
    }

}
//if localstorage has 'FlightRouletteVisited', don't show initial modal
var hideInitialModal = function () {
    if (localStorage.getItem('FlightRouletteVisited')) {
        $('#starter-info').removeClass('is-active')
        $("#input-section").addClass("is-flex");
    }
}



//event listeners

$('#continueBtn').on('click', function () {
    if ($('#input-bar').val() && $("#origin-bar").val() && $("#date-bar-return").val() && $("#date-bar-depart").val()) {
        displayDesiredDestination();
        desiredDestinationStorage();
        populateSearchHistory();
        callCurrAPI();
        displayBudgetCard();
    } else {
        $("#country-modal").addClass('is-active')
    };
});

$('#submitBtn').on('click', function () {
    if ($('#entire-budget-input').val() && $("#food-input").val() && $("#activities-input").val()) {
       
        $("#location-section").addClass("is-flex");
        budgetMath();
        
        
    } else {
        $("#budget-modal").addClass('is-active')
    }
});

$("#input-modal-close").on('click', function (event) {
    $("#country-modal").removeClass('is-active');
    event.preventDefault();
})

$("#airport-modal-close").on('click', function (event) {
    $("#airport-modal").removeClass('is-active');
    event.preventDefault();
})

$("#budget-modal-close").on('click', function (event) {
    $("#budget-modal").removeClass('is-active');
    event.preventDefault();
})


//too many request error modal button listener  for FlightAPI
$('#requests-error-modal').on('click', 'button', function () {
    $('#requests-error-modal').removeClass('is-block')
    location.reload();
})

//404 Error Modal for FlightAPI
$('#not-found-error-modal').on('click', 'button', function () {
    $('#not-found-error-modal').removeClass('is-block')
    location.reload();
})

// 400 Error for FlightAPI
$('#bad-request-error-modal').on('click', 'button', function () {
    $('#bad-request-error-modal').removeClass('is-block')
    location.reload();
})

//no flights modal event listener
$('#no-flights-modal').on('click', 'button', function () {
    $('#no-flights-modal').removeClass('is-block')
    location.reload();
})


//initial Modal that will let the user know quick information about the site, disappears and continues website load.
$("#close-button").on("click", function () {
    validateCheckbox();

    $("#starter-info").removeClass("is-active");
    $("#input-section").addClass("is-flex");
})

$("#search-history-button").on("click", function () {
    $("#dropdown-target-display").toggle();
})


//application initialization
hideInitialModal();
populateSearchHistory();
