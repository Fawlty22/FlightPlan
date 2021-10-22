

<<<<<<< HEAD
//list of flights for destinations
//documentation for flight API https://www.flightapi.io/docs/#getting-started
const flightAPIKey = "6170dd58559f311752870242"
const exchangeAPIKey = "10a0a9e87b4e3dfb6a11dfe5"

//API call for flight data
fetch(`https://api.flightapi.io/roundtrip/${flightAPIKey}/LHR/LAX/2021-10-25/2021-10-29/2/0/1/Economy/USD`)
.then(function(response){
    return response.json();
})
.then(function(flightData){
    console.log(flightData)
})

//API call for currency conversion
fetch(`https://v6.exchangerate-api.com/v6/${exchangeAPIKey}/latest/USD`)
.then(function(response){
    return response.json();
})
.then(function(exchangeRates){
    console.log(exchangeRates);
});

//doesn't work with the catch. Need to fix.     
// .catch(function(error) {
// 	console.log(error);
// });
=======
var displayBudgetCard = function() {
    $('#budget-input').addClass('is-block')
}

var displayLocationCards = function() {
    $('#location-section').addClass('is-flex')
}






$('#location-input').on('click', 'button', function(){
    displayBudgetCard();
})
$('#budget-input').on('click', 'button', function(){
    displayLocationCards();
})
>>>>>>> 29fbdb8f599be5c777364bc11a132e824d976f82
