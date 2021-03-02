document.addEventListener("DOMContentLoaded", function () {

    // the URL for our data
    const companyData = 'http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php'
    const stockLink = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol='

    const companies = retrieveStorage();
    const stocks = [];

    function retrieveStorage() {
        return JSON.parse(localStorage.getItem('companies'))
            || [];
    }

    function updateStorage() {
        localStorage.setItem('companies',
            JSON.stringify(companies));
    }

    // hide form and display loading animation
    document.querySelector("form.textbox").style.display = "none";
    document.querySelector("#loading").style.display = "block";

    // fetch from API and save to local storage if companies is empty
    if (companies.length == 0) {
        fetch(companyData)
            .then(response => response.json())
            .then(data => {

                document.querySelector("form.textbox").style.display =
                    "block";
                document.querySelector("#loading").style.display =
                    "none";
                companies.push(...data);
                updateStorage();


            })
            .catch(error => console.error(error));
    } else {
        //show form as no need to retrieve info
        document.querySelector("form.textbox").style.display = "block";
        document.querySelector("#loading").style.display = "none";
    }
    displayCompanies();


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
            displayInfo(selectedCompany);
            displayMap(selectedCompany);
            const stockData = `${stockLink}${selectedCompany.symbol}`;
            console.log(stockData);
            fetch(stockData)
                .then(response => response.json())
                .then(data => {
                    displayStock(data, defaultSort);
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
        if (a.volume < b.volume) {
            return 1;
        } else if (a.volume > b.volume) {
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

        document.querySelector("#stock").innerHTML = `<tr id="stockHeaders">
        <th>Date</th><th>Volume</th><th>Open</th><th>Close</th><th>High</th><th>Low</th></tr>`;
        const sortedStock = stocks.sort(sortFunction);
        const table = document.querySelector("#stock");
        for (let stock of sortedStock) {
            let row = document.createElement("tr");
            for (let item in stock) {
                if (item == "date" || item == "open" || item == "close" || item == "high" || item == "low" || item == "volume") {
                    let data = document.createElement("td");
                    data.textContent = stock[item];
                    row.appendChild(data);
                }
            }
            table.appendChild(row);
        }
    }

    function displayInfo(selectedCompany) {
        document.querySelector("div.b section").style.display = "flex";
        document.querySelector("#logo").src = `logos/${selectedCompany.symbol}.svg`;
        console.log(`logos/${selectedCompany.symbol}.svg`);
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
});

function initMap() { }