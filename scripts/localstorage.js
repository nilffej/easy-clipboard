let db;

async function init() {
  db = await idb.openDB("data", 1, {
    upgrade(d) {
      d.createObjectStore("links");
    }
  });
}

async function putLink(name, content, category) {
  const transaction = db.transaction("links", "readwrite");
  const store = transaction.objectStore("links");

  const data = (await store.get(category) || {});
  data[name] = content;
  await store.put(data, category);
  await transaction.done;
}

async function deleteLink(name, category) {
  const transaction = db.transaction("links", "readwrite");
  const store = transaction.objectStore("links");

  const data = (await store.get(category) || {});
  delete data[name];
  await store.put(data, category);
  await transaction.done;
}

async function deleteCategory(category) {
  const transaction = db.transaction("links", "readwrite");
  const store = transaction.objectStore("links");

  await store.delete(category);
  await transaction.done;
}

async function getCategories() {
  const transaction = db.transaction("links", "readonly");
  const store = transaction.objectStore("links");

  const data = (await store.getAllKeys());
  await transaction.done
  return data;
}

async function getCategoryLinks(category) {
  const transaction = db.transaction("links", "readonly");
  const store = transaction.objectStore("links");

  const data = (await store.getAll(category))[0];
  await transaction.done

  return data;
}

async function getAllData() {
  const categories = await getCategories();
  let data = {};

  const promises = categories.map(async (category) => {
    return new Promise(async (resolve, reject) => {
      data[category] = await getCategoryLinks(category);
      resolve();
    })
  })

  await Promise.all(promises);
  return data;
}