var data = [];

var displayBudgetCard = function() {
    $('#budget-input').addClass('is-block')
}

var displayLocationCards = function() {
    $('#location-section').addClass('is-flex')
}


//turn input into country code and run convertToCurrencyVariable
var  convertCountryInput= function(data) {
    var desiredLocation =  $('#input-bar').val().trim();
    //loop through iso.js to find matching object 
    for( i= 0; i < countriesArray.length; i++) {
        var grabbedName = countriesArray[i].Entity
        if (desiredLocation === grabbedName.toLowerCase()){
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
}

var convertToCurrencyVariable = function(data) {
     for( i= 0; i < data.array_conversion_rates.length; i++) {
        if (data.currency_code == data.array_conversion_rates[i][0]){
            //this is
             var currencyVariable = data.array_conversion_rates[i][1]
             console.log(currencyVariable)
        }
    }
}

var callFlightAPI = function(){
 // //API call for flight data
// fetch(`https://api.flightapi.io/roundtrip/${flightAPIKey}/LHR/LAX/2021-10-25/2021-10-29/2/0/1/Economy/USD`)
// .then(function(response){
//     if (response.ok) {
//         response.json().then(function(data){
        
//         }
//         )}
//     });
//doesn't work with the catch. Need to fix.     
// .catch(function(error) {
// 	console.log(error);
// });
   
}
var callCurrAPI = function(){
    //API call for currency conversion
fetch(`https://v6.exchangerate-api.com/v6/${exchangeAPIKey}/latest/USD`)
.then(function(response){
if (response.ok) {
    response.json().then(function(data){
  
    convertCountryInput(data)
    }
    )}
});
}

//list of flights for destinations
//documentation for flight API https://www.flightapi.io/docs/#getting-started
const flightAPIKey = "6170dd58559f311752870242"
const exchangeAPIKey = "10a0a9e87b4e3dfb6a11dfe5"








$('#location-input').on('click', 'button', function(){
    displayBudgetCard();
    callCurrAPI();
})

$('#budget-input').on('click', 'button', function(){
    displayLocationCards();
    callAPI();
})
