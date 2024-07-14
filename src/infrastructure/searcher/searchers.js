export function searchCategory(searchName, array) {
  let searchList = [];

  searchList = array.filter(
    (element) =>
      element.transactionCategory
        .toLowerCase()
        .indexOf(searchName.toLowerCase()) !== -1
  );

  return searchList;
}

/**
 * Searches through an array of objects, filtering based on the presence or absence of a search term
 * across multiple fields.
 * Example usage:
 * const results = search('apple', data, ['transactionDescription', 'companyName', 'transactionName']);
 *
 * @param {string} searchName - The term to search for; if it starts with '-', the function excludes items containing the term.
 * @param {Array} array - The array of objects to search through.
 * @param {Array<string>} fields - The fields in the objects to search through.
 * @returns {Array} - An array of objects that match the search criteria.
 */

export function searchFields(searchName, array, fields) {
  const exclude = searchName.startsWith('-');
  const searchTerm = exclude
    ? searchName.slice(1).toLowerCase()
    : searchName.toLowerCase();

  return array.filter((element) => {
    return fields.some((field) => {
      if (typeof element[field] === 'string') {
        const content = element[field].toLowerCase();
        return exclude
          ? !content.includes(searchTerm)
          : content.includes(searchTerm);
      }
      return false;
    });
  });
}

export function searchByID(id, array) {
  let element = null;

  element = array.find((element) => element.id.indexOf(id) !== -1);

  return element;
}

export function getIndexOfElement(id, elementList) {
  let index = elementList.findIndex((element) => {
    if (element.id === id) {
      return element;
    }
    return null;
  });
  return index;
}
