/*
Bootstable
 @description  Javascript library to make HMTL tables editable, using Bootstrap
 @version 1.1
 @autor Tito Hinostroza
*/
"use strict";
//Global variables
var params1 = null; //Parameters
var params2 = null; //Parameters

var colsEdi = ["0"];
var newColHtml1 = '<div class="btn-group pull-right">' +
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
var colEdicHtml1 = '<td class="col" name="buttons">' + newColHtml1 + '</td>';

var newColHtml2 = '<div class="btn-group pull-right">' +
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
var colEdicHtml2 = '<td class="col" name="buttons">' + newColHtml2 + '</td>';

$.fn.SetEditable1 = function(options) {
    var defaults = {
        columnsEd: "1", //Index to editable columns. If null all td editables. Ex.: "1,2,3,4,5"
        $addButton: null, //Jquery object of "Add" button
        onEdit: function() {}, //Called after edition
        onBeforeDelete: function() {}, //Called before deletion
        onDelete: function() {}, //Called after deletion
        onAdd: function() {} //Called when added a new row
    };
    params1 = $.extend(defaults, options);
    this.find('thead tr').append('<th class="col" name="buttons">Action</th>'); //encabezado vacío
    this.find('tbody tr').append(colEdicHtml1);
    var $tabedi = this; //Read reference to the current table, to resolve "this" here.
};

$.fn.SetEditable2 = function(options) {
    var defaults = {
        columnsEd: "1", //Index to editable columns. If null all td editables. Ex.: "1,2,3,4,5"
        $addButton: null, //Jquery object of "Add" button
        onEdit: function() {}, //Called after edition
        onBeforeDelete: function() {}, //Called before deletion
        onDelete: function() {}, //Called after deletion
        onAdd: function() {} //Called when added a new row
    };
    params2 = $.extend(defaults, options);
    this.find('thead tr').append('<th class="col" name="buttons">Action</th>'); //encabezado vacío
    this.find('tbody tr').append(colEdicHtml2);
    var $tabedi = this; //Read reference to the current table, to resolve "this" here.

};

function IterarCamposEdit($cols, tarea) {
    //Itera por los campos editables de una fila
    var n = 0;
    $cols.each(function() {
        n++;
        if ($(this).attr('name') == 'buttons') return; //excluye columna de botones
        if (!EsEditable(n - 1)) return; //noe s campo editable
        tarea($(this));
    });

    function EsEditable(idx) {
        //Indica si la columna pasada está configurada para ser editable
        if (colsEdi == null) { //no se definió
            return true; //todas son editable
        } else { //hay filtro de campos
            //alert('verificando: ' + idx);
            for (var i = 0; i < colsEdi.length; i++) {
                if (idx == colsEdi[i]) return true;
            }
            return false; //no se encontró
        }
    }
}

function FijModoNormal(but) {
    $(but).parent().find('#bAcep').hide();
    $(but).parent().find('#bCanc').hide();
    $(but).parent().find('#bEdit').show();
    $(but).parent().find('#bElim').show();
    var $row = $(but).parents('tr'); //accede a la fila
    $row.attr('id', ''); //quita marca
}

function FijModoEdit(but) {
    $(but).parent().find('#bAcep').show();
    $(but).parent().find('#bCanc').show();
    $(but).parent().find('#bEdit').hide();
    $(but).parent().find('#bElim').hide();
    var $row = $(but).parents('tr'); //accede a la fila
    $row.attr('id', 'editing'); //indica que está en edición
}

function ModoEdicion($row) {
    if ($row.attr('id') == 'editing') {
        return true;
    } else {
        return false;
    }
}

function rowAcep1(but) {
    //Acepta los cambios de la edición
    var $row = $(but).parents('tr'); //accede a la fila
    var $cols = $row.find('td'); //lee campos
    if (!ModoEdicion($row)) return; //Ya está en edición
    //Está en edición. Hay que finalizar la edición
    IterarCamposEdit($cols, function($td) { //itera por la columnas
        var cont = $td.find('input').val(); //lee contenido del input
        $td.html(cont); //fija contenido y elimina controles
    });
    FijModoNormal(but);
    params1.onEdit($row);
}

function rowAcep2(but) {
    //Acepta los cambios de la edición
    var $row = $(but).parents('tr'); //accede a la fila
    var $cols = $row.find('td'); //lee campos
    if (!ModoEdicion($row)) return; //Ya está en edición
    //Está en edición. Hay que finalizar la edición
    IterarCamposEdit($cols, function($td) { //itera por la columnas
        var cont = $td.find('input').val(); //lee contenido del input
        $td.html(cont); //fija contenido y elimina controles
    });
    FijModoNormal(but);
    params2.onEdit($row);
}

function rowCancel1(but) {
    //Rechaza los cambios de la edición
    var $row = $(but).parents('tr'); //accede a la fila
    var $cols = $row.find('td'); //lee campos
    if (!ModoEdicion($row)) return; //Ya está en edición
    //Está en edición. Hay que finalizar la edición
    IterarCamposEdit($cols, function($td) { //itera por la columnas
        var cont = $td.find('div').html(); //lee contenido del div
        $td.html(cont); //fija contenido y elimina controles
    });
    FijModoNormal(but);
}

function rowCancel2(but) {
    //Rechaza los cambios de la edición
    var $row = $(but).parents('tr'); //accede a la fila
    var $cols = $row.find('td'); //lee campos
    if (!ModoEdicion($row)) return; //Ya está en edición
    //Está en edición. Hay que finalizar la edición
    IterarCamposEdit($cols, function($td) { //itera por la columnas
        var cont = $td.find('div').html(); //lee contenido del div
        $td.html(cont); //fija contenido y elimina controles
    });
    FijModoNormal(but);
}

function rowEdit1(but) { //Inicia la edición de una fila
    var $row = $(but).parents('tr'); //accede a la fila
    var $cols = $row.find('td'); //lee campos
    if (ModoEdicion($row)) return; //Ya está en edición
    //Pone en modo de edición
    IterarCamposEdit($cols, function($td) { //itera por la columnas
        var cont = $td.html(); //lee contenido
        var div = '<div style="display: none;">' + cont + '</div>'; //guarda contenido
        var input = '<input class="form-control input-sm"  value="' + cont + '">';
        $td.html(div + input); //fija contenido
    });
    FijModoEdit(but);
}

function rowEdit2(but) { //Inicia la edición de una fila
    var $row = $(but).parents('tr'); //accede a la fila
    var $cols = $row.find('td'); //lee campos
    if (ModoEdicion($row)) return; //Ya está en edición
    //Pone en modo de edición
    IterarCamposEdit($cols, function($td) { //itera por la columnas
        var cont = $td.html(); //lee contenido
        var div = '<div style="display: none;">' + cont + '</div>'; //guarda contenido
        var input = '<input class="form-control input-sm"  value="' + cont + '">';
        $td.html(div + input); //fija contenido
    });
    FijModoEdit(but);
}

function rowElim1(but) { //Elimina la fila actual
    var $row = $(but).parents('tr'); //accede a la fila
    params1.onBeforeDelete($row);
    $row.remove();
    params1.onDelete();
}

function rowElim2(but) { //Elimina la fila actual
    var $row = $(but).parents('tr'); //accede a la fila
    params2.onBeforeDelete($row);
    $row.remove();
    params2.onDelete();
}



function TableToCSV(tabId, separator) { //Convierte tabla a CSV
    var datFil = '';
    var tmp = '';
    var $tab_en_edic = $("#" + tabId); //Table source
    $tab_en_edic.find('tbody tr').each(function() {
        //Termina la edición si es que existe
        if (ModoEdicion($(this))) {
            $(this).find('#bAcep').click(); //acepta edición
        }
        var $cols = $(this).find('td'); //lee campos
        datFil = '';
        $cols.each(function() {
            if ($(this).attr('name') == 'buttons') {
                //Es columna de botones
            } else {
                datFil = datFil + $(this).html() + separator;
            }
        });
        if (datFil != '') {
            datFil = datFil.substr(0, datFil.length - separator.length);
        }
        tmp = tmp + datFil + '\n';
    });
    return tmp;
}
