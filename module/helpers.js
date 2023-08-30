/**
 * Filter a collection of Items by type and return them sorted
 * @param {Array} collection The list of Items
 * @param {String} type The Type of item we're looking for
 * @returns The filtered, sorted list
 */
export const filter_items = (collection, type, sort = false) => {
  var items = collection.filter((element) => {
    return element.type == type
  })

  if (sort) {
    return items.sort((a, b) => {
      if (a.name < b.name) {
        return -1
      }
      return 1
    })
  }

  return items
}

/**
 * Filter a collection of Techniques by approach
 * @param {Array} collection The list of Techniques
 * @param {String} approach The Approach we want
 * @returns The items in the collection matching the specified approach
 */
export const filter_techniques = (collection, approach) => {
  return collection.filter((element) => {
    return element.type === 'technique' && element.system.approach === approach
  })
}

export const filter_statuses = (collection, type) => {
  return collection.filter((e) => {
    return e.type === 'status' && e.system.type === type
  })
}

export const onlyUnique = (array) => {
  return array.filter((value, index, array) => array.indexOf(value) === index)
}
