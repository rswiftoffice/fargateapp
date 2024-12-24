export function removeKeyFromObject(
  obj: {
    [key: string]: any;
  },
  propToDelete: string,
) {
  for (const property in obj) {
    if (typeof obj[property] == 'object') {
      delete obj.property;
      const newJsonData = removeKeyFromObject(obj[property], propToDelete);
      obj[property] = newJsonData;
    } else {
      if (property === propToDelete) {
        delete obj[property];
      }
    }
  }
  return obj;
}
