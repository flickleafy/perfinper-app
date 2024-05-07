export function searchCategory(searchName, array) {
  let searchList = [];

  searchList = array.filter(
    (element) =>
      element.category.toLowerCase().indexOf(searchName.toLowerCase()) !== -1
  );

  return searchList;
}

export function searchDescription(searchName, array) {
  let searchList = [];

  searchList = array.filter(
    (element) =>
      element.description.toLowerCase().indexOf(searchName.toLowerCase()) !== -1
  );
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
