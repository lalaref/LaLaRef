/**
 * LaLaRef 球證排程系統 — Google Apps Script Backend
 * 
 * 設置步驟 SETUP INSTRUCTIONS:
 * 1. 建立新的 Google Sheet，命名為 "LaLaRef Schedule"
 * 2. 建立 3 個工作表 (sheets)：
 *    - "Users"    → 欄位: username | password | name | phone | role | active
 *    - "Matches"  → 欄位: id | date | timeStart | timeEnd | venue | venueDetails | format | orgName | refCount | status | createdBy | createdAt
 *    - "Assignments" → 欄位: id | matchId | refereeUsername | role | status | notified | notifiedAt
 * 3. 在 Users 表加入管理員帳號：admin | admin123 | 管理員 | 84828484 | admin | TRUE
 * 4. 在 Users 表加入球證帳號：ref1 | ref123 | 陳大文 | 91234567 | referee | TRUE
 * 5. 到 Extensions > Apps Script，貼上此代碼
 * 6. 部署為 Web App：Deploy > New deployment > Web app > Anyone can access
 * 7. 複製部署 URL，貼到 schedule.html 的 API_URL 變數
 */

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const params = e.parameter;
  const action = params.action;
  
  try {
    let result;
    switch(action) {
      case 'login': result = login(params.username, params.password); break;
      case 'getMatches': result = getMatches(params.username); break;
      case 'getMatch': result = getMatch(params.matchId); break;
      case 'addMatch': result = addMatch(JSON.parse(params.data)); break;
      case 'updateMatch': result = updateMatch(params.matchId, JSON.parse(params.data)); break;
      case 'deleteMatch': result = deleteMatch(params.matchId); break;
      case 'getReferees': result = getReferees(); break;
      case 'addReferee': result = addReferee(JSON.parse(params.data)); break;
      case 'updateReferee': result = updateReferee(JSON.parse(params.data)); break;
      case 'getAssignments': result = getAssignments(params.matchId); break;
      case 'assignReferee': result = assignReferee(JSON.parse(params.data)); break;
      case 'removeAssignment': result = removeAssignment(params.assignmentId); break;
      case 'getMySchedule': result = getMySchedule(params.username); break;
      case 'getTodayMatches': result = getTodayMatches(); break;
      case 'updateAssignmentStatus': result = updateAssignmentStatus(params.assignmentId, params.status); break;
      case 'getMonthlySummary': result = getMonthlySummary(params.year, params.month, params.refereeUsername || ''); break;
      case 'setHourlyRate': result = setHourlyRate(params.refereeUsername, params.rate); break;
      default: result = { success: false, message: 'Unknown action' };
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============ AUTH ============
function login(username, password) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && data[i][1] === password && data[i][5] === true) {
      return { success: true, user: { username: data[i][0], name: data[i][2], phone: data[i][3], role: data[i][4] }};
    }
  }
  return { success: false, message: '用戶名或密碼錯誤' };
}

// ============ REFEREES ============
function getReferees() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const referees = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === 'referee' && data[i][5] === true) {
      referees.push({ username: data[i][0], name: data[i][2], phone: data[i][3] });
    }
  }
  return { success: true, referees };
}

function addReferee(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  sheet.appendRow([data.username, data.password, data.name, data.phone, 'referee', true]);
  return { success: true, message: '球證已新增' };
}

function updateReferee(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username) {
      if (data.name) sheet.getRange(i+1, 3).setValue(data.name);
      if (data.phone) sheet.getRange(i+1, 4).setValue(data.phone);
      if (data.password) sheet.getRange(i+1, 2).setValue(data.password);
      return { success: true, message: '球證資料已更新' };
    }
  }
  return { success: false, message: '找不到球證' };
}

// ============ MATCHES ============
function getMatches(username) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Matches');
  const aSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  const uSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const aData = aSheet.getDataRange().getValues();
  const uData = uSheet.getDataRange().getValues();
  
  const userMap = {};
  for (let i = 1; i < uData.length; i++) userMap[uData[i][0]] = { name: uData[i][2], phone: uData[i][3] };
  
  const matches = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][9] !== 'deleted') {
      const matchId = data[i][0];
      const refs = [];
      for (let j = 1; j < aData.length; j++) {
        if (aData[j][1] === matchId && aData[j][4] !== 'removed') {
          const u = userMap[aData[j][2]] || {};
          refs.push({ name: u.name || aData[j][2], phone: u.phone || '', status: aData[j][4], role: aData[j][3], assignmentId: aData[j][0] });
        }
      }
      matches.push({
        id: matchId, date: data[i][1], timeStart: data[i][2], timeEnd: data[i][3],
        venue: data[i][4], venueDetails: data[i][5], format: data[i][6],
        orgName: data[i][7], refCount: data[i][8], status: data[i][9],
        createdBy: data[i][10], createdAt: data[i][11], referees: refs
      });
    }
  }
  matches.sort((a, b) => new Date(b.date) - new Date(a.date));
  return { success: true, matches };
}

function getMatch(matchId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Matches');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === matchId) {
      return { success: true, match: {
        id: data[i][0], date: data[i][1], timeStart: data[i][2], timeEnd: data[i][3],
        venue: data[i][4], venueDetails: data[i][5], format: data[i][6],
        orgName: data[i][7], refCount: data[i][8], status: data[i][9]
      }};
    }
  }
  return { success: false, message: '找不到比賽' };
}

function addMatch(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Matches');
  const id = 'M' + Date.now();
  sheet.appendRow([id, data.date, data.timeStart, data.timeEnd, data.venue, data.venueDetails || '', data.format, data.orgName || '', data.refCount || 2, 'confirmed', data.createdBy || 'admin', new Date().toISOString()]);
  return { success: true, matchId: id, message: '比賽已新增' };
}

function updateMatch(matchId, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Matches');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === matchId) {
      if (data.date) sheet.getRange(i+1, 2).setValue(data.date);
      if (data.timeStart) sheet.getRange(i+1, 3).setValue(data.timeStart);
      if (data.timeEnd) sheet.getRange(i+1, 4).setValue(data.timeEnd);
      if (data.venue) sheet.getRange(i+1, 5).setValue(data.venue);
      if (data.venueDetails !== undefined) sheet.getRange(i+1, 6).setValue(data.venueDetails);
      if (data.format) sheet.getRange(i+1, 7).setValue(data.format);
      if (data.orgName !== undefined) sheet.getRange(i+1, 8).setValue(data.orgName);
      if (data.refCount) sheet.getRange(i+1, 9).setValue(data.refCount);
      if (data.status) sheet.getRange(i+1, 10).setValue(data.status);
      return { success: true, message: '比賽已更新' };
    }
  }
  return { success: false, message: '找不到比賽' };
}

function deleteMatch(matchId) {
  return updateMatch(matchId, { status: 'deleted' });
}

// ============ ASSIGNMENTS ============
function getAssignments(matchId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  const users = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users').getDataRange().getValues();
  const data = sheet.getDataRange().getValues();
  const assignments = [];
  
  const userMap = {};
  for (let i = 1; i < users.length; i++) {
    userMap[users[i][0]] = { name: users[i][2], phone: users[i][3] };
  }
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === matchId && data[i][4] !== 'removed') {
      const ref = userMap[data[i][2]] || {};
      assignments.push({
        id: data[i][0], matchId: data[i][1], refereeUsername: data[i][2],
        role: data[i][3], status: data[i][4], notified: data[i][5],
        refereeName: ref.name || data[i][2], refereePhone: ref.phone || ''
      });
    }
  }
  return { success: true, assignments };
}

function assignReferee(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  const id = 'A' + Date.now();
  sheet.appendRow([id, data.matchId, data.refereeUsername, data.role || '球證', 'assigned', false, '']);
  return { success: true, assignmentId: id, message: '球證已分配' };
}

function removeAssignment(assignmentId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === assignmentId) {
      sheet.getRange(i+1, 5).setValue('removed');
      return { success: true, message: '已移除分配' };
    }
  }
  return { success: false, message: '找不到分配記錄' };
}

function updateAssignmentStatus(assignmentId, status) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === assignmentId) {
      sheet.getRange(i+1, 5).setValue(status);
      if (status === 'notified') {
        sheet.getRange(i+1, 6).setValue(true);
        sheet.getRange(i+1, 7).setValue(new Date().toISOString());
      }
      return { success: true, message: '狀態已更新' };
    }
  }
  return { success: false, message: '找不到分配記錄' };
}

// ============ SCHEDULE ============
function getMySchedule(username) {
  const aSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  const mSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Matches');
  const aData = aSheet.getDataRange().getValues();
  const mData = mSheet.getDataRange().getValues();
  
  const matchMap = {};
  for (let i = 1; i < mData.length; i++) {
    matchMap[mData[i][0]] = {
      id: mData[i][0], date: mData[i][1], timeStart: mData[i][2], timeEnd: mData[i][3],
      venue: mData[i][4], venueDetails: mData[i][5], format: mData[i][6],
      orgName: mData[i][7], status: mData[i][9]
    };
  }
  
  const schedule = [];
  for (let i = 1; i < aData.length; i++) {
    if (aData[i][2] === username && aData[i][4] !== 'removed') {
      const match = matchMap[aData[i][1]];
      if (match && match.status !== 'deleted') {
        schedule.push({ ...match, assignmentId: aData[i][0], role: aData[i][3], assignmentStatus: aData[i][4] });
      }
    }
  }
  schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
  return { success: true, schedule };
}

function getTodayMatches() {
  const today = Utilities.formatDate(new Date(), 'Asia/Hong_Kong', 'yyyy-MM-dd');
  const mSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Matches');
  const aSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  const uSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const mData = mSheet.getDataRange().getValues();
  const aData = aSheet.getDataRange().getValues();
  const uData = uSheet.getDataRange().getValues();
  
  const userMap = {};
  for (let i = 1; i < uData.length; i++) userMap[uData[i][0]] = { name: uData[i][2], phone: uData[i][3] };
  
  const todayMatches = [];
  for (let i = 1; i < mData.length; i++) {
    const matchDate = Utilities.formatDate(new Date(mData[i][1]), 'Asia/Hong_Kong', 'yyyy-MM-dd');
    if (matchDate === today && mData[i][9] !== 'deleted') {
      const matchId = mData[i][0];
      const refs = [];
      for (let j = 1; j < aData.length; j++) {
        if (aData[j][1] === matchId && aData[j][4] !== 'removed') {
          const u = userMap[aData[j][2]] || {};
          refs.push({ name: u.name || aData[j][2], phone: u.phone || '', status: aData[j][4], assignmentId: aData[j][0] });
        }
      }
      todayMatches.push({
        id: matchId, date: mData[i][1], timeStart: mData[i][2], timeEnd: mData[i][3],
        venue: mData[i][4], format: mData[i][6], orgName: mData[i][7], referees: refs
      });
    }
  }
  return { success: true, matches: todayMatches };
}

// ============ MONTHLY SUMMARY ============
function getMonthlySummary(year, month, refereeUsername) {
  const mSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Matches');
  const aSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  const uSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const rSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Rates');
  const mData = mSheet.getDataRange().getValues();
  const aData = aSheet.getDataRange().getValues();
  const uData = uSheet.getDataRange().getValues();
  
  // Build user map
  const userMap = {};
  for (let i = 1; i < uData.length; i++) userMap[uData[i][0]] = { name: uData[i][2], phone: uData[i][3] };
  
  // Build rates map (referee -> hourlyRate)
  const ratesMap = {};
  if (rSheet) {
    const rData = rSheet.getDataRange().getValues();
    for (let i = 1; i < rData.length; i++) {
      ratesMap[rData[i][0]] = parseFloat(rData[i][1]) || 0;
    }
  }
  
  // Build match map
  const matchMap = {};
  for (let i = 1; i < mData.length; i++) {
    if (mData[i][9] === 'deleted') continue;
    const d = new Date(mData[i][1]);
    const mYear = d.getFullYear();
    const mMonth = d.getMonth() + 1;
    if (mYear == year && mMonth == month) {
      matchMap[mData[i][0]] = {
        id: mData[i][0], date: Utilities.formatDate(d, 'Asia/Hong_Kong', 'yyyy-MM-dd'),
        timeStart: mData[i][2], timeEnd: mData[i][3], venue: mData[i][4], format: mData[i][6]
      };
    }
  }
  
  // Group assignments by referee for the month
  const refSummary = {};
  for (let i = 1; i < aData.length; i++) {
    if (aData[i][4] === 'removed') continue;
    const matchId = aData[i][1];
    const match = matchMap[matchId];
    if (!match) continue;
    
    const refUser = aData[i][2];
    // If filtering by referee
    if (refereeUsername && refUser !== refereeUsername) continue;
    
    if (!refSummary[refUser]) {
      const u = userMap[refUser] || {};
      refSummary[refUser] = { username: refUser, name: u.name || refUser, phone: u.phone || '', hourlyRate: ratesMap[refUser] || 0, matches: [], totalHours: 0, totalPay: 0 };
    }
    
    // Calculate hours
    let hours = 2; // default
    try {
      const [sh, sm] = match.timeStart.split(':').map(Number);
      const [eh, em] = match.timeEnd.split(':').map(Number);
      hours = (eh + em/60) - (sh + sm/60);
      if (hours < 0) hours += 24;
    } catch(e) {}
    
    refSummary[refUser].matches.push({ ...match, role: aData[i][3], hours: Math.round(hours * 100) / 100 });
    refSummary[refUser].totalHours += hours;
  }
  
  // Calculate totals
  const summaries = Object.values(refSummary).map(s => {
    s.totalHours = Math.round(s.totalHours * 100) / 100;
    s.totalPay = Math.round(s.totalHours * s.hourlyRate * 100) / 100;
    s.matches.sort((a, b) => a.date.localeCompare(b.date));
    return s;
  });
  
  return { success: true, summaries, year: parseInt(year), month: parseInt(month) };
}

function setHourlyRate(refereeUsername, rate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let rSheet = ss.getSheetByName('Rates');
  if (!rSheet) {
    rSheet = ss.insertSheet('Rates');
    rSheet.appendRow(['username', 'hourlyRate']);
  }
  const data = rSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === refereeUsername) {
      rSheet.getRange(i+1, 2).setValue(parseFloat(rate));
      return { success: true, message: '時薪已更新' };
    }
  }
  rSheet.appendRow([refereeUsername, parseFloat(rate)]);
  return { success: true, message: '時薪已設定' };
}
