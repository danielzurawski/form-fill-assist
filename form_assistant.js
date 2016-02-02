'use strict';

var HANDLERS = {
    selectFormFields: selectFormFields,
    fillout: fillout
};

function selectFormFields(request, sendResponse) {
    var formFields = Array.apply(null, document.querySelectorAll('input'));
        formFields = formFields.filter(function(input) { return input.type == 'text'; }).map(function(i) {
    	return { name: i.name, title: i.title };
    });

    sendResponse({ formFields: formFields });
}

function fillout(request, sendResponse) {
    document.querySelector('input[name="' + request.fieldName + '"]').value = request.text;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    request.type && HANDLERS[request.type] && HANDLERS[request.type](request, sendResponse);
});
