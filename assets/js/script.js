var data = [];

var displayBudgetCard = function () {
    $('#budget-input').addClass('is-block')
}

var displayLocationCards = function () {
    $('#location-section').addClass('is-flex')
}


//turn input into country code and run convertToCurrencyVariable
var convertCountryInput = function (data) {
    var desiredLocation = $('#input-bar').val().trim();
    //loop through iso.js to find matching object 
    for (i = 0; i < countriesArray.length; i++) {
        var grabbedName = countriesArray[i].Entity
        if (desiredLocation === grabbedName.toLowerCase()) {
            //declare variable with country code = to user inupt
            var countryCode = countriesArray[i].AlphabeticCode
            //add it to data obj
            data.currency_code = countryCode
            //convert conversion rate object to array
            var dataArray = data.conversion_rates
            var result = Object.entries(dataArray);
            data.array_conversion_rates = result

            console.log('data', data)
            convertToCurrencyVariable(data);
            break;
        }
    }
    //clear input-bar
    $('#input-bar').val('')
}

var convertToCurrencyVariable = function (data) {
    for (i = 0; i < data.array_conversion_rates.length; i++) {
        if (data.currency_code == data.array_conversion_rates[i][0]) {
            //this is
            var currencyVariable = data.array_conversion_rates[i][1]
            console.log(currencyVariable)
        }
    }
}

// //API call for currency conversion
// const exchangeAPIKey = "10a0a9e87b4e3dfb6a11dfe5"
// fetch(`https://v6.exchangerate-api.com/v6/${exchangeAPIKey}/latest/USD`)
// .then(function(response){
//     return response.json();
// })
// .then(function(exchangeRates){
//     console.log(exchangeRates);
// });

var callFlightAPI = function () {
    //API call for flight data
    fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/SFO-sky/JFK-sky/2021-10-30?inboundpartialdate=2021-11-10", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
            "x-rapidapi-key": "66c69d12e4msh8b9325bed3418c9p1018dbjsn8cf4ae03c51f"
        }
    })
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data)
                }
                )
            }
        });
}


var callCurrAPI = function () {
    //API call for currency conversion
    fetch(`https://v6.exchangerate-api.com/v6/${exchangeAPIKey}/latest/USD`)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {

                    convertCountryInput(data)
                }
                )
            }
        });
}

//list of flights for destinations
//documentation for flight API https://www.flightapi.io/docs/#getting-started
const flightAPIKey = "6170dd58559f311752870242"
const exchangeAPIKey = "10a0a9e87b4e3dfb6a11dfe5"


$('#location-input').on('click', 'button', function () {
    displayBudgetCard();
    callCurrAPI();
})

$('#budget-input').on('click', 'button', function () {
    displayLocationCards();
    callFlightAPI();
})
