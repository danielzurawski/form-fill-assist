'use strict';

function toggleContext() {
    var btnToggleContext = document.getElementById('ffa_toggleContextIntercept');
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
            var tabs = document.getElementById('ffa_tabs');
            Array.prototype.forEach.call(tabs.childNodes, function( t ){
                t.classList.remove('active');
            });

            li.classList.add('active');
        });
    };
};

function setupFormActivation(tabs) {
    chrome.runtime.sendMessage({ type: 'getCurrentTabId' }, function(currentTabId) {
        var tabsUl = document.getElementById('ffa_tabs');
        tabs.forEach(function(tab) {
            var newLi = document.createElement('li');
            if (currentTabId && currentTabId == tab.id) newLi.classList.add('active');
            newLi.appendChild(document.createTextNode(tab.url));
            newLi.onclick = onSelectForm(tab, newLi);
            tabsUl.appendChild(newLi);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    getTabs(setupFormActivation);
    toggleContext();
});
