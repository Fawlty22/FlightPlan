var data = [];
var entireBudget = 0;
var foodNumber = 0;
var activitiesNumber = 0;
var searchHistory = JSON.parse(localStorage.getItem("search-history")) || [];
const exchangeAPIKey = "10a0a9e87b4e3dfb6a11dfe5";
var currencyVariable;



var clearSearchHistory = function() {
    localStorage.clear();
    searchHistory = [];
    $('#search-history-list').empty();
}

var displayBudgetCard = function () {
    $('#budget-input').addClass('is-block')
}

var displayLocationCards = function () {
    $('#location-section').addClass('is-flex')
    
    //Loop over cards in location-section and display none if flight price exceeds entireBudget
    for (i=0; i<$('#location-section').children('div').length; i++) {
        // get flight price from h4 element in card.
        var flightPrice = $($($($('#location-section').children('div')[i]).children('div')[0]).children('div')[1]).children('h4')[0].innerText.split('$')[1]
        var budgetForFlight = entireBudget-foodNumber-activitiesNumber
        if(flightPrice>budgetForFlight){
            $($('#location-section').children('div')[i]).addClass("display-none")
        }
    }
}

//changes span element to display the location that was searched for
var displayDesiredDestination = function() {
    $("#destination-text").text("You are going to " + $('#input-bar').val().trim() + ".")
}

//pushes the location that was searched for to local storage with "search-history" key
var desiredDestinationStorage = function() {
    searchHistory.push($('#input-bar').val().trim());
    localStorage.setItem("search-history", JSON.stringify(searchHistory));
}

// first deletes all elements in the dropdown menu, then repopulates the dropdown menu from searchHistory array
var populateSearchHistory = function(){
    $('#search-history-list').empty();
    //Loop through searchHistory array to create buttons for previously searched cities. Add event listeners to the buttons to trigger API calls and change searched text
    for(var i=0; i<searchHistory.length; i++) {
        const capitalizedDestination = searchHistory[i].charAt(0).toUpperCase() + searchHistory[i].slice(1);
        var searchedLocation = $('<button/>', {
            text: capitalizedDestination,
            class: "button is-info dropdown item",
            click: function() {
                const destination = $(this).text()
                $('#input-bar').val(destination);
                displayDesiredDestination();
                callCurrAPI();
                displayBudgetCard();
                $("#destination-text").text("You are going to " + $(this).text() + ".")
            }
        });
        $('#search-history-list').append(searchedLocation);
    }
    var historyClear = $('<button/>', {
        text: "Clear Search History",
        class: "button is-warning navbar-item",
        click: function() {
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
var convertToCountryCode = function(dataCurr){
    var desiredLocation = $('#input-bar').val().trim();
    //for the sake of when things exist, here I am declaring a few variables to pass as arguments into flightAPIcall
    var originAirportCode = $('#origin-bar').val().trim().toUpperCase();
    var leaveDate = $('#date-bar-depart').val()
    var returnDate = $('#date-bar-return').val()




    for (i = 0; i < countryCodesArray.length; i++){
        if (countryCodesArray[i].name.toLowerCase().includes(desiredLocation.toLowerCase())) {
            var countryCode = countryCodesArray[i].code;

            
            callFlightAPI(countryCode, dataCurr, originAirportCode, leaveDate, returnDate);
            break;
        }
    }
}

//makes card to display budget in converted currency
var convertedBudgetCard = function(entireBudget, foodNumber, activitiesNumber) {
    $("#converted-budget").addClass("is-flex");
    $("#budget-input").removeClass("is-flex");
    $("#budget-input").addClass("is-hidden");

    $("#total-span").text(entireBudget * currencyVariable);
    $("#food-span").text(foodNumber * currencyVariable);
    $("#activity-span").text(activitiesNumber * currencyVariable);
}

//budget math function
var budgetMath = function() {
    entireBudget = Number($('#entire-budget-input').val());
    foodNumber = Number($('#food-input').val());
    activitiesNumber = Number($('#activities-input').val());
    
    //var budgetForFlight = Number(entireBudget - (foodNumber + activitiesNumber));

    convertedBudgetCard(entireBudget, foodNumber, activitiesNumber);

    //$('#budget-text').text('Great! That leaves $' + budgetForFlight + ' for your flight.')

}

var createCards = function(dataFlight, dataCurr) {
    
    for (i = 0; i < dataFlight.Quotes.length; i++){
        var quoteID = dataFlight.Quotes[i].OutboundLeg.DestinationId
        //loop through the places array to convert destination ID into text
        for (k = 0; k < dataFlight.Places.length; k++){
            if (dataFlight.Places[k].PlaceId == quoteID){
                quoteID = dataFlight.Places[k].CityName;
            }
        }

        //make the main card div
        var card = $('<div>').addClass('card column location-card is-one-third is-full-mobile mb-4');
        //make the card-content div
        var cardContent = $('<div>') .addClass('card-content');
        //make the media div
        var mediaDiv =$('<div>') .addClass('media');
        // make the media-left div
        var mediaLeftDiv = $('<div>').addClass('media-left');
        //make the figure element
        var figure = $('<figure>').addClass('image is-48x48');
        //make the img element and append to figure
        // var image = $('<img>').attr('src', `./assets/images/number${i}.jpg`)
        // figure.append(image)
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
        if(dataFlight.Quotes[i].Direct){
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
                
                console.log('dataFlight', dataFlight)
                createCards(dataFlight, dataCurr);
            }
            )
        } else {                            // Error Handling
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
    })
    //clear input-bar
    .then(function(){
        $('#input-bar').val('')
    })
    .catch(function(response){
        console.error('error', response);
    })
}

var callCurrAPI = function () {
    //API call for currency conversion
    fetch(`https://v6.exchangerate-api.com/v6/${exchangeAPIKey}/latest/USD`)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (dataCurr) {
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






//event listeners
$('#location-input').on('click', 'button', function () {
    displayDesiredDestination();
    desiredDestinationStorage();
    populateSearchHistory();
    displayBudgetCard();
    callCurrAPI();
})

$('#budget-input').on('click', 'button', function () {
    $("#location-section").addClass("is-flex");
    budgetMath();
    displayLocationCards();
})

//too many request error modal button listener  for FlightAPI
$('#requests-error-modal').on('click', 'button', function(){
    $('#requests-error-modal').removeClass('is-block')
})

//404 Error Modal for FlightAPI
$('#not-found-error-modal').on('click', 'button', function(){
    $('#not-found-error-modal').removeClass('is-block')
})

// 400 Error for FlightAPI
$('#bad-request-error-modal').on('click', 'button', function(){
    $('#bad-request-error-modal').removeClass('is-block')
})



//initial Modal that will let the user know quick information about the site, disappears and continues website load.
$("#close-button").on("click", function () {
    $("#starter-info").removeClass("is-active");
    $("#input-section").addClass("is-flex");
})

$("#search-history-button").on("click", function() {
    $("#dropdown-target-display").toggle();
})

//application initialization
populateSearchHistory();
