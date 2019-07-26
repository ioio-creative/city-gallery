/*
 * 
 * 
*/
import { config } from 'globals/config';
import { invokeIfIsFunction } from 'utils/js/isFunction';

function fetchExhibitionJsonFromUrl(exhib_url, callback) {
  fetch(exhib_url)
    .then(res => {
      if (!res.ok) {
        // seems when not found, the server will still return a 404 page but not 404 response
        // thats mean cannot catch 404 here
        throw Error(res.statusText);
      }
      return res.json();
    })
    .then(resJSON => {
      invokeIfIsFunction(callback, resJSON);
    })
    .catch(err => {
      // when 404 page received, the res.json() will throw error but not the !res.ok
      console.log('Somethings wrong.', err);
      // add this to let the caller know fetch complete and no data recieved
      invokeIfIsFunction(callback, null, err);
    }); 
}

export default {
  fetchExhibitionJsonFromUrl
};