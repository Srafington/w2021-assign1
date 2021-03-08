document.addEventListener("DOMContentLoaded", function () {

    // the URL for our data
    const companyData = 'http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php'
    const stockLink = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol='

    const companies = retrieveStorage('companies');

    let companyDesc = '';

    let barChart;
    let lineChart;
    let candleChart;

    function retrieveStorage(key) {
        return JSON.parse(localStorage.getItem(key))
            || [];
    }

    function updateStorage(key, value) {
        localStorage.setItem(key,
            JSON.stringify(value));
    }

    // hide form and display loading animation
    document.querySelector("form.textbox").style.display = "none";
    document.querySelector("#loading").style.display = "block";

    // fetch from API and save to local storage if companies is empty
    if (companies.length == 0) {
        document.querySelector("form.textbox").style.display = "none";
        document.querySelector("#loading").style.display = "block";
        fetch(companyData)
            .then(response => response.json())
            .then(data => {

                document.querySelector("form.textbox").style.display =
                    "block";
                document.querySelector("#loading").style.display =
                    "none";
                companies.push(...data);
                updateStorage('comapnies', companies);
                displayCompanies();

            })
            .catch(error => console.error(error));
    } else {
        //show form as no need to retrieve info
        document.querySelector("form.textbox").style.display = "block";
        document.querySelector("#loading").style.display = "none";
        displayCompanies();
    }


    function displayCompanies() {
        const list = document.querySelector("#companyList");
        list.innerHTML = "";
        companies.forEach(company => {
            let option = document.createElement('li');
            option.textContent = company.name;
            list.appendChild(option);
        })
    }

    //keyboard event handlers
    const searchBox = document.querySelector('.search');
    searchBox.addEventListener('keyup', displayMatches);

    //https://www.w3schools.com/howto/howto_js_filter_lists.asp

    function displayMatches() {
        filter = searchBox.value.toUpperCase();
        ul = document.querySelector("#companyList");
        li = ul.getElementsByTagName("li");
        for (let i = 0; i < li.length; i++) {
            let item = li[i];
            textValue = item.textContent;
            if (textValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }

    }

    document.querySelector("#companyList").addEventListener("click", function (e) {
        if (e.target && e.target.nodeName.toLowerCase() == "li") {
            const name = e.target.textContent;
            const selectedCompany = companies.find(company => company.name == name);
            updateStorage('selectedCompany', selectedCompany);
            displayInfo(selectedCompany);
            displayMap(selectedCompany);
            const stockQuery = `${stockLink}${selectedCompany.symbol}`;
            fetch(stockQuery)
                .then(response => response.json())
                .then(data => {
                    updateStorage('stocks', data);
                    displayStock(data, defaultSort);
                    displayStats(data);
                    document.querySelector("#stock").addEventListener('click', function (e) {

                        if (e.target && e.target.nodeName.toLowerCase() == "th") {
                            if (e.target.textContent == "Date") {
                                displayStock(data, defaultSort);
                            } else if (e.target.textContent == "Volume") {
                                displayStock(data, volumeSort);
                            } else if (e.target.textContent == "Open") {
                                displayStock(data, openSort);
                            } else if (e.target.textContent == "Close") {
                                displayStock(data, closeSort);
                            } else if (e.target.textContent == "High") {
                                displayStock(data, highSort);
                            } else {
                                displayStock(data, lowSort);
                            }

                        }
                    });
                })
                .catch(error => console.error(error));
        }
    });

    // document.querySelector("#toggleCharts").addEventListener("click", function (e) {
    //     let chartContext = document.getElementById('chart').getContext('2d');
    //     if(chartContext){

    //         fetch
    //         barChart = new new Chart(ctx, {});
    //     }
    // });

    function displayStats(stocks) {
        document.querySelector(".e").style.height = "300px";
        const stats = [];
        //volume calculations
        let averageVolume = 0;
        stocks.forEach(stock => averageVolume += parseFloat(stock.volume));
        const sortedByVolume = stocks.sort(volumeSort);
        stats.push(["Volume:", Math.round(averageVolume / stocks.length),
            Math.round(parseFloat(sortedByVolume[0].volume)), Math.round(parseFloat(sortedByVolume[sortedByVolume.length - 1].volume))]);

        //open calculations
        let averageOpen = 0;
        stocks.forEach(stock => averageOpen += parseFloat(stock.open));
        const sortedByOpen = stocks.sort(openSort);
        stats.push(["Open:", currency(averageOpen / stocks.length),
            currency(parseFloat(sortedByOpen[0].open)), currency(parseFloat(sortedByOpen[sortedByOpen.length - 1].open))]);

        //close calculations
        let averageClose = 0;
        stocks.forEach(stock => averageClose += parseFloat(stock.close));
        const sortedByClose = stocks.sort(closeSort);
        stats.push(["Close:", currency(averageClose / stocks.length),
            currency(parseFloat(sortedByClose[0].close)), currency(parseFloat(sortedByClose[sortedByClose.length - 1].close))]);

        //high calculations
        let averageHigh = 0;
        stocks.forEach(stock => averageHigh += parseFloat(stock.high));
        const sortedByHigh = stocks.sort(highSort);
        stats.push(["High:", currency(averageHigh / stocks.length),
            currency(parseFloat(sortedByHigh[0].high)), currency(parseFloat(sortedByHigh[sortedByHigh.length - 1].high))]);

        //low calculations
        let averageLow = 0;
        stocks.forEach(stock => averageLow += parseFloat(stock.low));
        const sortedByLow = stocks.sort(lowSort);
        stats.push(["Low:", currency(averageLow / stocks.length),
            currency(parseFloat(sortedByLow[0].low)), currency(parseFloat(sortedByLow[sortedByHigh.length - 1].low))]);

        const table = document.querySelector("#stats");
        table.innerHTML = `<tr id="statHeaders"><th>Data Category</th><th>Average</th><th>Maximum</th><th>Minimum</th></tr>`
        for (let category of stats) {
            let row = document.createElement("tr");
            for (let item of category) {
                let data = document.createElement("td");
                data.textContent = item;
                row.appendChild(data);
            }
            table.appendChild(row);
        }

    }


    function defaultSort(a, b) {
        if (new Date(a.date) < new Date(b.date)) {
            return 1;
        } else if (new Date(a.date) > new Date(b.date)) {
            return -1
        } else
            return 0;
    }
    // function volumeSort(property) {
    //     let value = property;
    //     function sortFunction(a, b){
    //     if (a.value < b.value) {
    //         return 1;
    //     } else if (a.value > b.value) {
    //         return -1
    //     } else
    //         return 0;
    // }
    // return sortFunction;
    // }

    function volumeSort(a, b) {
        if (parseInt(a.volume) < parseInt(b.volume)) {
            return 1;
        } else if (parseInt(a.volume) > parseInt(b.volume)) {
            return -1
        } else
            return 0;
    }

    function openSort(a, b) {
        if (a.open < b.open) {
            return 1;
        } else if (a.open > b.open) {
            return -1
        } else
            return 0;
    }

    function closeSort(a, b) {
        if (a.close < b.close) {
            return 1;
        } else if (a.close > b.close) {
            return -1
        } else
            return 0;
    }

    function highSort(a, b) {
        if (a.high < b.high) {
            return 1;
        } else if (a.high > b.high) {
            return -1
        } else
            return 0;
    }

    function lowSort(a, b) {
        if (a.low < b.low) {
            return 1;
        } else if (a.low > b.low) {
            return -1
        } else
            return 0;
    }


    function displayStock(stocks, sortFunction) {
        document.querySelector(".d").style.width = "680px";
        document.querySelector("table").style.overflowY = "scroll";
        document.querySelector("#stock").innerHTML = `<tr id="stockHeaders">
        <th>Date</th><th>Volume</th><th>Open</th><th>Close</th><th>High</th><th>Low</th></tr>`;
        const sortedStock = stocks.sort(sortFunction);
        document.querySelector("#showCharts").style = "display: inline";
        const table = document.querySelector("#stock");
        for (let stock of sortedStock) {
            let row = document.createElement("tr");
            for (let item in stock) {
                if (item == "open" || item == "close" || item == "high" || item == "low") {
                    let data = document.createElement("td");
                    data.textContent = currency(stock[item]);
                    row.appendChild(data);
                } else if (item == "date") {
                    let data = document.createElement("td");
                    data.textContent = new Date(stock[item]).toDateString();
                    row.appendChild(data);
                } else if (item == "volume") {
                    let data = document.createElement("td");
                    data.textContent = Math.round(stock[item]);
                    row.appendChild(data);
                }
            }
            table.appendChild(row);
        }
    }

    function displayInfo(selectedCompany) {
        document.querySelector("div.b section").style.display = "flex";
        document.querySelector("#logo").src = `logos/${selectedCompany.symbol}.svg`;
        document.querySelector("#symbol").textContent = selectedCompany.symbol;
        document.querySelector("#name").textContent = selectedCompany.name;
        document.querySelector("#sub").textContent = selectedCompany.subindustry;
        document.querySelector("#address").textContent = selectedCompany.address;
        document.querySelector("#website").href = selectedCompany.website;
        document.querySelector("#website").textContent = selectedCompany.website;
        document.querySelector("#exchange").textContent = selectedCompany.exchange;
        document.querySelector("#description").textContent = selectedCompany.description;
    }


    function displayMap(company) {
        let longitude = company.longitude;
        let latitude = company.latitude;
        drawMap(longitude, latitude);
        document.querySelector('#map').style.height = "650px";

    }


    function drawMap(longitude, latitude) {
        map = new google.maps.Map(document.querySelector('#map'), {
            center: { lat: latitude, lng: longitude },
            mapTypeId: 'satellite',
            zoom: 18
        });
    }

    const currency = function (num) {
        return new Intl.NumberFormat('en-us', {
            style: 'currency',
            currency: 'USD'
        }).format(num);
    };
    document.querySelector('#showCharts').addEventListener("click", event => {
        showCharts();
    });

    document.querySelector('#closeCharts').addEventListener('click', (event) => {
        hideCharts();
    });
    document.querySelector('#readAloud').addEventListener('click', () => {
        const utterance = new SpeechSynthesisUtterance(companyDesc);
        speechSynthesis.speak(utterance);
    });
    const showCharts = function () {
        let standardElements = document.querySelectorAll('.defaultView');
        let chartElements = document.querySelectorAll('.chartView');
        standardElements.forEach((element) => {
            element.style = 'display: none';
        });
        chartElements.forEach((element) => {
            element.style = 'display: block';
        });
        let companyData = retrieveStorage('selectedCompany');
        let companyBoxTitle = document.querySelector('.g h2');
        let companyBoxDesciption = document.querySelector('.g p');
        companyDesc = companyData.description;
        companyBoxTitle.textContent = `${companyData.name} - ${companyData.symbol}`;
        companyBoxDesciption.textContent = companyData.description;
        displayFinancials(companyData);

        drawCharts(companyData);

    };



    const hideCharts = function () {
        let standardElements = document.querySelectorAll('.defaultView');
        let chartElements = document.querySelectorAll('.chartView');
        standardElements.forEach((element) => {
            element.style = 'display: block';
        });
        chartElements.forEach((element) => {
            element.style = 'display: none';
        });
        barChart.destroy();
        candleChart.destroy();
        lineChart.destroy();
    };

    const displayFinancials = function (companyData) {
        const financialsTable = document.querySelector('.i table');
        const tableHeader = financialsTable.querySelector('#tableHeader');
        financialsTable.innerHTML = '';
        financialsTable.appendChild(tableHeader);
        console.log(companyData.financials)
        if (companyData.financials) {
            for (let i = 0; i < companyData.financials.years.length; i++) {
                let tableRow = document.createElement('tr');
                tableRow.appendChild(createTableCell(companyData.financials.years[i]));
                tableRow.appendChild(createTableCell(companyData.financials.revenue[i]));
                tableRow.appendChild(createTableCell(companyData.financials.earnings[i]));
                tableRow.appendChild(createTableCell(companyData.financials.assets[i]));
                tableRow.appendChild(createTableCell(companyData.financials.liabilities[i]));
                financialsTable.appendChild(tableRow);
            }
        } else {
            let tableRow = document.createElement('tr');
            let cell = createTableCell("No data to show");
            cell.colSpan = 5;
            cell.style = "text-align: center;"
            tableRow.appendChild(cell);
            financialsTable.appendChild(tableRow);
        }

    }

    const createTableCell = function (value) {
        const tableCell = document.createElement('td');
        tableCell.textContent = value;
        return tableCell;
    }

    const drawCharts = function (companyData) {
        const barChartContext = document.querySelector('#barChart').getContext('2d');
        const stocks = retrieveStorage('stocks');
        if (barChartContext) {
            drawBarChart(barChartContext, companyData.financials);
        }
        //next two are placeholders for now
        const candleChartContext = document.querySelector('#candleChart').getContext('2d');
        if (candleChartContext) {
            drawCandleChart(candleChartContext, stocks);
        }
        const lineChartContext = document.querySelector('#lineChart').getContext('2d');
        if (lineChartContext) {
            drawLineChart(lineChartContext, stocks);
        }


    };

    const drawBarChart = function (context, financials) {
        if (financials) {
            barChart = new Chart(context, {
                type: 'bar',
                data: {
                    labels: financials.years,
                    datasets: [
                        {
                            label: 'Assets',
                            data: financials.assets,
                            backgroundColor: '#536DC4',
                            borderWidth: 1
                        },
                        {
                            label: 'Earnings',
                            data: financials.earnings,
                            backgroundColor: '#91CD71',
                            borderWidth: 1
                        },
                        {
                            label: 'Liabilities',
                            data: financials.liabilities,
                            backgroundColor: '#F7CA57',
                            borderWidth: 1
                        },
                        {
                            label: 'Revenue',
                            data: financials.revenue,
                            backgroundColor: '#F5615E',
                            borderWidth: 1
                        },
                    ]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        } else {
            barChart = new Chart(context, {
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'No Financial History Available',
                            padding: 100,
                            font: {
                                size: 20,
                                family: "'Comfortaa', sans-serif"
                            }
                        }
                    }
                }

            });
        }
    }


    const drawCandleChart = function (context, stocks) {
        // let min = getCandle(stocks, Math.min, 1);
        // let max = getCandle(stocks, Math.max, 2);
        // let avg = getCandle(stocks, (...arguments) => arguments.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / arguments.length, 3);
        // let none = {
        //     "t": 0,
        //     "l": 0,
        //     "h": 0,
        //     "o": 0,
        //     "c": 0
        // }
        // candleChart = new Chart(context, {
        //     type: 'candlestick',
        //     data: {
        //         datasets: [
        //             {
        //                 label: 'Minimum OCLH',
        //                 data: [min, min],
        //                 backgroundColor: min.o > min.c ? "#FF4444" : "#44FF44",
        //                 borderColor: min.o > min.c ? "#FF4444" : "#44FF44"
        //             },
        //             {
        //                 label: 'Maximum OCLH',
        //                 data: [min, max],
        //                 backgroundColor: max.o > max.c ? "#FF4444" : "#44FF44",
        //                 borderColor: max.o > max.c ? "#FF4444" : "#44FF44"
        //             },
        //             {
        //                 label: 'Average OCLH',
        //                 data: [min, avg],
        //                 backgroundColor: avg.o > avg.c ? "#FF4444" : "#44FF44",
        //                 borderColor: avg.o > avg.c ? "#FF4444" : "#44FF44"
        //             }
        //         ]
        //     }
        // });
        console.log(stocks)
        let data = stocks.map((stock) => {
            return {
                "t": (new Date(stock.date)).valueOf(),
                "l": stock.low,
                "h": stock.high,
                "o": stock.open,
                "c": stock.close
            }
        });
        console.log(data)
        candleChart = new Chart(context, {
            type: 'candlestick',
            data: {
                datasets: [
                    {
                        label: 'Data',
                        data: data,
                        color: {
                            up: '#44FF44',
                            down: '#FF4444',
                            unchanged: '#999'
                        }
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    const getMap = (stock, key) => {
        return stock.map(val => val[key]);
    }
    const getCandle = function (stock, aggregationFunction, pos) {
        return {
            "t": pos,
            "l": aggregationFunction(...getMap(stock, 'low')),
            "h": aggregationFunction(...getMap(stock, 'high')),
            "o": aggregationFunction(...getMap(stock, 'open')),
            "c": aggregationFunction(...getMap(stock, 'close'))
        };

    }





    const drawLineChart = function (context, stocks) {
        const series1 = getMap(stocks, 'volume');
        const series2 = getMap(stocks, 'open');
        const labelSeries = getMap(stocks, 'date')

        lineChart = new Chart(context, {
            type: 'line',
            data: {
                labels: labelSeries,
                datasets: [
                    {
                        label: 'Volume',
                        data: series1,
                        backgroundColor: '#536DC4',
                        borderColor: '#536DC4',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Open',
                        data: series2,
                        backgroundColor: '#91CD71',
                        borderColor: '#91CD71',
                        borderWidth: 1,
                        yAxisID: 'y2'

                    }
                ]
            },
            options: {
                scales: {
                    y1: {
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                        }
                    },
                    y2: {
                        position: 'right',
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                        ticks: {
                            beginAtZero: true,
                        }
                    }
                }
            }
        });
    }

});

function initMap() { }