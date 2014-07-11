/** 
* default styles
* always loaded 
*/
var default_style = {
    '.pages .selected': {
        'background-color': 'transparent',
        'font-weight': 'bold'
    },
    '.banner-back, .ownbanner-back, #playads_dummy, #playads': {
        'display': 'none'
    },
    '#topics-list .item td.last-post': {
        'vertical-align': ' middle'
    },
    '#topics-list .item td': {
        'height': '40px',
        'padding': ' 0px 0px'
    }
};

function json2css(obj) {
    var out = '';
    for(var selector in obj) {
        out += selector + '{';
        for(var css in obj[selector]) {
            out += css + ':' + obj[selector][css] + ' !important;';
        }
        out += '}';
    }
    return out;
} 

/* checked accounts */
var checkedUsers = [218552, 30297, 57333, 323172, 111001, 166516, 24119, 101646, 70019, 76392, 2065, 147900, 4912, 148447, 260895];
var checkedAccaunts = [171789, 282920, 246730, 261337, 226863, 234982, 240582, 238636, 247706, 245345, 285288, 288176, 4598, 273214, 270458, 204704, 247706, 234050, 207424, 298274, 279700];
var adminUsers = [82885, 21, 123190];
var css_txt = '';

for(var i=0;i<checkedUsers.length;i++) {
    css_txt += '#posts-list .posth a.user[href="/profile/'+checkedUsers[i].toString()+'"]{color: brown !important;}';
}
for(var i=0;i<checkedAccaunts.length;i++) {
    css_txt += '#posts-list .posth a.user[href="/profile/'+checkedAccaunts[i].toString()+'"]{color: #00a0ef !important;}';
}