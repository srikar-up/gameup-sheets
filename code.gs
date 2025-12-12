function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('STONKS Life OS')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tracker
  let tSheet = ss.getSheetByName("Tracker");
  if (!tSheet) { tSheet = ss.insertSheet("Tracker"); }
  if (tSheet.getLastRow() === 0) {
    tSheet.getRange(1, 1, 1, 11).setValues([["ID", "Task Name", "Description", "Type", "Priority", "Due Date", "Current", "Target", "XP", "Status", "Reward"]]).setFontWeight("bold").setBackground("#e0e0e0");
  }

  // 2. Events
  let eSheet = ss.getSheetByName("Events");
  if (!eSheet) { eSheet = ss.insertSheet("Events"); }
  if (eSheet.getLastRow() === 0) { eSheet.getRange(1, 1, 1, 4).setValues([["Name", "Date", "Type", "Recurrence"]]).setFontWeight("bold").setBackground("#ffccbc"); }

  // 3. Notes
  let nSheet = ss.getSheetByName("Notes");
  if (!nSheet) { nSheet = ss.insertSheet("Notes"); }
  if (nSheet.getLastRow() === 0) { nSheet.getRange(1, 1, 1, 4).setValues([["ID", "Content", "Type", "Expiry Date"]]).setFontWeight("bold").setBackground("#fff9c4"); }

  // 4. Counters (New)
  let cSheet = ss.getSheetByName("Counters");
  if (!cSheet) { cSheet = ss.insertSheet("Counters"); }
  if (cSheet.getLastRow() === 0) { cSheet.getRange(1, 1, 1, 3).setValues([["ID", "Name", "Total Count"]]).setFontWeight("bold").setBackground("#b2dfdb"); }

  // 5. History (New - The Database)
  let hSheet = ss.getSheetByName("History");
  if (!hSheet) { hSheet = ss.insertSheet("History"); }
  if (hSheet.getLastRow() === 0) { hSheet.getRange(1, 1, 1, 5).setValues([["Date", "Name", "Type", "Action", "XP Earned"]]).setFontWeight("bold").setBackground("#d1c4e9"); }
}

function getTrackerData() {
  setupSheet(); // Self-healing
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tSheet = ss.getSheetByName("Tracker");
  const eSheet = ss.getSheetByName("Events");
  const nSheet = ss.getSheetByName("Notes");
  const cSheet = ss.getSheetByName("Counters");
  const hSheet = ss.getSheetByName("History");

  // 1. TASKS
  let tasks = [];
  if (tSheet.getLastRow() > 1) {
    const tData = tSheet.getDataRange().getValues(); tData.shift();
    tasks = tData.filter(r => r[0] !== "").map(row => {
      const current = parseInt(row[6]) || 0; const target = parseInt(row[7]) || 1;
      let dateObj = new Date(row[5]); if (isNaN(dateObj.getTime())) dateObj = new Date();
      return {
        id: row[0], task: row[1], description: row[2], type: row[3], priority: row[4],
        dateRaw: dateObj.getTime(), dateDisplay: dateObj.toLocaleDateString(),
        current: current, target: target, xpValue: parseInt(row[8])||0, isComplete: (current >= target), reward: row[10] || ""
      };
    });
  }

  // 2. COUNTERS
  let counters = [];
  if (cSheet.getLastRow() > 1) {
    const cData = cSheet.getDataRange().getValues(); cData.shift();
    counters = cData.filter(r => r[0] !== "").map(row => ({ id: row[0], name: row[1], total: parseInt(row[2]) || 0 }));
  }

  // 3. EVENTS
  let alerts = [];
  if (eSheet.getLastRow() > 1) {
    const eData = eSheet.getDataRange().getValues(); eData.shift();
    const today = new Date(); today.setHours(0,0,0,0);
    eData.forEach(row => {
      if(row[0]) {
        let evtDate = new Date(row[1]);
        const recurrence = row[3] || "Annual";
        if (recurrence === "Annual" || row[2] === "Birthday") {
           evtDate.setFullYear(today.getFullYear());
           if (evtDate < today) { evtDate.setFullYear(today.getFullYear() + 1); }
        } else { evtDate.setHours(0,0,0,0); }
        
        const diff = Math.ceil((evtDate - today) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 10) { alerts.push({ name: row[0], daysLeft: diff, date: evtDate.toLocaleDateString(), type: row[2] }); }
      }
    });
  }

  // 4. NOTES
  let notes = [];
  if (nSheet.getLastRow() > 1) {
    const nData = nSheet.getDataRange().getValues(); nData.shift();
    const today = new Date(); today.setHours(0,0,0,0);
    notes = nData.filter(r => r[0] !== "").map(row => {
      if (row[2] === "Temporary") {
        const expiry = new Date(row[3]); expiry.setHours(0,0,0,0);
        if (expiry < today) return null;
      }
      return { id: row[0], content: row[1], type: row[2] };
    }).filter(n => n !== null);
  }

  // 5. STATS (Calculated from History Sheet for Permanence)
  let totalXP = 0;
  if (hSheet.getLastRow() > 1) {
    const hData = hSheet.getRange(2, 5, hSheet.getLastRow() - 1, 1).getValues(); // Get Column E (XP)
    totalXP = hData.reduce((sum, row) => sum + (parseInt(row[0]) || 0), 0);
  }

  return { tasks, counters, alerts, notes, userStats: calculateLevelStats(totalXP) };
}

function calculateLevelStats(totalXP) {
  let level = 1; let xpNeeded = 100; let current = totalXP;
  while (current >= xpNeeded) { current -= xpNeeded; level++; xpNeeded += 50; }
  return { level: level, totalXP: totalXP, currentLevelXP: current, nextLevelThreshold: xpNeeded };
}

// --- UPDATES ---

function updateProgress(id, change) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tSheet = ss.getSheetByName("Tracker");
  const hSheet = ss.getSheetByName("History");
  const data = tSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      const row = i + 1;
      let currentVal = parseInt(data[i][6]) || 0;
      const targetVal = parseInt(data[i][7]);
      const xpVal = parseInt(data[i][8]) || 0;
      const wasComplete = data[i][9]; // Check previous status
      
      let newVal = currentVal + change;
      if (newVal < 0) newVal = 0; if (newVal > targetVal) newVal = targetVal;
      
      tSheet.getRange(row, 7).setValue(newVal);
      
      const isComplete = newVal >= targetVal;
      tSheet.getRange(row, 10).setValue(isComplete);

      // HISTORY LOGGING: Only log XP if task JUST completed
      if (isComplete && !wasComplete) {
        hSheet.appendRow([new Date(), data[i][1], "Quest", "Completed", xpVal]);
      }
      return getTrackerData();
    }
  }
}

function updateCounter(id, change) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cSheet = ss.getSheetByName("Counters");
  const hSheet = ss.getSheetByName("History");
  const data = cSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      const row = i + 1;
      let newVal = (parseInt(data[i][2]) || 0) + change;
      if (newVal < 0) newVal = 0;
      
      cSheet.getRange(row, 3).setValue(newVal);
      
      // Log to History (+10 XP per counter click for fun, or just track count)
      if (change > 0) {
        // Log "1" count to history for charts
        hSheet.appendRow([new Date(), data[i][1], "Counter", "Increment", 10]); // Giving 10 XP per click
      }
      return getTrackerData();
    }
  }
}

// --- ADDS ---

function addTask(taskObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Tracker");
  const lastRow = sheet.getLastRow();
  let targetRow = lastRow + 1;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) { if (ids[i][0] === "") { targetRow = i + 2; break; } }
  }
  const newID = new Date().getTime().toString().slice(-6);
  let xp = 20; if(taskObj.priority === "Gold") xp = 150; if(taskObj.priority === "Silver") xp = 100; if(taskObj.priority === "Bronze") xp = 50;
  sheet.getRange(targetRow, 1, 1, 11).setValues([[newID, taskObj.name, taskObj.description, taskObj.type, taskObj.priority, taskObj.date, 0, taskObj.target, xp, false, taskObj.reward]]);
  return getTrackerData();
}

function addCounter(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Counters");
  const newID = new Date().getTime().toString().slice(-6);
  sheet.appendRow([newID, name, 0]);
  return getTrackerData();
}

function addNote(c, t, d) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Notes");
  const newID = new Date().getTime().toString().slice(-6);
  let expiry = "";
  if (t === "Temporary") { const dt = new Date(); dt.setDate(dt.getDate() + parseInt(d)); expiry = dt.toISOString().split('T')[0]; }
  sheet.appendRow([newID, c, t, expiry]);
  return getTrackerData();
}

function addEvent(n, d, t, r) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Events").appendRow([n, d, t, r]);
  return getTrackerData();
}

function deleteNote(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Notes");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) { if (data[i][0] == id) { sheet.getRange(i+1, 1, 1, 4).clearContent(); break; } }
  return getTrackerData();
}

function resetRepeatingQuests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Tracker");
  const data = sheet.getDataRange().getValues();
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 1; i < data.length; i++) {
    const type = data[i][3];
    const rawDate = data[i][5];
    const dueDate = new Date(rawDate); dueDate.setHours(0,0,0,0);
    if (type === "Repeating" && today <= dueDate) {
      sheet.getRange(i+1, 7).setValue(0);
      sheet.getRange(i+1, 10).setValue(false);
    }
  }
}
