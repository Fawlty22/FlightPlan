

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
