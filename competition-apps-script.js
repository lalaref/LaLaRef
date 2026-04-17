/**
 * LaLaRef 賽事管理系統 — Google Apps Script Backend (v2 Flexible)
 *
 * SETUP:
 * 1. 建立 Google Sheet "LaLaRef Competitions"
 * 2. 建立 2 個工作表:
 *    - "Competitions" → 欄位: id | token | name | nameEn | date | venue | status | password | config | createdAt
 *      config = JSON string containing: { rules, rundown, phases, matches }
 *    - "Admins" → 欄位: key | value  (row2: masterPassword | your_password)
 * 3. Extensions > Apps Script → 貼上此代碼
 * 4. Deploy > New deployment > Web app > Anyone can access
 * 5. 複製 URL 到 competition.html / competition-admin.html
 *
 * DESIGN:
 * - Each competition stores its ENTIRE structure in one JSON "config" field
 * - config.rules = { format, halves, quarters, ... }
 * - config.rundown = [{ time, event, type }]  (type: ceremony/match/break/show)
 * - config.phases = [{ id, name, type }]  (type: group/knockout/ceremony/show)
 * - config.matches = [{ id, phaseId, gameNo, time, teamA, teamB, scoreA, scoreB,
 *                        status, label, sourceA, sourceB }]
 *   sourceA/sourceB = { matchId, result:'winner'|'loser' } for auto-progression
 * - This means the ENTIRE bracket structure is customizable per competition
 *   without changing any code — just different JSON configs
 */

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  return handle(params);
}

function doPost(e) {
  var params;
  try { params = JSON.parse(e.postData.contents); } catch(_) { params = e && e.parameter ? e.parameter : {}; }
  return handle(params);
}

function handle(p) {
  try {
    var r;
    switch(p.action) {
      // Public
      case 'getCompetition': r = getCompetition(p.token); break;
      // Admin
      case 'verifyAdmin':    r = verifyAdmin(p.token, p.password); break;
      case 'listAll':        r = listAll(p.masterPassword); break;
      case 'create':         r = create(p); break;
      case 'update':         r = update(p); break;
      case 'remove':         r = remove(p.token, p.password); break;
      default: r = { success:false, message:'Unknown action' };
    }
    return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success:false,message:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Helpers ───────────────────────────────────────────────────
function sheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }

function getMasterPw() {
  var s = sheet('Admins'); if(!s) return null;
  var d = s.getDataRange().getValues();
  for(var i=1;i<d.length;i++) { if(d[i][0]==='masterPassword') return d[i][1]; }
  return null;
}

function authComp(token, password) {
  var s = sheet('Competitions'); if(!s) return false;
  var d = s.getDataRange().getValues();
  for(var i=1;i<d.length;i++) { if(d[i][1]===token && d[i][7]===password) return true; }
  return false;
}

function parseConfig(val) {
  if(!val) return {};
  try { return JSON.parse(val); } catch(_) { return {}; }
}

function rowToComp(row) {
  var cfg = parseConfig(row[8]);
  return {
    id:row[0], token:row[1], name:row[2], nameEn:row[3],
    date:row[4], venue:row[5], status:row[6],
    rules: cfg.rules||{}, rundown: cfg.rundown||[],
    phases: cfg.phases||[], matches: cfg.matches||[],
    createdAt:row[9]
  };
}

// ── Public ────────────────────────────────────────────────────
function getCompetition(token) {
  var s = sheet('Competitions'); if(!s) return {success:false,message:'Sheet not found'};
  var d = s.getDataRange().getValues();
  for(var i=1;i<d.length;i++) {
    if(d[i][1]===token) return {success:true, competition:rowToComp(d[i])};
  }
  return {success:false, message:'找不到賽事'};
}

// ── Admin ─────────────────────────────────────────────────────
function verifyAdmin(token, password) {
  return {success: authComp(token, password)};
}

function listAll(masterPassword) {
  if(masterPassword !== getMasterPw()) return {success:false,message:'密碼錯誤'};
  var s = sheet('Competitions'); if(!s) return {success:true,competitions:[]};
  var d = s.getDataRange().getValues();
  var list = [];
  for(var i=1;i<d.length;i++) { if(d[i][0]) list.push(rowToComp(d[i])); }
  return {success:true, competitions:list};
}

function create(p) {
  if(p.masterPassword !== getMasterPw()) return {success:false,message:'主密碼錯誤'};
  var s = sheet('Competitions'); if(!s) return {success:false,message:'Sheet not found'};
  // Check token unique
  var d = s.getDataRange().getValues();
  for(var i=1;i<d.length;i++) { if(d[i][1]===p.token) return {success:false,message:'Token 已存在'}; }
  var id = 'C'+Date.now();
  var config = { rules:safeP(p.rules), rundown:safeP(p.rundown), phases:safeP(p.phases), matches:safeP(p.matches) };
  s.appendRow([id, p.token, p.name||'', p.nameEn||'', p.date||'', p.venue||'',
    p.status||'upcoming', p.password||'', JSON.stringify(config), new Date().toISOString()]);
  return {success:true, id:id, message:'賽事已建立'};
}

function update(p) {
  if(!authComp(p.token, p.password)) return {success:false,message:'密碼錯誤'};
  var s = sheet('Competitions');
  var d = s.getDataRange().getValues();
  for(var i=1;i<d.length;i++) {
    if(d[i][1]===p.token) {
      var r = i+1;
      if(p.name!==undefined)   s.getRange(r,3).setValue(p.name);
      if(p.nameEn!==undefined) s.getRange(r,4).setValue(p.nameEn);
      if(p.date!==undefined)   s.getRange(r,5).setValue(p.date);
      if(p.venue!==undefined)  s.getRange(r,6).setValue(p.venue);
      if(p.status!==undefined) s.getRange(r,7).setValue(p.status);
      // Merge config
      var existing = parseConfig(d[i][8]);
      if(p.rules!==undefined)   existing.rules   = safeP(p.rules);
      if(p.rundown!==undefined) existing.rundown  = safeP(p.rundown);
      if(p.phases!==undefined)  existing.phases   = safeP(p.phases);
      if(p.matches!==undefined) existing.matches  = safeP(p.matches);
      s.getRange(r,9).setValue(JSON.stringify(existing));
      return {success:true, message:'賽事已更新'};
    }
  }
  return {success:false, message:'找不到賽事'};
}

function remove(token, password) {
  if(!authComp(token, password)) return {success:false,message:'密碼錯誤'};
  var s = sheet('Competitions');
  var d = s.getDataRange().getValues();
  for(var i=1;i<d.length;i++) {
    if(d[i][1]===token) { s.deleteRow(i+1); return {success:true,message:'已刪除'}; }
  }
  return {success:false,message:'找不到賽事'};
}

function safeP(v) {
  if(!v) return v;
  if(typeof v === 'string') { try { return JSON.parse(v); } catch(_) { return v; } }
  return v;
}
