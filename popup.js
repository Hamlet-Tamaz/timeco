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
        "position":"relative", 
        "top":"145px",
        "left": "45px",
        "z-index" : "10"
    });
    
    if($('div#category-summary').length > 0){
        $('div#category-summary').parent().parent().append(lunchDiv);  
    } else {
        lunchDiv = $(lunchDiv).css({
            "top":"170px",
        });

        $('div#ajaxContainer').append(lunchDiv);
    }
};

var timeco = setInterval(function() {

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
    timeWorked = +$('#mainForm #punch_list>tbody>tr:last-child td:nth-child(10)')[0].innerHTML,
    splitTimeWorked,
    hoursWorked,
    minutesWorked,
    timeLeft,
    hoursLeft,
    minutesLeft,
    minutesLeftCarry = 0,
    whenToLeave,
    leaveHour,
    leaveMinute,
    leaveMinuteCarry = 0,
    ampmLeave,
    overHours,
    overMinutes,
    lunchVal,
    timeDiv,
    timeDivOver,
    goodbyeDiv,
    onLunch;

if (nowMinute.toString().length < 2) nowMinute = '0' + nowMinute;

if (nowHour > 12) {
    ampmNowHour = nowHour % 12 ;
    ampmCur = 'pm'
} else {
    ampmNowHour = nowHour;
    ampmCur = 'am'
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
timeWorked = timeWorked.toFixed(5);

timeLeft = (workHours - timeWorked).toFixed(5);

// Creating time with minutes from decimal time

splitTimeWorked = timeWorked.split('.');

hoursWorked = splitTimeWorked[0];
minutesWorked = Math.floor( (60 * ('.' + splitTimeWorked[1])).toString() );
if (minutesWorked.toString().length < 2) minutesWorked = '0' + minutesWorked;


minutesLeft = (60 - minutesWorked + +workMinutes).toString().substring(0, 2);
if (minutesLeft.length < 2) minutesLeft = '0' + minutesLeft;
if (minutesLeft >= 60) {
    minutesLeft = minutesLeft % 60;
    minutesLeftCarry = 1;
}else if (minutesLeft == '60') {
    minutesLeft = "00";
    minutesLeftCarry = 1;
}
hoursLeft = workHours - hoursWorked + minutesLeftCarry - 1;

// Calculate leave time
lunchVal = +$('select#lunch').val() || 0;

leaveMinute = +nowMinute + +minutesLeft + lunchVal;
if (leaveMinute >= 120) {
    leaveMinute = leaveMinute % 60;
    leaveMinuteCarry = 2;

}
else if (leaveMinute >= 60) {
    leaveMinute = leaveMinute % 60;
    leaveMinuteCarry = 1;

};

if (leaveMinute.toString().length < 2) leaveMinute = '0' + leaveMinute;

leaveHour = nowHour + hoursLeft + leaveMinuteCarry;

if (leaveHour > 12) {
    leaveHour = leaveHour % 12;
    ampmLeave = 'pm'
} else {
    ampmLeave = 'am'
}

// Over-time

overHours = Math.floor( Math.abs(hoursWorked - workHours) );

overMinutes = minutesWorked - workMinutes;
if (overMinutes.toString().length < 2) overMinutes = '0' + overMinutes;

// Create divs

timeDiv = ('<div id="timeDiv"> Work Hours: ' + workHours + ":"  + workMinutes           + 
              '<br>Current Time: ' + ampmNowHour     + ':' + nowMinute     + ' ' + ampmCur  +
              '<br>Time Worked: '  + hoursWorked + ':' + minutesWorked + 
              '<br>Time Left: '    + hoursLeft   + ':' + minutesLeft   + 
              '<br>Leave At: '     + leaveHour   + ':' + leaveMinute   + ' ' + ampmLeave  +
              '<br><br class="extrabr"><br class="extrabr">'           +
          '</div>');


timeDivOver = ('<div id="timeDiv"> <h1 style="color: red">You can leave now.</h1>'        + 
                  '<br>Work Hours: '   + workHours   + ':' + workMinutes   +
                  '<br>Current Time: ' + nowHour     + ':' + nowMinute     +
                  '<br>Time Worked: '  + hoursWorked + ':' + minutesWorked + 
                  '<br><div style="color:red">Overtime: '  + overHours     + ':' + overMinutes + 
              '</div></div>');

// Style divs

timeDiv = $(timeDiv).css({
    "position" : "relative",
    "color"    : "green",
    "font-size": "20px",
    "background-color" : "#f0f0f0",
    "padding"  : "10px",
    "margin-left" : "10px"
});

timeDivOver = $(timeDivOver).css({
    "position" : "relative",
    "color"    : "green",
    "font-size": "20px",
    "background-color" : "#f0f0f0",
    "padding"  : "10px",
    "margin-left" : "10px"
});

$('div#timeDiv').remove();

if($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(9) span.punch-time')[0].innerHTML.trim().length != 0) {
    goodbyeDiv = '<div id="timeDiv"><h1> You have clocked out for the day. <br>See you tomorrow!</h1></div>';
    $('div#category-summary').parent().parent().append(goodbyeDiv);
}
else if($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(7) span.punch-time')[0].innerHTML.trim().length == 0 && $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(6) span.punch-time')[0].innerHTML.trim().length != 0) {
    onLunch = '<div id="timeDiv"><h1> Enjoy your lunch!</h1></div>';
    $('div#category-summary').parent().parent().append(onLunch);

    $('div#lunchDiv').remove(); 
}
else if (timeWorked < workHours) {
    if($('div#category-summary').length > 0){
        $('div#category-summary').parent().parent().append(timeDiv);  

        if(arr[1] != 0 || $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(9) span.punch-time')[0].innerHTML.trim().length != 0) {
            $('div#lunchDiv').remove(); 
            Array.from($('br.extrabr')).forEach((el)=> {el.remove()} ); 
        } else {
            timeDiv = $(timeDiv).css({"top" : "-33px"});
            timeDivOver = $(timeDivOver).css({"top" : "-33px"});
        };      
    } else {
        timeDiv = $(timeDiv).css({
            "top" : "0px",
            "margin-left" : "0px",
            "display" : "inline-block"
        });

        $('div#ajaxContainer').append(timeDiv);
    }
    
} else {
    $('div#category-summary').parent().parent().append(timeDivOver);
};




}, 5000);


 
