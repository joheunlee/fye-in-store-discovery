var quizJSON;
var landing;
var questions;
var results;
var sessionResult = [];
var list;
var listItems;

 $(document).ready(function() {
  var requestURL = '../lib/quiz.json';
  var request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();

  var requestURL2 = '../lib/list.json';
  var request2 = new XMLHttpRequest();
  request2.open('GET', requestURL2);
  request2.responseType = 'json';
  request2.send();


  request.onload = function() {
    quizJSON = request.response;
    landing = quizJSON.landing;
    questions = quizJSON.questions;    
    results = quizJSON.results;
    populateQuizLanding();

  }
  request2.onload = function() {
    list = request2.response;
    listItems = list.items;
  }
});

function populateQuizLanding() {
  $('.quiz-landing-heading').html(landing.heading);
  $('.quiz-landing-description').html(landing.description);
  $('#quiz-landing-image').attr('src', landing.image);
  $('#quiz-landing').fadeIn(1000);
}

function showQuizQuestion() {
  $('#quiz-landing').fadeOut(200);
  $('#quiz-questions-container').fadeIn(800);
  initSessionResult();
  loadQuiz();
  ga('send', 'event', 'Quiz', 'click', 'Take the Quiz');
}

//initialize the sessionResult array
function initSessionResult () {
  for (var i = 0; i < results.length; i++) {
    sessionResult.push(0);
  }
}

/* Create all the HTML structure & logic for the quiz. */
function loadQuiz() {
  for (var i = 0; i < questions.length; i++) {
    var questionNode = questions[i];
    var naturalI = i + 1;
    var $quizQContainer = $('<div>', {id: "quiz-q" + naturalI + "-container" , class: "quiz-q-container"});
    //question
    var $questionQ = $('<h1>', {id: "question-q" + naturalI, class: "question-q"});
    $questionQ.html("Q" + naturalI + ". " + questionNode.question);
    $quizQContainer.append($questionQ);
    //options
    var $optionsContainer = $('<div>', {id: "options-container"});
    for(var j = 0; j < questionNode.options.length; j++) {
      var baseID = "q" + naturalI + "-option" + j;
      var optionNode = questionNode.options[j];
      var $option = $('<div>', {id: baseID, class: "option"});
      var $optionImg = $('<img />', {id: baseID + "-img", class: "option-img", src: optionNode.image});
      var $optionTitle = $('<h2>', {id: baseID + "-title", class: "option-title"});
      $optionTitle.html(optionNode.title);
      var $optionDescription = $('<p>', {id: baseID + '-description', class: "option-description"});
      $optionDescription.html(optionNode.description);
      
      $option.append($optionImg);
      $option.append($optionTitle);
      $option.append($optionDescription);
      //adding onclick function
      $option.click({param: baseID}, onQuizOptionClick);

      $quizQContainer.append($option);
    }

    //set the visibility of the questions
    if(i != 0) {
      $quizQContainer.css('display', 'none');
    }

    $('#quiz-questions-container').append($quizQContainer);

  }
}

/* helper function: on clicking the option with the given ID, 
 * it tallies the selected option & shows the next question */
function onQuizOptionClick (event) {
  var baseID = event.data.param;
  var naturalQNum = baseID.substr(1, baseID.indexOf('-') - 1);
  var qNum = naturalQNum - 1;
  var oNum = baseID.substr(baseID.indexOf('n') + 1);
  var naturalONum = oNum + 1;
  var resultIndex = questions[qNum].options[oNum].resultIndex;
  var weights = questions[qNum].options[oNum].weight;
  //tally
  for(var i = 0; i < resultIndex.length; i++) {
    var j = resultIndex[i];
    sessionResult[j] += weights[i];
    console.log(sessionResult[j]);
  }
  //log in GA
  ga('send', 'event', 'Quiz Responses: v1', 'click', "Q" + naturalQNum + "A" + naturalONum);
  //show next question
  $('#quiz-q' + naturalQNum + '-container').hide(50);
  var nextQNum = parseInt(naturalQNum) + 1;
  if(nextQNum > questions.length) {
    //reached the end of questions
    $('#quiz-questions-container').hide(50);
    displayQuizResultLoading();
    setTimeout(populateQuizResult, 2200);
  } 
  else {
    $('#quiz-q' + nextQNum + '-container').fadeIn(400);  
  }
}

/* show & hide loading screen */
function displayQuizResultLoading() {
  var $l = $('#quiz-result-loading');
  $l.fadeIn(300).delay(1500).fadeOut(300);
  $l.css('display', 'flex');
  $l.css('align-items', 'center');
  $l.css('justify-content', 'center');
}
/* Populates quiz result page based on the result */
function populateQuizResult() {
  var maxVal = Math.max.apply(Math, sessionResult);
  //NOTE: uses the first occurence in case there are ties
  var i = sessionResult.indexOf(maxVal);
  var result = results[i];
  resultTitle = result.title;

  $('#quiz-result-title').html(result.title);
  $('#quiz-result-img').attr('src', result.image);
  $('#quiz-result-description').html(result.description);
  for(var j = 0; j < result.itemList.length; j++) {
    var itemID = result.itemList[j];
    var baseID = 'quiz-product-' + itemID;
    var $item = $('<div>', {id: baseID, class: 'quiz-product'});
    var $itemImgWrapper = $('<div>', {id: baseID + '-img-wrapper', class: 'quiz-product-img-wrapper'});
    var $itemImg = $('<img />', {id: baseID + '-img', class: 'quiz-product-img', src: listItems[itemID].images[0]});
    var $itemLabel = $('<p>', {id: baseID + '-description', class:'quiz-product-description'});
    $itemLabel.html(listItems[itemID].title);

    $itemImgWrapper.append($itemImg);
    $item.append($itemImgWrapper);
    $item.append($itemLabel);
    //adding onclick function
    $item.click({param: itemID}, onQuizProductClick);

    $('#quiz-result-items-container').append($item);
  }
  $('#quiz-result').fadeIn(1000);
  ga('send', 'page', '/quiz/result/' + result.title + '.html');
  ga('send', 'pageview');
  ga('send', 'event', 'Quiz Result', 'visit', 'Quiz Result: ' + result.title);
}

/* Global var for quiz result name */
var resultTitle;
var itemID;

/* helper function: on clicking the product grid item with the given itemID,
 * it shows the item details page */
function onQuizProductClick (event) {
  var itemID = event.data.param;
  var item = listItems[itemID];
  
  $('#item-details-primary-img').attr("src", item.images[0]);
  $('#item-details-secondary-img').attr("src", ''); //resets secondary image in case it was filled in by previous visit
  if(typeof item.images[1] != "undefined") {
    $('#item-details-secondary-img').attr("src", item.images[1]);
  }
  $('.item-details-name').html(item.title);
  $('.item-details-price').html('$' + item.price.toFixed(2) + "*");
  $('.item-details-description').html(item.description);
  var secondarySection;
  if(item.secondarySection == null) {
    secondarySection = "";
  }
  else {
    secondarySection = " > " + item.secondarySection;
  }

  $('#item-details-purchase-section').html(item.primarySection + secondarySection);
  $('#item-details-purchase-url').attr("href", item.url + "?utm_source=store-discovery&utm_medium=stores&utm_campaign=2018-05-21");

  $('#quiz-result').fadeOut(300);
  $('#item-details').fadeIn(800);
  ga('send', 'event', 'Item View', 'click', item.id + ' from Quiz Result ' + resultTitle);
  window.setTimeout(scrollToTop, 300);
  
}
function scrollToTop() {
    $('html, body').scrollTop(0);
  }
/* going back to quiz result from product detail */
function goBackToQuizResult() {
  $('#item-details').fadeOut(300);
  $('#quiz-result').show(400);
  ga('send', 'event', 'Back to quiz result', 'click', itemID);
}

function itemDetailsQuizBackTrack() {
  ga('send', 'event', 'Home', 'click', randomItem.id + " from Quiz Result " + resultTitle);
}

function takeAgain() {
  location.href='quiz.html';
  ga('send', 'event', 'Quiz', 'reload quiz page', itemID);
}

