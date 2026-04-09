const SUPABASE_URL = "https://aavzsvurygojkoxxvssd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_At0pbd5rRAbdWUF6gL0Kgw_O0QPSx0-";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// inputs
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const budgetInput = document.getElementById("budget");

const list = document.getElementById("dateList");
const toast = document.getElementById("toast");

let editId = null;

// toggles
document.getElementById("toggleAdd").onclick = () => {
  document.getElementById("addBox").classList.toggle("open");
};

document.getElementById("toggleIdeas").onclick = () => {
  document.getElementById("ideasBox").classList.toggle("open");
};

// toast
function showToast(msg) {
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// 🔥 RENDER (FIXED - NO BUGS)
async function renderList() {
  const { data } = await supabaseClient
    .from("date_ideas")
    .select("*")
    .order("id", { ascending: false });

  list.innerHTML = "";

  if (!data?.length) {
    list.innerHTML = "<p>Geen ideeën 💭</p>";
    return;
  }

  data.forEach((idea) => {
    const li = document.createElement("li");
    li.className = "date-item";

    li.innerHTML = `
      <div>
        <strong>${idea.title}</strong> ${idea.favorite ? "⭐" : ""}<br/>
        <small>${idea.description}</small>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "actions";

    // ⭐ favorite
    const fav = document.createElement("button");
    fav.className = "iconBtn";
    fav.innerText = "⭐";
    fav.onclick = async () => {
      await supabaseClient
        .from("date_ideas")
        .update({ favorite: !idea.favorite })
        .eq("id", idea.id);
      renderList();
    };

    // ✏️ edit
    const edit = document.createElement("button");
    edit.className = "iconBtn";
    edit.innerText = "✏️";
    edit.onclick = () => {
      titleInput.value = idea.title;
      descInput.value = idea.description;
      categoryInput.value = idea.category;
      budgetInput.value = idea.budget;
      editId = idea.id;
      showToast("Bewerken ✏️");
    };

    // 🗑 delete
    const del = document.createElement("button");
    del.className = "iconBtn";
    del.innerText = "🗑";
    del.onclick = async () => {
      await supabaseClient.from("date_ideas").delete().eq("id", idea.id);
      renderList();
    };

    actions.appendChild(fav);
    actions.appendChild(edit);
    actions.appendChild(del);

    li.appendChild(actions);
    list.appendChild(li);
  });
}

// ➕ save / edit
document.getElementById("addBtn").onclick = async () => {
  const payload = {
    title: titleInput.value,
    description: descInput.value,
    category: categoryInput.value,
    budget: budgetInput.value
  };

  if (editId) {
    await supabaseClient.from("date_ideas").update(payload).eq("id", editId);
    editId = null;
    showToast("Aangepast ✏️");
  } else {
    await supabaseClient.from("date_ideas").insert([payload]);
    showToast("Toegevoegd 💖");
  }

  titleInput.value = "";
  descInput.value = "";

  renderList();
};

// 🎲 random IN CARD (NO POPUP)
document.getElementById("generateBtn").onclick = async () => {
  const { data } = await supabaseClient.from("date_ideas").select("*");

  if (!data?.length) return;

  const rand = data[Math.floor(Math.random() * data.length)];

  document.getElementById("randomTitle").innerText = rand.title;
  document.getElementById("randomDescription").innerText = rand.description;

  document.getElementById("randomCard").classList.remove("hidden");
};

renderList();
