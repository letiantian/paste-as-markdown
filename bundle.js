var editableTextArea = document.getElementById('content');

function handlepaste (e) {
    var types, pastedData, savedContent;

    // Browsers that support the 'text/html' type in the Clipboard API (Chrome, Firefox 22+)
    if (e && e.clipboardData && e.clipboardData.types && e.clipboardData.getData) {

        console.log(e.clipboardData);

        // Check for 'text/html' in types list. See abligh's answer below for deatils on
        // why the DOMStringList bit is needed. We cannot fall back to 'text/plain' as
        // Safari/Edge don't advertise HTML data even if it is available
        types = e.clipboardData.types;
        if (((types instanceof DOMStringList) && types.contains("text/html")) || (types.indexOf && types.indexOf('text/html') !== -1)) {

            // Extract data and pass it to callback
            pastedData = e.clipboardData.getData('text/html');

            console.log(pastedData);

            typeInTextarea($('#content'), processHtmlData(pastedData));

            // Stop the data from actually being pasted
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    }
}

function typeInTextarea(el, newText) {
      var start = el.prop("selectionStart")
      var end = el.prop("selectionEnd")
      var text = el.val()
      var before = text.substring(0, start)
      var after = text.substring(end, text.length)
      el.val(before + newText + after)
      el[0].selectionStart = el[0].selectionEnd = start + newText.length
      el.focus()
      return false
}

function processHtmlData(data) {
    data = '<div>' + data + '</div>';   // let find() run
    var dataDom = $(data);
    dataDom.filter('script').remove();
    dataDom.filter('style').remove();

    // process <a></a>
    dataDom.find('a').each(function(idx, item) {
        console.log('find a link');
        var url = $(item).attr("href");
        var content = $(item).text();
        $(this).text('['+content+'](' + url + ')');
    });

    // process <img/>
    dataDom.find('img').each(function(idx, item) {
        console.log('find an img');
        var url = $(item).attr("src");
        var content = '';
        $(this).after('<span>!['+content+'](' + url + ')</span>');
    });

    console.log('after process img: ' + dataDom.html());

    // process p,h1,h2,... 
    ['p', 'h1', 'h2', 'h3', 'h4'].forEach(function(tag, idx){
        dataDom.find(tag).each(function(index, item) {
            var content = $(item).html().trim();
            if (content.length > 0)
                $(this).html(content + '&#13;&#10;');  // add new line
        });
    });

    return dataDom.text().trim();
}

// Modern browsers. Note: 3rd argument is required for Firefox <= 6
editableTextArea.addEventListener('paste', handlepaste, false);


// add text button
function processButtonClick() {
    typeInTextarea($('#content'), 'Hello, ~');
}
document.getElementById('addText').addEventListener('click', processButtonClick, false);