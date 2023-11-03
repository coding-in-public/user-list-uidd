// selectors
const btnWrapper = document.querySelector("#btn-wrapper");
const usersWrapper = document.querySelector("#user-wrapper");

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

btnWrapper.addEventListener("click", (e) => {
  if (e.target.dataset.area) {
    // clear all aria-pressed
    clearAllPressed();
    // apply aria-pressed to button
    const isPressed = e.target.hasAttribute("aria-pressed");
    e.target.setAttribute("aria-pressed", "true");
  }

  // update the query param
});

function generateFilterButton(area) {
  return `<button class="btn" data-area="${area}">${area}</button>`;
}

// event listeners
window.addEventListener("DOMContentLoaded", async () => {
  let params = new URL(document.location).searchParams;
  let { area, search } = Object.fromEntries(params);

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

    // fill the cards
    let cardHTML;
    if (area === "All" || !area) {
      cardHTML = data.map(generateCardHTML);
    } else {
      cardHTML = data.filter((p) => p.area === area).map(generateCardHTML);
    }
    usersWrapper.insertAdjacentHTML("beforeend", cardHTML.join(""));
  } catch (e) {
    console.error(e.message);
  }
});
