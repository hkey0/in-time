const STORAGE_KEY_HOURLY = "hourlyWage";
const STORAGE_KEY_DAILY_HOURS = "dailyHours";
const ORIGINAL_PRICE_ATTR = "data-original-price";

console.log("[Amazon Time] Content script loaded");

const parsePrice = (text) => {
  if (!text) return null;
  // Handle various formats: $19.99, €19,99, £19.99, ₹1,999.00, etc.
  const normalized = text
    .replace(/[^\d.,]/g, "")
    .replace(/(\d),(\d{3})/g, "$1$2") // Remove thousands separator
    .replace(/,(\d{2})$/, ".$1"); // Convert European decimal comma
  if (!normalized) return null;
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
};

const formatTimeFromPrice = (price, hourlyWage, workdayHours = 8) => {
  if (!hourlyWage || hourlyWage <= 0) return null;
  const totalSeconds = (price / hourlyWage) * 3600;
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return null;

  // Nanoseconds (less than 1 microsecond)
  if (totalSeconds < 0.000001) {
    const ns = totalSeconds * 1e9;
    return `${ns.toFixed(2)}ns`;
  }

  // Microseconds (less than 1 millisecond)
  if (totalSeconds < 0.001) {
    const us = totalSeconds * 1e6;
    return `${us.toFixed(2)}µs`;
  }

  // Milliseconds (less than 1 second)
  if (totalSeconds < 1) {
    const ms = totalSeconds * 1000;
    return `${ms.toFixed(1)}ms`;
  }

  // Seconds (less than 1 minute)
  if (totalSeconds < 60) {
    const s = Math.round(totalSeconds);
    return `${s}s`;
  }

  const totalMinutes = totalSeconds / 60;

  // Minutes only (less than 1 hour)
  if (totalMinutes < 60) {
    const mins = Math.floor(totalMinutes);
    const secs = Math.round((totalMinutes - mins) * 60);
    if (secs > 0 && mins < 10) {
      return `${mins}m ${secs}s`;
    }
    return `${Math.round(totalMinutes)}m`;
  }

  const totalHours = totalMinutes / 60;

  // Hours and minutes (less than 1 workday)
  if (totalHours < workdayHours) {
    const hrs = Math.floor(totalHours);
    const mins = Math.round((totalHours - hrs) * 60);
    if (mins > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${hrs}h`;
  }

  const totalDays = totalHours / workdayHours;

  // Days, hours, minutes (less than 1 week / 5 workdays)
  if (totalDays < 5) {
    const days = Math.floor(totalDays);
    const remainingHours = (totalDays - days) * workdayHours;
    const hrs = Math.floor(remainingHours);
    const mins = Math.round((remainingHours - hrs) * 60);
    
    let result = `${days}d`;
    if (hrs > 0) result += ` ${hrs}h`;
    if (mins > 0 && days < 2) result += ` ${mins}m`;
    return result;
  }

  // Weeks and days (less than 4 weeks)
  const totalWeeks = totalDays / 5;
  if (totalWeeks < 4) {
    const weeks = Math.floor(totalWeeks);
    const remainingDays = Math.round((totalWeeks - weeks) * 5);
    if (remainingDays > 0) {
      return `${weeks}w ${remainingDays}d`;
    }
    return `${weeks}w`;
  }

  // Months and weeks
  const totalMonths = totalWeeks / 4;
  if (totalMonths < 12) {
    const months = Math.floor(totalMonths);
    const remainingWeeks = Math.round((totalMonths - months) * 4);
    if (remainingWeeks > 0) {
      return `${months}mo ${remainingWeeks}w`;
    }
    return `${months}mo`;
  }

  // Years and months
  const totalYears = totalMonths / 12;
  const years = Math.floor(totalYears);
  const remainingMonths = Math.round((totalYears - years) * 12);
  if (remainingMonths > 0) {
    return `${years}y ${remainingMonths}mo`;
  }
  return `${years}y`;
};

const replacePrice = (container, timeLabel) => {
  // Store original HTML if not already stored
  if (!container.hasAttribute(ORIGINAL_PRICE_ATTR)) {
    container.setAttribute(ORIGINAL_PRICE_ATTR, container.innerHTML);
  }

  // Find the visible price elements and replace their text
  const wholeEl = container.querySelector(".a-price-whole");
  const fractionEl = container.querySelector(".a-price-fraction");
  const symbolEl = container.querySelector(".a-price-symbol");
  const offscreenEl = container.querySelector(".a-offscreen");

  if (wholeEl) {
    // Clear the whole/fraction structure and show time
    wholeEl.textContent = timeLabel;
    if (fractionEl) fractionEl.style.display = "none";
    if (symbolEl) symbolEl.style.display = "none";
    if (offscreenEl) offscreenEl.textContent = timeLabel;
  } else {
    // Fallback: just replace entire content
    container.textContent = timeLabel;
  }
};

const applyToPrices = (hourlyWage, workdayHours = 8) => {
  // Find all .a-price containers
  const priceContainers = document.querySelectorAll(".a-price");
  console.log(`[Amazon Time] Found ${priceContainers.length} .a-price elements`);

  priceContainers.forEach((container) => {
    // Get original price from stored attribute or current offscreen text
    let priceText;
    if (container.hasAttribute(ORIGINAL_PRICE_ATTR)) {
      // Parse from original HTML
      const temp = document.createElement("div");
      temp.innerHTML = container.getAttribute(ORIGINAL_PRICE_ATTR);
      const offscreen = temp.querySelector(".a-offscreen");
      priceText = offscreen?.textContent || temp.textContent;
    } else {
      const offscreen = container.querySelector(".a-offscreen");
      priceText = offscreen?.textContent || container.textContent;
    }

    const price = parsePrice(priceText);
    if (price === null) return;

    const timeLabel = formatTimeFromPrice(price, hourlyWage, workdayHours);
    if (!timeLabel) return; // No wage set, leave original

    replacePrice(container, timeLabel);
  });

  // Handle other standalone price elements
  const otherPrices = document.querySelectorAll(
    "#corePrice_feature_div .a-offscreen, #corePriceDisplay_desktop_feature_div .a-offscreen"
  );
  console.log(`[Amazon Time] Found ${otherPrices.length} other price elements`);

  otherPrices.forEach((el) => {
    if (!el.hasAttribute(ORIGINAL_PRICE_ATTR)) {
      el.setAttribute(ORIGINAL_PRICE_ATTR, el.textContent);
    }

    const originalText = el.getAttribute(ORIGINAL_PRICE_ATTR);
    const price = parsePrice(originalText);
    if (price === null) return;

    const timeLabel = formatTimeFromPrice(price, hourlyWage, workdayHours);
    if (!timeLabel) return;

    el.textContent = timeLabel;
  });
};

let currentWage = null;
let currentDailyHours = 8;
let scheduled = false;

const scheduleApply = () => {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyToPrices(currentWage, currentDailyHours);
  });
};

const startObserver = () => {
  const observer = new MutationObserver(() => scheduleApply());
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// Use browser namespace for Firefox compatibility
const storageAPI = typeof browser !== "undefined" ? browser.storage : chrome.storage;

const init = async () => {
  console.log("[Amazon Time] Initializing...");
  try {
    const stored = await storageAPI.sync.get([STORAGE_KEY_HOURLY, STORAGE_KEY_DAILY_HOURS]);
    currentWage = stored[STORAGE_KEY_HOURLY] ?? null;
    currentDailyHours = stored[STORAGE_KEY_DAILY_HOURS] ?? 8;
    console.log(`[Amazon Time] Loaded wage: ${currentWage}, daily hours: ${currentDailyHours}`);
    applyToPrices(currentWage, currentDailyHours);
    startObserver();
    console.log("[Amazon Time] Observer started");
  } catch (err) {
    console.error("[Amazon Time] Init error:", err);
  }
};

storageAPI.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;
  if (changes[STORAGE_KEY_HOURLY]) {
    currentWage = changes[STORAGE_KEY_HOURLY].newValue ?? null;
    console.log(`[Amazon Time] Wage updated: ${currentWage}`);
    scheduleApply();
  }
  if (changes[STORAGE_KEY_DAILY_HOURS]) {
    currentDailyHours = changes[STORAGE_KEY_DAILY_HOURS].newValue ?? 8;
    console.log(`[Amazon Time] Daily hours updated: ${currentDailyHours}`);
    scheduleApply();
  }
});

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

