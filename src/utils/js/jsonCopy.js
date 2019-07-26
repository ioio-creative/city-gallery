function jsonCopy(o) {
  var newO,
    i;

  if (typeof o !== 'object') {
    return o;
  }
  if (!o) {
    return o;
  }

  if ('[object Array]' === Object.prototype.toString.apply(o)) {
    newO = [];
    for (i = 0; i < o.length; i += 1) {
      newO[i] = jsonCopy(o[i]);
    }
    return newO;
  }
  if ('[object HTMLElement]' === Object.prototype.toString.apply(o)) {
    return o;
  }

  newO = {};
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = jsonCopy(o[i]);
    }
  }
  return newO;
}

export default jsonCopy;