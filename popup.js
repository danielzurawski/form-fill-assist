'use strict';

var activeFormTab;

function getTabs(callback) {
    var queryInfo = {
	active: false,
	currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
	//tabs = tabs.filter(function(t) { return /skep.obpon.pl\/job\/dojob\//.test(t.url); })
	callback(tabs);
    });
}

function setupFormActivation(tabs) {
    var tabsUl = document.getElementById('tabs');
    tabs.forEach(function(tab) {	
	var newLi = document.createElement('li');
	newLi.appendChild(document.createTextNode(tab.url));
	newLi.onclick = function() {
	    activeFormTab = tab;
	    console.log('activating tab', tab);
	}
	tabsUl.appendChild(newLi);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    getTabs(setupFormActivation);
});
