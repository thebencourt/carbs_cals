class CarbCalculator {
  constructor() {
    // Form/buttons
    this.form = document.getElementById('form');
    this.calculateBtn = document.getElementById('calculate');
    this.saveBtn = document.getElementById('save');
    this.saveEntryBtn = document.getElementById('saveEntry');
    this.listBtn = document.getElementById('listBtn');

    // Inputs
    this.numberInputs = document.querySelectorAll('input[type="number"]');
    this.amount = document.getElementById('amount');
    this.calories = document.getElementById('calories');
    this.carbs = document.getElementById('carbs');
    this.serving = document.getElementById('serving');
    this.name = document.getElementById('name');

    // Outputs
    this.caloriesOutput = document.getElementById('calories-output');
    this.carbsOutput = document.getElementById('carbs-output');

    // Modal
    this.modal = document.getElementById('modal');

    // Sidebar
    this.sidebar = document.getElementById('sidebar');
    this.list = document.getElementById('savedList');

    // Bind
    this.init = this.init.bind(this);
    this.setupList = this.setupList.bind(this);
    this.toggleList = this.toggleList.bind(this);
    this.handleSavedItemClick = this.handleSavedItemClick.bind(this);
    this.calculate = this.calculate.bind(this);
    this.openModal = this.openModal.bind(this);
    this.save = this.save.bind(this);
    this.toggleButtons = this.toggleButtons.bind(this);
    this.showSavedItem = this.showSavedItem.bind(this);
    this.removeSavedItem = this.removeSavedItem.bind(this);

    // Go!
    this.init();
  }

  init() {
    if (localStorage.getItem('saved')) {
      this.listBtn.removeAttribute('hidden');
      
      this.setupList();
    }
  
  
    // Add event listeners
    this.listBtn.addEventListener('click', this.toggleList);
    this.list.addEventListener('click', this.handleSavedItemClick);
    this.form.addEventListener('submit', this.calculate);
    this.saveBtn.addEventListener('click', this.openModal);
    this.saveEntryBtn.addEventListener('click', this.save);
    this.numberInputs.forEach(i => i.addEventListener('input', this.toggleButtons));
  }

  /**
   * Basic validation and calculate values
   * @param {ev} Event The form submit event
   */
  calculate(ev) {
    if (ev) {
      ev.preventDefault();
    }

    // Check we have required values
    if (!this.amount.value || (!this.calories.value && !this.carbs.value) || !this.serving.value) {
      // @TODO: Add validation about missing fields
      return;
    }

    // Get values, default any optional ones to 0
    const amountVal = parseFloat(this.amount.value);
    const caloriesVal = parseFloat(this.calories.value) || 0;
    const carbsVal = parseFloat(this.carbs.value) || 0;
    const servingVal = parseFloat(this.serving.value);

    // Check values entered are valid
    if (
      Number.isNaN(amountVal) ||
      Number.isNaN(caloriesVal) ||
      Number.isNaN(carbsVal) ||
      Number.isNaN(servingVal)
    ) {
      return;
    }

    // Do the math!
    const caloriesPerGram = caloriesVal / servingVal;
    const carbsPerGram = carbsVal / servingVal;
    const totalCals = caloriesPerGram * amountVal;
    const totalCarbs = carbsPerGram * amountVal;

    // Round to two decimals
    const fixedCalories = totalCals.toFixed(2);
    const fixedCarbs = totalCarbs.toFixed(2);

    // If decimcals are 00 then remove
    this.caloriesOutput.textContent = fixedCalories.split('.')[1] === '00'
      ? fixedCalories.split('.')[0]
      : fixedCalories;

      this.carbsOutput.textContent = fixedCarbs.split('.')[1] === '00'
      ? fixedCarbs.split('.')[0]
      : fixedCarbs;

    // Toggle the buttons
    this.calculateBtn.setAttribute('hidden', '');
    this.saveBtn.removeAttribute('hidden');
    this.saveBtn.focus();
  }

  /**
   * Opens the save entry modal
   */
  openModal() {
    this.modal.classList.add('modal--active');
    requestAnimationFrame(() => this.name.focus());
  }

  /**
   * Saves the entry to localStorage
   */
  save() {
    const savedItems = localStorage.getItem('saved');
    const parsed = savedItems ? JSON.parse(savedItems) : [];

    const data = {
      id: this.name.value.trim().replace(' ', '_'),
      name: this.name.value.trim(),
      amount: this.amount.value,
      calories: this.caloriesOutput.textContent,
      carbs: this.carbsOutput.textContent,
      serving: this.serving.value,
    };

    const updated = [
      ...parsed,
      data,
    ];

    localStorage.setItem('saved', JSON.stringify(updated));

    this.amount.value = '';
    this.calories.value = '';
    this.carbs.value = '';
    this.serving.value = '';
    this.name.value = '';

    this.caloriesOutput.textContent = '0';
    this.carbsOutput.textContent = '0';

    this.toggleButtons();

    this.listBtn.removeAttribute('hidden');
    
    this.setupList();
  }

  /**
   * Switches between calculate and save buttons
   */
  toggleButtons() {
    if (this.calculateBtn.hasAttribute('hidden')) {
      this.saveBtn.setAttribute('hidden', '');
      this.calculateBtn.removeAttribute('hidden');
    }

    if (this.modal.classList.contains('modal--active')) {
      this.modal.classList.remove('modal--active');
    }
  }


  /**
   * toggleList
   */
  toggleList() {
    this.sidebar.classList.toggle('Sidebar--active');
  }

  /**
   * setupList
   */
  setupList() {
    const items = localStorage.getItem('saved');
    const parsed = JSON.parse(items);
    const frag = document.createDocumentFragment();
    
    parsed.forEach(p => {
      const li = document.createElement('li');
      li.className = 'Sidebar__listItem';
      li.innerHTML = `
        <button
          class="Sidebar__listItemBtn Sidebar__listItemBtn--name"
          data-action="show"
          data-id="${p.id}"
          type="button"
        >
          ${p.name}
        </button>
        <button
          class="Sidebar__listItemBtn Sidebar__listItemBtn--remove"
          data-action="remove"
          data-id="${p.id}"
          type="button"
        >
          X
        </button>
      `;
      frag.appendChild(li);
    });

    this.list.innerHTML = '';
    this.list.appendChild(frag);
  }

  /**
   * @param {Event} ev Click event
   */
  handleSavedItemClick(ev) {
    const item = ev.target;
    const { dataset: { action, id } } = item;

    if (action === 'show') {
      this.showSavedItem(id);
    }

    if (action === 'remove') {
      this.removeSavedItem(id);
    }
  }

  /**
   * @param {string} id ID of item to show
   */
  showSavedItem(id) {
    const saved = localStorage.getItem('saved');
    const parsed = JSON.parse(saved);
    const selected = parsed.find(x => x.id === id);

    this.amount.value = selected.amount;
    this.calories.value = selected.calories;
    this.carbs.value = selected.carbs;
    this.serving.value = selected.serving;

    this.calculate();
    this.toggleList();
  }

  /**
   * @param {string} id ID of item to remove
   */
  removeSavedItem(id) {
    const saved = localStorage.getItem('saved');
    const parsed = JSON.parse(saved);
    const updated = parsed.filter(x => x.id !== id);

    localStorage.setItem('saved', JSON.stringify(updated));
    this.setupList();

    if (!updated.length) {
      this.listBtn.setAttribute('hidden', '');
      this.toggleList();
    }
  }
}

new CarbCalculator();
