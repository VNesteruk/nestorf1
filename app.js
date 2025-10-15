const yearSelect = document.getElementById("yearSelect")
const roundSelect = document.getElementById("roundSelect")
const sessionSelect = document.getElementById("sessionSelect")
const resultsDiv = document.getElementById("results")
const showResults = document.getElementById("showResults")
const nationalityEmoji = {
  British: "🇬🇧",
  German: "🇩🇪",
  Dutch: "🇳🇱",
  Spanish: "🇪🇸",
  Finnish: "🇫🇮",
  French: "🇫🇷",
  Australian: "🇦🇺",
  Mexican: "🇲🇽",
  Italian: "🇮🇹",
  Canadian: "🇨🇦",
  Japanese: "🇯🇵",
  Brazilian: "🇧🇷",
  Danish: "🇩🇰",
  Russian: "🇷🇺",
  American: "🇺🇸",
  Monégasque: "🇲🇨",
}

// 1️⃣ — Заповнюємо роки (2020–2025)
for (let year = 2020; year <= 2025; year++) {
  const option = document.createElement("option")
  option.value = year
  option.textContent = year
  yearSelect.appendChild(option)
}

// 2️⃣ — Коли обираємо рік → тягнемо календар
yearSelect.addEventListener("change", async () => {
  const year = yearSelect.value
  roundSelect.innerHTML = "<option>Завантаження...</option>"
  sessionSelect.innerHTML = "<option>Оберіть раунд</option>"

  try {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`)
    const data = await response.json()
    const races = data.MRData.RaceTable.Races

    roundSelect.innerHTML = ""
    races.forEach((race) => {
      const option = document.createElement("option")
      option.value = race.round
      option.textContent = `${race.round}. ${race.raceName}`
      roundSelect.appendChild(option)
    })
  } catch (error) {
    console.error("Помилка календаря:", error)
    roundSelect.innerHTML = "<option>Не вдалося завантажити</option>"
  }
})

// 3️⃣ — Коли обираємо раунд → показуємо доступні сесії
roundSelect.addEventListener("change", async () => {
  const year = yearSelect.value
  const round = roundSelect.value
  sessionSelect.innerHTML = "<option>Завантаження...</option>"

  // Стандартні сесії (не всі траси мають спринт)
  const possibleSessions = [
    // { key: 'practice/1', name: 'Practice 1' },
    // { key: 'practice/2', name: 'Practice 2' },
    // { key: 'practice/3', name: 'Practice 3' },
    // { key: 'sprint', name: 'Sprint' },
    { key: "qualifying", name: "Qualifying" },
    { key: "results", name: "Race" },
  ]

  sessionSelect.innerHTML = ""
  possibleSessions.forEach((s) => {
    const option = document.createElement("option")
    option.value = s.key
    option.textContent = s.name
    sessionSelect.appendChild(option)
  })
})

// 4️⃣ — Натискаємо "Показати результати"
showResults.addEventListener("click", async () => {
  const year = yearSelect.value
  const round = roundSelect.value
  const session = sessionSelect.value

  if (!year || !round || !session) {
    resultsDiv.innerHTML = "<p>Оберіть рік, раунд і сесію</p>"
    return
  }

  resultsDiv.innerHTML = '<p class="loading">Завантаження результатів...</p>'

  try {
    const url = `https://api.jolpi.ca/ergast/f1/${year}/${round}/${session}.json`
    const response = await fetch(url)
    const data = await response.json()

    let results
    let race

    // 🔍 Розрізняємо структури даних (бо різні сесії мають різні поля)
    if (session === "results" || session === "sprint") {
      race = data.MRData.RaceTable.Races[0]
      results = race?.Results || race?.SprintResults
    } else {
      race = data.MRData.RaceTable.Races[0]
      results = race?.QualifyingResults || race?.PracticeResults
    }

    if (!results || results.length === 0) {
      resultsDiv.innerHTML = "<p>Результати не знайдено</p>"
      return
    }

    resultsDiv.innerHTML = `
      <div class="race-header">
        <h3 class="race-title">${race.raceName}</h3>
        <p class="race-location">${race.Circuit.Location.country}</p>
      </div>
    `

    results.forEach((r) => {
      const name = r.Driver ? `${r.Driver.givenName} ${r.Driver.familyName}` : "—"
      const team = r.Constructor ? r.Constructor.name : "—"
      const position = r.position || "—"
      const points = r.points ? `${r.points} pts` : ""
      const timeDisplay = r.Time ? r.Time.time : r.status || ""
      const flag = nationalityEmoji[r.Driver?.nationality] || ""

      const row = document.createElement("div")
      row.className = "result-item"
      row.innerHTML = `
        <div class="result-position">${position}</div>
        <div class="result-driver">
          <div class="driver-name">${flag} ${name}</div>
          <div class="driver-team">${team}</div>
        </div>
        <div class="result-time">${timeDisplay}</div>
        <div class="result-points">${points}</div>
      `
      resultsDiv.appendChild(row)
    })
  } catch (error) {
    console.error(error)
    resultsDiv.innerHTML = "<p>Помилка при завантаженні</p>"
  }
})


///// останя гонка 

const raceResultsDiv = document.getElementById('raceResultsDiv');
    const refreshBtn = document.getElementById('refreshBtn');

    async function getLastRaceResults(season = 2025) {
        raceResultsDiv.innerHTML = '<p>Завантаження...</p>';

        try {
            // Отримуємо календар сезону
            const response = await fetch(`https://api.openf1.org/v1/races?season=${season}`);
            const data = await response.json();

            const races = data.data;
            if (!races || races.length === 0) {
                raceResultsDiv.innerHTML = `<p>Даних за ${season} рік не знайдено 😢</p>`;
                return;
            }

            // Шукаємо останню гонку з результатами
            const lastRace = races.slice().reverse().find(race => race.results && race.results.length > 0);

            if (!lastRace) {
                raceResultsDiv.innerHTML = `<p>Поки що немає завершених гонок у сезоні ${season} 😢</p>`;
                return;
            }

            const results = lastRace.results;

            // Вивід назви гонки
            raceResultsDiv.innerHTML = `<h2>🏁 ${lastRace.name} — ${lastRace.circuit.name}, ${lastRace.circuit.location.country}</h2>`;

            // Створюємо таблицю результатів
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Пілот</th>
                        <th>Команда</th>
                        <th>Час</th>
                        <th>Очки</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            const tbody = table.querySelector('tbody');

            results.forEach(result => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${result.position}</td>
                    <td>${result.driver.givenName} ${result.driver.familyName}</td>
                    <td>${result.constructor.name}</td>
                    <td>${result.time ? result.time.time : 'DNF'}</td>
                    <td>${result.points}</td>
                `;
                tbody.appendChild(tr);
            });

            raceResultsDiv.appendChild(table);

        } catch (error) {
            console.error(error);
            raceResultsDiv.innerHTML = "<p>Сталася помилка при завантаженні даних 🚫</p>";
        }
    }

    // Початкове завантаження
    getLastRaceResults();
