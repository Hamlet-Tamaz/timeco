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
    
    if ($('#mainForm #punch_list>tbody>tr:last-child td.no_wrap span')[2].innerHTML.trim().length == 0 ) {
        if($('div#category-summary').length > 0){
            $('div#category-summary').parent().parent().append(lunchDiv);  
        } else {
            lunchDiv = $(lunchDiv).css({
                "top":"170px",
            });

            $('div#ajaxContainer').append(lunchDiv);
        }
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
    leaveMinutes,
    leaveMinutesCarry = 0,
    ampmLeave,
    overHours,
    overMinutes,
//     overMinutesCarry = 0,
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
};
hoursLeft = workHours - hoursWorked + minutesLeftCarry - 1;

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

// Over-time

overMinutes = minutesWorked + (60 - workMinutes);
if (overMinutes >= 60) overMinutes = overMinutes % 60;
if (overMinutes.toString().length < 2) overMinutes = '0' + overMinutes;

overHours = hoursWorked - workHours;

// Create divs
var timeDivStyle = '"font-size: 20px; color: green; position: absolute; bottom: 100px; right: 50px; border: solid 1px black; padding: 10px"';


timeDiv = ('<div id="timeDiv"><table style='+ timeDivStyle +'>'                + 
              '<tr><td>Work Hours: </td> <td>'   + workHours   + ":" + workMinutes   + '</td></tr>'   + 
              '<tr><td>Current Time: </td> <td>' + ampmNowHour + ':' + nowMinute     + ' ' + ampmCur  + '</td></tr>' +
              '<tr><td>Time Worked: </td> <td>'  + hoursWorked + ':' + minutesWorked + '</td></tr>'   +
              '<tr><td>Time Left: </td> <td>'    + hoursLeft   + ':' + minutesLeft   + '</td></tr>'   +
              '<tr><td>Leave At: </td> <td>'     + leaveHour   + ':' + leaveMinutes   + ' ' + ampmLeave  + '</td></tr>' +
              '<tr><td><br class="extrabr"><br class="extrabr">'           + '</td></tr>'   +
          '</table></div>');


timeDivOver = ('<div id="timeDiv"><table style='+ timeDivStyle +'>'                + 
                  '<tr><td><h1 style="color: red">You can leave now.</h1></td></tr>'          + 
                  '<tr><td>Work Hours: </td> <td>'   + workHours   + ':' + workMinutes   + '</td></tr>' +
                  '<tr><td>Current Time: </td> <td>' + nowHour     + ':' + nowMinute     + ' ' + ampmLeave+ '</td></tr>' +
                  '<tr><td>Time Worked: </td> <td>'  + hoursWorked + ':' + minutesWorked + '</td></tr>' +
                  '<tr style="color:red"><td>Overtime: </td> <td>'  + overHours     + ':' + overMinutes +  '</td></tr>' +
              '</table></div>');

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


 
