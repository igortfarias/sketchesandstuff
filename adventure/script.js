/* =========================================================
   GRUMPY QUEST — BOOK STYLE GAME ENGINE
   =========================================================

   CORE IDEA (like old books):
   - Each "page" is a node
   - Choices point to other pages
   - We track currentPage in gameState

   EXTRA SYSTEMS INCLUDED:
   - Player stats (HP, gold, skills)
   - Inventory
   - Combat (dice-based)
   - NPC display
   - History log
   - Auto-save (localStorage)

========================================================= */


/* =========================================================
   STORAGE (AUTO SAVE SYSTEM)
========================================================= */

const STORAGE_KEY = "grumpyQuestSave";

function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  console.log("Game saved");
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const data = JSON.parse(saved);
  Object.assign(gameState, data);

  console.log("Game loaded");
}


/* =========================================================
   GAME STATE (ALL DYNAMIC DATA)
========================================================= */

const gameState = {
  currentPage: 1,

  player: {
    hp: 18,
    maxHp: 25,
    gold: 23,

    skills: {
      attack: 4,
      defense: 2,
      persuasion: 1,
      luck: 3
    },

    inventory: {
      "Health Potion": 2,
      Torch: 1,
      "Rusty Key": 1
    }
  },

  enemy: null, // only exists during combat

  history: []
};


/* =========================================================
   DICE SYSTEM (CORE MECHANIC)
========================================================= */

function rollDie(sides = 6) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollD20() {
  return rollDie(20);
}


/* =========================================================
   STORY / PAGES SYSTEM (BOOK STYLE)
========================================================= */

const PAGES = {
  1: {
    title: "The Bridge",
    text: `You reach an old stone bridge. A goblin blocks your way.`,

    choices: [
      { text: "Approach the goblin", page: 2 },
      { text: "Search the area", page: 3 }
    ]
  },

  2: {
    title: "Goblin Tollkeeper",
    text: `"Toll is 5 gold," the goblin says.`,

    npc: {
      name: "Goblin",
      hp: 12,
      maxHp: 12,
      attack: 2,
      defense: 10
    },

    choices: [
      {
        text: "Pay 5 gold",
        page: 4,
        action: () => {
          gameState.player.gold -= 5;
          addHistory("You paid 5 gold.");
        },
        condition: () => gameState.player.gold >= 5
      },

      { text: "Attack", page: 5 }
    ]
  },

  3: {
    title: "Search",
    text: `You find 1 gold on the ground.`,

    choices: [
      {
        text: "Return",
        page: 2,
        action: () => {
          gameState.player.gold += 1;
          addHistory("You found 1 gold.");
        }
      }
    ]
  },

  4: {
    title: "Safe Passage",
    text: "You cross safely.",

    choices: [{ text: "Restart", page: 1, action: resetGame }]
  },

  5: {
    title: "Combat Begins",
    text: "The goblin attacks!",

    action: () => startCombat("Goblin"),

    choices: [
      { text: "Attack", action: playerAttack },
      { text: "Use Potion", action: usePotion }
    ]
  }
};


/* =========================================================
   HISTORY / LOG SYSTEM
========================================================= */

function addHistory(message) {
  gameState.history.push(message);
}


/* =========================================================
   COMBAT SYSTEM
========================================================= */

function startCombat(enemyName) {
  gameState.enemy = {
    name: enemyName,
    hp: 12,
    maxHp: 12,
    attack: 2,
    defense: 10
  };

  addHistory("Combat started!");
}

/* ---------- PLAYER ATTACK ---------- */

function playerAttack() {
  const attackRoll = rollD20() + gameState.player.skills.attack;

  if (attackRoll >= gameState.enemy.defense) {
    const damage = rollDie(6);
    gameState.enemy.hp -= damage;

    addHistory(`You hit for ${damage} damage.`);
  } else {
    addHistory("You missed.");
  }

  if (gameState.enemy.hp <= 0) {
    winCombat();
    return;
  }

  enemyAttack();
  saveGame();
  renderGame();
}

/* ---------- ENEMY ATTACK ---------- */

function enemyAttack() {
  const roll = rollD20() + gameState.enemy.attack;

  if (roll >= 10 + gameState.player.skills.defense) {
    const damage = rollDie(4);
    gameState.player.hp -= damage;

    addHistory(`Enemy hits you for ${damage}.`);
  } else {
    addHistory("Enemy missed.");
  }

  if (gameState.player.hp <= 0) {
    gameOver();
  }
}

/* ---------- COMBAT END ---------- */

function winCombat() {
  addHistory("You defeated the enemy!");
  gameState.enemy = null;
  gameState.currentPage = 4;
}

function gameOver() {
  addHistory("You died.");
  gameState.currentPage = 1;
}


/* =========================================================
   INVENTORY SYSTEM
========================================================= */

function usePotion() {
  if (!gameState.player.inventory["Health Potion"]) {
    addHistory("No potions.");
    return;
  }

  const heal = rollDie(6) + 2;

  gameState.player.hp = Math.min(
    gameState.player.maxHp,
    gameState.player.hp + heal
  );

  gameState.player.inventory["Health Potion"]--;

  addHistory(`Healed ${heal} HP.`);

  enemyAttack();
  saveGame();
  renderGame();
}


/* =========================================================
   PAGE NAVIGATION SYSTEM
========================================================= */

function handleChoice(choice) {
  addHistory(`Choice: ${choice.text}`);

  if (choice.condition && !choice.condition()) return;

  if (choice.action) choice.action();

  if (choice.page) {
    gameState.currentPage = choice.page;
  }

  saveGame();
  renderGame();
}


/* =========================================================
   RESET SYSTEM
========================================================= */

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);

  gameState.currentPage = 1;
  gameState.player.hp = 18;
  gameState.player.gold = 23;
  gameState.history = [];

  addHistory("Game reset.");
}


/* =========================================================
   RENDER SYSTEM (UI UPDATE)
   NOTE: You already have UI — this hooks into it
========================================================= */

function renderGame() {
  const page = PAGES[gameState.currentPage];

  console.log("Rendering page:", gameState.currentPage);
  console.log(page);

  // YOU will connect this to your HTML:
  // update title, text, choices, stats, etc.
}


/* =========================================================
   INIT
========================================================= */

loadGame();
renderGame();