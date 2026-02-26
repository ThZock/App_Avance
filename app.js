
const debtForm = document.getElementById('debt-form');
const debtListEl = document.getElementById('debt-list');
const debtTemplate = document.getElementById('debt-template');
const globalSummary = document.getElementById('global-summary');

const savingsForm = document.getElementById('savings-form');
const savingsSummary = document.getElementById('savings-summary');
const savingsListEl = document.getElementById('savings-list');
const savingsTemplate = document.getElementById('savings-template');

const financeForm = document.getElementById('finance-form');
const financeSummary = document.getElementById('finance-summary');
const responsibilityForm = document.getElementById('responsibility-form');
const responsibilityList = document.getElementById('responsibility-list');
const responsibilityTemplate = document.getElementById('responsibility-template');

const extraExpenseForm = document.getElementById('extra-expense-form');
const extraExpenseList = document.getElementById('extra-expense-list');
const extraExpenseTemplate = document.getElementById('extra-expense-template');
const salarySpendBar = document.getElementById('salary-spend-bar');
const salaryProgressLabel = document.getElementById('salary-progress-label');

const themeToggle = document.getElementById('theme-toggle');

const debtState = [];
const savingsState = [];
const responsibilitiesState = [];
const extraExpensesState = [];

const financeState = { salary: 0, extraIncome: 0, expenses: 0 };

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const numberFormat = new Intl.NumberFormat('es-CO');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseMoney(value) {
  const clean = String(value || '').replace(/\D/g, '');
  return clean ? Number(clean) : 0;
}

function formatMoneyInputValue(value) {
  const num = parseMoney(value);
  return num ? numberFormat.format(num) : '';
}

function setupMoneyInputs() {
  document.querySelectorAll('[data-money]').forEach((input) => {
    input.addEventListener('input', () => {
      input.value = formatMoneyInputValue(input.value);
    });
  });
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark', isDark);
  themeToggle.textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function initializeTheme() {
  const storedTheme = localStorage.getItem('theme');
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(storedTheme || (preferredDark ? 'dark' : 'light'));
}

function addPeriod(dateString, frequency, steps) {
  const date = new Date(`${dateString}T00:00:00`);
  if (frequency === 'quincenal') {
    date.setDate(date.getDate() + 15 * steps);
  } else if (frequency === 'mensual') {
    date.setMonth(date.getMonth() + steps);
  } else if (frequency === 'semestral') {
    date.setMonth(date.getMonth() + 6 * steps);
  } else {
    date.setFullYear(date.getFullYear() + steps);
  }

  return date.toISOString().split('T')[0];
}

function renderDebts() {
  debtListEl.innerHTML = '';

  if (!debtState.length) {
    debtListEl.innerHTML = '<p>Aún no has registrado deudas.</p>';
    renderDebtSummary();
    return;
  }

  debtState.forEach((debt, index) => {
    const node = debtTemplate.content.cloneNode(true);
    const totalAmount = debt.installmentAmount * debt.totalInstallments;
    const paidAmount = debt.installmentAmount * debt.paidInstallments;
    const remainingAmount = Math.max(totalAmount - paidAmount, 0);
    const progress = clamp(Math.round((paidAmount / totalAmount) * 100), 0, 100);
    const nextDueDate = debt.paidInstallments >= debt.totalInstallments
      ? 'Deuda saldada'
      : addPeriod(debt.startDate, debt.frequency, debt.paidInstallments);

    node.querySelector('.debt-name').textContent = debt.name;
    node.querySelector('.debt-frequency').textContent = `Frecuencia: ${debt.frequency}`;
    node.querySelector('.debt-dates').textContent = `Inicio: ${debt.startDate} · Próximo pago: ${nextDueDate}`;
    node.querySelector('.debt-amounts').textContent = `Valor cuota: ${currency.format(debt.installmentAmount)} · Total deuda: ${currency.format(totalAmount)} · Restante: ${currency.format(remainingAmount)}`;
    node.querySelector('.debt-installments').textContent = `Cuotas pagadas: ${debt.paidInstallments} / ${debt.totalInstallments}`;
    node.querySelector('.progress-bar').style.width = `${progress}%`;
    node.querySelector('.progress-label').textContent = `Progreso total: ${progress}%`;

    const payForm = node.querySelector('.payment-form');
    payForm.dataset.index = String(index);
    payForm.querySelector('.payment-date').value = new Date().toISOString().split('T')[0];

    debtListEl.appendChild(node);
  });

  renderDebtSummary();
}

function renderDebtSummary() {
  const totalDebt = debtState.reduce((sum, debt) => sum + debt.installmentAmount * debt.totalInstallments, 0);
  const totalPaid = debtState.reduce((sum, debt) => sum + debt.installmentAmount * debt.paidInstallments, 0);
  const totalPending = Math.max(totalDebt - totalPaid, 0);
  const overallProgress = totalDebt ? Math.round((totalPaid / totalDebt) * 100) : 0;

  globalSummary.innerHTML = [
    `<strong>Deuda total:</strong> ${currency.format(totalDebt)}`,
    `<strong>Total pagado:</strong> ${currency.format(totalPaid)}`,
    `<strong>Saldo pendiente:</strong> ${currency.format(totalPending)}`,
    `<strong>Progreso global:</strong> ${overallProgress}%`,
  ].join('<br/>');
}

function renderSavings() {
  savingsListEl.innerHTML = '';

  if (!savingsState.length) {
    savingsSummary.innerHTML = 'Aún no tienes metas de ahorro registradas.';
    return;
  }

  const totalGoal = savingsState.reduce((sum, item) => sum + item.goal, 0);
  const totalSaved = savingsState.reduce((sum, item) => sum + item.saved, 0);
  const totalPending = Math.max(totalGoal - totalSaved, 0);
  const totalProgress = totalGoal ? Math.round((totalSaved / totalGoal) * 100) : 0;

  savingsSummary.innerHTML = [
    `<strong>Metas registradas:</strong> ${savingsState.length}`,
    `<strong>Meta acumulada:</strong> ${currency.format(totalGoal)}`,
    `<strong>Total ahorrado:</strong> ${currency.format(totalSaved)}`,
    `<strong>Faltante total:</strong> ${currency.format(totalPending)}`,
    `<strong>Progreso global de ahorro:</strong> ${totalProgress}%`,
  ].join('<br/>');

  savingsState.forEach((goal, index) => {
    const node = savingsTemplate.content.cloneNode(true);
    const progress = goal.goal ? clamp(Math.round((goal.saved / goal.goal) * 100), 0, 100) : 0;
    const remaining = Math.max(goal.goal - goal.saved, 0);

    node.querySelector('.savings-name').textContent = goal.name;
    node.querySelector('.savings-amounts').textContent = `Meta: ${currency.format(goal.goal)} · Ahorrado: ${currency.format(goal.saved)} · Faltante: ${currency.format(remaining)}`;
    node.querySelector('.progress-bar').style.width = `${progress}%`;
    node.querySelector('.progress-label').textContent = `Progreso: ${progress}%`;

    const updateForm = node.querySelector('.savings-update-form');
    updateForm.dataset.index = String(index);

    savingsListEl.appendChild(node);
  });
}

function renderFinance() {
  responsibilityList.innerHTML = '';
  extraExpenseList.innerHTML = '';

  const totalResponsibilities = responsibilitiesState.reduce((sum, item) => sum + item.amount, 0);
  const totalExtraExpenses = extraExpensesState.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = financeState.salary + financeState.extraIncome;
  const totalOutflow = financeState.expenses + totalResponsibilities + totalExtraExpenses;
  const available = totalIncome - totalOutflow;

  const salarySpentPercent = financeState.salary ? clamp(Math.round((totalOutflow / financeState.salary) * 100), 0, 999) : 0;
  salarySpendBar.style.width = `${clamp(salarySpentPercent, 0, 100)}%`;
  salaryProgressLabel.textContent = financeState.salary
    ? `Has comprometido el ${salarySpentPercent}% de tu salario mensual.`
    : 'Ingresa tu salario para visualizar qué tan cerca estás de gastarlo por completo.';

  financeSummary.innerHTML = [
    `<strong>Ingreso total (salario + extras):</strong> ${currency.format(totalIncome)}`,
    `<strong>Gastos base:</strong> ${currency.format(financeState.expenses)}`,
    `<strong>Responsabilidades:</strong> ${currency.format(totalResponsibilities)}`,
    `<strong>Gastos adicionales:</strong> ${currency.format(totalExtraExpenses)}`,
    `<strong>Total egresos:</strong> ${currency.format(totalOutflow)}`,
    `<strong>Disponible del mes:</strong> ${currency.format(available)}`,
  ].join('<br/>');

  responsibilityList.innerHTML = responsibilitiesState.length ? '' : '<p>Aún no has agregado responsabilidades.</p>';
  responsibilitiesState.forEach((item) => {
    const node = responsibilityTemplate.content.cloneNode(true);
    node.querySelector('.responsibility-name').textContent = item.name;
    node.querySelector('.responsibility-amount').textContent = currency.format(item.amount);
    responsibilityList.appendChild(node);
  });

  extraExpenseList.innerHTML = extraExpensesState.length ? '' : '<p>Aún no hay gastos adicionales en el histórico.</p>';
  extraExpensesState.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach((item) => {
    const node = extraExpenseTemplate.content.cloneNode(true);
    node.querySelector('.extra-expense-category').textContent = item.category;
    node.querySelector('.extra-expense-date').textContent = item.date;
    node.querySelector('.extra-expense-note').textContent = item.note;
    node.querySelector('.extra-expense-amount').textContent = currency.format(item.amount);
    extraExpenseList.appendChild(node);
  });
}

debtForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = debtForm.name.value.trim();
  const frequency = debtForm.frequency.value;
  const installmentAmount = parseMoney(debtForm.installmentAmount.value);
  const totalInstallments = Number(debtForm.totalInstallments.value);
  const startDate = debtForm.startDate.value;

  if (!name || !frequency || !startDate || installmentAmount <= 0 || totalInstallments <= 0) {
    return;
  }

  debtState.push({
    name,
    frequency,
    installmentAmount,
    totalInstallments,
    paidInstallments: 0,
    startDate,
  });

  debtForm.reset();
  renderDebts();
});

debtListEl.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.classList.contains('payment-form')) {
    return;
  }

  event.preventDefault();
  const index = Number(form.dataset.index);
  const debt = debtState[index];
  if (!debt) {
    return;
  }

  const count = Number(form.querySelector('.payment-count').value);
  debt.paidInstallments = clamp(debt.paidInstallments + Math.max(count, 0), 0, debt.totalInstallments);
  renderDebts();
});

savingsForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = savingsForm.savingsName.value.trim();
  const goal = parseMoney(savingsForm.savingsGoal.value);
  const saved = parseMoney(savingsForm.savedAmount.value);

  if (!name || goal <= 0) {
    return;
  }

  savingsState.push({ name, goal, saved: clamp(saved, 0, goal) });
  savingsForm.reset();
  renderSavings();
});

savingsListEl.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains('savings-add-amount')) {
    return;
  }

  target.value = formatMoneyInputValue(target.value);
});

savingsListEl.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.classList.contains('savings-update-form')) {
    return;
  }

  event.preventDefault();
  const index = Number(form.dataset.index);
  const goal = savingsState[index];
  if (!goal) {
    return;
  }

  const amountInput = form.querySelector('.savings-add-amount');
  if (!(amountInput instanceof HTMLInputElement)) {
    return;
  }

  const addAmount = parseMoney(amountInput.value);
  if (addAmount <= 0) {
    return;
  }

  goal.saved = clamp(goal.saved + addAmount, 0, goal.goal);
  renderSavings();
});

financeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  financeState.salary = parseMoney(financeForm.salary.value);
  financeState.extraIncome = parseMoney(financeForm.extraIncome.value);
  financeState.expenses = parseMoney(financeForm.expenses.value);
  renderFinance();
});

responsibilityForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = responsibilityForm.responsibilityName.value.trim();
  const amount = parseMoney(responsibilityForm.responsibilityAmount.value);
  if (!name || amount <= 0) {
    return;
  }

  responsibilitiesState.push({ name, amount });
  responsibilityForm.reset();
  renderFinance();
});

extraExpenseForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const category = extraExpenseForm.extraExpenseCategory.value;
  const note = extraExpenseForm.extraExpenseNote.value.trim();
  const date = extraExpenseForm.extraExpenseDate.value;
  const amount = parseMoney(extraExpenseForm.extraExpenseAmount.value);

  if (!category || !note || !date || amount <= 0) {
    return;
  }

  extraExpensesState.push({ category, note, date, amount });
  extraExpenseForm.reset();
  renderFinance();
});

themeToggle.addEventListener('click', () => {
  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

setupMoneyInputs();
initializeTheme();
renderDebts();
renderSavings();
renderFinance();
=======
+const debtForm = document.getElementById('debt-form');
+const debtListEl = document.getElementById('debt-list');
+const debtTemplate = document.getElementById('debt-template');
+const globalSummary = document.getElementById('global-summary');
+
+const savingsForm = document.getElementById('savings-form');
+const savingsSummary = document.getElementById('savings-summary');
+const savingsListEl = document.getElementById('savings-list');
+const savingsTemplate = document.getElementById('savings-template');
+
+const financeForm = document.getElementById('finance-form');
+const financeSummary = document.getElementById('finance-summary');
+const responsibilityForm = document.getElementById('responsibility-form');
+const responsibilityList = document.getElementById('responsibility-list');
+const responsibilityTemplate = document.getElementById('responsibility-template');
+
+const extraExpenseForm = document.getElementById('extra-expense-form');
+const extraExpenseList = document.getElementById('extra-expense-list');
+const extraExpenseTemplate = document.getElementById('extra-expense-template');
+const salarySpendBar = document.getElementById('salary-spend-bar');
+const salaryProgressLabel = document.getElementById('salary-progress-label');
+
+const themeToggle = document.getElementById('theme-toggle');
+
+const debtState = [];
+const savingsState = [];
+const responsibilitiesState = [];
+const extraExpensesState = [];
+
+const financeState = { salary: 0, extraIncome: 0, expenses: 0 };
+
+const currency = new Intl.NumberFormat('es-CO', {
+  style: 'currency',
+  currency: 'COP',
+  maximumFractionDigits: 0,
+});
+
+const numberFormat = new Intl.NumberFormat('es-CO');
+
+function clamp(value, min, max) {
+  return Math.min(Math.max(value, min), max);
+}
+
+function parseMoney(value) {
+  const clean = String(value || '').replace(/\D/g, '');
+  return clean ? Number(clean) : 0;
+}
+
+function formatMoneyInputValue(value) {
+  const num = parseMoney(value);
+  return num ? numberFormat.format(num) : '';
+}
+
+function setupMoneyInputs() {
+  document.querySelectorAll('[data-money]').forEach((input) => {
+    input.addEventListener('input', () => {
+      input.value = formatMoneyInputValue(input.value);
+    });
+  });
+}
+
+function setTheme(theme) {
+  const isDark = theme === 'dark';
+  document.body.classList.toggle('dark', isDark);
+  themeToggle.textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
+  localStorage.setItem('theme', isDark ? 'dark' : 'light');
+}
+
+function initializeTheme() {
+  const storedTheme = localStorage.getItem('theme');
+  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
+  setTheme(storedTheme || (preferredDark ? 'dark' : 'light'));
+}
+
+function addPeriod(dateString, frequency, steps) {
+  const date = new Date(`${dateString}T00:00:00`);
+  if (frequency === 'quincenal') {
+    date.setDate(date.getDate() + 15 * steps);
+  } else if (frequency === 'mensual') {
+    date.setMonth(date.getMonth() + steps);
+  } else if (frequency === 'semestral') {
+    date.setMonth(date.getMonth() + 6 * steps);
+  } else {
+    date.setFullYear(date.getFullYear() + steps);
+  }
+
+  return date.toISOString().split('T')[0];
+}
+
+function renderDebts() {
+  debtListEl.innerHTML = '';
+
+  if (!debtState.length) {
+    debtListEl.innerHTML = '<p>Aún no has registrado deudas.</p>';
+    renderDebtSummary();
+    return;
+  }
+
+  debtState.forEach((debt, index) => {
+    const node = debtTemplate.content.cloneNode(true);
+    const totalAmount = debt.installmentAmount * debt.totalInstallments;
+    const paidAmount = debt.installmentAmount * debt.paidInstallments;
+    const remainingAmount = Math.max(totalAmount - paidAmount, 0);
+    const progress = clamp(Math.round((paidAmount / totalAmount) * 100), 0, 100);
+    const nextDueDate = debt.paidInstallments >= debt.totalInstallments
+      ? 'Deuda saldada'
+      : addPeriod(debt.startDate, debt.frequency, debt.paidInstallments);
+
+    node.querySelector('.debt-name').textContent = debt.name;
+    node.querySelector('.debt-frequency').textContent = `Frecuencia: ${debt.frequency}`;
+    node.querySelector('.debt-dates').textContent = `Inicio: ${debt.startDate} · Próximo pago: ${nextDueDate}`;
+    node.querySelector('.debt-amounts').textContent = `Valor cuota: ${currency.format(debt.installmentAmount)} · Total deuda: ${currency.format(totalAmount)} · Restante: ${currency.format(remainingAmount)}`;
+    node.querySelector('.debt-installments').textContent = `Cuotas pagadas: ${debt.paidInstallments} / ${debt.totalInstallments}`;
+    node.querySelector('.progress-bar').style.width = `${progress}%`;
+    node.querySelector('.progress-label').textContent = `Progreso total: ${progress}%`;
+
+    const payForm = node.querySelector('.payment-form');
+    payForm.dataset.index = String(index);
+    payForm.querySelector('.payment-date').value = new Date().toISOString().split('T')[0];
+
+    debtListEl.appendChild(node);
+  });
+
+  renderDebtSummary();
+}
+
+function renderDebtSummary() {
+  const totalDebt = debtState.reduce((sum, debt) => sum + debt.installmentAmount * debt.totalInstallments, 0);
+  const totalPaid = debtState.reduce((sum, debt) => sum + debt.installmentAmount * debt.paidInstallments, 0);
+  const totalPending = Math.max(totalDebt - totalPaid, 0);
+  const overallProgress = totalDebt ? Math.round((totalPaid / totalDebt) * 100) : 0;
+
+  globalSummary.innerHTML = [
+    `<strong>Deuda total:</strong> ${currency.format(totalDebt)}`,
+    `<strong>Total pagado:</strong> ${currency.format(totalPaid)}`,
+    `<strong>Saldo pendiente:</strong> ${currency.format(totalPending)}`,
+    `<strong>Progreso global:</strong> ${overallProgress}%`,
+  ].join('<br/>');
+}
+
+function renderSavings() {
+  savingsListEl.innerHTML = '';
+
+  if (!savingsState.length) {
+    savingsSummary.innerHTML = 'Aún no tienes metas de ahorro registradas.';
+    return;
+  }
+
+  const totalGoal = savingsState.reduce((sum, item) => sum + item.goal, 0);
+  const totalSaved = savingsState.reduce((sum, item) => sum + item.saved, 0);
+  const totalPending = Math.max(totalGoal - totalSaved, 0);
+  const totalProgress = totalGoal ? Math.round((totalSaved / totalGoal) * 100) : 0;
+
+  savingsSummary.innerHTML = [
+    `<strong>Metas registradas:</strong> ${savingsState.length}`,
+    `<strong>Meta acumulada:</strong> ${currency.format(totalGoal)}`,
+    `<strong>Total ahorrado:</strong> ${currency.format(totalSaved)}`,
+    `<strong>Faltante total:</strong> ${currency.format(totalPending)}`,
+    `<strong>Progreso global de ahorro:</strong> ${totalProgress}%`,
+  ].join('<br/>');
+
+  savingsState.forEach((goal) => {
+    const node = savingsTemplate.content.cloneNode(true);
+    const progress = goal.goal ? clamp(Math.round((goal.saved / goal.goal) * 100), 0, 100) : 0;
+    const remaining = Math.max(goal.goal - goal.saved, 0);
+
+    node.querySelector('.savings-name').textContent = goal.name;
+    node.querySelector('.savings-amounts').textContent = `Meta: ${currency.format(goal.goal)} · Ahorrado: ${currency.format(goal.saved)} · Faltante: ${currency.format(remaining)}`;
+    node.querySelector('.progress-bar').style.width = `${progress}%`;
+    node.querySelector('.progress-label').textContent = `Progreso: ${progress}%`;
+    savingsListEl.appendChild(node);
+  });
+}
+
+function renderFinance() {
+  responsibilityList.innerHTML = '';
+  extraExpenseList.innerHTML = '';
+
+  const totalResponsibilities = responsibilitiesState.reduce((sum, item) => sum + item.amount, 0);
+  const totalExtraExpenses = extraExpensesState.reduce((sum, item) => sum + item.amount, 0);
+  const totalIncome = financeState.salary + financeState.extraIncome;
+  const totalOutflow = financeState.expenses + totalResponsibilities + totalExtraExpenses;
+  const available = totalIncome - totalOutflow;
+
+  const salarySpentPercent = financeState.salary ? clamp(Math.round((totalOutflow / financeState.salary) * 100), 0, 999) : 0;
+  salarySpendBar.style.width = `${clamp(salarySpentPercent, 0, 100)}%`;
+  salaryProgressLabel.textContent = financeState.salary
+    ? `Has comprometido el ${salarySpentPercent}% de tu salario mensual.`
+    : 'Ingresa tu salario para visualizar qué tan cerca estás de gastarlo por completo.';
+
+  financeSummary.innerHTML = [
+    `<strong>Ingreso total (salario + extras):</strong> ${currency.format(totalIncome)}`,
+    `<strong>Gastos base:</strong> ${currency.format(financeState.expenses)}`,
+    `<strong>Responsabilidades:</strong> ${currency.format(totalResponsibilities)}`,
+    `<strong>Gastos adicionales:</strong> ${currency.format(totalExtraExpenses)}`,
+    `<strong>Total egresos:</strong> ${currency.format(totalOutflow)}`,
+    `<strong>Disponible del mes:</strong> ${currency.format(available)}`,
+  ].join('<br/>');
+
+  responsibilityList.innerHTML = responsibilitiesState.length ? '' : '<p>Aún no has agregado responsabilidades.</p>';
+  responsibilitiesState.forEach((item) => {
+    const node = responsibilityTemplate.content.cloneNode(true);
+    node.querySelector('.responsibility-name').textContent = item.name;
+    node.querySelector('.responsibility-amount').textContent = currency.format(item.amount);
+    responsibilityList.appendChild(node);
+  });
+
+  extraExpenseList.innerHTML = extraExpensesState.length ? '' : '<p>Aún no hay gastos adicionales en el histórico.</p>';
+  extraExpensesState.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach((item) => {
+    const node = extraExpenseTemplate.content.cloneNode(true);
+    node.querySelector('.extra-expense-category').textContent = item.category;
+    node.querySelector('.extra-expense-date').textContent = item.date;
+    node.querySelector('.extra-expense-note').textContent = item.note;
+    node.querySelector('.extra-expense-amount').textContent = currency.format(item.amount);
+    extraExpenseList.appendChild(node);
+  });
+}
+
+debtForm.addEventListener('submit', (event) => {
+  event.preventDefault();
+
+  const name = debtForm.name.value.trim();
+  const frequency = debtForm.frequency.value;
+  const installmentAmount = parseMoney(debtForm.installmentAmount.value);
+  const totalInstallments = Number(debtForm.totalInstallments.value);
+  const startDate = debtForm.startDate.value;
+
+  if (!name || !frequency || !startDate || installmentAmount <= 0 || totalInstallments <= 0) {
+    return;
+  }
+
+  debtState.push({
+    name,
+    frequency,
+    installmentAmount,
+    totalInstallments,
+    paidInstallments: 0,
+    startDate,
+  });
+
+  debtForm.reset();
+  renderDebts();
+});
+
+debtListEl.addEventListener('submit', (event) => {
+  const form = event.target;
+  if (!(form instanceof HTMLFormElement) || !form.classList.contains('payment-form')) {
+    return;
+  }
+
+  event.preventDefault();
+  const index = Number(form.dataset.index);
+  const debt = debtState[index];
+  if (!debt) {
+    return;
+  }
+
+  const count = Number(form.querySelector('.payment-count').value);
+  debt.paidInstallments = clamp(debt.paidInstallments + Math.max(count, 0), 0, debt.totalInstallments);
+  renderDebts();
+});
+
+savingsForm.addEventListener('submit', (event) => {
+  event.preventDefault();
+
+  const name = savingsForm.savingsName.value.trim();
+  const goal = parseMoney(savingsForm.savingsGoal.value);
+  const saved = parseMoney(savingsForm.savedAmount.value);
+
+  if (!name || goal <= 0) {
+    return;
+  }
+
+  savingsState.push({ name, goal, saved: clamp(saved, 0, goal) });
+  savingsForm.reset();
+  renderSavings();
+});
+
+financeForm.addEventListener('submit', (event) => {
+  event.preventDefault();
+  financeState.salary = parseMoney(financeForm.salary.value);
+  financeState.extraIncome = parseMoney(financeForm.extraIncome.value);
+  financeState.expenses = parseMoney(financeForm.expenses.value);
+  renderFinance();
+});
+
+responsibilityForm.addEventListener('submit', (event) => {
+  event.preventDefault();
+
+  const name = responsibilityForm.responsibilityName.value.trim();
+  const amount = parseMoney(responsibilityForm.responsibilityAmount.value);
+  if (!name || amount <= 0) {
+    return;
+  }
+
+  responsibilitiesState.push({ name, amount });
+  responsibilityForm.reset();
+  renderFinance();
+});
+
+extraExpenseForm.addEventListener('submit', (event) => {
+  event.preventDefault();
+
+  const category = extraExpenseForm.extraExpenseCategory.value;
+  const note = extraExpenseForm.extraExpenseNote.value.trim();
+  const date = extraExpenseForm.extraExpenseDate.value;
+  const amount = parseMoney(extraExpenseForm.extraExpenseAmount.value);
+
+  if (!category || !note || !date || amount <= 0) {
+    return;
+  }
+
+  extraExpensesState.push({ category, note, date, amount });
+  extraExpenseForm.reset();
+  renderFinance();
+});
+
+themeToggle.addEventListener('click', () => {
+  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
+});
+
+setupMoneyInputs();
+initializeTheme();
+renderDebts();
+renderSavings();
+renderFinance();
