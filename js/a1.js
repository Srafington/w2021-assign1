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
    console.log(companies[0]);



    //keyboard event handlers
    const searchBox = document.querySelector('.search');
    const suggestionList = document.querySelector('#filteredList');
    searchBox.addEventListener('keyup', displayMatches);


    function displayMatches() {
        if (this.value.length >= 3) {
            const matches = findMatches(this.value, companies);
            suggestionList.innerHTML = "";
            matches.forEach(match => {
                let option = document.createElement('option');
                option.textContent = match.name;
                suggestionList.appendChild(option);
            })
        }
    }

    function findMatches(lettersToMatch, movies) {
        return companies.filter(obj => {
            const regex = new RegExp(lettersToMatch, 'gi');
            return obj.name.match(regex);
        });
    }

});