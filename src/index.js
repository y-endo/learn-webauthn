import 'es6-promise';
import 'whatwg-fetch';
import './signup';
import './signin';

import { fetchAllUserName, polyfillArrayIncludes } from './utils';

polyfillArrayIncludes();

if (!('credentials' in navigator)) {
  document.querySelector('.error-message:last-child').style.display = 'block';
}

window.addEventListener('DOMContentLoaded', async () => {
  const users = await fetchAllUserName();
  const userNameListItems = users.map(userName => `<li>${userName}</li>`);

  document.querySelector('.js-user-list').innerHTML = userNameListItems.join('');
});
