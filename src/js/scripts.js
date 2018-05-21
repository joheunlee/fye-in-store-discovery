// Viewport Checker
//= viewport_checker.js

var list;
var items;
 $(document).ready(function() {
  var requestURL = '../lib/list.json';
  var request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();


  request.onload = function() {
    list = request.response;
    items = list.items;
    fillRandomImage();
    displayRandomItem();
    $('#random-items').fadeIn(1400);
    
  }
});
/* current category object */
var currentCategory = null;
var currentCategoryIndex = 0;

/* tracking the current screen status for the backspace:
 0 - home screen
 1 - A moment & its items
 2 - An item detail
 3 - Map view */
var currentScreen = 0;

/* Back button binding */
$(window).on('keydown', function() {
	var key = event.keyCode || event.charCode;
	if(key == 8) {
		switch (currentScreen) {
    		case 0:
    			break;
    		case 1:
    			backToHome();
    			break;
    		case 2:
    			backToList();
    			break;
    		case 3:
    			backToItem();
    			break;
		}
	}
});

window.onpopstate = function (event) {
      switch (currentScreen) {
        case 0:
          break;
        case 1:
          backToHome();
          break;
        case 2:
          backToList();
          break;
        case 3:
          backToItem();
          break;
      }
};

/* hide the random screen and show item landing */
function showItemLanding() {
	$('#random-items').fadeOut(100);
	$('#item-landing').fadeIn(800);
	//add animation to the elements
	$('#item-landing-img').addClass('zoomIn');
}

/* hide the item landing & show detail page - Learn more button onlick */
function showItemDetails() {
	$('#item-landing').fadeOut(100);
	$('#item-details').fadeIn(800);
	ga('send', 'event', 'Item View from Lucky', 'click', randomItem.id + " from Lucky");
}

/* Reload the page */
function findAnother() {
	location.href='lucky.html';
	ga('send', 'event', 'Lucky', 'reload lucky page', randomItem.id);
}

/* Lucky pages */
var counter = 0;
var counterEnd = 60; //how many times we will flash the image
var animationLength = 800;
var imgs = ['img/mystery/01.png', 'img/mystery/02.png', 'img/mystery/03.png', 'img/mystery/04.png', 'img/mystery/05.png', 'img/mystery/06.png', 'img/mystery/07.png', 'img/mystery/08.png', 'img/mystery/09.png', 'img/mystery/10.png', 'img/mystery/11.png', 'img/mystery/12.png'];

function fillRandomImage() {
	counter++;
	var randIndex = Math.floor(Math.random() * imgs.length);
	/*console.log(randIndex);
	while(randIndex == prevIndex) {
		randIndex = Math.floor(Math.random() * imgs.length);
	}*/
	$('#random-img').attr('src', imgs[randIndex]);
	animationLength *= 0.88;
	if (animationLength < 50) {
		animationLength = 50;
	}
	if(counter < counterEnd) {
		setTimeout(fillRandomImage, animationLength);
	}
	//go to the next page
	else if(counter == counterEnd) {
		showItemLanding();
	}
}


/* Returns a random item from the JSON */
function getRandomItem() {
	var objKeys = Object.keys(items);
	var randKey = objKeys[Math.floor(Math.random() * objKeys.length)];
	return items[randKey];
}
/* Random item global var */
var randomItem;

/* Display a random item in the lucky page */
function displayRandomItem() {
	randomItem = getRandomItem();
	//item landing page
	$('.item-landing-name').html(randomItem.title);
	$('#item-landing-img').attr("src", randomItem.images[0]);
	//item details page
	$('#item-details-primary-img').attr("src", randomItem.images[0]);
	if(typeof randomItem.images[1] != "undefined") {
		$('#item-details-secondary-img').attr("src", randomItem.images[1]);
	}
	$('.item-details-name').html(randomItem.title);
	$('.item-details-price').html('$' + randomItem.price.toFixed(2) + "*");
	$('.item-details-description').html(randomItem.description);
	var secondarySection;
	if(randomItem.secondarySection == null) {
		secondarySection = "";
	}
	else {
		secondarySection = " > " + randomItem.secondarySection;
	}

	$('#item-details-purchase-section').html(randomItem.primarySection + secondarySection);
	$('#item-details-purchase-url').attr("href", randomItem.url + "?utm_source=store-discovery&utm_medium=stores&utm_campaign=2018-05-21");
	//return randomItem;
}

/* Extra tracking functions */
function itemDetailsBackTrack() {
	ga('send', 'event', 'Home', 'click', randomItem.id + " from Lucky");
}
function itemPositiveClick() {
	ga('send', 'event', 'Item Positive', 'click', randomItem.id);
}
function itemNegativeClick() {
	ga('send', 'event', 'Item Negative', 'click', randomItem.id);
}
function orderNowClick() {
	ga('send', 'event', 'Web Visit', 'click', randomItem.id);
}