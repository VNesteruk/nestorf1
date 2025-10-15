const constructorsDiv = document.getElementById("constructorsDiv")

async function getConstructorStandings() {
  const season = 2025
  constructorsDiv.innerHTML = '<p class="loading">Завантаження...</p>'

  try {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/${season}/constructorstandings.json`)
    const data = await response.json()
    const constructors = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings

    if (!constructors || constructors.length === 0) {
      constructorsDiv.innerHTML = `<p>Даних за ${season} рік не знайдено</p>`
      return
    }

    const table = document.createElement("table")
    table.innerHTML = `
        <thead>
            <tr>
            <th>#</th>
            <th>Команда</th>
            <th>Очки</th>
            <th>Перемоги</th>
            </tr>
        </thead>
        <tbody></tbody>
        `
    const tbody = table.querySelector("tbody")

    constructors.forEach((s) => {
      const tr = document.createElement("tr")
      const team = s.Constructor
      tr.innerHTML = `
                <td>${s.position}</td>
                <td>${team.name}</td>
                <td>${s.points}</td>
                <td>${s.wins}</td>
            `
      tbody.appendChild(tr)
    })

    constructorsDiv.innerHTML = ""
    constructorsDiv.appendChild(table)
  } catch (error) {
    console.error(error)
    constructorsDiv.innerHTML = "<p>Сталася помилка при завантаженні даних</p>"
  }
}
getConstructorStandings()
