// make form editable
$('#transaction-table').SetEditable({
    onEdit: function(e) {
        let cells = Array.from(e[0].cells);

        // get data
        let id = e[0].getAttribute("name");
        let cellVals = {
            balance: cells[0].innerHTML.replace(/\$/g, ''),
            category: cells[1].innerHTML,
            date: cells[2].innerHTML,
            id: id
        };

        $.post("/assets-update/",
            cellVals,
            function(id, status) {
                if (status == "success") {
                    // update charts
                    updateGraphs(1);
                } else {
                    alert("Data: " + id + "\nStatus: " + status);
                }
            });

    }, //Called after edition
    onBeforeDelete: function(e) {
        let cells = Array.from(e[0].cells);

        // get data
        let id = e[0].getAttribute("name");

        $.post("/assets-delete/", {
                id: id
            },
            function(id, status) {
                if (status == "success") {
                    // update charts
                    updateGraphs(1);
                } else {
                    alert("Data: " + id + "\nStatus: " + status);
                }
            });
    }, //Called before deletion
    onDelete: function(e) {
        updateGraphs(1);
    }, //Called after deletion
    onAdd: function() {
        updateGraphs(1);
    }, //Called when added a new row
	columnsEd: "0,2"
});


// when new row is added
function submit_function(e) {
    let form = $("#transaction_form");
    let url = form.attr('action');

    let amount = $("#amount").val();
    let category = $("#account").val();
    let date = $("#date").val();

    $.post(url, {
            balance: amount,
            category: category,
            date: date
        },
        function(id, status) {
            if (status == "success") {
                //alert("Data: " + data + "\nStatus: " + status);

                let btnColHtml = '<div class="btn-group pull-right">' +
                    '<button id="bEdit" type="button" class="btn btn-sm btn-default" onclick="rowEdit(this);">' +
                    '<i class="far fa-edit"></i>' +
                    '</button>' +
                    '<button id="bElim" type="button" class="btn btn-sm btn-default" onclick="rowElim(this);">' +
                    '<i class="far fa-trash-alt"></i>' +
                    '</button>' +
                    '<button id="bAcep" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowAcep(this);">' +
                    '<i class="fas fa-check"></i>' +
                    '</button>' +
                    '<button id="bCanc" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowCancel(this);">' +
                    '<i class="fas fa-times"></i>' +
                    '</button>' +
                    '</div>';


                let markup = "<tr class='row text-center m-0' name='" + id + "'>" +
                    "<td class='col-sm-3'>$" + amount + "</td>" +
                    "<td class='col-sm-3 category'>" + category + "</td>" +
                    "<td class='col-sm-4 date'>" + date + "</td>" +
                    '<td class="col" name="buttons">' + btnColHtml + "</td>" +
                    "</tr>";

                // add new row
                $("table tbody").prepend(markup);

                form.removeClass('was-validated');
                $("#amount").val(null);
                $("#category").val($('#category option:first').val());
                $("#date").val(null);

                // update charts
                updateGraphs(1);
            } else {
                alert("Data: " + id + "\nStatus: " + status);
            }
        });
}



// -----------------------------------------------------------------------------
// START INITIALISE GRAPHS
// -----------------------------------------------------------------------------

// do the initial graph make
creatGraphs(1);

// -----------------------------------------------------------------------------
// END INITIALISE GRAPHS
// -----------------------------------------------------------------------------
