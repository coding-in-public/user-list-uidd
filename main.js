// selectors
const btnWrapper = document.querySelector("#btn-wrapper");
const usersWrapper = document.querySelector("#user-wrapper");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
let debounceTimer;

function getQueryParamsAsObject() {
  let params = new URL(document.location).searchParams;
  return Object.fromEntries(params);
}

function generateUpdatedURL(paramObj) {
  const { area: newArea, search: newSearch } = paramObj;
  const { area: originalArea, search: originalSearch } =
    getQueryParamsAsObject();

  const area = newArea ? newArea : originalArea;
  let search;

  switch (newSearch) {
    case "":
      search = undefined;
      break;
    case undefined:
      search = originalSearch;
      break;
    default:
      search = newSearch;
      break;
  }

  const newParamsObj = {};
  if (area) {
    newParamsObj.area = area;
  }
  if (search) {
    newParamsObj.search = search;
  }

  const newURL = new URL(location.origin);
  const searchParams = new URLSearchParams(newParamsObj);
  // return an updated url with the new params
  return `${newURL}?${searchParams.toString()}`;
}

function generateCardHTML(data) {
  const fullName = `${data.name.first} ${data.name.last}`;
  return `<article class="user-card flex--xs">
            <img
              src="${data.headshot}"
              alt="${fullName}"
              class="user-image"
              width="60"
              height="60"
            />
            <div class="grid--xs user-deets">
              <div>
                <h3>${fullName}</h3>
                <p class="user-location">${data.location}</p>
              </div>
              <div class="flex--xs flex-wrap pill-wrapper">
                ${data.tags.map((t) => `<p class="pill">${t}</p>`).join("")}
              </div>
            </div>
          </article>`;
}

function clearAllPressed() {
  btnWrapper
    .querySelectorAll(".btn")
    .forEach((b) => b.removeAttribute("aria-pressed"));
}

function generateFilterButton(area) {
  return `<button class="btn" data-area="${area}">${area}</button>`;
}

// event listeners
btnWrapper.addEventListener("click", (e) => {
  if (e.target.dataset.area) {
    // clear all aria-pressed
    clearAllPressed();
    // apply aria-pressed to button
    const isPressed = e.target.hasAttribute("aria-pressed");
    e.target.setAttribute("aria-pressed", "true");
  }

  // update the query param
  const updatedURL = generateUpdatedURL({ area: e.target.dataset.area });
  window.location = updatedURL;
});

window.addEventListener("DOMContentLoaded", async () => {
  const { area, search } = getQueryParamsAsObject();

  if (search) {
    searchInput.value = search;
  }

  try {
    // fetch data
    const res = await fetch("http://localhost:3000/users");
    if (!res.ok) {
      throw new Error("stuff happened");
    }
    const data = await res.json();
    // fill the buttons //
    // 1. get an array of all roles
    const areas = [...new Set(data.map((person) => person.area))];
    // 2. generate a button for each role
    const btnHTML = areas.map(generateFilterButton);
    btnWrapper.insertAdjacentHTML("beforeend", btnHTML.join(""));

    // update the aria-pressed attribute
    clearAllPressed();
    const btnToPress = btnWrapper.querySelector(`[data-area="${area}"]`);
    if (btnToPress) {
      btnToPress.setAttribute("aria-pressed", "true");
    } else {
      btnWrapper
        .querySelector(`[data-area="All"]`)
        .setAttribute("aria-pressed", "true");
    }

    // fill the cards
    let cardHTML;
    if (area === "All" || !area) {
      cardHTML = data.map(generateCardHTML);
    } else {
      cardHTML = data.filter((p) => p.area === area).map(generateCardHTML);
    }

    if (search) {
      cardHTML = cardHTML.filter((card) =>
        card.toLowerCase().includes(search.toLowerCase())
      );
    }
    usersWrapper.insertAdjacentHTML("beforeend", cardHTML.join(""));
  } catch (e) {
    console.error(e.message);
  }
});

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  // 500ms debounce
  debounceTimer = setTimeout(
    () =>
      (window.location = generateUpdatedURL({
        search: searchInput.value,
      })),
    500
  );
});
