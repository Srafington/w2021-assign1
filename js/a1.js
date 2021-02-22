document.addEventListener("DOMContentLoaded", function () {

    // the URL for our data
    const companyData = 'http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php'

    const companies = retrieveStorage();

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
                console.log("hello");
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
    

    function displayCompanies(){
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

    document.querySelector("#companyList").addEventListener("click", function(e){
        if(e.target && e.target.nodeName.toLowerCase() == "li"){
            const name = e.target.textContent;
            const selectedCompany = companies.find(company => company.name == name);
            displayInfo(selectedCompany);
            displayMap(selectedCompany);
        }
    });

    function displayInfo(selectedCompany){
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


    function displayMap(company){
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

function initMap() {} 