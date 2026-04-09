const SUPABASE_URL = "https://aavzsvurygojkoxxvssd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_At0pbd5rRAbdWUF6gL0Kgw_O0QPSx0-";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== ELEMENT REFS =====
const titleInput       = document.getElementById("title");
const descInput        = document.getElementById("description");
const categoryInput    = document.getElementById("category");
const budgetInput      = document.getElementById("budget");
const addBtn           = document.getElementById("addBtn");
const addBtnLabel      = document.getElementById("addBtnLabel");
const cancelBtn        = document.getElementById("cancelBtn");
const addTitleEl       = document.getElementById("addTitle");
const list             = document.getElementById("dateList");
const toast            = document.getElementById("toast");
const ideaCount        = document.getElementById("ideaCount");
const searchInput      = document.getElementById("searchInput");
const filterCategory   = document.getElementById("filterCategory");
const filterBudget     = document.getElementById("filterBudget");
const loadingOverlay   = document.getElementById("loadingOverlay");
const confirmModal     = document.getElementById("confirmModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn  = document.getElementById("cancelDelete");
const favOnlyCheck     = document.getElementById("favOnlyCheck");

let editId       = null;
let deleteId     = null;
let allIdeas     = [];
let toastTimeout = null;

// ===== LOADING =====
function setLoading(on) {
  loadingOverlay.classList.toggle("hidden", !on);
}

// ===== TOAST =====
function showToast(msg) {
  toast.innerText = msg;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ===== TOGGLE PANELS =====
function setupToggle(toggleId, boxId, chevronId) {
  document.getElementById(toggleId).onclick = () => {
    const box     = document.getElementById(boxId);
    const chevron = document.getElementById(chevronId);
    box.classList.toggle("open");
    chevron.classList.toggle("open");
  };
}

setupToggle("toggleAdd",    "addBox",    "chevronAdd");
setupToggle("toggleIdeas",  "ideasBox",  "chevronIdeas");

// ===== CANCEL EDIT =====
cancelBtn.onclick = () => {
  resetForm();
};

function resetForm() {
  titleInput.value    = "";
  descInput.value     = "";
  categoryInput.value = "";
  budgetInput.value   = "";
  editId              = null;
  addBtnLabel.innerText = "💾 Opslaan";
  addTitleEl.innerText  = "Voeg date toe";
}

// ===== RENDER LIST =====
async function renderList() {
  setLoading(true);

  const { data, error } = await supabaseClient
    .from("date_ideas")
    .select("*")
    .order("favorite", { ascending: false })
    .order("id",       { ascending: false });

  setLoading(false);

  if (error) {
    showToast("❌ Fout bij laden");
    return;
  }

  allIdeas = data || [];
  ideaCount.innerText = allIdeas.length;
  applyFilters();
}

// ===== APPLY FILTERS =====
function applyFilters() {
  const search   = searchInput.value.toLowerCase();
  const cat      = filterCategory.value;
  const budget   = filterBudget.value;

  const filtered = allIdeas.filter(idea => {
    const matchSearch = !search ||
      idea.title?.toLowerCase().includes(search) ||
      idea.description?.toLowerCase().includes(search);
    const matchCat    = !cat    || idea.category === cat;
    const matchBudget = !budget || idea.budget   === budget;
    return matchSearch && matchCat && matchBudget;
  });

  renderItems(filtered);
}

searchInput.addEventListener("input",  applyFilters);
filterCategory.addEventListener("change", applyFilters);
filterBudget.addEventListener("change",   applyFilters);

// ===== RENDER ITEMS =====
function renderItems(ideas) {
  list.innerHTML = "";

  if (!ideas.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">💭</span>
        <p>Geen ideeën gevonden</p>
      </div>`;
    return;
  }

  ideas.forEach((idea) => {
    const li = document.createElement("li");
    li.className  = "date-item";
    li.dataset.id = idea.id;

    li.innerHTML = `
      <div class="item-content">
        <strong>${idea.title} ${idea.favorite ? "⭐" : ""}</strong>
        <small>${idea.description || ""}</small>
        <div class="item-badges">
          ${idea.category ? `<span class="badge badge-cat">${categoryEmoji(idea.category)} ${idea.category}</span>` : ""}
          ${idea.budget   ? `<span class="badge badge-budget">${budgetEmoji(idea.budget)} ${idea.budget}</span>` : ""}
        </div>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "actions";

    // ⭐ Favorite
    const fav = document.createElement("button");
    fav.className = "iconBtn";
    fav.title     = idea.favorite ? "Verwijder favoriet" : "Markeer als favoriet";
    fav.innerText = idea.favorite ? "💖" : "🤍";
    fav.onclick   = async () => {
      await supabaseClient
        .from("date_ideas")
        .update({ favorite: !idea.favorite })
        .eq("id", idea.id);
      showToast(idea.favorite ? "Favoriet verwijderd" : "Favoriet toegevoegd ⭐");
      renderList();
    };

    // ✏️ Edit
    const edit = document.createElement("button");
    edit.className = "iconBtn";
    edit.title     = "Bewerken";
    edit.innerText = "✏️";
    edit.onclick   = () => {
      titleInput.value    = idea.title;
      descInput.value     = idea.description;
      categoryInput.value = idea.category;
      budgetInput.value   = idea.budget;
      editId              = idea.id;
      addBtnLabel.innerText = "💾 Bijwerken";
      addTitleEl.innerText  = "Idee bewerken";

      // Open het add-paneel als het dicht is
      const addBox   = document.getElementById("addBox");
      const chevron  = document.getElementById("chevronAdd");
      if (!addBox.classList.contains("open")) {
        addBox.classList.add("open");
        chevron.classList.add("open");
      }

      // Scroll naar het formulier
      document.getElementById("addSection").scrollIntoView({ behavior: "smooth", block: "start" });
      showToast("Bewerkmodus ✏️");
    };

    // 🗑 Delete
    const del = document.createElement("button");
    del.className = "iconBtn";
    del.title     = "Verwijderen";
    del.innerText = "🗑️";
    del.onclick   = () => {
      deleteId = idea.id;
      confirmModal.classList.remove("hidden");
    };

    actions.appendChild(fav);
    actions.appendChild(edit);
    actions.appendChild(del);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

// ===== DELETE MODAL =====
confirmDeleteBtn.onclick = async () => {
  if (!deleteId) return;

  const item = list.querySelector(`[data-id="${deleteId}"]`);
  if (item) {
    item.classList.add("removing");
    await new Promise(r => setTimeout(r, 280));
  }

  await supabaseClient.from("date_ideas").delete().eq("id", deleteId);
  deleteId = null;
  confirmModal.classList.add("hidden");
  showToast("Verwijderd 🗑️");
  renderList();
};

cancelDeleteBtn.onclick = () => {
  deleteId = null;
  confirmModal.classList.add("hidden");
};

// Klik buiten modal = sluiten
confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) {
    deleteId = null;
    confirmModal.classList.add("hidden");
  }
});

// ===== SAVE / EDIT =====
addBtn.onclick = async () => {
  const title = titleInput.value.trim();
  if (!title) {
    showToast("Vul een titel in 📝");
    titleInput.focus();
    return;
  }

  const payload = {
    title:       title,
    description: descInput.value.trim(),
    category:    categoryInput.value,
    budget:      budgetInput.value
  };

  setLoading(true);

  if (editId) {
    await supabaseClient.from("date_ideas").update(payload).eq("id", editId);
    showToast("Aangepast ✏️");
  } else {
    await supabaseClient.from("date_ideas").insert([payload]);
    showToast("Toegevoegd 💖");
  }

  setLoading(false);
  resetForm();

  // Sluit het formulier na opslaan
  const addBox  = document.getElementById("addBox");
  const chevron = document.getElementById("chevronAdd");
  addBox.classList.remove("open");
  chevron.classList.remove("open");

  renderList();
};

// ===== RANDOM =====
document.getElementById("generateBtn").onclick = async () => {
  const favOnly  = favOnlyCheck.checked;
  const filterCat    = document.getElementById("randomFilterCategory").value;
  const filterBudget = document.getElementById("randomFilterBudget").value;

  let pool = allIdeas;

  if (favOnly) {
    pool = pool.filter(i => i.favorite);
  }
  if (filterCat) {
    pool = pool.filter(i => i.category === filterCat);
  }
  if (filterBudget) {
    pool = pool.filter(i => i.budget === filterBudget);
  }

  if (!allIdeas.length) {
    showToast("Nog geen ideeën! Voeg er eerst wat toe 💭");
    return;
  }

  if (!pool.length) {
    showToast("Geen ideeën gevonden met deze filters ✨");
    return;
  }

  const rand = pool[Math.floor(Math.random() * pool.length)];

  document.getElementById("randomTitle").innerText = rand.title;
  document.getElementById("randomDescription").innerText = rand.description || "";

  const catEl    = document.getElementById("randomCategory");
  const budgetEl = document.getElementById("randomBudget");
  catEl.innerText    = rand.category ? `${categoryEmoji(rand.category)} ${rand.category}` : "";
  budgetEl.innerText = rand.budget   ? `${budgetEmoji(rand.budget)} ${rand.budget}`       : "";

  // Reset animatie door kaart even te verbergen
  const card = document.getElementById("randomCard");
  card.classList.add("hidden");
  void card.offsetWidth; // reflow
  card.classList.remove("hidden");
};

// ===== HELPERS =====
function categoryEmoji(cat) {
  return { Buiten: "🌿", Thuis: "🏠", Eten: "🍽️", Avontuur: "⚡" }[cat] || "📂";
}

function budgetEmoji(budget) {
  return { Gratis: "🆓", Goedkoop: "💚", Gemiddeld: "💛", Duur: "❤️" }[budget] || "💸";
}

// ===== INIT =====
renderList();
