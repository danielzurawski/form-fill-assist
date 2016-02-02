'use strict';

var activeFormTabId;
var activeFields;

var toggleContext = false;

var HANDLERS = {
    selectFormFields: selectFormFields,
    fetchFieldsAndNotify: fetchFieldsAndNotify,
    fillout: filloutProxy,
    toggleContextIntercept: toggleContextIntercept,
    getContextIntercept: getContextIntercept
};


function getContextIntercept(request, sendResponse) {
    sendResponse(toggleContext);
};

function toggleContextIntercept() {
    toggleContext = ! toggleContext;
    sendToAllTabs({ type: 'contextToggle', contextToggle: toggleContext });
}

function fetchFieldsAndNotify(request) {
    if (! request.tabId) return;

    activeFormTabId = request.tabId;

    chrome.tabs.sendMessage(request.tabId, { type: 'selectFormFields' }, function (fields) {
        if (! fields) return;

        activeFields = fields.formFields;
        sendToAllTabs({ type: 'formFields', formFields: activeFields });
    });
}

function selectFormFields(request, sendResponse) {
    if (activeFields) {
        sendResponse(activeFields);
        sendToAllTabs({ type: 'formFields', formFields: activeFields});
    }
}

function sendToAllTabs(data) {
    chrome.tabs.query({}, function(tabs) {
       tabs.forEach(function(t) {
           chrome.tabs.sendMessage(t.id, data);
       });
    });
}

function filloutProxy(request, sendResponse) {
    if (activeFormTabId)
       chrome.tabs.sendMessage(activeFormTabId, request);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    request.type && HANDLERS[request.type] && HANDLERS[request.type](request, sendResponse);
});
