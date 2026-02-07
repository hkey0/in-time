const STORAGE_KEY_HOURLY = "hourlyWage";
const STORAGE_KEY_SALARY_TYPE = "salaryType";
const STORAGE_KEY_SALARY_AMOUNT = "salaryAmount";
const STORAGE_KEY_DAILY_HOURS = "dailyHours";
const storageAPI = typeof browser !== "undefined" ? browser.storage : chrome.storage;

const form = document.getElementById("wage-form");
const salaryTypeInput = document.getElementById("salary-type");
const salaryTypeWrapper = document.getElementById("salary-type-wrapper");
const salaryTypeTrigger = document.getElementById("salary-type-trigger");
const salaryTypeOptions = document.getElementById("salary-type-options");
const salaryAmountInput = document.getElementById("salary-amount");
const dailyHoursInput = document.getElementById("daily-hours");
const status = document.getElementById("status");
const presetsList = document.getElementById("presets-list");

// Custom dropdown logic
const openDropdown = () => {
  salaryTypeWrapper.classList.add("open");
};

const closeDropdown = () => {
  salaryTypeWrapper.classList.remove("open");
};

const selectOption = (value, label) => {
  salaryTypeInput.value = value;
  salaryTypeTrigger.querySelector(".select-value").textContent = label;
  
  // Update selected state
  salaryTypeOptions.querySelectorAll("li").forEach(li => {
    li.classList.toggle("selected", li.dataset.value === value);
  });
  
  closeDropdown();
};

salaryTypeTrigger.addEventListener("click", (e) => {
  e.preventDefault();
  if (salaryTypeWrapper.classList.contains("open")) {
    closeDropdown();
  } else {
    openDropdown();
  }
});

salaryTypeOptions.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (li) {
    selectOption(li.dataset.value, li.textContent);
  }
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!salaryTypeWrapper.contains(e.target)) {
    closeDropdown();
  }
});

// Preset selection logic
const clearPresetSelection = () => {
  presetsList.querySelectorAll("li").forEach(li => li.classList.remove("active"));
};

presetsList.addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (li) {
    const hourlyWage = parseFloat(li.dataset.hourly);
    const hours = parseFloat(li.dataset.hours);
    
    // Fill in the form
    selectOption("hourly", "Hourly");
    salaryAmountInput.value = hourlyWage;
    dailyHoursInput.value = hours;
    
    // Mark as active
    clearPresetSelection();
    li.classList.add("active");
    
    // Auto-save
    await storageAPI.sync.set({
      [STORAGE_KEY_HOURLY]: hourlyWage,
      [STORAGE_KEY_SALARY_TYPE]: "hourly",
      [STORAGE_KEY_SALARY_AMOUNT]: hourlyWage,
      [STORAGE_KEY_DAILY_HOURS]: hours
    });
    showStatus("Saved!");
  }
});

// Clear preset selection when user manually changes inputs
salaryAmountInput.addEventListener("input", clearPresetSelection);
dailyHoursInput.addEventListener("input", clearPresetSelection);

const showStatus = (message) => {
  status.textContent = message;
  window.setTimeout(() => {
    status.textContent = "";
  }, 1500);
};

// Convert salary to hourly wage
const convertToHourly = (amount, type, dailyHours = 8) => {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  
  const workDaysPerMonth = 22; // Average working days per month
  const workDaysPerYear = 260; // Average working days per year
  
  switch (type) {
    case "hourly":
      return amount;
    case "monthly":
      return amount / (workDaysPerMonth * dailyHours);
    case "yearly":
      return amount / (workDaysPerYear * dailyHours);
    default:
      return null;
  }
};

// Default preset: SF Citizen
const DEFAULT_HOURLY = 90;
const DEFAULT_HOURS = 8;

const loadSettings = async () => {
  const stored = await storageAPI.sync.get([
    STORAGE_KEY_HOURLY,
    STORAGE_KEY_SALARY_TYPE,
    STORAGE_KEY_SALARY_AMOUNT,
    STORAGE_KEY_DAILY_HOURS
  ]);
  
  // If no settings exist, use SF citizen as default and save it
  if (!stored[STORAGE_KEY_HOURLY] && !stored[STORAGE_KEY_SALARY_AMOUNT]) {
    selectOption("hourly", "Hourly");
    salaryAmountInput.value = DEFAULT_HOURLY;
    dailyHoursInput.value = DEFAULT_HOURS;
    
    // Save default settings
    await storageAPI.sync.set({
      [STORAGE_KEY_HOURLY]: DEFAULT_HOURLY,
      [STORAGE_KEY_SALARY_TYPE]: "hourly",
      [STORAGE_KEY_SALARY_AMOUNT]: DEFAULT_HOURLY,
      [STORAGE_KEY_DAILY_HOURS]: DEFAULT_HOURS
    });
    
    // Mark SF preset as active
    const sfPreset = presetsList.querySelector('li[data-hourly="90"]');
    if (sfPreset) sfPreset.classList.add("active");
    return;
  }
  
  // Load salary type (default to hourly)
  const salaryType = stored[STORAGE_KEY_SALARY_TYPE] || "hourly";
  const selectedOption = salaryTypeOptions.querySelector(`li[data-value="${salaryType}"]`);
  if (selectedOption) {
    selectOption(salaryType, selectedOption.textContent);
  }
  
  // Load salary amount
  if (stored[STORAGE_KEY_SALARY_AMOUNT]) {
    salaryAmountInput.value = stored[STORAGE_KEY_SALARY_AMOUNT];
  } else if (stored[STORAGE_KEY_HOURLY]) {
    // Migrate from old hourly wage format
    salaryAmountInput.value = stored[STORAGE_KEY_HOURLY];
  }
  
  // Load daily hours (default to 8)
  if (stored[STORAGE_KEY_DAILY_HOURS]) {
    dailyHoursInput.value = stored[STORAGE_KEY_DAILY_HOURS];
  } else {
    dailyHoursInput.value = 8;
  }
  
  // Check if current values match a preset and mark it active
  const currentHourly = parseFloat(salaryAmountInput.value);
  const currentHours = parseFloat(dailyHoursInput.value);
  if (salaryType === "hourly") {
    presetsList.querySelectorAll("li").forEach(li => {
      const presetHourly = parseFloat(li.dataset.hourly);
      const presetHours = parseFloat(li.dataset.hours);
      if (presetHourly === currentHourly && presetHours === currentHours) {
        li.classList.add("active");
      }
    });
  }
};

const saveSettings = async (event) => {
  event.preventDefault();
  
  const salaryAmount = Number.parseFloat(salaryAmountInput.value);
  if (!Number.isFinite(salaryAmount) || salaryAmount <= 0) {
    showStatus("Enter a valid amount.");
    return;
  }
  
  const dailyHours = Number.parseFloat(dailyHoursInput.value);
  if (!Number.isFinite(dailyHours) || dailyHours <= 0 || dailyHours > 24) {
    showStatus("Enter valid daily work hours (0.5-24).");
    return;
  }
  
  const selectedType = salaryTypeInput.value || "hourly";
  const hourlyWage = convertToHourly(salaryAmount, selectedType, dailyHours);
  
  if (!hourlyWage || hourlyWage <= 0) {
    showStatus("Invalid calculation.");
    return;
  }
  
  await storageAPI.sync.set({
    [STORAGE_KEY_HOURLY]: hourlyWage,
    [STORAGE_KEY_SALARY_TYPE]: selectedType,
    [STORAGE_KEY_SALARY_AMOUNT]: salaryAmount,
    [STORAGE_KEY_DAILY_HOURS]: dailyHours
  });
  
  showStatus("Saved!");
};

form.addEventListener("submit", saveSettings);
loadSettings();

