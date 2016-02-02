'use strict';

function toggleContext() {
    var btnToggleContext = document.getElementById('toggleContextIntercept');
    btnToggleContext.addEventListener('click', function() {
        chrome.runtime.sendMessage({ type: 'toggleContextIntercept' });
    });
}

function getTabs(callback) {
    chrome.tabs.query({}, function(tabs) {
       tabs = tabs.filter(function(t) { return /skep.obpon.pl\/job\/dojob\//.test(t.url); });
       callback(tabs);
    });
}

function onSelectForm(tab, li) {
    return function() {
        chrome.runtime.sendMessage({ type: 'fetchFieldsAndNotify', tabId: tab.id }, function() {
            li.style.backgroundColor = 'red';
        });
    };
};

function setupFormActivation(tabs) {
    var tabsUl = document.getElementById('tabs');
    tabs.forEach(function(tab) {
        var newLi = document.createElement('li');
        newLi.appendChild(document.createTextNode(tab.url));
        newLi.onclick = onSelectForm(tab, newLi);
        tabsUl.appendChild(newLi);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    getTabs(setupFormActivation);
    toggleContext();
});
