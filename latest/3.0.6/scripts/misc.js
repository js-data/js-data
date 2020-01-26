function copy(value){
    const el = document.createElement('textarea');
    el.value = value;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function showTooltip(id){
    var tooltip = document.getElementById(id);
    tooltip.classList.add('show-tooltip');
    setTimeout(function(){
        tooltip.classList.remove('show-tooltip');
    }, 3000);
}

function copyFunction(id){
    // selecting the pre element
    var code = document.getElementById(id);

    // selecting the code element of that pre element
    code = code.childNodes[0]

    // copy
    copy(code.innerText);

    // show tooltip
    showTooltip('tooltip-' + id);
}

(function(){

    // capturing all pre element on the page
    var all_pre = document.getElementsByTagName("pre");

    
    
    var i, lang_name, classList, lang_name_div;
    for( i = 0; i < all_pre.length; i++){
        // get the list of class in current pre element
        classList = all_pre[i].classList;
        var id = 'pre-id-' + i;

        // tooltip
        var tooltip = '<div class="tooltip" id="tooltip-'+ id +'">Copied!</div>';
        
        // template of copy to clipboard icon container
        var copy_to_clipboard = '<div class="code-copy-icon-container" onclick="copyFunction(\''+ id +'\')"><div><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg>'+ tooltip +'<div></div>';

        // extract the code language
        lang_name = classList[classList.length - 1].split('-')[1];

        if( lang_name == undefined ) lang_name = 'JavaScript'
        
        // if(lang_name != undefined)
            lang_name_div = '<div class="code-lang-name-container"><div class="code-lang-name">'+ lang_name.toLocaleUpperCase() +'</div></div>';
        // else lang_name_div = '';
        
        // appending everythin to the current pre element
        all_pre[i].innerHTML += lang_name_div + copy_to_clipboard;
        all_pre[i].setAttribute('id', id);

    }
})()