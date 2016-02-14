'use strict';

var activeFormTabId;
var activeFields;

var toggleContext = false;

var HANDLERS = {
    selectFormFields: selectFormFields,
    fetchFieldsAndNotify: fetchFieldsAndNotify,
    fillout: filloutProxy,
    toggleContextIntercept: toggleContextIntercept,
    getContextIntercept: getContextIntercept,
    getCurrentTabId: getCurrentTabId
};

function getCurrentTabId(request, sendResponse) {
    sendResponse(activeFormTabId);
}

function getContextIntercept(request, sendResponse) {
    sendResponse(toggleContext);
};

function toggleContextIntercept() {
    toggleContext = ! toggleContext;
    sendToAllTabs({ type: 'contextToggle', contextToggle: toggleContext });
}

function fetchFieldsAndNotify(request, sendResponse) {
    if (! request.tabId) return;

    activeFormTabId = request.tabId;

    if (activeFields) notify();
    else
        chrome.tabs.sendMessage(request.tabId, { type: 'selectFormFields' }, function (fields) {
            if (! fields) return;

            activeFields = fields.formFields;
            notify();
        });

    function notify() {
        sendToAllTabs({ type: 'formFields', formFields: activeFields }, sendResponse);
    }
}

function selectFormFields(request, sendResponse) {
    if (activeFields) {
        sendResponse(activeFields);
        sendToAllTabs({ type: 'formFields', formFields: activeFields});
    }
}

function sendToAllTabs(data, cb) {
    chrome.tabs.query({}, function(tabs) {
       tabs.forEach(function(t) {
           chrome.tabs.sendMessage(t.id, data);
           if (cb) cb();
       });
    });
}

function filloutProxy(request, sendResponse) {
    if (activeFormTabId)
       chrome.tabs.sendMessage(activeFormTabId, request);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    request.type && HANDLERS[request.type] && HANDLERS[request.type](request, sendResponse);
    return true;
});
