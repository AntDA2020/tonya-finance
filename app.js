const API_URL = "https://script.google.com/macros/s/AKfycbwy8HPvUxjXubKvQDHFcDEULdmmws0M1brERJzItHvBwwakF81jls_r8ziBsKGjN7rK/exec";

loadDashboard();

function formatMoney(value) {
  return Number(value).toLocaleString("ru-RU") + " ₽";
}

function showResult(text) {
  const result = document.getElementById("result");
  result.classList.remove("hidden");
  result.innerText = text;
}

function loadDashboard() {
  fetch(API_URL + "?action=dashboard")
    .then(response => response.json())
    .then(data => {
      document.getElementById("balanceValue").innerText = formatMoney(data.balance);
      document.getElementById("incomeValue").innerText = formatMoney(data.income);
      document.getElementById("expenseValue").innerText = formatMoney(data.expenses);
    })
    .catch(() => {
      showResult("Не удалось загрузить данные. Проверь Apps Script API.");
    });
}

function addIncome() {
  const amount = prompt("Введите сумму дохода:");

  if (!amount) return;

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "addIncome",
      amount: Number(amount)
    })
  })
    .then(response => response.json())
    .then(data => {
      showResult(data.message);
      loadDashboard();
    })
    .catch(() => {
      showResult("Ошибка при добавлении дохода.");
    });
}

function addExpense() {
  const categories = [
    "Еда",
    "Машина",
    "Жилье",
    "Развлечения",
    "Одежда",
    "Обувь",
    "Непредвиденное",
    "Разное"
  ];

  const category = prompt("Введите категорию:\n\n" + categories.join("\n"));

  if (!category) return;

  const amount = prompt("Введите сумму расхода:");

  if (!amount) return;

  const comment = prompt("Комментарий? Можно оставить пустым:");

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "addExpense",
      category: category,
      amount: Number(amount),
      comment: comment || ""
    })
  })
    .then(response => response.json())
    .then(data => {
      showResult(data.message);
      loadDashboard();
    })
    .catch(() => {
      showResult("Ошибка при добавлении расхода.");
    });
}

function showStats() {
  fetch(API_URL + "?action=stats")
    .then(response => response.json())
    .then(data => {
      let text = "📊 Статистика\n\n";
      text += "💰 Доходы: " + formatMoney(data.income) + "\n";
      text += "💸 Расходы: " + formatMoney(data.expenses) + "\n";
      text += "🟢 Остаток: " + formatMoney(data.balance) + "\n\n";
      text += "Расходы по категориям:\n";

      for (const category in data.categories) {
        text += category + ": " + formatMoney(data.categories[category]) + "\n";
      }

      showResult(text);
    })
    .catch(() => {
      showResult("Ошибка при загрузке статистики.");
    });
}

function showHistory() {
  fetch(API_URL + "?action=history")
    .then(response => response.json())
    .then(items => {
      if (!items.length) {
        showResult("История пока пустая");
        return;
      }

      let text = "🧾 Последние операции\n\n";

      items.forEach(item => {
        text += item.date + "\n";
        text += item.category + " — " + formatMoney(item.amount);

        if (item.comment) {
          text += "\n" + item.comment;
        }

        text += "\n\n";
      });

      showResult(text);
    })
    .catch(() => {
      showResult("Ошибка при загрузке истории.");
    });
}
