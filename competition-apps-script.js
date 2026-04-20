/**
 * LaLaRef 賽事比分更新 — Google Apps Script Backend
 *
 * SETUP:
 * 1. 建立 Google Sheet，命名為 "LaLaRef Competition Scores"
 * 2. 建立工作表 "Scores" → 欄位 (row 1): key | teamA | teamB | scoreA | scoreB | status
 * 3. Extensions > Apps Script → 貼上此代碼
 * 4. Deploy > New deployment > Web app > Anyone can access
 * 5. 複製 URL 到 competition.html 的 API_URL
 */

var ADMIN_PASSWORD = 'hyd2026';

function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};
  var action = p.action || '';

  if (action === 'getAll') {
    return respond(getAllScores());
  }
  if (action === 'update') {
    if (p.pw !== ADMIN_PASSWORD) return respond({ success: false, message: '密碼錯誤' });
    return respond(updateScore(p.key, p.teamA, p.teamB, p.scoreA, p.scoreB, p.status));
  }
  return respond({ success: false, message: 'Unknown action' });
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (_) { body = {}; }
  if (body.action === 'update') {
    if (body.pw !== ADMIN_PASSWORD) return respond({ success: false, message: '密碼錯誤' });
    return respond(updateScore(body.key, body.teamA, body.teamB, body.scoreA, body.scoreB, body.status));
  }
  return respond({ success: false, message: 'Unknown action' });
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getAllScores() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Scores');
  if (!sheet) return { success: true, scores: {} };
  var data = sheet.getDataRange().getValues();
  var scores = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      scores[data[i][0]] = {
        teamA: data[i][1] || '',
        teamB: data[i][2] || '',
        scoreA: data[i][3] !== '' ? String(data[i][3]) : '',
        scoreB: data[i][4] !== '' ? String(data[i][4]) : '',
        status: data[i][5] || 'scheduled'
      };
    }
  }
  return { success: true, scores: scores };
}

function updateScore(key, teamA, teamB, scoreA, scoreB, status) {
  if (!key) return { success: false, message: 'Missing key' };
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Scores');
  if (!sheet) return { success: false, message: 'Sheet not found' };
  var data = sheet.getDataRange().getValues();
  // Find existing row
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      var r = i + 1;
      sheet.getRange(r, 2).setValue(teamA || '');
      sheet.getRange(r, 3).setValue(teamB || '');
      sheet.getRange(r, 4).setValue(scoreA !== undefined && scoreA !== '' ? Number(scoreA) : '');
      sheet.getRange(r, 5).setValue(scoreB !== undefined && scoreB !== '' ? Number(scoreB) : '');
      sheet.getRange(r, 6).setValue(status || 'scheduled');
      return { success: true, message: '已更新' };
    }
  }
  // New row
  sheet.appendRow([key, teamA || '', teamB || '', scoreA !== undefined && scoreA !== '' ? Number(scoreA) : '', scoreB !== undefined && scoreB !== '' ? Number(scoreB) : '', status || 'scheduled']);
  return { success: true, message: '已新增' };
}
