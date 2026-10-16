/**
 * Xaridor Sifat Paneli — Google Apps Script (ma'lumotlar bazasi sifatida Google Sheets).
 *
 * O'rnatish: README.md dagi 1-bosqichga qarang.
 * Bu kod Google Sheets jadvaliga bog'langan bo'lishi kerak (Extensions → Apps Script).
 */

// ===== SOZLAMALAR: shu ikki qatorni o'zgartiring =====
const EDIT_PASS = 'TAHRIRLASH-PAROLINI-YOZING';  // yuklash va o'zgartirish uchun (majburiy)
const VIEW_PASS = '';                              // faqat ko'rish uchun; bo'sh qoldirsangiz ko'rish hammaga ochiq
// =====================================================

const SHEET_DAYS = 'Yozuvlar';
const SHEET_SET = 'Sozlamalar';
const HEAD = ['Sana', 'Tur', 'Model', 'Detal / joy', 'Nuqson', 'Qiymat', 'Smena', 'PONO', 'Maydon', 'Qism', 'Fayl', 'Sex'];

function doGet() {
  return out_({ ok: true, info: 'Xaridor Sifat Paneli API' });
}

function doPost(e) {
  try {
    const q = JSON.parse(e.postData.contents);
    const role = roleOf_(q.pw);
    if (!role) return out_({ error: 'auth' });
    if (q.action === 'load') return out_(loadAll_(role));
    if (role !== 'edit') return out_({ error: "Faqat ko'rish huquqi" });
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (q.action === 'saveDay') saveDays_([q.doc]);
      else if (q.action === 'saveDays') saveDays_(q.docs);
      else if (q.action === 'saveTargets') setSetting_('target:' + q.ym, JSON.stringify({ ym: q.ym, v: q.v }));
      else if (q.action === 'saveRules') setSetting_('rules', String(q.txt || ''));
      else return out_({ error: 'noma\'lum amal' });
    } finally {
      lock.releaseLock();
    }
    return out_({ ok: true });
  } catch (err) {
    return out_({ error: String(err && err.message || err) });
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function roleOf_(pw) {
  pw = String(pw || '');
  if (EDIT_PASS && pw === EDIT_PASS) return 'edit';
  if (VIEW_PASS === '' || pw === VIEW_PASS) return 'view';
  return null;
}

function sheet_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
    if (name === SHEET_DAYS) sh.getRange('A:A').setNumberFormat('@'); // sana matn bo'lib qolsin
    if (name === SHEET_SET) sh.getRange('A:B').setNumberFormat('@');
  }
  return sh;
}

function dateStr_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v || '').slice(0, 10);
}

function readRows_() {
  const sh = sheet_(SHEET_DAYS, HEAD);
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, HEAD.length).getValues().filter(function (r) { return r[0] !== ''; });
}

function loadAll_(role) {
  const days = {};
  readRows_().forEach(function (r) {
    const date = dateStr_(r[0]);
    const d = days[date] || (days[date] = { date: date, name: String(r[10] || ''), g: [], l: [], r: [], dl: [] });
    const type = r[1], m = String(r[2]), desc = String(r[3]), f = String(r[4]), val = Number(r[5]) || 0, sh = String(r[6] || '');
    if (type === 'GCA') d.g.push({ m: m, a: String(r[8] || ''), p: String(r[9] || ''), d: desc, f: f, w: val, po: String(r[7] || ''), sh: sh, sx: String(r[11] || '') });
    else if (type === 'DRR') d.r.push({ m: m, d: desc, f: f, q: val, sh: sh, sx: String(r[11] || '') });
  });
  const targets = {};
  let rules = '';
  const st = sheet_(SHEET_SET, ['Kalit', 'Qiymat']);
  const n = st.getLastRow() - 1;
  if (n > 0) {
    st.getRange(2, 1, n, 2).getValues().forEach(function (r) {
      const k = String(r[0]);
      if (k === 'rules') rules = String(r[1]);
      else if (k.indexOf('target:') === 0) { try { targets[k.slice(7)] = JSON.parse(r[1]); } catch (e) {} }
    });
  }
  return { role: role, days: days, targets: targets, rules: rules };
}

function saveDays_(docs) {
  if (!docs || !docs.length) throw new Error("Hujjat yo'q");
  const dates = {}, add = [];
  docs.forEach(function (doc) {
    if (!doc || !/^\d{4}-\d{2}-\d{2}$/.test(doc.date)) throw new Error("Sana noto'g'ri");
    const date = doc.date, name = String(doc.name || '');
    dates[date] = true;
    (doc.g || []).forEach(function (x) { add.push([date, 'GCA', x.m, x.d, x.f, x.w, x.sh, x.po, x.a, x.p, name, x.sx || '']); });
    (doc.r || []).forEach(function (x) { add.push([date, 'DRR', x.m, x.d, x.f, x.q, x.sh, '', '', '', name, x.sx || '']); });
  });
  const sh = sheet_(SHEET_DAYS, HEAD);
  // mavjud qatorlar: shu kunlar va (kerak bo'lmagan) DRL / Line Stop qatorlari tashlanadi
  const keep = readRows_().filter(function (r) {
    return !dates[dateStr_(r[0])] && (r[1] === 'GCA' || r[1] === 'DRR');
  }).map(function (r) { r[0] = dateStr_(r[0]); return r; });
  const all = keep.concat(add).sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; });
  sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight('bold');
  const oldN = sh.getLastRow() - 1;
  if (oldN > 0) sh.getRange(2, 1, oldN, HEAD.length).clearContent();
  if (all.length) {
    sh.getRange(2, 1, all.length, 1).setNumberFormat('@');
    sh.getRange(2, 1, all.length, HEAD.length).setValues(all);
  }
}

function setSetting_(key, value) {
  const st = sheet_(SHEET_SET, ['Kalit', 'Qiymat']);
  const n = st.getLastRow() - 1;
  if (n > 0) {
    const keys = st.getRange(2, 1, n, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (String(keys[i][0]) === key) { st.getRange(i + 2, 2).setValue(value); return; }
    }
  }
  st.getRange(n > 0 ? n + 2 : 2, 1, 1, 2).setValues([[key, value]]);
}
