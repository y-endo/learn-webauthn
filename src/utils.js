export function fetchAllUserName() {
  return new Promise(resolve => {
    fetch('/api/users', {
      method: 'POST',
      cache: 'no-cache'
    })
      .then(response => response.json())
      .then(json => {
        resolve(json.users);
      });
  });
}

export function polyfillArrayIncludes() {
  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function (searchElement, fromIndex) {
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        let o = Object(this);
        let len = o.length >>> 0;

        if (len === 0) {
          return false;
        }

        let n = fromIndex | 0;
        let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        while (k < len) {
          if (o[k] === searchElement) {
            return true;
          }
          k++;
        }

        return false;
      }
    });
  }
}
