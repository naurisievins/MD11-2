import axios from 'axios';

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