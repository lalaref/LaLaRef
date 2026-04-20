/**
 * LaLaRef 賽事比分更新 — Google Apps Script Backend (v3 Clean)
 *
 * SETUP:
 * 1. 建立 Google Sheet
 * 2. 建立工作表 "Scores"
 *    - 第一行 headers: key | teamA | teamB | scoreA | scoreB | status
 *    - 選取 D 及 E 欄 (scoreA, scoreB) → Format → Number → Plain text
 * 3. Extensions > Apps Script → 貼上此代碼
 * 4. Deploy > New deployment > Web app > Anyone > Deploy
 * 5. 複製 URL 到 hyd2026.html
 *
 * IMPORTANT: Score columns MUST be formatted as "Plain text" in Google Sheets
 * to prevent auto-conversion to dates.
 */

var ADMIN_PASSWORD = 'hyd2026';

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  return handleAction(p);
}

function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch(x) {
    p = (e && e.parameter) ? e.parameter : {};
  }
  return handleAction(p);
}

function handleAction(p) {
  try {
    var action = p.action || '';
    if (action === 'getAll') return ok(readAll());
    if (action === 'update') {
      if (p.pw !== ADMIN_PASSWORD) return ok({success:false, message:'密碼錯誤'});
      return ok(writeScore(p));
    }
    return ok({success:false, message:'Unknown action: ' + action});
  } catch(err) {
    return ok({success:false, message:err.toString()});
  }
}

function ok(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ── READ ── */
function readAll() {
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Scores');
  if (!s) return {success:true, scores:{}};
  var rows = s.getDataRange().getDisplayValues(); // getDisplayValues returns strings, avoids Date conversion
  var out = {};
  for (var i = 1; i < rows.length; i++) {
    var k = rows[i][0];
    if (!k) continue;
    out[k] = {
      teamA:  rows[i][1],
      teamB:  rows[i][2],
      scoreA: rows[i][3],
      scoreB: rows[i][4],
      status: rows[i][5] || 'scheduled'
    };
  }
  return {success:true, scores:out};
}

/* ── WRITE ── */
function writeScore(p) {
  var key = p.key;
  if (!key) return {success:false, message:'Missing key'};

  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Scores');
  if (!s) return {success:false, message:'Scores sheet not found'};

  var tA = p.teamA || '';
  var tB = p.teamB || '';
  var sA = (p.scoreA !== undefined && p.scoreA !== '') ? String(p.scoreA) : '';
  var sB = (p.scoreB !== undefined && p.scoreB !== '') ? String(p.scoreB) : '';
  var st = p.status || 'scheduled';

  // Find existing row by key
  var data = s.getDataRange().getDisplayValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      var r = i + 1;
      s.getRange(r, 2).setValue(tA);
      s.getRange(r, 3).setValue(tB);
      // Use setNumberFormat('@') before setValue to force plain text
      s.getRange(r, 4).setNumberFormat('@').setValue(sA);
      s.getRange(r, 5).setNumberFormat('@').setValue(sB);
      s.getRange(r, 6).setValue(st);
      return {success:true, message:'已更新'};
    }
  }

  // New row — format score cells as plain text first
  var newRow = s.getLastRow() + 1;
  s.getRange(newRow, 1).setValue(key);
  s.getRange(newRow, 2).setValue(tA);
  s.getRange(newRow, 3).setValue(tB);
  s.getRange(newRow, 4).setNumberFormat('@').setValue(sA);
  s.getRange(newRow, 5).setNumberFormat('@').setValue(sB);
  s.getRange(newRow, 6).setValue(st);
  return {success:true, message:'已新增'};
}
