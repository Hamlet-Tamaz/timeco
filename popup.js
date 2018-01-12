$(document).ready(function runApp() {
    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js", function(e) {

        sessionStorage.clear();

        var startTime = Date.now();
        sessionStorage.setItem('startTime', startTime);

    //  check if page is fully loaded before calculating
        var checkPageLoaged = setInterval(function() {
            if ($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(10)').length > 0) {
                calculate();
                clearInterval(checkPageLoaged);
            }    
        }, 100)
        
        setInterval(calculate, 5000);

    //     setEventListeners();
        if (!Notification) {
          alert('Desktop notifications not available in your browser. Try Google Chrome.'); 
        }else{
          if (Notification.permission !== "granted")
            Notification.requestPermission();
        }

    //  append image to reload to keep session alive
//         $('body').append('<img id="keepMeAlive" style="height: 50px; margin-left: 6px; border-radius: 50px;" src=" http://i.imgur.com/ZIDOJ9P.gif?x="/>');
        $('body').append('<img id="keepMeAlive" style="height: 50px; margin-left: 6px; border-radius: 50px;" src="https://secure.qbillc.com/includes/images/QBI-logo_White-on-Blue_x43.png?x=1"/>');

        if(localStorage.getItem('pageRefresh') != 'false') {
            pageRefresh();
        }
    });
});


function createNewDialogue(appendTo) {
    $('div#timeDivOver').remove();
    
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
    
    var lunchDiv = '';
    if (typeof(firstRow_out) != 'undefined' && firstRow_out.innerHTML.trim().length == 0 ) {
        var lunchStyle = '"color: black; font-size: 15px;"'
        var lunchDiv = ( 
            '<div id="lunchDiv" style='+ lunchStyle +'>' +
                '<table>' + 
                    '<tr>' +
                        '<td><label>Add Lunch OR</label></td> <td><label>Desired Leave Time</label></td>' +
                    '</tr><tr>' +
                        '<td style="display: inline;"><select name="lunch" id="lunchDiv_select" style="width: 50px;">' +
                            '<option value="0">0</option>'   +
                            '<option value="30">30</option>' +
                            '<option value="45">45</option>' +
                            '<option value="60">60</option>' +
                            '<option value="75">75</option>' +
                            '<option value="90">90</option>' +
                        '</select></td>' +

                        '<td > <input type="time" id="timeDivOption_leaveAt_input" name="timeDivOption_leaveAt_input" min=>' +
                        '<button id="timeDivOption_leaveAt_submit"> GO </button> </td>' +
                    '</tr>' +
                '</table>' +
                '<p id="timeDivOption_leaveAt_rec" style="font-size: 12px"></p>' +
            '</div> <br />');
    }
    
    var timeDivStyle = '"padding: 10px; background-color: #f0f0f0; margin: 0 10px"'; //position: absolute; bottom: 100px; right: 50px; border: solid 1px black; 
    var tableStyle =   '"font-size: 20px; color: green; "';
    var timeDivOptionsStyle = '"font-size: 15px; line-height: 1.5; display: none"';

    timeDiv     =  '<div id="timeDiv" style='+ timeDivStyle +'><table style='+tableStyle+'>';
    timeDiv     +=    '<tr><td>Work Hours &nbsp </td>    <td> <span id="workHours"></span>:<span id="workMinutes"></span> </td></tr>';
    timeDiv     +=    '<tr><td>Current Time &nbsp </td>  <td> <span id="ampmNowHour"></span>:<span id="nowMinute"></span> <span id="ampmCur"></span></td></tr>';
    timeDiv     +=    '<tr><td>Time Worked &nbsp </td>   <td> <span id="hoursWorked"></span>:<span id="minutesWorked"></span> </td></tr>';
    timeDiv     +=    '<tr><td>Time Left &nbsp </td>     <td> <span id="hoursLeft"></span>:<span id="minutesLeft"></span> </td></tr>';

    // On Fridays, show time to leave as 4pm even if work time ends earlier
    // if($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(3)')[0].innerHTML.substring(0,6)=='Friday' && leaveHour < 4) {
    //     timeDiv +=    '<tr><td>Leave At &nbsp </td> <td>4:00 pm</td></tr>';
    // } else {
        timeDiv +=    '<tr><td>Leave At &nbsp </td> <td> <span id="leaveHour"></span>:<span id="leaveMinutes"></span> <span id="ampmLeave"></span></td></tr>';
    // }
//     timeDiv     +=    '<tr><td><br class="extrabr"><br class="extrabr"></td></tr>';
    timeDiv     += '</table><br />';
    timeDiv     += '<p id="advancedOptions" style="text-align: center; cursor: pointer; text-decoration: underline">Options</p>'
    timeDiv     += '<div id="timeDivOptions" style='+timeDivOptionsStyle+'><br />' + lunchDiv;
//     timeDiv     += '<label>Desired Leave Time</label> <br /> <input type="time" id="timeDivOption_leaveAt_input" name="timeDivOption_leaveAt_input" min=>' ;
//     timeDiv     += '<button id="timeDivOption_leaveAt_submit"> GO </button> <span id="timeDivOption_leaveAt_rec"></span> <br />' ;
//     timeDiv     += '<input type="checkbox" id="timeDivOption_clockOut" name="timeDivOption_clockOut"> &nbsp <label>Clock-Out</label><br />';
    timeDiv     += '<input type="checkbox" id="timeDivOption_pageRefresh" name="timeDivOption_pageRefresh"> &nbsp <label>Keep Me Signed In</label>' ;
    timeDiv     += '<br /><input type="checkbox" id="timeDivOption_getNotifications" name="timeDivOption_getNotifications"> &nbsp <label>Get Notifications</label>' ;
    timeDiv     += '</div>'; //</div><button id="addpunch-button1">close</button>
    
    appendTo.append(timeDiv);
    setEventListeners();

    if(localStorage.getItem('pageRefresh') != 'false') {
        $('#timeDivOption_pageRefresh').prop('checked', true);
//         $('#timeDivOption_pageRefresh').trigger('click');
    }

    if(localStorage.getItem('getNotifications') != 'false') {
        $('#timeDivOption_getNotifications').prop('checked', true);
//         $('#timeDivOption_getNotifications').trigger('click');
    }

    
}

function createNewDialogue_over(appendTo) {
    $('div#timeDiv').remove();
    
    var timeDivStyle = '"font-size: 15px; padding: 10px; background-color: #f0f0f0; margin: 0 10px"'; //position: absolute; bottom: 100px; right: 50px; border: solid 1px black; 
    var tableStyle =   '"font-size: 20px; color: green; "';
    var timeDivOptionsStyle = '"font-size: 15px; line-height: 1.5; display: none"';


    timeDivOver =  '<div id="timeDivOver" style='+timeDivStyle+'><table style='+ tableStyle +'>';
    timeDivOver +=     '<tr><td><h1 style="color: red">You can leave now.</h1></td></tr>';
    timeDivOver +=     '<tr><td>Work Hours: </td>   <td><span id="workHours"></span>:<span id="workMinutes"></span></td></tr>';
    timeDivOver +=     '<tr><td>Current Time: </td> <td><span id="ampmNowHour"></span>:<span id="nowMinute"></span> <span id="ampmCur"></span></td></tr>';
//     timeDivOver +=     '<tr><td>Time Worked: </td>  <td><span id="hoursWorked"></span>:<span id="minutesWorked"></span></td></tr>';
    timeDivOver +=     '<tr style="color:red"><td>Overtime: </td> <td><span id="overHours"></span>:<span id="overMinutes"></span></td></tr>';
    timeDivOver += '</table> <br />';
    timeDivOver += '<p id="advancedOptions" style="text-align: center; cursor: pointer; text-decoration: underline">Options</p>'
    timeDivOver += '<div id="timeDivOptions" style='+timeDivOptionsStyle+'><br />';
    timeDivOver += '<input type="checkbox" id="timeDivOption_pageRefresh" name="timeDivOption_pageRefresh"> &nbsp <label>Page Refresh</label>';
    timeDivOver += '<br /><input type="checkbox" id="timeDivOption_getNotifications" name="timeDivOption_getNotifications"> &nbsp <label>Notifications</label></div>' ;
    timeDivOver += '</div>';
    appendTo.append(timeDivOver);
    setEventListeners();

    if(localStorage.getItem('pageRefresh') != 'false') {
//         $('#timeDivOption_pageRefresh').prop('checked', true);
        $('#timeDivOption_pageRefresh').trigger('click');
    }

    if(localStorage.getItem('getNotifications') != 'false') {
//         $('#timeDivOption_getNotifications').prop('checked', true);
        $('#timeDivOption_getNotifications').trigger('click');
    }

}

function calculate() {

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

    var arr = []
//         , dailyTotal = $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(10)')
        , in1 = $('#mainForm #punch_list>tbody>tr:last-child td.no_wrap')[0]
        , in2 = $('#mainForm #punch_list>tbody>tr:last-child td.no_wrap')[2]
        , out1 = $('#mainForm #punch_list>tbody>tr:last-child td.no_wrap')[1]
        , out2 = $('#mainForm #punch_list>tbody>tr:last-child td.no_wrap')[3]
        , in1Hours = in1.innerText.split(':')[0]
        , in1Minutes = in1.innerText.split(':')[1]
        , out1Hours = out1.innerText.split(':')[0]
        , out1Minutes = out1.innerText.split(':')[1]
        , momIn1 
        , momOut1 
        , in2Hours = in2.innerText.split(':')[0]
        , in2Minutes = in2.innerText.split(':')[1]
        , out2Hours = out2.innerText.split(':')[0]
        , out2Minutes = out2.innerText.split(':')[1]
        , momIn2 
        , momOut2 
        , newDate = new Date()
        , cur
        , workHours
        , workMinutes
        , time = 0
        , count = 0
        , nowHour = newDate.getHours()
        , nowMinute = newDate.getMinutes()
        , ampmNowHour
        , ampmCur
        , timeWorked //= firstRow_dailyTotal
        , splitTimeWorked
        , hoursWorked
        , minutesWorked
        , timeLeft
        , hoursLeft
        , minutesLeft
        , minutesLeftCarry = 0
        , whenToLeave
        , leaveHour
        , leaveMinutes
        , leaveMinutesCarry = 0
        , ampmLeave
        , overHours
        , overMinutes
        , overMinutesCarry = 0
        , lunchVal = +$('select#lunchDiv_select').val() || 0
        , lunchOut
        , lunchOutHr
        , lunchOutMin
        , lunchDiff
        , lunchLengthMin
        , lunchLengthHour
        , lunchLength
        , timeDiv
        , timeDivOver
        , messageDiv
        , onLunch
        , preLunchWork
        , preLunchHoursWorked
        , preLunchMinutesWorked;

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


    // Get time values from screen
    if($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(3)')[0].innerHTML.substring(0,6)=='Friday') {
        workHours = 6;
        workMinutes = 30;   
    }
    else {
        workHours = 8;
        workMinutes = 0;
    }
 

    momIn1 = moment().set({hours: in1Hours, minutes: in1Minutes});
    momOut1 = moment().set({hours: out1Hours, minutes: out1Minutes});

    momIn2 = moment().set({hours: in2Hours, minutes: in2Minutes});
//     momOut2 = moment().set({hours: out2Hours, minutes: out2Minutes});

    if(+firstRow_dailyTotal > 0) {
        preLunchWork = moment.duration(momOut1.diff(momIn1));
        preLunchHoursWorked = preLunchWork._data.hours;
        preLunchMinutesWorked = preLunchWork._data.minutes;

        timeWorked = moment({hours: preLunchHoursWorked, minutes: preLunchMinutesWorked}).add(moment.duration(moment().diff(momIn2)));
    } else {
        timeWorked = moment.duration(moment().diff(momIn1));
    }

    hoursWorked = timeWorked.hours();
    minutesWorked = timeWorked.minutes();


    minutesLeft = (+workMinutes > 0 ? workMinutes : 60 ) - minutesWorked;
    hoursLeft = (minutesLeft > 0 ) ? workHours - hoursWorked - 1: workHours - hoursWorked ;
    
   

    // leave time
    
    momLeaveAt = moment().add({hours: hoursLeft, minutes: (minutesLeft + lunchVal)});
    leaveHour = momLeaveAt.hours();
    leaveMinutes = momLeaveAt.minutes() + 1; // plus one counts for differing time between console time and server/timeco time

    if (leaveHour > 12) {
        leaveHour = leaveHour % 12;
        ampmLeave = 'pm';
    } else {
        ampmLeave = 'am';
    };

    
  

    //if it is friday, you work until 8:30 - 4 regardless
    // if(newDate.getDay() != 5 && leaveHour < 4) {
    //     leaveHour = 4;
    //     leaveMinutes = '00';

    //     hoursLeft = 4 - nowHour;
    //     minutesLeft = 60 - nowMinute;
    // }

    // Over-time
    
    if( newDate.getDay() == 5 ) {
        overMinutes = newDate.getMinutes;

        if (overMinutes.toString().length < 2) overMinutes = '0' + overMinutes;

        overHours = newDate.getHours() - 4;
    } else {
        var momOverTime = moment.duration(moment().diff(momLeaveAt));
        overMinutes = momOverTime.minutes();
        overHours = momOverTime.hours();
    }


    // Style divs
    
    if (workMinutes.toString().length < 2) workMinutes = '0' + workMinutes;
    if (minutesLeft.toString().length < 2) minutesLeft = '0' + minutesLeft;
    if (minutesWorked.toString().length < 2) minutesWorked = '0' + minutesWorked;
    if (leaveMinutes.toString().length < 2) leaveMinutes = '0' + leaveMinutes;
    if (overMinutes.toString().length < 2) overMinutes = '0' + overMinutes;
  
    // var x = $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(9) span.punch-time')[0];
    var summaryRow = $('div#category-summary').parent().parent();
    var punchRow_length = $('table#punch_list tr.punch-row').length;
    var last_punchRow_out = $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(9) span.punch-time')[0];
    var last_punchRow_out_length = 0;
    if ( typeof last_punchRow_out != 'undefined') {
        last_punchRow_out_length = $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(9) span.punch-time')[0].innerHTML.trim().length;
    }

    if(punchRow_length == 10 && last_punchRow_out_length != 0) {
        messageDiv = '<div id="messageDiv"><h1> You are in a completed pay range. <br>Please update from top left corner.</h1></div>';
        
        if( !($('#messageDiv').length > 0) ) {
            $('div#ajaxContainer > table').append(messageDiv);
            $('#timeDiv').remove();
        }

        $('div#ajaxContainer > table > tbody').css({'display':'inline-block'});
        $('#messageDiv').css({'display': 'inline-block'});
    }
    else if (punchRow_length == 0) {
        messageDiv = '<div id="messageDiv"><h1>Good Morning! Please punch in to start counting your hours!</h1></div>';
        
        if( !($('#messageDiv').length > 0) ) {
            $('div#ajaxContainer').append(messageDiv);    
            $('#timeDiv').remove();
        }
    }
    else if(last_punchRow_out_length != 0) {
        if (newDate.getDate() == +$('#mainForm #punch_list>tbody>tr:last-child td:nth-child(3)').html().split(',')[1].split('/')[1]) {
            messageDiv = '<div id="messageDiv"><h1> You have clocked out for the day. <br>See you tomorrow!</h1></div>';    
        } else {
            messageDiv = '<div id="messageDiv"><h1>Good Morning! Please punch in to start counting your hours!</h1></div>';
        } 
        
        if( !($('#messageDiv').length > 0) ) {
            summaryRow.append(messageDiv);    
            $('#timeDiv').remove();
        }
    }
    else if($('#mainForm #punch_list>tbody>tr:last-child td:nth-child(7) span.punch-time')[0].innerHTML.trim().length == 0 && $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(6) span.punch-time')[0].innerHTML.trim().length != 0) {
        lunchOut = $('#mainForm #punch_list>tbody>tr:last-child td:nth-child(6) span.punch-time')[0].innerHTML.trim().split(':');

//         lunchOutHr = (lunchOut[0] > 12) ? lunchOut[0] % 12 : lunchOut[0];
        lunchOutHr = lunchOut[0];
        lunchOutMin = lunchOut[1];
        
        lunchDiff = moment.duration(moment().diff(moment().set({hours: lunchOutHr, minutes: lunchOutMin})));

        lunchLengthMin = lunchDiff.minutes();
        lunchLengthHour = lunchDiff.hours();

        if (lunchLengthMin.toString().length < 2) lunchLengthMin = '0' + lunchLengthMin;

        lunchLength = lunchLengthHour + ':' + lunchLengthMin;    

        onLunch = '<div id="messageDiv"><h1> Enjoy your lunch!</h1><h1>You\'ve been away for <span id="lunchLength">' + lunchLength +'</span>.</h1></div>';
    
        if( ($('#timeDiv').length > 0) ) {
            
            $('#timeDiv').remove();
        }

        $('#messageDiv').remove();
        summaryRow.append(onLunch);
    }
    else if (hoursWorked < workHours || (hoursWorked == workHours && minutesWorked < workMinutes) || (newDate.getDay() == 5 && newDate.getHours() < 16 ) ) {
        if(!($('#timeDiv').length > 0)) {
            if($('div#category-summary').length > 0 ){
                createNewDialogue(summaryRow)  ;
                $('#messageDiv').remove();
            } else {
                createNewDialogue($('div#ajaxContainer'))  ;
                $('#messageDiv').remove();
            }
        }

        updateDialogue();

    } else {
        if( !($('#timeDivOver').length > 0) ) {
            createNewDialogue_over(summaryRow)  ;
            $('#messageDiv').remove();
        }

        updateDialogue();
    };


    function updateDialogue() {
        if ( $('#workHours'     ).length > 0 ) $('#workHours').text(workHours) ;
        if ( $('#workMinutes'   ).length > 0 ) $('#workMinutes').text(workMinutes) ;
        if ( $('#ampmNowHour'   ).length > 0 ) $('#ampmNowHour').text(ampmNowHour) ;
        if ( $('#nowMinute'     ).length > 0 ) $('#nowMinute').text(nowMinute) ;
        if ( $('#ampmCur'       ).length > 0 ) $('#ampmCur').text(ampmCur) ;
        if ( $('#hoursWorked'   ).length > 0 ) $('#hoursWorked').text(hoursWorked) ;
        if ( $('#minutesWorked' ).length > 0 ) $('#minutesWorked').text(minutesWorked) ;
        if ( $('#hoursLeft'     ).length > 0 ) $('#hoursLeft').text(hoursLeft) ;
        if ( $('#minutesLeft'   ).length > 0 ) $('#minutesLeft').text(minutesLeft) ;
        if ( $('#leaveHour'     ).length > 0 ) $('#leaveHour').text(leaveHour) ;
        if ( $('#leaveMinutes'  ).length > 0 ) $('#leaveMinutes').text(leaveMinutes) ;
        if ( $('#ampmLeave'     ).length > 0 ) $('#ampmLeave').text(ampmLeave) ;
        if ( $('#overHours'     ).length > 0 ) $('#overHours').text(overHours) ;
        if ( $('#overMinutes'   ).length > 0 ) $('#overMinutes').text(overMinutes) ;
    }
    
    if(hoursLeft == 0 && localStorage.getItem('getNotifications') == 'true'){
        if (minutesLeft == 10 && sessionStorage.getItem('notification1') != 'true') {
            notify('Get Excited!','You have 10 minutes left.', 'notification1');
        }
        if (minutesLeft == 5 && sessionStorage.getItem('notification2') != 'true') {
            notify('Almost there...','You have 5 minutes left. Save your work and prepare to leave!', 'notification2');
        }
        if (minutesLeft == 1 && sessionStorage.getItem('notification3') != 'true') {
            notify('You did it!','You may leave now.', 'notification3');
        }
    }


};

function setEventListeners() {

    $('#addpunch-button').on('click', function(e) {
//        e.preventDefault();
       $('#timeDiv').remove();
       calculate();
    });

    $('#timeDivOption_clockOut').off('change').on('change', function(e) {
        console.log('please clock me out: ')    ;
    });


    $('#timeDivOption_pageRefresh').off('change').on('change', function(e) {
        var startTime = sessionStorage.getItem('startTime');        
        localStorage.setItem('pageRefresh', e.target.checked);

        if(e.target.checked) {
            pageRefresh();
        }else {
            clearInterval(pageRefresh_interval);
        }
        

        
    });

    $('#timeDivOption_getNotifications').off('change').on('change', function(e) {
        var startTime = sessionStorage.getItem('startTime');        
        localStorage.setItem('getNotifications', e.target.checked);
    });

    $('#timeDivOption_leaveAt_submit').off('click').on('click', function(e) {
        e.preventDefault();
        $('#lunchDiv_select').val(0);
        calculate();
        
        var leaveAt = $('#timeDivOption_leaveAt_input').val().split(':');

        var prefLeaveAtHour = +leaveAt[0] % 12;
        if (prefLeaveAtHour == 0) prefLeaveAtHour = 12;
        var prefLeaveAtMinute = +leaveAt[1];
        var prefLeaveAtCarry = 0;

        if( ( (prefLeaveAtHour - +leaveHour.innerText >= 2) || ( (prefLeaveAtHour - +leaveHour.innerText) == 1) && (((60 - +leaveMinutes.innerText)+prefLeaveAtMinute) >=30) ) || ((prefLeaveAtHour == +leaveHour.innerText) && (prefLeaveAtMinute - +leaveMinutes.innerText >= 30) ) ){
            var lunchLengthMin = prefLeaveAtMinute - +leaveMinutes.innerText;

            if (lunchLengthMin < 0) {
                lunchLengthMin = 60 + lunchLengthMin;
                prefLeaveAtCarry = 1;
                lunchLengthMin = Math.abs(lunchLengthMin);
            }

            var lunchLengthHour = prefLeaveAtHour - +leaveHour.innerText - prefLeaveAtCarry;

            $('#timeDivOption_leaveAt_rec').html('Suggested lunch time is <b>' + lunchLengthHour + 'hrs ' + lunchLengthMin + 'mins<b/>'); //<button id="timeDivOption_leaveAt_rec_button">Set</button>
            
            if(lunchLengthHour > 1 || (lunchLengthHour == 1 && lunchLengthMin > 0) ) {
                alert('Please note that the allowed lunch time is one hour. You may need to request permission.');
            }

//             $('#timeDivOption_leaveAt_rec_button').off('click').on('click', function(e) {
//                 e.preventDefault();

//                 var lunchLengthTotalMins = (lunchLengthHour * 60) + lunchLengthMin;

//                 var newOption = '<option value='+lunchLengthTotalMins+'>'+lunchLengthTotalMins+'</option>';
//                 $('#lunchDiv_select').append(newOption);

//                 $('#lunchDiv_select').val(lunchLengthTotalMins);
//             });

        }else {
            alert('Your leave time must be at least half an hour after the default.');
        }

    });

    $('#lunchDiv_select').off('change').on('change', function(e) {
        $('#timeDivOption_leaveAt_rec').text('');
        $('#timeDivOption_leaveAt_input').val(0);
        calculate();
    });

    $('#advancedOptions').on('click', function(e) {
        $('#timeDivOptions').toggle();
    });

   
};

function pageRefresh() {
    var startTime = sessionStorage.getItem('startTime');
    
    if ( (Date.now() - startTime) >= 10800000 || true) {   // if you have been logged in for 3hrs 
        sessionStorage.setItem('startTime', Date.now());
        var myImg = $('img#keepMeAlive');
        if (myImg) myImg.attr('src', myImg.attr('src').replace(/\?.*$/, '?x=' + Math.random()));
    } 
//     else {
        var pageRefresh_interval = setInterval(function() {
            if ( (Date.now() - startTime) >= 10800000 )   {
                sessionStorage.setItem('startTime', Date.now());
                var myImg = $('img#keepMeAlive');
                if (myImg.length > 0) myImg.attr('src', myImg.attr('src').replace(/\?.*$/, '?' + Math.random()));
            }
        }, 600000); // 600000 = 10 mins
//     }
}


function notify(title, body, tag, icon, url ){

  if(!icon) {
//     var ic = chrome.extension.getURL('QBI-Logo.png');
//     var ic = 'file:///C:\Users\hamlet.tamazian\Documents\Work\Timeco Extension\Release\timeco_extension v0.4.9.4.zip\timeco_extension\QBI-Logo.png';
    var ic = 'https://pbs.twimg.com/profile_images/690320093092294656/a21miJNR.jpg';
  }
  if(!url) {
    var link = 'https://timeco-login.timeco.com/Timecard/MyTimecard.aspx';
  }
  if (typeof Notification != 'undefined' ){
    if (Notification.permission == "granted"){
      
      var options = {
        icon: ic,
        body: body,
        tag: tag,
        requireInteraction: true
      }

      var notification = new Notification(title, options);
      sessionStorage.setItem(tag, 'true');

      notification.onclick = function (e) {
        window.focus();
        notification.close();
      };

      notification.addEventListener('close', function(e) {
      })
    }    
  }else{
    alert(body);
  }

}

