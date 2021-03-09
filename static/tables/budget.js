function getTableData(tableId) {

    //gets table
    var oTable = document.getElementById(tableId); // table must have this id

    //gets rows of table
    var rowLength = oTable.rows.length;

    // arrays to store info
    let data = {}

    //loops through rows
    for (i = 1; i < rowLength; i++) { // skip the header row

        if (oTable.rows.item(i).style.display == "none") {
            continue; // skip non displayed row
        }

        //gets cells of current row
        var oCells = oTable.rows.item(i).cells;

        //gets amount of cells of current row
        var cellLength = oCells.length;

        // set up variables
        let amount = 0.0;
        let category = ""; // could also be category

        //loops through each cell in current row
        for (let j = 0; j < cellLength; j++) {
            // get your cell info here
            if (j == 0) { // if amount
                let cellVal = oCells.item(j).innerHTML;
                amount = Number(cellVal.replace(/[^0-9.-]+/g, ""));
            }

            if (j == 1) { // if type
                let cellVal = oCells.item(j).innerHTML;
                category = cellVal;
            }

        }

        data[category] = amount
    }

    sum = 0.0;

    for (key in data) {
        sum += data[key];
    }



    return [sum, data];
}

function updateOverview() {
    // get monthly data
    resultsM = getTableData("monthly-table");
    sumM = resultsM[0];
    tdM = resultsM[1];

    sumMx12 = sumM * 12;

    // get yearly data
    resultsY = getTableData("yearly-table");
    sumY = resultsY[0];
    tdY = resultsY[1];

    sumTotal = sumMx12 + sumY;

    // set values
    $("#month-total").text("$" + sumM.toFixed(2));
    $("#year-total").text("$" + sumY.toFixed(2));
    $("#month-x12-total").text("$" + sumMx12.toFixed(2));
    $("#combined-total").text("$" + sumTotal.toFixed(2));
}



// make form editable
$('#monthly-table').SetEditable1({
    onEdit: function(e) {
        let cells = Array.from(e[0].cells);

        // get data
        let id = e[0].getAttribute("name");
        let cellVals = {
            amount: cells[0].innerHTML.replace(/\$/g, ''),
            category: cells[1].innerHTML,
            type: "month"
        };

        $.post("/budget-update/",
            cellVals,
            function(id, status) {
                if (status == "success") {
                    // update charts
                    updateOverview();
                } else {
                    alert("Data: " + id + "\nStatus: " + status);
                }
            });
    }, //Called after edition
    onBeforeDelete: function(e) {
        let cells = Array.from(e[0].cells);

        // get data
        let name = e[0].getAttribute("name");

        $.post("/budget-delete/", {
                name: name
            },
            function(id, status) {
                if (status == "success") {
                    // update charts
                    updateOverview();
                } else {
                    alert("Data: " + id + "\nStatus: " + status);
                }
            });
    }, //Called before deletion
    onDelete: function(e) {
        updateOverview();
    }, //Called after deletion
    onAdd: function(e) {
        updateOverview();
    } //Called when added a new row
});



// make form editable
$('#yearly-table').SetEditable2({
    onEdit: function(e) {
        let cells = Array.from(e[0].cells);

        // get data
        let id = e[0].getAttribute("name");
        let cellVals = {
            amount: cells[0].innerHTML.replace(/\$/g, ''),
            category: cells[1].innerHTML,
            type: "year"
        };

        $.post("/budget-update/",
            cellVals,
            function(id, status) {
                if (status == "success") {
                    // update charts
                    updateOverview();
                } else {
                    alert("Data: " + id + "\nStatus: " + status);
                }
            });
    }, //Called after edition
    onBeforeDelete: function(e) {
        let cells = Array.from(e[0].cells);

        // get data
        let name = e[0].getAttribute("name");

        $.post("/budget-delete/", {
                name: name
            },
            function(id, status) {
                if (status == "success") {
                    // update charts
                    updateOverview();
                } else {
                    alert("Data: " + id + "\nStatus: " + status);
                }
            });
    }, //Called before deletion
    onDelete: function(e) {
        updateOverview();
    }, //Called after deletion
    onAdd: function(e) {
        updateOverview();
    } //Called when added a new row
});


window.onload = function(event) {
    updateOverview();
};





function submit_month_function(e) {
    let form = $("#month_form");
    let url = form.attr('action');

    let amount = $("#m-amount").val();
    let category = $("#category-month").val();

    let data = {
        amount: amount,
        category: category,
        type: "month"
    };

    console.log(data)

    $.post(url, data,
        function(id, status) {
            if (status == "success" && id != "Bad insert") {
                //alert("Data: " + data + "\nStatus: " + status);

                let btnColHtml = '<div class="btn-group pull-right">' +
                    '<button id="bEdit" type="button" class="btn btn-sm btn-default" onclick="rowEdit1(this);">' +
                    '<i class="far fa-edit"></i>' +
                    '</button>' +
                    '<button id="bElim" type="button" class="btn btn-sm btn-default" onclick="rowElim1(this);">' +
                    '<i class="far fa-trash-alt"></i>' +
                    '</button>' +
                    '<button id="bAcep" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowAcep1(this);">' +
                    '<i class="fas fa-check"></i>' +
                    '</button>' +
                    '<button id="bCanc" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowCancel1(this);">' +
                    '<i class="fas fa-times"></i>' +
                    '</button>' +
                    '</div>';


                let markup = "<tr class='row text-center m-0' term='month' name='" + category + "'>" +
                    "<td class='col-sm-4'>$" + amount + "</td>" +
                    "<td class='col-sm-5'>" + category + "</td>" +
                    '<td class="col" name="buttons">' + btnColHtml + "</td>" +
                    "</tr>";

                // add new row
                $("#month-table").prepend(markup);

                form.removeClass('was-validated');
                $("#m-amount").val(null);
                $("#category-month").val(null);


                // update charts
                updateOverview();
            } else {
                alert("ERROR: " + id);
            }
        });
}



function submit_year_function(e) {
    let form = $("#year_form");
    let url = form.attr('action');

    let amount = $("#y-amount").val();
    let category = $("#category-year").val();

    let data = {
        amount: amount,
        category: category,
        type: "year"
    };

    console.log(data)

    $.post(url, data,
        function(id, status) {
            if (status == "success" && id != "Bad insert") {
                //alert("Data: " + data + "\nStatus: " + status);

                let btnColHtml = '<div class="btn-group pull-right">' +
                    '<button id="bEdit" type="button" class="btn btn-sm btn-default" onclick="rowEdit2(this);">' +
                    '<i class="far fa-edit"></i>' +
                    '</button>' +
                    '<button id="bElim" type="button" class="btn btn-sm btn-default" onclick="rowElim2(this);">' +
                    '<i class="far fa-trash-alt"></i>' +
                    '</button>' +
                    '<button id="bAcep" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowAcep2(this);">' +
                    '<i class="fas fa-check"></i>' +
                    '</button>' +
                    '<button id="bCanc" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowCancel2(this);">' +
                    '<i class="fas fa-times"></i>' +
                    '</button>' +
                    '</div>';


                let markup = "<tr class='row text-center m-0' term='year' name='" + category + "'>" +
                    "<td class='col-sm-4'>$" + amount + "</td>" +
                    "<td class='col-sm-5'>" + category + "</td>" +
                    '<td class="col" name="buttons">' + btnColHtml + "</td>" +
                    "</tr>";

                // add new row
                $("#year-table").prepend(markup);

                form.removeClass('was-validated');
                $("#y-amount").val(null);
                $("#category-year").val(null);


                // update charts
                updateOverview();
            } else {
                alert("ERROR: " + id);
            }
        });
}
