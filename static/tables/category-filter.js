function filterByCategory(category) {
    $('tr').each(function(){
        tdObject = $(this).find('td.category');

        if (tdObject[0]) { // if date object found
            tdCategory = tdObject.text();

            if(tdCategory === category){
                $(this).removeClass("category-hide");
            }else $(this).addClass("category-hide");
        }
    });
}


function filterAllCat() {
    $('tr').each(function(){
        $(this).removeClass("category-hide");
    });
}


function categoryFilter(event) {
    let value = event.target.value;
    console.log(value)
    if (value != -1) {
        filterByCategory(value);
    } else {
        filterAllCat();
    }
}
