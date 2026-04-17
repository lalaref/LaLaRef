/**
 * LaLaRef 賽事管理系統 — Google Apps Script Backend
 *
 * SETUP INSTRUCTIONS 設置步驟:
 * 1. 建立新的 Google Sheet，命名為 "LaLaRef Competitions"
 * 2. 建立 3 個工作表:
 *    - "Competitions" → id | token | name | nameEn | date | venue | status | adminPassword | rules | rundown | createdAt
 *    - "Matches"      → id | competitionId | gameNo | timeSlot | teamA | teamB | scoreA | scoreB | status | label
 *    - "Admins"       → token | password
 * 3. 到 Extensions > Apps Script，貼上此代碼
 * 4. 部署為 Web App：Deploy > New deployment > Web app > Anyone can access
 * 5. 複製部署 URL，貼到 competition.html 及 competition-admin.html 的 API_URL 變數
 */

function doGet(e) {
  return handleRequest(e.parameter);
}

function doPost(e) {
  let params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch (_) {
    params = e.parameter;
  }
  return handleRequest(params);
}

function handleRequest(params) {
  try {
    let result;
    switch (params.action) {
      case 'getCompetition':      result = getCompetition(params.token); break;
      case 'getMatches':          result = getMatches(params.token); break;
      case 'listCompetitions':    result = listCompetitions(params.password); break;
      case 'createCompetition':   result = createCompetition(params); break;
      case 'updateCompetition':   result = updateCompetition(params); break;
      case 'deleteCompetition':   result = deleteCompetition(params.token, params.password); break;
      case 'saveMatch':           result = saveMatch(params); break;
      case 'updateScore':         result = updateScore(params); break;
      case 'deleteMatch':         result = deleteMatch(params.matchId, params.token, params.password); break;
      case 'verifyAdmin':         result = verifyAdmin(params.token, params.password); break;
      default: result = { success: false, message: 'Unknown action' };
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ── helpers ──────────────────────────────────────────────────

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function rowToCompetition(row) {
  return {
    id: row[0], token: row[1], name: row[2], nameEn: row[3],
    date: row[4], venue: row[5], status: row[6],
    rules: safeJson(row[8]),
    rundown: safeJson(row[9]),
    createdAt: row[10]
  };
}

function rowToMatch(row) {
  return {
    id: row[0], competitionId: row[1], gameNo: row[2],
    timeSlot: row[3], teamA: row[4], teamB: row[5],
    scoreA: row[6] === '' ? null : Number(row[6]),
    scoreB: row[7] === '' ? null : Number(row[7]),
    status: row[8], label: row[9]
  };
}

function safeJson(val) {
  if (!val) return null;
  try { return JSON.parse(val); } catch (_) { return val; }
}

function authCheck(token, password) {
  const sheet = getSheet('Competitions');
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === token && data[i][7] === password) return true;
  }
  return false;
}

// ── public reads ─────────────────────────────────────────────

function getCompetition(token) {
  const sheet = getSheet('Competitions');
  if (!sheet) return { success: false, message: 'Sheet not found' };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === token) {
      return { success: true, competition: rowToCompetition(data[i]) };
    }
  }
  return { success: false, message: '找不到賽事' };
}

function getMatches(token) {
  // First resolve competitionId from token
  const cSheet = getSheet('Competitions');
  if (!cSheet) return { success: false, message: 'Sheet not found' };
  const cData = cSheet.getDataRange().getValues();
  let compId = null;
  for (let i = 1; i < cData.length; i++) {
    if (cData[i][1] === token) { compId = cData[i][0]; break; }
  }
  if (!compId) return { success: false, message: '找不到賽事' };

  const mSheet = getSheet('Matches');
  if (!mSheet) return { success: true, matches: [] };
  const mData = mSheet.getDataRange().getValues();
  const matches = [];
  for (let i = 1; i < mData.length; i++) {
    if (mData[i][1] === compId) matches.push(rowToMatch(mData[i]));
  }
  matches.sort((a, b) => (a.gameNo || 0) - (b.gameNo || 0));
  return { success: true, matches };
}

// ── admin reads ───────────────────────────────────────────────

function verifyAdmin(token, password) {
  return { success: authCheck(token, password) };
}

function listCompetitions(password) {
  // Master password stored in Admins sheet row 1
  const aSheet = getSheet('Admins');
  if (!aSheet) return { success: false, message: 'Admins sheet not found' };
  const aData = aSheet.getDataRange().getValues();
  const masterPw = aData.length > 1 ? aData[1][1] : null;
  if (!masterPw || password !== masterPw) return { success: false, message: '密碼錯誤' };

  const sheet = getSheet('Competitions');
  if (!sheet) return { success: true, competitions: [] };
  const data = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) list.push(rowToCompetition(data[i]));
  }
  return { success: true, competitions: list };
}

// ── admin writes ──────────────────────────────────────────────

function createCompetition(params) {
  // Verify master password
  const aSheet = getSheet('Admins');
  if (!aSheet) return { success: false, message: 'Admins sheet not found' };
  const aData = aSheet.getDataRange().getValues();
  const masterPw = aData.length > 1 ? aData[1][1] : null;
  if (!masterPw || params.masterPassword !== masterPw) return { success: false, message: '主密碼錯誤' };

  const sheet = getSheet('Competitions');
  if (!sheet) return { success: false, message: 'Competitions sheet not found' };

  // Check token uniqueness
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === params.token) return { success: false, message: 'Token 已存在，請使用其他 Token' };
  }

  const id = 'C' + Date.now();
  sheet.appendRow([
    id, params.token, params.name, params.nameEn || '',
    params.date || '', params.venue || '', params.status || 'upcoming',
    params.adminPassword,
    JSON.stringify(params.rules || {}),
    JSON.stringify(params.rundown || []),
    new Date().toISOString()
  ]);
  return { success: true, id, message: '賽事已建立' };
}

function updateCompetition(params) {
  if (!authCheck(params.token, params.password)) return { success: false, message: '密碼錯誤' };
  const sheet = getSheet('Competitions');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === params.token) {
      const r = i + 1;
      if (params.name !== undefined)     sheet.getRange(r, 3).setValue(params.name);
      if (params.nameEn !== undefined)   sheet.getRange(r, 4).setValue(params.nameEn);
      if (params.date !== undefined)     sheet.getRange(r, 5).setValue(params.date);
      if (params.venue !== undefined)    sheet.getRange(r, 6).setValue(params.venue);
      if (params.status !== undefined)   sheet.getRange(r, 7).setValue(params.status);
      if (params.rules !== undefined)    sheet.getRange(r, 9).setValue(JSON.stringify(params.rules));
      if (params.rundown !== undefined)  sheet.getRange(r, 10).setValue(JSON.stringify(params.rundown));
      return { success: true, message: '賽事已更新' };
    }
  }
  return { success: false, message: '找不到賽事' };
}

function deleteCompetition(token, password) {
  if (!authCheck(token, password)) return { success: false, message: '密碼錯誤' };
  const sheet = getSheet('Competitions');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === token) {
      sheet.deleteRow(i + 1);
      return { success: true, message: '賽事已刪除' };
    }
  }
  return { success: false, message: '找不到賽事' };
}

function saveMatch(params) {
  if (!authCheck(params.token, params.password)) return { success: false, message: '密碼錯誤' };

  // Get competitionId
  const cSheet = getSheet('Competitions');
  const cData = cSheet.getDataRange().getValues();
  let compId = null;
  for (let i = 1; i < cData.length; i++) {
    if (cData[i][1] === params.token) { compId = cData[i][0]; break; }
  }
  if (!compId) return { success: false, message: '找不到賽事' };

  const sheet = getSheet('Matches');
  if (!sheet) return { success: false, message: 'Matches sheet not found' };

  if (params.matchId) {
    // Update existing
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.matchId) {
        const r = i + 1;
        sheet.getRange(r, 3).setValue(params.gameNo || data[i][2]);
        sheet.getRange(r, 4).setValue(params.timeSlot || data[i][3]);
        sheet.getRange(r, 5).setValue(params.teamA !== undefined ? params.teamA : data[i][4]);
        sheet.getRange(r, 6).setValue(params.teamB !== undefined ? params.teamB : data[i][5]);
        sheet.getRange(r, 9).setValue(params.status || data[i][8]);
        sheet.getRange(r, 10).setValue(params.label !== undefined ? params.label : data[i][9]);
        return { success: true, message: '場次已更新' };
      }
    }
    return { success: false, message: '找不到場次' };
  } else {
    // Create new
    const id = 'M' + Date.now();
    sheet.appendRow([
      id, compId, params.gameNo || '', params.timeSlot || '',
      params.teamA || '', params.teamB || '',
      '', '', params.status || 'scheduled', params.label || ''
    ]);
    return { success: true, matchId: id, message: '場次已新增' };
  }
}

function updateScore(params) {
  if (!authCheck(params.token, params.password)) return { success: false, message: '密碼錯誤' };
  const sheet = getSheet('Matches');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.matchId) {
      const r = i + 1;
      if (params.scoreA !== undefined) sheet.getRange(r, 7).setValue(params.scoreA);
      if (params.scoreB !== undefined) sheet.getRange(r, 8).setValue(params.scoreB);
      if (params.status !== undefined) sheet.getRange(r, 9).setValue(params.status);
      if (params.teamA !== undefined)  sheet.getRange(r, 5).setValue(params.teamA);
      if (params.teamB !== undefined)  sheet.getRange(r, 6).setValue(params.teamB);
      return { success: true, message: '比分已更新' };
    }
  }
  return { success: false, message: '找不到場次' };
}

function deleteMatch(matchId, token, password) {
  if (!authCheck(token, password)) return { success: false, message: '密碼錯誤' };
  const sheet = getSheet('Matches');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === matchId) {
      sheet.deleteRow(i + 1);
      return { success: true, message: '場次已刪除' };
    }
  }
  return { success: false, message: '找不到場次' };
}
