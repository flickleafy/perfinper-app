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

export function searchDescription(searchName, array) {
  let searchList = [];

  if (searchName.startsWith('-')) {
    // Extract the word to exclude from the search term by removing the hyphen
    const wordToExclude = searchName.slice(1).toLowerCase();
    // Filter out items that contain the word to exclude
    searchList = array.filter(
      (element) =>
        !element.itemDescription.toLowerCase().includes(wordToExclude)
    );
  } else {
    // Include items that contain the search term
    searchList = array.filter((element) =>
      element.itemDescription.toLowerCase().includes(searchName.toLowerCase())
    );
  }

  return searchList;
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
