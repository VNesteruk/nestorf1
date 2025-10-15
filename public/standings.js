const standingsDiv = document.getElementById("standingsDiv")

async function getCurrentDriverStandings() {
  const season = 2025
  standingsDiv.innerHTML = '<p class="loading">Завантаження...</p>'

  try {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/${season}/driverStandings.json`)
    const data = await response.json()
    const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings
    if (!standings || standings.length === 0) {
      standingsDiv.innerHTML = `<p>Даних за ${season} рік не знайдено</p>`
      return
    }

    const table = document.createElement("table")
    table.innerHTML = `
        <thead>
            <tr>
            <th>#</th>
            <th>Пілот</th>
            <th>Команда</th>
            <th>Очки</th>
            <th>Перемоги</th>
            </tr>
        </thead>
        <tbody></tbody>
        `
    const tbody = table.querySelector("tbody")

    standings.forEach((s) => {
      const tr = document.createElement("tr")
      const driver = s.Driver
      const team = s.Constructors[0]
      tr.innerHTML = `
                <td>${s.position}</td>
                <td>${driver.givenName} ${driver.familyName}</td>
                <td>${team.name}</td>
                <td>${s.points}</td>
                <td>${s.wins}</td>
            `
      tbody.appendChild(tr)
    })

    standingsDiv.innerHTML = ""
    standingsDiv.appendChild(table)
  } catch (error) {
    console.error(error)
    standingsDiv.innerHTML = "<p>Сталася помилка при завантаженні даних</p>"
  }
}

getCurrentDriverStandings()
