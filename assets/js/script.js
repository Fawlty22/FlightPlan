

var displayBudgetCard = function() {
    $('#budget-input').addClass('is-block')
}

var displayLocationCards = function() {
    $('#location-section').addClass('is-flex')
}

//list of flights for destinations

//API call for flight data

fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/SFO-sky/JFK-sky/2021-10-30?inboundpartialdate=2021-11-10", {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
		"x-rapidapi-key": "66c69d12e4msh8b9325bed3418c9p1018dbjsn8cf4ae03c51f"
	}
})
.then(response => {
	return response.json();
})
.then(function(response){
    console.log(response);
})


//API call for currency conversion
const exchangeAPIKey = "10a0a9e87b4e3dfb6a11dfe5"
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

$('#location-input').on('click', 'button', function(){
    displayBudgetCard();
})
$('#budget-input').on('click', 'button', function(){
    displayLocationCards();
})
