// -----------------------------------------------------------------------------
// START GET TABLE DATA
// -----------------------------------------------------------------------------
function getTableData() {

    //gets table
    var oTable = document.getElementById('transaction-table'); // table must have this id

    //gets rows of table
    var rowLength = oTable.rows.length;

    // arrays to store info
    let data = {}

    // example layout of data
    // {
    //  type: [{date -> amount}, {date -> amount}, {date -> amount}, {date -> amount}],
    //  type: [{date -> amount}, {date -> amount}, {date -> amount}, {date -> amount}],
    //  ...
    //  type: [{date -> amount}, {date -> amount}, {date -> amount}, {date -> amount}]
    // }
    // k[i] = (Array.isArray(k[i]) ? k[i].push(value) : [value])
    //loops through rows
    for (i = 1; i < rowLength; i++){ // skip the header row

       if (oTable.rows.item(i).classList.contains("date-hide") || oTable.rows.item(i).classList.contains("category-hide")) {
           continue; // skip non displayed row
       }

       //gets cells of current row
       var oCells = oTable.rows.item(i).cells;

       //gets amount of cells of current row
       var cellLength = oCells.length;

       // set up variables
       let number = 0.0;
       let type = ""; // could also be category
       let date = "";

       //loops through each cell in current row
       for(let j = 0; j < cellLength; j++){
              // get your cell info here
              if(j == 0) { // if data
                  let cellVal = oCells.item(j).innerHTML;
                  number = Number(cellVal.replace(/[^0-9.-]+/g,""));
              }

              if(j == 1) { // if type
                  let cellVal = oCells.item(j).innerHTML;
                  type = cellVal;
              }

              if(j == 2) { // if date
                  let cellVal = oCells.item(j).innerHTML;
                  date = cellVal;
              }
          }

           let amount_date = {date: date, amount: number}; // dictionary

           // check if already is array and then add new value
           if(Array.isArray(data[type])) {
               data[type].push(amount_date);
           } else {
               data[type] = [amount_date]
           }
    }

    // process data
    let headings = [];
    let values   = [];
    let combinedData = [];

    for(let key in data) {
        // set heading
        headings.push(key);

        // create new labels and values array
        combinedData.push([]);
        values.push([]);

        // get array of [{date -> amount}, {date -> amount}, ..., {date -> amount}]
        let value = data[key];

        // add labels and values
        value.forEach(({date, amount}) => {
            let dateS = date.split('-');
            let dateO = new Date(dateS[0], dateS[1], dateS[2]);
            combinedData[combinedData.length - 1].push({x: dateO, y: amount});
            values[values.length - 1].push(amount);
        });
    }

    // sort the combined data by date
    for (let i = 0; i < headings.length; i++) {
        combinedData[i].sort(function compare(a, b) {
            let dateA = a.x;
            let dateB = b.x;
            return dateA - dateB;
        });
    }


    /* setup of chart.js data for line chart

    data = {
        datasets: [
            {
                label: heading,
                data: [
                    {x: xval, y: yval},
                    ...
                    {x: xval, y: yval}
                ]
            }, {
                label: heading,
                data: [
                    {x: xval, y: yval},
                    ...
                    {x: xval, y: yval}
                ]
            }
        ]
    }


    for pie chart

    data = {
        datasets: [{
            data: [x1, x2, x3, ...]
        }],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            label1,
            label2,
            label3,
            ...
        ]
    };

    */
    // colors for GRAPHS
    const colors = randomColor({
        count: headings.length,
        seed: 96,
		luminosity: "bright",
		
    });
	


    // make line data object
    let dataObject = {
        datasets: []
    }

    for (let i = 0; i < headings.length; i++) {
        let dataSetObject = {
            label: headings[i],
            data: combinedData[i],
            borderColor: colors[i],
            backgroundColor: colors[i],
            fill: false
        };

        dataObject.datasets.push(dataSetObject);
    }



    // make pie data object
    let dataObjectPie = {
        datasets: [{
            data: [],
            backgroundColor: [],
            borderColor: [],
            hoverOffset: 4
        }],
        labels: headings
    }

    for (let i = 0; i < headings.length; i++) {
        dataSum = values[i].reduce((a, b) => a + b, 0);
        dataObjectPie.datasets[0].data.push(dataSum);
        dataObjectPie.datasets[0].backgroundColor.push(colors[i]);
        dataObjectPie.datasets[0].borderColor.push(colors[i]);
    }




    // sort data for pie chart
    arrayLabel = headings;
    arrayData = dataObjectPie.datasets[0].data;

    arrayOfObj = arrayLabel.map(function(d, i) {
      return {
        label: d,
        data: arrayData[i] || 0
      };
    });

    sortedArrayOfObj = arrayOfObj.sort(function(a, b) {
      return b.data - a.data;
    });

    newArrayLabel = [];
    newArrayData = [];
    sortedArrayOfObj.forEach(function(d){
      newArrayLabel.push(d.label);
      newArrayData.push(d.data);
    });


    // set sorted labels
    dataObjectPie.labels = newArrayLabel;
    dataObjectPie.datasets[0].data = newArrayData
    //console.log(newArrayLabel);
    //console.log(newArrayData);




    // make pie data object (for assets) We only want the last input value
    let dataObjectPieAssets = {
        datasets: [{
            data: [],
            backgroundColor: [],
            borderColor: [],
            hoverOffset: 4
        }],
        labels: headings
    }

    for (let i = 0; i < headings.length; i++) {
        lastVal = values[i][0];
        dataObjectPieAssets.datasets[0].data.push(lastVal);
        dataObjectPieAssets.datasets[0].backgroundColor.push(colors[i]);
        dataObjectPieAssets.datasets[0].borderColor.push(colors[i]);
    }


    // sort data for pie chart (assets)
    arrayLabel = headings;
    arrayData = dataObjectPieAssets.datasets[0].data;

    arrayOfObj = arrayLabel.map(function(d, i) {
      return {
        label: d,
        data: arrayData[i] || 0
      };
    });

    sortedArrayOfObj = arrayOfObj.sort(function(a, b) {
      return b.data - a.data;
    });

    newArrayLabel = [];
    newArrayData = [];
    sortedArrayOfObj.forEach(function(d){
      newArrayLabel.push(d.label);
      newArrayData.push(d.data);
    });


    // set sorted labels
    dataObjectPieAssets.labels = newArrayLabel;
    dataObjectPieAssets.datasets[0].data = newArrayData


    // bundle and return
    return [dataObject, dataObjectPie, dataObjectPieAssets];
}
// -----------------------------------------------------------------------------
// END GET TABLE DATA
// -----------------------------------------------------------------------------


// globals to access graphs
var lineChart;
var pieChart;

// -----------------------------------------------------------------------------
// START CREATE GRAPHS (chart.js)
// -----------------------------------------------------------------------------
function creatGraphs(assetsPie = -1, useLine = 1) {
    let returnVal = getTableData();
    dataObject    = returnVal[0];
    dataObjectPie = returnVal[1];
    dataObjectPieAssets = returnVal[2];

    if (assetsPie == 1) { // use assets data
        dataObjectPie = dataObjectPieAssets;
    }

    if( useLine == 1 ) {
        chart_type = "line";
    } else {
        chart_type = "scatter";
    }


    // Chart code
    Chart.defaults.global.defaultFontColor = '#f8f9fa';
    var ctx = document.getElementById('lineChart').getContext('2d');
    var timeFormat = 'YYYY-MM-DD';
    lineChart = new Chart(ctx, {
        // The type of chart we want to create
        type: chart_type,

        // The data for our dataset
        data: dataObject,

        // Configuration options go here
        options: {
            responsive: true,
            scales:
            {
                xAxes: [{
                    type: 'time',
                    gridLines: {
                        color: '#c9c9c9'
                    },
                }],
                yAxes: [{
                    type: 'linear',
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            // Convert the number to a string and splite the string every 3 charaters from the end
                            value = value.toString();
                            value = value.split(/(?=(?:...)*$)/);

                            // Convert the array to a string and format the output
                            value = value.join(',');
                            return '$' + value;
                        }
                    },
                    gridLines: {
                        color: '#c9c9c9'
                    }
                }]
            },
            tooltips: {
                mode: 'nearest',
                callbacks: {
                    label: function (tooltipItem, data) {
                        let label = data.datasets[tooltipItem.datasetIndex].label || '';
                        let value = tooltipItem.yLabel;

                        if (label) {
                            label += ': $';

                            label += value.toFixed(2);
                        }
                        return label;
                    }
                },
                footerFontStyle: 'normal'
            }
        }
    });


    // make pie chart
    var ctx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'doughnut',

        // The data for our dataset
        data: dataObjectPie,

        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            tooltips: {
                mode: 'index',
                callbacks: {
                    // Use the footer callback to display the sum of the items showing in the tooltip
                    footer: function(tooltipItems, data) {
                        let sum = 0;

                        tooltipItems.forEach(function(tooltipItem) {
                            sum += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        });
                        return 'Total: $' + sum.toFixed(2);
                    },
                    label: function (tooltipItem, data) {
                        let label = data.labels[tooltipItem.index] || '';

                        if (label) {
                            label += ': ';

                            let sum = 0;
                            let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            data.datasets[0].data.forEach(function(dataItem) {
                                sum += dataItem;
                            });
                            let percentage = (value*100 / sum).toFixed(2)+"%";
                            label += percentage;
                        }
                        // /label += Math.round(tooltipItem.yLabel * 100) / 100;
                        return label;
                        // Here is the trick: the second argument has the dataset label
                        //return data.datasets[tooltipItem.datasetIndex].label;// '{0}: {1}'.Format(data.datasets[tti.datasetIndex].label, (tti.yLabel).toFixed(2));
                    }
                },
                footerFontStyle: 'normal'
            },
            hover: {
                mode: 'index',
                intersect: true
            }
        }
    });
}

// ,
// tooltips: {
//     enabled: false,
//     formatter: (value, ctx) => {
//         let sum = 0;
//         let dataArr = dataObjectPie.data.datasets[0].data;
//         dataArr.map(data => {
//             sum += data;
//         });
//         let percentage = (value*100 / sum).toFixed(2)+"%";
//         return percentage;
//     }
// }


function destroyGraphs() {
    lineChart.destroy();
    pieChart.destroy();
}

function updateGraphs(assetsPie = -1) {
    // get data
    let returnVal = getTableData();
    dataObjectLine    = returnVal[0];
    dataObjectPie = returnVal[1];
    dataObjectPieAssets = returnVal[2];

    if (assetsPie == 1) { // use assets data
        dataObjectPie = dataObjectPieAssets;
    }

    // change data
    lineChart.data = dataObjectLine;
    pieChart.data = dataObjectPie;

    // update plots
    lineChart.update();
    pieChart.update();
}


// -----------------------------------------------------------------------------
// END CREATE GRAPHS
// -----------------------------------------------------------------------------
