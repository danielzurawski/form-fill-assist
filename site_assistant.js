'use strict';

var formFields;
var contextToggle = true;

var CSS_ITEM_HEIGHT=46;
var CSS_ITEM_WIDTH=298;
var CSS_ITEM_ADDITIONAL_HEIGHT=10;

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
    var selectedText = e.target.innerText;
    if (! selectedText || ! formFields) return;

    toggleMenu(e, selectedText);
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
    menu.classList.add("ffa_context-menu");

    Array.apply(null, formFields.map(function(b) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(b.title));
        li.onclick = onFillout(b.name, selectedText, menu);
        return li;
    })).forEach(function(li) {
       menu.appendChild(li);
    });

    positionMenu(e, menu);

    document.querySelector('body').appendChild(menu);
    document.addEventListener('click', function() {
        setTimeout(function() {
            menu.remove();
        }, 0);
    });
}

function positionMenu(e, menu) {
    var clickX = e.pageX;
    var clickY = e.pageY;

    var menuWidth = menu.offsetWidth + CSS_ITEM_WIDTH;
    var menuHeight = menu.offsetHeight + (menu.childNodes.length*CSS_ITEM_HEIGHT) + CSS_ITEM_ADDITIONAL_HEIGHT;
    var windowWidth = window.pageXOffset + window.innerWidth;
    var windowHeight = window.pageYOffset + window.innerHeight;

    if ( (windowWidth - clickX) < menuWidth ) {
        menu.style.left = (windowWidth - menuWidth) + "px";
    } else {
        menu.style.left = clickX + "px";
    }

    if ( (windowHeight - clickY) < menuHeight ) {
        menu.style.top = (windowHeight - menuHeight) + "px";
    } else {
        if ((clickY - (menuHeight/2)) > window.pageYOffset)
            menu.style.top = (clickY - (menuHeight/2)) + "px";
        else
            menu.style.top = clickY + "px";
    }
}
