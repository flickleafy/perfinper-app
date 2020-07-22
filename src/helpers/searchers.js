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

export function searchByID(_id, array) {
  let element = null;

  element = array.find((element) => element._id.indexOf(_id) !== -1);

  return element;
}

export function getIndexOfElement(_id, elementList) {
  let index = elementList.findIndex((element) => {
    if (element._id === _id) {
      return element;
    }
  });
  return index;
}
