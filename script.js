// --- Supabase setup ---
const SUPABASE_URL = 'https://aavzsvurygojkoxxvssd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_At0pbd5rRAbdWUF6gL0Kgw_O0QPSx0-Y'

// Correcte manier om client te maken
const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Elementen ---
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const budgetInput = document.getElementById("budget");
const addBtn = document.getElementById("addBtn");
const dateList = document.getElementById("dateList");
const generateBtn = document.getElementById("generateBtn");
const randomCard = document.getElementById("randomCard");
const randomTitle = document.getElementById("randomTitle");
const randomDescription = document.getElementById("randomDescription");
const filterCategory = document.getElementById("filterCategory");
const filterBudget = document.getElementById("filterBudget");

// --- Functies ---
async function fetchIdeas() {
  const { data, error } = await client
    .from('date_ideas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Fout bij ophalen:", error);
  }

  return data || [];
}

async function renderList() {
  const ideas = await fetchIdeas();
  dateList.innerHTML = "";

  ideas.forEach((idea) => {
    if (filterCategory.value && idea.category !== filterCategory.value) return;
    if (filterBudget.value && idea.budget !== filterBudget.value) return;

    const li = document.createElement("li");
    li.className = "date-item";

    li.innerHTML = `
      <span>${idea.title} (${idea.category}, ${idea.budget})</span>
    `;

    const delBtn = document.createElement("button");
    delBtn.innerText = "Verwijder";

    delBtn.onclick = async () => {
      await client.from('date_ideas').delete().eq('id', idea.id);
      renderList();
    };

    li.appendChild(delBtn);
    dateList.appendChild(li);
  });
}

// --- Add date ---
addBtn.addEventListener("click", async () => {
  if (!titleInput.value || !descInput.value) {
    alert("Vul titel en beschrijving in");
    return;
  }

  const { error } = await client.from('date_ideas').insert([{
    title: titleInput.value,
    description: descInput.value,
    category: categoryInput.value,
    budget: budgetInput.value
  }]);

  if (error) {
    console.error("Fout bij toevoegen:", error);
    alert("Er ging iets mis!");
  }

  // reset velden
  titleInput.value = "";
  descInput.value = "";
  categoryInput.value = "";
  budgetInput.value = "";

  renderList();
});

// --- Random picker ---
generateBtn.addEventListener("click", async () => {
  const ideas = await fetchIdeas();

  let filtered = ideas;

  if (filterCategory.value) {
    filtered = filtered.filter(i => i.category === filterCategory.value);
  }

  if (filterBudget.value) {
    filtered = filtered.filter(i => i.budget === filterBudget.value);
  }

  if (filtered.length === 0) {
    alert("Geen ideeën gevonden voor deze filters!");
    return;
  }

  const rand = filtered[Math.floor(Math.random() * filtered.length)];

  randomTitle.innerText = rand.title;
  randomDescription.innerText = rand.description;

  randomCard.classList.remove("hidden");
});

// --- Filters ---
filterCategory.addEventListener("change", renderList);
filterBudget.addEventListener("change", renderList);

// --- Initial load ---
renderList();
