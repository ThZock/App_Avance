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

const financeState = {
  salary: 0,
  extraIncome: 0,
  expenses: 0,
};

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
  const theme = storedTheme || (preferredDark ? 'dark' : 'light');
  setTheme(theme);
}

function renderDebts() {
  debtListEl.innerHTML = '';

  if (!debtState.length) {
    debtListEl.innerHTML = '<p>Aún no has registrado deudas.</p>';
    renderDebtSummary();
    return;
  }

  debtState.forEach((debt) => {
    const node = debtTemplate.content.cloneNode(true);

    node.querySelector('.debt-name').textContent = debt.name;
    node.querySelector('.debt-date').textContent = `Vence: ${debt.dueDate}`;
    node.querySelector('.debt-amounts').textContent = `Total: ${currency.format(debt.totalAmount)} · Pagado: ${currency.format(debt.paidAmount)} · Restante: ${currency.format(debt.totalAmount - debt.paidAmount)}`;
    node.querySelector('.debt-installments').textContent = `Cuotas pagadas: ${debt.paidInstallments} / ${debt.totalInstallments}`;

    const progressByMoney = (debt.paidAmount / debt.totalAmount) * 100;
    const progressByInstallments = (debt.paidInstallments / debt.totalInstallments) * 100;
    const progress = clamp(Math.round((progressByMoney + progressByInstallments) / 2), 0, 100);

    node.querySelector('.progress-bar').style.width = `${progress}%`;
    node.querySelector('.progress-label').textContent = `Progreso total: ${progress}%`;
    debtListEl.appendChild(node);
  });

  renderDebtSummary();
}

function renderDebtSummary() {
  const totalDebt = debtState.reduce((sum, debt) => sum + debt.totalAmount, 0);
  const totalPaid = debtState.reduce((sum, debt) => sum + debt.paidAmount, 0);
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

  savingsState.forEach((goal) => {
    const node = savingsTemplate.content.cloneNode(true);
    const progress = goal.goal ? clamp(Math.round((goal.saved / goal.goal) * 100), 0, 100) : 0;
    const remaining = Math.max(goal.goal - goal.saved, 0);

    node.querySelector('.savings-name').textContent = goal.name;
    node.querySelector('.savings-amounts').textContent = `Meta: ${currency.format(goal.goal)} · Ahorrado: ${currency.format(goal.saved)} · Faltante: ${currency.format(remaining)}`;
    node.querySelector('.progress-bar').style.width = `${progress}%`;
    node.querySelector('.progress-label').textContent = `Progreso: ${progress}%`;

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

  const salarySpentPercent = financeState.salary
    ? clamp(Math.round((totalOutflow / financeState.salary) * 100), 0, 999)
    : 0;
  salarySpendBar.style.width = `${clamp(salarySpentPercent, 0, 100)}%`;

  salaryProgressLabel.textContent = financeState.salary
    ? `Has comprometido el ${salarySpentPercent}% de tu salario mensual (si supera 100%, ya gastaste más de tu salario).`
    : 'Ingresa tu salario para visualizar qué tan cerca estás de gastarlo por completo.';

  financeSummary.innerHTML = [
    `<strong>Ingreso total (salario + extras):</strong> ${currency.format(totalIncome)}`,
    `<strong>Gastos base:</strong> ${currency.format(financeState.expenses)}`,
    `<strong>Responsabilidades:</strong> ${currency.format(totalResponsibilities)}`,
    `<strong>Gastos adicionales:</strong> ${currency.format(totalExtraExpenses)}`,
    `<strong>Total egresos:</strong> ${currency.format(totalOutflow)}`,
    `<strong>Disponible del mes:</strong> ${currency.format(available)}`,
  ].join('<br/>');

  if (!responsibilitiesState.length) {
    responsibilityList.innerHTML = '<p>Aún no has agregado responsabilidades.</p>';
  } else {
    responsibilitiesState.forEach((item) => {
      const node = responsibilityTemplate.content.cloneNode(true);
      node.querySelector('.responsibility-name').textContent = item.name;
      node.querySelector('.responsibility-amount').textContent = currency.format(item.amount);
      responsibilityList.appendChild(node);
    });
  }

  if (!extraExpensesState.length) {
    extraExpenseList.innerHTML = '<p>Aún no hay gastos adicionales en el histórico.</p>';
  } else {
    extraExpensesState
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((item) => {
        const node = extraExpenseTemplate.content.cloneNode(true);
        node.querySelector('.extra-expense-category').textContent = item.category;
        node.querySelector('.extra-expense-date').textContent = item.date;
        node.querySelector('.extra-expense-note').textContent = item.note;
        node.querySelector('.extra-expense-amount').textContent = currency.format(item.amount);
        extraExpenseList.appendChild(node);
      });
  }
}

debtForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = debtForm.name.value.trim();
  const totalAmount = Number(debtForm.totalAmount.value);
  const dueDate = debtForm.dueDate.value;
  const totalInstallments = Number(debtForm.totalInstallments.value);
  const paidInstallments = Number(debtForm.paidInstallments.value);
  const paidAmount = Number(debtForm.paidAmount.value);

  if (!name || !dueDate || totalAmount <= 0 || totalInstallments <= 0) {
    return;
  }

  debtState.push({
    name,
    totalAmount,
    dueDate,
    totalInstallments,
    paidInstallments: clamp(paidInstallments, 0, totalInstallments),
    paidAmount: clamp(paidAmount, 0, totalAmount),
  });

  debtForm.reset();
  renderDebts();
});

savingsForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = savingsForm.savingsName.value.trim();
  const goal = Number(savingsForm.savingsGoal.value);
  const saved = Number(savingsForm.savedAmount.value);

  if (!name || goal <= 0) {
    return;
  }

  savingsState.push({
    name,
    goal,
    saved: clamp(saved, 0, goal),
  });

  savingsForm.reset();
  renderSavings();
});

financeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  financeState.salary = Math.max(Number(financeForm.salary.value), 0);
  financeState.extraIncome = Math.max(Number(financeForm.extraIncome.value), 0);
  financeState.expenses = Math.max(Number(financeForm.expenses.value), 0);

  renderFinance();
});

responsibilityForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = responsibilityForm.responsibilityName.value.trim();
  const amount = Number(responsibilityForm.responsibilityAmount.value);

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
  const amount = Number(extraExpenseForm.extraExpenseAmount.value);

  if (!category || !note || !date || amount <= 0) {
    return;
  }

  extraExpensesState.push({
    category,
    note,
    date,
    amount,
  });

  extraExpenseForm.reset();
  renderFinance();
});

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});

initializeTheme();
renderDebts();
renderSavings();
renderFinance();
