'use strict';

/* global require, module */

var $ = require('jquery');
var _ = require('underscore');
var keyboard = require('keyboardjs');
var List = require('list.js');

var terms = require('./terms');

var glossaryLink = $('.term'),
    glossaryIsOpen = false,
    glossaryList,
    populateList,
    findTerm,
    showGlossary,
    hideGlossary,
    clearTerm;

// Builds the List in the glossary slide panel
populateList = function(terms) {
    var itemTemplate = '<li id="glossary-list-item">' +
                        '<div class="js-accordion_header accordion__header">' +
                        '<h4 class="glossary-term"></h4>' +
                        '<a href="#" class="accordion__button js-accordion_button"></a>' +
                        '</div>' +
                        '<p class="glossary-definition js-accordion_item"></p>' +
                        '</li>';
    var options = {
        item: itemTemplate,
        valueNames: ['glossary-term'],
        listClass: 'glossary__list',
        searchClass: 'glossary__search'
    };
    glossaryList = new List('glossary', options, terms);
    glossaryList.sort('glossary-term', {order: 'asc'});
};

populateList(terms);

// Adding title to all terms
$('.term').attr('title', 'Click to define').attr('tabindex', 0);

findTerm = function(term) {
    $('.glossary__search').val(term);
    // Highlight the term and remove other highlights
    $('.term--highlight').removeClass('term--highlight');
    $('span[data-term="' + term + '"]').addClass('term--highlight');
    glossaryList.filter(function(item) {
      return item._values['glossary-term'] === term;
    });
    // Hack: Expand text for selected item
    glossaryList.search();
    _.each(glossaryList.visibleItems, function(item) {
      var $elm = $(item.elm).find('div');
      if ($elm.hasClass('accordion--collapsed')) {
        $elm.find('.accordion__button').click();
      }
    });
};

// Opens the glossary
showGlossary = function() {
    $('.side-panel--right').addClass('side-panel--open');
    $('body').addClass('panel-active--right');
    $('#glossary-toggle').addClass('active');
    $('#glossary-search').focus();
    glossaryIsOpen = true;
};

// Hides the glossary
hideGlossary = function() {
    $('.side-panel--right').removeClass('side-panel--open');
    $('.term--highlight').removeClass('term--highlight');
    $('body').removeClass('panel-active--right');
    $('#glossary-toggle').removeClass('active');
    glossaryIsOpen = false;
    clearTerm();
};

clearTerm = function() {
    $('#glossary-term').html('');
    $('#glossary-definition').html('');
    $("#glossary-search").val('');
};

module.exports = {
    init: function() {
        glossaryLink.on('click keypress', function(e){
            if (e.which === 13 || e.type === 'click') {
                var dataTerm = $(this).data('term');
                showGlossary();
                findTerm(dataTerm);
            }
        });

        $('#glossary-toggle, #hide-glossary').click(function(){
            if (glossaryIsOpen) {
                hideGlossary();
            } else {
                showGlossary();
            }
        });

        $(document.body).on('keyup', function(e) {
            if (e.keyCode == keyboard.key.code('escape')) {
                if (glossaryIsOpen) {
                    hideGlossary();
                    $('#glossary-toggle').focus();
                }
            }
        });

        // Hack: Remove filters applied by clicking a term on new user input
        $('#glossary-search').on('input', function() {
          if (glossaryList.filtered) {
            glossaryList.filter();
          }
        });
    }
};
