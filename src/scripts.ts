import axios from 'axios';

//  Disable 'TypeScript and JavaScript Language Features' to work
import type { Country } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');

const url = new URL('http://localhost:3004/countries?_page=1&_limit=20');
const tableBody = document.querySelector('.table__body');

/* ############################# Pagination ############################# */

const firstPageBtn:HTMLSpanElement = document.querySelector('.js-first-page');
const prevPageBtn:HTMLSpanElement = document.querySelector('.js-prev-page');
const nextPageBtn:HTMLSpanElement = document.querySelector('.js-next-page');
const lastPageBtn:HTMLSpanElement = document.querySelector('.js-last-page');
const pages:HTMLSpanElement = document.querySelector('.js-pages');
let currentPage: string;
let totalPages: string;
let firstPage: string;
let prevPage: string;
let nextPage: string;
let lastPage: string;

const getCurrentPage = (link: string) => {
  const trimmedLink: string = link.replace('http://localhost:3004/countries?_page=', '').slice(0, 3);
  let result = '';
  for (const char of trimmedLink) {
    if (Number(char) < 10) {
      result += char.toString();
    }
  }
  return result;
};

const pagination = (link: string) => {
  const links = link.split(' ');
  if (links.length === 1) {
    currentPage = '1';
    totalPages = '1';
    pages.innerHTML = `Page <b>${currentPage}</b> of <b> ${totalPages} </b>`;
    firstPageBtn.classList.add('inactive');
    prevPageBtn.classList.add('inactive');
    nextPageBtn.classList.add('inactive');
    lastPageBtn.classList.add('inactive');
  } else {
    if (links.length === 6) {
      const nextOrPrev = link.split(' ')[3].slice(5, -2);
      if (nextOrPrev === 'next') {
        firstPage = links[0].slice(1, -2);
        nextPage = links[2].slice(1, -2);
        lastPage = links[4].slice(1, -2);
        currentPage = (+getCurrentPage(nextPage) - 1).toString();
      } else if (nextOrPrev === 'prev') {
        firstPage = links[0].slice(1, -2);
        prevPage = links[2].slice(1, -2);
        lastPage = links[4].slice(1, -2);
        currentPage = (+getCurrentPage(prevPage) + 1).toString();
      }
    } else if (links.length === 8) {
      firstPage = links[0].slice(1, -2);
      prevPage = links[2].slice(1, -2);
      nextPage = links[4].slice(1, -2);
      lastPage = links[6].slice(1, -2);
      currentPage = (+getCurrentPage(prevPage) + 1).toString();
    }
    totalPages = getCurrentPage(lastPage);
    pages.innerHTML = `Page <b>${currentPage}</b> of <b> ${totalPages} </b>`;
  }
};

/* ############################# Insert country data in DOM ############################# */
let id = 1;

const insertCountryData = (data: Country[]) => {
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

/* ############################# reset to default ############################# */

const resetDefault = () => {
  id = 1;
  firstPageBtn.classList.add('inactive');
  prevPageBtn.classList.add('inactive');
  nextPageBtn.classList.remove('inactive');
  lastPageBtn.classList.remove('inactive');
};

/* ############################# Delete all country rows from table ############################# */

const deleteCountries = () => {
  for (let i = tableBody.childNodes.length - 1; i >= 0; i -= 1) {
    tableBody.removeChild(tableBody.childNodes[i]);
  }
};

/* ############################# Fetch country data ############################# */

const fetchCountries = (apiUrl: URL | string) => {
  axios.get(apiUrl.toString())
    .then((response) => {
      insertCountryData(response.data);
      pagination(response.headers.link);
    });
};

/* ############################# Pagination listeners ############################# */

firstPageBtn.addEventListener('click', () => {
  if (+totalPages > 1) {
    nextPageBtn.classList.remove('inactive');
    lastPageBtn.classList.remove('inactive');
    if (!firstPageBtn.classList.contains('inactive')) {
      id = 1;
      deleteCountries();
      fetchCountries(firstPage);
      firstPageBtn.classList.add('inactive');
      prevPageBtn.classList.add('inactive');
    }
  }
});

prevPageBtn.addEventListener('click', () => {
  if (+totalPages > 1) {
    nextPageBtn.classList.remove('inactive');
    lastPageBtn.classList.remove('inactive');
    if (currentPage === '2') {
      prevPageBtn.classList.add('inactive');
      firstPageBtn.classList.add('inactive');
    }
    if (currentPage !== '1') {
      id = (Number(currentPage) - 1) * 20 - 19;
      deleteCountries();
      fetchCountries(prevPage);
    }
  }
});

nextPageBtn.addEventListener('click', () => {
  if (+totalPages > 1) {
    firstPageBtn.classList.remove('inactive');
    prevPageBtn.classList.remove('inactive');
    if (Number(currentPage) === (Number(totalPages) - 1)) {
      nextPageBtn.classList.add('inactive');
      lastPageBtn.classList.add('inactive');
    }
    if (Number(currentPage) !== (Number(totalPages))) {
      id = (Number(currentPage) + 1) * 20 - 19;
      deleteCountries();
      fetchCountries(nextPage);
    }
  }
});

lastPageBtn.addEventListener('click', () => {
  if (+totalPages > 1) {
    firstPageBtn.classList.remove('inactive');
    prevPageBtn.classList.remove('inactive');
    if (!lastPageBtn.classList.contains('inactive')) {
      nextPageBtn.classList.add('inactive');
      lastPageBtn.classList.add('inactive');
      id = Number(totalPages) * 20 - 19;
      deleteCountries();
      fetchCountries(lastPage);
    }
  }
});

/* ############################# Search function ############################# */

let searchUrl:URL = url;
let canSearch = true;
const search = (searchFor: string, value: string) => {
  canSearch = false;
  let searchParams = '';
  axios.get('http://localhost:3004/countries')
    .then((response) => {
      for (let i = 0; i < response.data.length; i += 1) {
        const result: string = _.get(response.data[i], searchFor);
        if (result.toLowerCase().includes(value.toLowerCase())) {
          searchParams += `&${searchFor}=${result}`;
        }
        if (i === response.data.length - 1 && searchParams) {
          canSearch = false;
          searchUrl = new URL(`${url.href}${searchParams.toString()}`);
          // eslint-disable-next-line no-loop-func
          const completeSearch = () => {
            resetDefault();
            deleteCountries();
            fetchCountries(searchUrl);
            canSearch = true;
            id = 1;
          };
          setTimeout(completeSearch, 500);
        } else {
          searchUrl = new URL('http://localhost:3004');
          pages.innerHTML = '<span style=\'color:#b10808\'>Nothing found</span>';
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

const clearInputValues = () => {
  searchCountry.value = '';
  searchCapital.value = '';
  searchCurrency.value = '';
  searchLanguage.value = '';
};

searchCountry.addEventListener('keyup', () => {
  searchCapital.value = '';
  searchCurrency.value = '';
  searchLanguage.value = '';
  if (searchCountry.value.length > 2 && canSearch) {
    search('name', searchCountry.value);
  } else {
    resetDefault();
    deleteCountries();
    fetchCountries(url);
  }
});

searchCapital.addEventListener('keyup', () => {
  searchCountry.value = '';
  searchCurrency.value = '';
  searchLanguage.value = '';
  if (searchCapital.value.length > 2 && canSearch) {
    search('capital', searchCapital.value);
  } else {
    resetDefault();
    deleteCountries();
    fetchCountries(url);
  }
});

searchCurrency.addEventListener('keyup', () => {
  searchCountry.value = '';
  searchCapital.value = '';
  searchLanguage.value = '';
  if (searchCurrency.value.length > 2 && canSearch) {
    search('currency.name', searchCurrency.value);
  } else {
    resetDefault();
    deleteCountries();
    fetchCountries(url);
  }
});

searchLanguage.addEventListener('keyup', () => {
  searchCountry.value = '';
  searchCapital.value = '';
  searchCurrency.value = '';
  if (searchLanguage.value.length > 2 && canSearch) {
    search('language.name', searchLanguage.value);
  } else {
    resetDefault();
    deleteCountries();
    fetchCountries(url);
  }
});

const getSortUrl = () => {
  if (searchUrl !== url) {
    return searchUrl;
  }
  return url;
};

/* ############################# Sort function, consts and listener ############################# */

const sort = (sortable: HTMLDivElement, sortBy: string) => {
  const sortParams = { _sort: sortBy, _order: 'asc' };
  if (sortable.classList.contains('asc')) {
    sortable.classList.replace('asc', 'desc');
    // eslint-disable-next-line no-underscore-dangle
    sortParams._order = 'desc';
  } else if (sortable.classList.contains('desc')) {
    sortable.classList.replace('desc', 'asc');
  } else {
    sortable.classList.add('asc');
  }
  const searchParams = new URLSearchParams(sortParams);
  const sortUrl = new URL(`${getSortUrl()}&${searchParams.toString()}`);
  deleteCountries();
  fetchCountries(sortUrl);
};

const sortByName:HTMLDivElement = document.querySelector('.js-sort-name');
const sortByCapital:HTMLDivElement = document.querySelector('.js-sort-capital');
const sortByCurrency:HTMLDivElement = document.querySelector('.js-sort-currency');
const sortByLanguage:HTMLDivElement = document.querySelector('.js-sort-language');

sortByName.addEventListener('click', () => {
  resetDefault();
  sort(sortByName, 'name');
});

sortByCapital.addEventListener('click', () => {
  resetDefault();
  sort(sortByCapital, 'capital');
});

sortByCurrency.addEventListener('click', () => {
  resetDefault();
  sort(sortByCurrency, 'currency.name');
});

sortByLanguage.addEventListener('click', () => {
  resetDefault();
  sort(sortByLanguage, 'language.name');
});

/* ############################# Home button ############################# */

const homeBtn = document.querySelector('.js-home');

homeBtn.addEventListener('click', () => {
  resetDefault();
  clearInputValues();
  deleteCountries();
  fetchCountries(url);
});

/* ############################# On page load ############################# */

fetchCountries(url);

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
