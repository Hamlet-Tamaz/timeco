var lunchDivOn = false;

function setLunchDiv() {
    var lunchDiv = ( 
    '<div id="lunchDiv">' +
        '<p>Add Lunch</p>' +
        '<select name="lunch" id="lunch">' +
          '<option value="0">0</option>'   +
          '<option value="30">30</option>' +
          '<option value="45">45</option>' +
          '<option value="60">60</option>' +
          '<option value="75">75</option>' +
          '<option value="90">90</option>' +
        '</select>' +
    '</div>');

    lunchDiv = $(lunchDiv).css({
        "position":"absolute", 
        "bottom":"120px",
        "right": "130px",
        "z-index" : "10"
    });
    
    var lunchSelect = function() {
        setTimeout(function() {
            setLunchDiv();
        }, 4000)  
    }

    var firstRow_out = $('#mainForm #punch_list>tbody>tr:last-child td.no_wrap span')[2];

//     If we are in a holiday week, I don't want the last row in the table, but the last non-'Holiday' row.
    if( $('#mainForm #punch_list>tbody>tr:last-child td:first-child').html() == 'Holiday') {
        var tableRows = $('#mainForm #punch_list>tbody>tr');
        for( var i=tableRows.length; i>0; i-- ) {
            if(tableRows[i-1].children[0].innerText == 'Regular') {
                firstRow_out = $('#mainForm #punch_list>tbody>tr:nth-child('+ i +') td.no_wrap span')[2];
                break;
            }
        }
    }

    if (typeof(firstRow_out) != 'undefined' && firstRow_out.innerHTML.trim().length == 0 ) {
//         if($('div#category-summary').length > 0){
//             $('div#category-summary').parent().parent().append(lunchDiv);  
//         } else {
//             lunchDiv = $(lunchDiv).css({
//                 "top":"170px",
//             });

//             $('div#ajaxContainer').append(lunchDiv);
//         }
        $('div#ajaxContainer').append(lunchDiv);

//         $('#addpunch-button').off('click', lunchSelect);
    } 
//     else {
//         $('#addpunch-button').click(lunchSelect);
//     }
};

var timeco = setInterval(function() {

var firstRow_dailyTotal = +$('#mainForm #punch_list>tbody>tr:last-child td:nth-child(10)')[0].innerHTML;

//     If we are in a holiday week, I don't want the last row in the table, but the last non-'Holiday' row.
if( $('#mainForm #punch_list>tbody>tr:last-child td:first-child').html() == 'Holiday') {
    var tableRows = $('#mainForm #punch_list>tbody>tr');
    for( var i=tableRows.length; i>0; i-- ) {
        if(tableRows[i-1].children[0].innerText == 'Regular') {
            firstRow_dailyTotal = +$('#mainForm #punch_list>tbody>tr:nth-child('+ i +')').children()[8].innerHTML;
            break;
        }
    }
}

var arr = [],
    cur,
    workHours,
    workMinutes,
    time = 0,
    count = 0,
    nowHour = new Date().getHours(),
    nowMinute = new Date().getMinutes(),
    ampmNowHour,
    ampmCur,
    timeWorked = firstRow_dailyTotal,
    splitTimeWorked,
    hoursWorked,
    minutesWorked,
    timeLeft,
    hoursLeft,
    minutesLeft,
    minutesLeftCarry = 0,
    whenToLeave,
    leaveHour,
    leaveMinutes,
    leaveMinutesCarry = 0,
    ampmLeave,
    overHours,
    overMinutes,
    overMinutesCarry = 0,
    lunchVal,
    timeDiv,
    timeDivOver,
    goodbyeDiv,
    onLunch;

if (nowMinute.toString().length < 2) nowMinute = '0' + nowMinute;

if (nowHour >= 12) {
    if (nowHour > 12) {
        ampmNowHour = nowHour % 12;   
    }
    else {
        ampmNowHour = nowHour;
    }
    ampmCur = 'pm';
} else {
    ampmNowHour = nowHour;
    ampmCur = 'am';
}

if($('div.message table >tbody>tr>td:nth-child(5) >span').html() == 'Not submitted' && lunchDivOn == false) {
        lunchDivOn = true;
        setLunchDiv();
    
} 
if ($('div.message table >tbody>tr>td:nth-child(5) >span').html() != 'Not submitted') {
    lunchDivOn = false;
}



// Get time values from screen
if($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(3)')[0].innerHTML.substring(0,6)=='Friday') {
    workHours = 6;
    workMinutes = 30;   
}
else {
    workHours = 8;
    workMinutes = 0;
}

if (workMinutes.toString().length < 2) workMinutes = '0' + workMinutes;

Array.from($('#mainForm #punch_list>tbody>tr:last-child td.no_wrap') )
.reverse().forEach( (e, i, a)=>
{
    var t = e.children[1].innerHTML.trim(),
        h = t.substr(0,2),
        m = t.substr(3, 6);
    
    if(i==0 && h) {
        arr.push( {out: new Date().getTime() } );
    } else if (h) {
        arr.push( {in: new Date().setHours(h, m) } );
    } else {
        arr.push(0);    
    }; 
} );

// Set last 'Out' to current timestamp and subract last 'In' to find last period at work

arr.forEach((e,i,a)=>{
    cur = cur || 0;

    if (i%2==0) {
        if(i == 0) {
            if(!e) {a[i] = {out: Date.now()} };
            cur = a[i].out;
        };
    }else if (e.in > 0 && count == 0) {
        time = (cur - e.in) / 1000 / 60 / 60;
        count++;
    };
});

// Calculating overall time

timeWorked += time;
timeWorked = timeWorked.toFixed(10);

timeLeft = (workHours - timeWorked);

// Creating time with minutes from decimal time

splitTimeWorked = timeWorked.split('.');

hoursWorked = splitTimeWorked[0];
minutesWorked = Math.round( (60 * ('.' + splitTimeWorked[1])) ).toString();

minutesWorked = minutesWorked >= 0 ? minutesWorked : 0;

if(hoursWorked.split('')[0] == '-') {
    hoursWorked = hoursWorked.slice(1);
    minutesWorked = 0;
} 

if (minutesWorked.toString().length < 2) minutesWorked = '0' + minutesWorked;


minutesLeft = (60 - minutesWorked + +workMinutes).toString().substring(0, 2);
if (minutesLeft.length < 2) minutesLeft = '0' + minutesLeft;
if (minutesLeft >= 60) {
    minutesLeft = minutesLeft % 60;
    if (minutesLeft.toString().length < 2) minutesLeft = '0' + minutesLeft;
    minutesLeftCarry = 1;
}else if (minutesLeft == '60') {
    minutesLeft = "00";
    minutesLeftCarry = 1;
};
hoursLeft = workHours - hoursWorked + minutesLeftCarry - 1;

if (hoursLeft < 0) {
    hoursLeft = 0;
    minutesLeft = '00';
}

// leave time
lunchVal = +$('select#lunch').val() || 0;

leaveMinutes = +nowMinute + +minutesLeft + lunchVal;
if (leaveMinutes >= 120) {
    leaveMinutes = leaveMinutes % 60;
    leaveMinutesCarry = 2;

}
else if (leaveMinutes >= 60) {
    leaveMinutes = leaveMinutes % 60;
    leaveMinutesCarry = 1;

};

if (leaveMinutes.toString().length < 2) leaveMinutes = '0' + leaveMinutes;

leaveHour = nowHour + hoursLeft + leaveMinutesCarry;

if (leaveHour > 12) {
    leaveHour = leaveHour % 12;
    ampmLeave = 'pm';
} else {
    ampmLeave = 'am';
};

//if it is friday, you work until 8:30 - 4 regardless
// if(new Date().getDay() != 5 && leaveHour < 4) {
//     leaveHour = 4;
//     leaveMinutes = '00';

//     hoursLeft = 4 - nowHour;
//     minutesLeft = 60 - nowMinute;
// }

// Over-time

overMinutes = +minutesWorked + (60 - workMinutes);
if (overMinutes >= 60) {
    overMinutes = overMinutes % 60;
    overMinutesCarry = 1;
}
if (overMinutes.toString().length < 2) overMinutes = '0' + overMinutes;

overHours = hoursWorked - workHours + overMinutesCarry - 1;


// Create divs

//     timeDiv +=    '<tr><td style="font-size: 15px; color: black;" colspan="2">Make sure to only leave after 4pm.</td></tr>';


var timeDivStyle = '"font-size: 20px; color: green; position: absolute; bottom: 100px; right: 50px; border: solid 1px black; padding: 10px; background-color: #f0f0f0"';


timeDiv     =  '<div id="timeDiv"><table style='+ timeDivStyle +'>';
timeDiv     +=    '<tr><td>Work Hours: </td> <td>'   + workHours   + ":" + workMinutes   + '</td></tr>';
timeDiv     +=    '<tr><td>Current Time: </td> <td>' + ampmNowHour + ':' + nowMinute     + ' ' + ampmCur  + '</td></tr>';
timeDiv     +=    '<tr><td>Time Worked: </td> <td>'  + hoursWorked + ':' + minutesWorked + '</td></tr>';
timeDiv     +=    '<tr><td>Time Left: </td> <td>'    + hoursLeft   + ':' + minutesLeft   + '</td></tr>';

// On Fridays, show time to leave as 4pm even if work time ends earlier
// if($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(3)')[0].innerHTML.substring(0,6)=='Friday' && leaveHour < 4) {
//     timeDiv +=    '<tr><td>Leave At: </td> <td>4:00 pm</td></tr>';
// } else {
    timeDiv +=    '<tr><td>Leave At: </td> <td>'     + leaveHour   + ':' + leaveMinutes  + ' ' + ampmLeave  + '</td></tr>';
// }
timeDiv     +=    '<tr><td><br class="extrabr"><br class="extrabr"></td></tr>';
timeDiv     += '</table></div>';


timeDivOver =  '<div id="timeDiv"><table style='+ timeDivStyle +'>';
timeDivOver +=     '<tr><td><h1 style="color: red">You can leave now.</h1></td></tr>';
timeDivOver +=     '<tr><td>Work Hours: </td> <td>'   + workHours   + ':' + workMinutes   + '</td></tr>';
timeDivOver +=     '<tr><td>Current Time: </td> <td>' + ampmNowHour + ':' + nowMinute     + ' ' + ampmCur+ '</td></tr>';
timeDivOver +=     '<tr><td>Time Worked: </td> <td>'  + hoursWorked + ':' + minutesWorked + '</td></tr>';
timeDivOver +=     '<tr style="color:red"><td>Overtime: </td> <td>'       + overHours     + ':' + overMinutes +  '</td></tr>';

timeDivOver += '</table></div>';

// Style divs

// timeDiv = $(timeDiv).children().first().css({
//     "position" : "relative",
//     "color"    : "green",
//     "font-size": "20px",
//     "background-color" : "#f0f0f0",
//     "padding"  : "10px",
//     "margin-left" : "10px"
// });

$('div#timeDiv').remove();

var x = $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(9) span.punch-time')[0]


if(typeof(x) == 'undefined') {
    goodbyeDiv = '<div id="timeDiv"><h1> You are in a completed pay range. <br>Please update from top left corner.</h1></div>';

    $('div#ajaxContainer').append(goodbyeDiv);
}
else if($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(9) span.punch-time')[0].innerHTML.trim().length != 0) {
    if(new Date().getDate() == +$('#mainForm #punch_list>tbody>tr:last-child td:nth-child(3)').html().split(',')[1].split('/')[1]) {
        goodbyeDiv = '<div id="timeDiv"><h1> You have clocked out for the day. <br>See you tomorrow!</h1></div>';    
    }else {
        goodbyeDiv = '<div id="timeDiv"><h1>Good Morning! Please punch in to start counting your hours!</h1></div>';
    }
    
    $('div#category-summary').parent().parent().append(goodbyeDiv);
}
else if($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(7) span.punch-time')[0].innerHTML.trim().length == 0 && $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(6) span.punch-time')[0].innerHTML.trim().length != 0) {
    var lunchOut = $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(6) span.punch-time')[0].innerHTML.trim().split(':');
    var lunchOutHr = lunchOut[0];
    var lunchOutMin = lunchOut[1];
    
    var lunchLengthMin_trial = nowMinute - +lunchOutMin;
    
    if(lunchLengthMin_trial < 0 && +lunchOutHr == nowHour) {
        var lunchLengthMin = 0;
        var lunchLength_carry = 0;
    }
    else if(lunchLengthMin_trial < 0) {
        var lunchLengthMin = 60 + (lunchLengthMin_trial % 60);
        var lunchLength_carry = 1;
    } else {
        var lunchLengthMin = lunchLengthMin_trial;
        var lunchLength_carry = 0;
    }

    if (lunchLengthMin.toString().length < 2) lunchLengthMin = '0' + lunchLengthMin;

    var lunchLentghHr = nowHour - +lunchOutHr - lunchLength_carry;

    var lunchLength = lunchLentghHr + ':' + lunchLengthMin;

    onLunch = '<div id="timeDiv"><h1> Enjoy your lunch!</h1><h1>You\'ve been away for ' + lunchLength +'.</h1></div>';

    $('div#category-summary').parent().parent().append(onLunch);

    $('div#lunchDiv').remove(); 
}
else if (hoursWorked < workHours || (hoursWorked == workHours && minutesWorked < workMinutes) || (new Date().getDay() == 5 && new Date().getHours() < 16 ) ) {
    if($('div#category-summary').length > 0){
        $('div#category-summary').parent().parent().append(timeDiv);  

        if(arr[1] != 0 || $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(9) span.punch-time')[0].innerHTML.trim().length != 0) {
            $('div#lunchDiv').remove(); 
            Array.from($('br.extrabr')).forEach((el)=> {el.remove()} ); 
        } else {
            timeDiv = $(timeDiv).css({"top" : "-33px"});
            timeDivOver = $(timeDivOver).css({"top" : "-33px"});
        };      

        if($('#lunchDiv').length == 0) {
            setLunchDiv();
        }
    } else {
        timeDiv = $(timeDiv).css({
            "top" : "0px",
            "margin-left" : "0px",
            "display" : "inline-block"
        });

        $('div#ajaxContainer').append(timeDiv);

        if($('#lunchDiv').length == 0) {
            setLunchDiv();
        }
    }
    
} else {
    $('div#category-summary').parent().parent().append(timeDivOver);
};




}, 5000);


 
