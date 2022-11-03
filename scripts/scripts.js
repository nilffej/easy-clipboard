let links = {};

function copyURL(category_key, key) {
  const input_field = document.getElementById("copy-content");
  input_field.value = links[category_key][key];
  input_field.select();
  document.execCommand("copy");
}

function buildSections() {
  for (const key in links) {
    buildCategoryContents(key);
  }
}

async function buildCategoryContents(category) {
  const collapsable = document.getElementById(`collapsable-${category}`);
  links[category] = await getCategoryLinks(category);

  if (!collapsable) {
    const categories_list = document.getElementById("categories-list");

    // Build wrapping div
    const categoryDiv = document.createElement("div");
    categoryDiv.id = `category-${category}`;
    categoryDiv.className = "category";

    // Build header
    const header = document.createElement("div");
    const collapsable = document.createElement("div");
    collapsable.id = `collapsable-${category}`;
    collapsable.className = "collapsable";

    // Build header
    header_text = document.createElement("h5");
    header_text.textContent = category;
    header.appendChild(header_text);
    header.appendChild(document.createElement("hr"));
    header.style.width = "100%";

    categoryDiv.appendChild(header);
    categoryDiv.appendChild(collapsable);
    categories_list.appendChild(categoryDiv);

    buildButtons(category, collapsable.id);
  } else {
    collapsable.innerHTML = "";
    buildButtons(category, `collapsable-${category}`);
  }
}

async function removeCategoryDiv(category) {
  await deleteCategory(category);
  delete links[category];
  document.getElementById(`category-${category}`).remove();
  populateCategoryDropdown();
}

async function removeButton(buttonName, category) {
  await deleteLink(buttonName, category);
  delete links[category][buttonName];
  if (!Object.keys(links[category]).length) {
    removeCategoryDiv(category);
  } else {
    buildCategoryContents(category);
  }
}

function buildButtons(category, id) {
  const deleteToggle = document.getElementById("delete-toggle");

  const collapsable = document.getElementById(id);
  const linksKeys = Object.keys(links[category]);
  for (let r = 0; r < linksKeys.length; r += 3) {
    const row = document.createElement("div");
    row.className = "row button-row";

    for (let c = r; c < r + 3 && c < linksKeys.length; ++c) {
      const buttonName = linksKeys[c];

      const col = document.createElement("div");
      col.className = "col-sm-4";

      const button = document.createElement("button");
      button.className = "btn btn-dark copy-button";
      button.textContent = buttonName;
      if (deleteToggle.checked) {
        button.style.backgroundColor = "#dc3545";
        button.style.borderColor = "#dc3545";
      }

      button.onclick = () => {
        if (!button.style.backgroundColor) {
          copyURL(category, buttonName);
        } else {
          removeButton(buttonName, category);
        }
      };

      col.appendChild(button);
      row.appendChild(col);
    }

    collapsable.appendChild(row);
  }
}

function populateCategoryDropdown() {
  const dropdown = document.getElementById("categories-dropdown");
  const categories = Object.keys(links);

  dropdown.innerHTML = "";

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    dropdown.appendChild(option);
  });

  if (categories.length) {
    dropdown.defaultValue = categories[0];
  } else {
    dropdown.defaultValue = "New Category";
  }
}

async function addLink() {
  const nickname = document.getElementById("nickname-input");
  const content = document.getElementById("copy-content-input");
  const category = document.getElementById("category-input");

  if (!(nickname.value && content.value && category.value)) {
    displayMessage("All fields are required!");
    return;
  }

  await putLink(nickname.value, content.value, category.value);
  links[category.value] = await getCategoryLinks(category.value);

  populateCategoryDropdown();
  buildCategoryContents(category.value);

  nickname.value = "";
  content.value = "";
  category.value = "";

  displayMessage("");
}

function displayMessage(message) {
  const nickname = document.getElementById("message");
  nickname.textContent = message;
  return;
}

function toggleDelete(e) {
  const buttons = Array.from(document.getElementsByClassName("copy-button"));
  const formWrapper = document.getElementById("form-wrapper");

  if (e.target.checked) {
    formWrapper.disabled = true;
    buttons.forEach((btn) => {
      btn.style.backgroundColor = "#dc3545";
      btn.style.borderColor = "#dc3545";
    });
  } else {
    formWrapper.disabled = false;
    buttons.forEach((btn) => {
      btn.style.backgroundColor = null;
      btn.style.borderColor = null;
    });
  }
}

async function main() {
  await init();
  links = await getAllData();

  buildSections();
  populateCategoryDropdown();

  const addLinkButton = document.getElementById("add-link-button");
  addLinkButton.onclick = () => addLink();

  const deleteToggle = document.getElementById("delete-toggle");
  deleteToggle.onclick = (e) => toggleDelete(e);
}

main();
