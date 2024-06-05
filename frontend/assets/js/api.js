"use strict";

const api_key = "6040885876149bb81ff3f115cef4ecdf";
const imageBaseURL = "http://image.tmdb.org/t/p/";

/*--------- 
Fetch data from a server using the 'url' and passes the result in JSON data to a 'callback' function, along with an optional parameter if has 'optionalParam'.
----------*/

const fetchDataFromServer = (url, callback, optionalParam) => {
  fetch(url, { mode: 'cors' })
    .then((response) => response.json())
    .then((data) => callback(data, optionalParam));
};



export { imageBaseURL, api_key, fetchDataFromServer };
