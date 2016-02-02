'use strict';

var formFields;
var contextToggle = true;

chrome.runtime.sendMessage({ type: 'selectFormFields' }, function(fields) {
    formFields = fields;
});

chrome.runtime.sendMessage({ type: 'getContextIntercept' }, function(ctxToggle) {
    contextToggle = ctxToggle;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'formFields')
       formFields = request.formFields;
    else if (request.type == 'contextToggle')
        contextToggle = request.contextToggle;
});

window.addEventListener('contextmenu', function(e) {
    if (! contextToggle) return;
    e.preventDefault();
    var selectedText = window.getSelection().toString();
    if (! selectedText || ! formFields) return;

    toggleMenu(e, selectedText);
    //console.log('selected text', selectedText, 'formFields', formFields);
});

function onFillout(fieldName, selectedText, menu) {
    return function() {
        var origin = window.location.origin;
        chrome.runtime.sendMessage({ type: 'fillout', fieldName: fieldName, text: selectedText, origin: origin });
    };
}

function toggleMenu(e, selectedText) {
    var menu = document.createElement('ul');
    menu.classList.add("site-assistant");
    menu.classList.add("context-menu");

    Array.apply(null, formFields.map(function(b) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(b.title));
        li.onclick = onFillout(b.name, selectedText, menu);
        return li;
    })).forEach(function(li) {
       menu.appendChild(li);
    });
    
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY-200 + 'px';

    document.querySelector('body').appendChild(menu);
    document.addEventListener('click', function() {
        setTimeout(function() {
            menu.remove();
        }, 0);
    });
}
