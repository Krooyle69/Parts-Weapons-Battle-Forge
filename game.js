// --- Названия и иконки запчастей ---
const partTypes = [
  { key: "nano", name: "Нано-кристаллы", icon: "img/nano_crystal.png" },
  { key: "plasma", name: "Плазмо-провода", icon: "img/plasma_wire.png" },
  { key: "quartz", name: "Кварцевые резонаторы", icon: "img/quartz_resonator.png" },
  { key: "thermal", name: "Термо-спирали", icon: "img/thermal_coil.png" },
  { key: "energy", name: "Энерго-матрицы", icon: "img/energy_matrix.png" }
];

// --- База оружия ---
const weapons = [
  {
    name: "Пульсарный Разрушитель",
    image: "img/pulsar_destroyer.png",
    bo: 90,
    cost: { nano: 10, plasma: 5, quartz: 8, thermal: 3, energy: 12 }
  },
  {
    name: "Грави-Импульсор",
    image: "img/gravity_impulsor.png",
    bo: 220,
    cost: { nano: 15, plasma: 10, quartz: 12, thermal: 8, energy: 20 }
  },
  {
    name: "Фазовый Резонатор",
    image: "img/phase_resonator.png",
    bo: 380,
    cost: { nano: 30, plasma: 20, quartz: 25, thermal: 15, energy: 30 }
  },
  {
    name: "Термо-Катар",
    image: "img/thermal_katar.png",
    bo: 450,
    cost: { nano: 40, plasma: 30, quartz: 35, thermal: 30, energy: 40 }
  },
  {
    name: "Энерго-Штурмовик",
    image: "img/energy_assault.png",
    bo: 640,
    cost: { nano: 60, plasma: 50, quartz: 60, thermal: 40, energy: 70 }
  }
];

// --- Игровое состояние ---
let parts = { nano: 0, plasma: 0, quartz: 0, thermal: 0, energy: 0 };
let inventory = {};
let totalBO = 0;
let autoGatherActive = false;

// --- DOM элементы ---
const boCount = document.getElementById("bo-count");
const gatherBtn = document.getElementById("gather-btn");
const autoGatherBtn = document.getElementById("auto-gather-btn");
const weaponList = document.getElementById("weapon-list");
const partsPanel = document.getElementById("parts-panel");
const dateTimeDisplay = document.getElementById("date-time");

// --- Модальное окно элементы ---
const modal = document.getElementById("auto-gather-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalBuyBtn = document.getElementById("modal-buy-btn");

// --- Сохраняем и загружаем прогресс ---
function saveGame() {
  const saveData = {
    parts,
    inventory,
    totalBO,
    autoGatherActive
  };
  localStorage.setItem("battleForgeSave", JSON.stringify(saveData));
}

function loadGame() {
  const saved = localStorage.getItem("battleForgeSave");
  if (saved) {
    const data = JSON.parse(saved);
    parts = data.parts || parts;
    inventory = data.inventory || inventory;
    totalBO = data.totalBO || totalBO;
    autoGatherActive = data.autoGatherActive || false;
  }
}

// --- Обновление панели запчастей ---
function renderPartsPanel() {
  partsPanel.innerHTML = "";
  partTypes.forEach(part => {
    const div = document.createElement("div");
    div.className = "part";
    div.title = part.name;
    div.innerHTML = `
      <img src="${part.icon}" alt="${part.name}" />
      <span id="${part.key}-count">${parts[part.key]}</span>
    `;
    partsPanel.appendChild(div);
  });
}

// --- Обновление БО ---
function updateBO() {
  boCount.textContent = totalBO;
}

// --- Создание UI оружия ---
function createWeaponUI() {
  weaponList.innerHTML = "";
  weapons.forEach((weapon, index) => {
    if (!(weapon.name in inventory)) inventory[weapon.name] = 0;

    const weaponEl = document.createElement("div");
    weaponEl.className = "weapon";

    weaponEl.innerHTML = `
      <img src="${weapon.image}" alt="${weapon.name}" />
      <div class="weapon-info">
        <div class="weapon-title">${weapon.name}</div>
        <div class="weapon-stats">БО: ${weapon.bo} | Куплено: <span id="count-${index}">${inventory[weapon.name]}</span></div>
        <div class="weapon-cost">
          ${Object.entries(weapon.cost)
            .map(([key, val]) => {
              const part = partTypes.find(p => p.key === key);
              return `
                <div class="weapon-cost-item" title="${part.name}">
                  <img src="${part.icon}" alt="${key}" /> ${val}
                </div>
              `;
            }).join('')}
        </div>
        <button id="buy-btn-${index}">Купить</button>
      </div>
    `;

    weaponList.appendChild(weaponEl);

    const buyBtn = document.getElementById(`buy-btn-${index}`);
    buyBtn.addEventListener("click", () => buyWeapon(index));
  });
}

// --- Проверка возможности покупки ---
function canBuy(weapon) {
  return Object.entries(weapon.cost).every(([key, val]) => parts[key] >= val);
}

// --- Покупка оружия ---
function buyWeapon(index) {
  const weapon = weapons[index];
  if (!canBuy(weapon)) {
    alert("Недостаточно запчастей!");
    return;
  }
  Object.entries(weapon.cost).forEach(([key, val]) => {
    parts[key] -= val;
  });
  inventory[weapon.name]++;
  totalBO += weapon.bo;
  document.getElementById(`count-${index}`).textContent = inventory[weapon.name];
  updatePartsPanel();
  updateBO();
  updateBuyButtons();
  saveGame();
}

// --- Обновление цифр запчастей ---
function updatePartsPanel() {
  partTypes.forEach(part => {
    const el = document.getElementById(`${part.key}-count`);
    if(el) el.textContent = parts[part.key];
  });
}

// --- Обновление доступности кнопок ---
function updateBuyButtons() {
  weapons.forEach((weapon, index) => {
    const buyBtn = document.getElementById(`buy-btn-${index}`);
    buyBtn.disabled = !canBuy(weapon);
  });

  // Авто-сбор кнопка: отключается после покупки
  if (autoGatherActive) {
    autoGatherBtn.disabled = true;
    autoGatherBtn.textContent = "Авто-сбор активирован";
  }
}

// --- Клик по кнопке сбора ---
gatherBtn.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * partTypes.length);
  const partKey = partTypes[randomIndex].key;
  parts[partKey]++;
  updatePartsPanel();
  updateBuyButtons();
  saveGame();
});

// --- Показать модальное окно покупки авто-сбора ---
autoGatherBtn.addEventListener("click", () => {
  if (autoGatherActive) return;
  modal.classList.remove("hidden");
});

// --- Закрыть модальное окно ---
modalCloseBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// --- Купить авто-сбор ---
modalBuyBtn.addEventListener("click", () => {
  const cost = 1000;
  if (Object.entries(parts).every(([key, val]) => val >= cost)) {
    // Списываем ресурсы
    Object.keys(parts).forEach(key => {
      parts[key] -= cost;
    });
    autoGatherActive = true;
    autoGatherBtn.disabled = true;
    autoGatherBtn.textContent = "Авто-сбор активирован";

    updatePartsPanel();
    updateBuyButtons();
    saveGame();
    modal.classList.add("hidden");
  } else {
    alert("Недостаточно ресурсов для покупки авто-сбора (1000 каждого).");
  }
});

// --- Закрыть окно по клику вне контента ---
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

// --- Функция авто-сбора каждые 2 секунды ---
function autoGatherTick() {
  if (!autoGatherActive) return;
  partTypes.forEach(part => {
    parts[part.key]++;
  });
  updatePartsPanel();
  updateBuyButtons();
  saveGame();
}

// --- Обновление даты и времени ---
function updateDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  dateTimeDisplay.textContent = `${dateStr} | ${timeStr}`;
}

// --- Загрузка прогресса и инициализация ---
function init() {
  loadGame();
  renderPartsPanel();
  createWeaponUI();
  updateBO();
  updatePartsPanel();
  updateBuyButtons();
  updateDateTime();

  // Запускаем авто-сбор, если активен
  if (autoGatherActive) {
    autoGatherBtn.disabled = true;
    autoGatherBtn.textContent = "Авто-сбор активирован";
  }

  setInterval(() => {
    updateDateTime();
  }, 1000);

  setInterval(() => {
    autoGatherTick();
  }, 2000);
}

init();
