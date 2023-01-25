import axios from 'axios';

const _ = require('lodash');

/* Sort by name
http://localhost:3004/countries?_sort=name&_order=desc (asc)
*/

/* Get 20 records (In the Link header you'll get first, prev, next and last links.)
http://localhost:3004/countries?_page=1&_limit=20
*/

/* Select country by name
http://localhost:3004/countries?name=Latvia
*/

/* Select by country language
http://localhost:3004/countries?language.name=Latvian
*/
const url = new URL('http://localhost:3004/countries?_page=1&_limit=20');
const tableBody = document.querySelector('.table__body');

/* ############################# Insert country data in DOM ############################# */

const insertCountryData = (data:any[]) => {
  let id = 1;

  data.forEach((ele) => {
    const row = document.createElement('tr');
    row.classList.add('js-country-row');
    const cell1 = document.createElement('td');
    const cell2 = document.createElement('td');
    const cell3 = document.createElement('td');
    const cell4 = document.createElement('td');
    const cell5 = document.createElement('td');

    tableBody.appendChild(row);
    cell1.innerText = String(id);
    id += 1;
    row.appendChild(cell1);
    cell2.innerText = ele.name;
    row.appendChild(cell2);
    cell3.innerText = ele.capital;
    row.appendChild(cell3);
    cell4.innerText = ele.currency.name;
    row.appendChild(cell4);
    cell5.innerText = ele.language.name;
    row.appendChild(cell5);
  });
};

/* ############################# Fetch country data ############################# */

const FetchCountries = (apiUrl: URL) => {
  axios.get(apiUrl.toString())
    .then((response) => insertCountryData(response.data));
};

/* ############################# Delete all country rows from table ############################# */

const deleteCountries = () => {
  for (let i = tableBody.childNodes.length - 1; i >= 0; i -= 1) {
    tableBody.removeChild(tableBody.childNodes[i]);
  }
};

/* ############################# Sort function, consts and listener ############################# */

const sort = (sortable: HTMLDivElement, sortBy: string) => {
  const sortParams = { _sort: sortBy, _order: 'asc' };
  if (sortable.classList.contains('asc')) {
    sortable.classList.replace('asc', 'desc');
    sortParams._order = 'desc';
  } else if (sortable.classList.contains('desc')) {
    sortable.classList.replace('desc', 'asc');
  } else {
    sortable.classList.add('asc');
  }
  const searchParams = new URLSearchParams(sortParams);
  const sortURL = new URL(`${url.href}&${searchParams.toString()}`);
  deleteCountries();
  FetchCountries(sortURL);
};

const sortByName:HTMLDivElement = document.querySelector('.js-sort-name');
const sortByCapital:HTMLDivElement = document.querySelector('.js-sort-capital');
const sortByCurrency:HTMLDivElement = document.querySelector('.js-sort-currency');
const sortByLanguage:HTMLDivElement = document.querySelector('.js-sort-language');

sortByName.addEventListener('click', () => {
  sort(sortByName, 'name');
});

sortByCapital.addEventListener('click', () => {
  sort(sortByName, 'capital');
});

sortByCurrency.addEventListener('click', () => {
  sort(sortByName, 'currency.name');
});

sortByLanguage.addEventListener('click', () => {
  sort(sortByName, 'language.name');
});

/* ############################# Search function ############################# */

let canSearch = true;
const search = (searchFor: string, value: string) => {
  canSearch = false;
  let searchParams = '';
  let searchURL:URL = url;
  axios.get('http://localhost:3004/countries')
    .then((response) => {
      for (let i = 0; i < response.data.length; i += 1) {
        const result: string = _.get(response.data[i], searchFor);
        if (result.toLowerCase().includes(value.toLowerCase())) {
          searchParams += `&${searchFor}=${result}`;
          searchURL = new URL(`${url.href}${searchParams.toString()}`);
        }
        if (i === response.data.length - 1 && searchParams) {
          canSearch = false;
          // eslint-disable-next-line no-loop-func
          const completeSearch = () => {
            deleteCountries();
            FetchCountries(searchURL);
            canSearch = true;
          };
          setTimeout(completeSearch, 500);
        } else {
          deleteCountries();
        }
      }
    });
  canSearch = true;
};

const searchCountry:HTMLInputElement = document.querySelector('.js-country-search');
const searchCapital:HTMLInputElement = document.querySelector('.js-capital-search');
const searchCurrency:HTMLInputElement = document.querySelector('.js-currency-search');
const searchLanguage:HTMLInputElement = document.querySelector('.js-language-search');

searchCountry.addEventListener('keyup', () => {
  if (searchCountry.value.length > 2 && canSearch) {
    search('name', searchCountry.value);
  } else {
    deleteCountries();
    FetchCountries(url);
  }
});

searchCapital.addEventListener('keyup', () => {
  if (searchCapital.value.length > 2 && canSearch) {
    search('capital', searchCapital.value);
  } else {
    deleteCountries();
    FetchCountries(url);
  }
});

searchCurrency.addEventListener('keyup', () => {
  if (searchCurrency.value.length > 2 && canSearch) {
    search('currency.name', searchCurrency.value);
  } else {
    deleteCountries();
    FetchCountries(url);
  }
});

searchLanguage.addEventListener('keyup', () => {
  if (searchLanguage.value.length > 2 && canSearch) {
    search('language.name', searchLanguage.value);
  } else {
    deleteCountries();
    FetchCountries(url);
  }
});

/* ############################# Fetch countries on page load ############################# */

FetchCountries(url);
