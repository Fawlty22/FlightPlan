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
    for (i = 0; i < currencyCodesArray.length; i++) {
        var grabbedName = currencyCodesArray[i].Entity
        //If desired location pulled from user input is included in the entity string in the massive currency codes array in iso.js
        if (grabbedName.toLowerCase().includes(desiredLocation.toLowerCase())) {
            //declare variable with country code = to user inupt
            var countryCode = currencyCodesArray[i].AlphabeticCode
            //add it to data obj
            data.currency_code = countryCode
            //convert conversion rate object to array
            var dataArray = data.conversion_rates
            var resultArray = Object.entries(dataArray);
            //add it to object as well
            data.array_conversion_rates = resultArray

            console.log('data', data)
            convertToCurrencyVariable(data);
            convertToCountryCode();
            break;
        }
    }
    //clear input-bar
    $('#input-bar').val('')
}

//select the conversion rate using the converted currency code
var convertToCurrencyVariable = function (data) {
    //loop through the array and find the mathcing country code, then grab the conversion rate
    for (i = 0; i < data.array_conversion_rates.length; i++) {
        if (data.currency_code == data.array_conversion_rates[i][0]) {
            var currencyVariable = data.array_conversion_rates[i][1]
            console.log(currencyVariable)
        }
    }
}


//convert user input country to country code for flight api call
var convertToCountryCode = function(){
    var desiredLocation = $('#input-bar').val().trim();

    for (i = 0; i < countryCodesArray.length; i++){
        if (desiredLocation.toLowerCase() == countryCodesArray[i].name.toLowerCase()) {
            var countryCode = countryCodesArray[i].code;
            console.log('countryCode', countryCode)

            callFlightAPI(countryCode);
        }
    }
}

//API Calls
var callFlightAPI = function (countryCode) {
    
    var destinationCountryCode = countryCode
    var originAirportCode = 'JFK'
    //url variables
    var originPlace = originAirportCode + '-sky'
    var destinationPlace = destinationCountryCode + '-sky'
    var outboundDate = '2021-11-22'
    var inboundDate = '2021-12-07'

    //API call for flight data
    fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/${originPlace}/${destinationPlace}/${outboundDate}?inboundpartialdate=${inboundDate}`, {
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
    })
    .catch(function(err){
        console.error(err);
    })
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






//event listeners
$('#location-input').on('click', 'button', function () {
    displayBudgetCard();
    callCurrAPI();
})

$('#budget-input').on('click', 'button', function () {
    displayLocationCards();
})
