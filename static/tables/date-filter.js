
function filterByDate(daysBeforeNow) {
    let compareDate = new Date();
    compareDate.setDate(compareDate.getDate() - daysBeforeNow);

    let tdDate;
    $('tr').each(function(){
        tdObject = $(this).find('td.date');

        if (tdObject[0]) { // if date object found
            tdText = tdObject.text();
            tdDate = new Date(tdText);

            tdDate = ((tdDate-compareDate)/1000/60/60/24/30);
            if(tdDate > 0 && tdDate < daysBeforeNow){
                $(this).removeClass("date-hide");
            }else $(this).addClass("date-hide");
        }
    });
}

function filterLastWeek() {
    filterByDate(7);
}

function filterLastTwoWeeks() {
    filterByDate(14);
}

function filterLastThirtyDays() {
    filterByDate(30);
}

function filterLastYear() {
    filterByDate(365);
}

function filterAllDate() {
    $('tr').each(function(){
        $(this).removeClass("date-hide");
    });
}


function dateFilter(event) {
    let value = event.target.value;

    if (value == 7) {
        filterLastWeek();
    } else if (value == 14) {
        filterLastTwoWeeks();
    } else if (value == 30) {
        filterLastThirtyDays();
    } else if (value == 365) {
        filterLastYear();
    } else {
        filterAllDate();
    }
}
