export function convertObjectToArray(data) {
  return Object.keys(data).map((key) => {
    return {
      id: key,
      ...data[key],
    };
  });
}
