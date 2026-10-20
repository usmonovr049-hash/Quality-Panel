# Xaridor Sifat Paneli

Xaridorning kunlik Daily_report (Excel) hisobotlaridan oylik panel. Sahifa GitHub Pages'da turadi, ma'lumot Google Sheets jadvalida saqlanadi. Yuklash va ko'rishda Claude ishlamaydi, hech kimning tokeni sarflanmaydi.

Fayllar:
- `index.html` — panelning o'zi
- `logo.png` — logotip
- `Code.gs` — Google Apps Script kodi (GitHub'ga yuklash shart emas; u Google jadvaliga qo'yiladi)

## 1-bosqich. Google jadval va Apps Script (taxminan 5 daqiqa)

1. Panel egasi hisobida yangi Google Sheets jadval oching (masalan, «Xaridor sifat ma'lumotlari»).
2. Menyudan **Extensions → Apps Script** ni tanlang.
3. Ochilgan muharrirdagi hamma kodni o'chiring va `Code.gs` ichidagisini qo'ying.
4. Kodning tepasidagi `EDIT_PASS` ga o'zingizning tahrirlash parolingizni yozing. Ko'rish uchun alohida parol kerak bo'lsa, `VIEW_PASS` ga yozing. Bo'sh qolsa, ko'rish hammaga ochiq (faqat havola bilgan odamga).
5. Saqlang (disk belgisi), keyin **Deploy → New deployment → Select type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
6. **Deploy** ni bosing, Google ruxsat so'raydi (**Authorize access**). Xavfsizlik ogohlantirishi chiqsa: **Advanced → Go to ... (unsafe) → Allow**. Bu o'z kodingiz, shuning uchun xavfsiz.
7. Chiqqan **Web app URL** ni nusxalang (`https://script.google.com/macros/s/.../exec`).

Parol faqat Google'dagi kodda turadi, GitHub'ga tushmaydi.

## 2-bosqich. GitHub

1. Panel egasi hisobida yangi repo oching (masalan, `sifat-paneli`). Bepul Pages uchun repo **Public** bo'lishi kerak.
2. `index.html` faylini oching va ichidagi
   `const API_URL='YOUR_APPS_SCRIPT_URL';`
   qatoriga 1-bosqichda nusxalangan havolani yozing.
3. `index.html` va `logo.png` ni repoga yuklang (**Add file → Upload files**).
4. **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main, / (root) → Save**.
5. 1–2 daqiqadan keyin sahifa `https://<akkaunt>.github.io/sifat-paneli/` manzilida ochiladi.

## Har kungi ish

1. Sahifani oching, parolni kiriting (brauzer eslab qoladi).
2. Kelgan `Daily_report_kk.oo.yyyy.xlsx` faylini «Hisobot yuklash» maydoniga tashlang.
3. Yashil «✓» chiqsa tayyor. Ma'lumot Google jadvalning «Yozuvlar» varag'iga ham yoziladi, uni jadvalda ham ko'rish va tahrirlash mumkin.

Hisobot fayli modellarga (Onix, Cobalt, Tracker) va DRR bo'limlariga bo'lingan holda keladi. Sex nomi har qatorning **P ustunidan** olinadi (kalit so'z qoidalari yo'q). P ustuni bo'sh eski kunlarda sex «belgilanmagan» bo'ladi, ularni yangi fayl bilan qayta yuklash mumkin.

Targetlar yillik, oyma-oy va model kesimida kiritiladi (Target bo'limi). Limitdan oshish foizda emas, son bilan ko'rsatiladi.

Bir sanaga ikkinchi marta yuklansa, o'sha kunning eski ma'lumoti almashadi. Faylni yuklab bo'lgach, boshqa odamlar sahifada «Yangilash»ni bosib yangi ma'lumotni ko'radi (sahifa 5 daqiqada o'zi ham yangilanadi).

## Parol va ruxsatlar

- `EDIT_PASS` bilan kirgan odam yuklay oladi, targetlarni o'zgartira oladi.
- `VIEW_PASS` bilan (yoki u bo'sh bo'lsa, parolsiz) faqat ko'rish mumkin.
- Parolni o'zgartirsangiz, Apps Script'da **Deploy → Manage deployments → Edit → New version → Deploy** qiling.
- Kodni o'zgartirganda ham shunday: yangi versiyani deploy qilmasangiz, eski kod ishlayveradi.

## Muammolar

- «API_URL sozlanmagan»: `index.html` ichiga havola yozilmagan.
- «Parol noto'g'ri»: `EDIT_PASS`/`VIEW_PASS` ni tekshiring.
- «Ma'lumotni olib bo'lmadi»: Apps Script'da Who has access = **Anyone** ekanini va oxirgi versiya deploy qilinganini tekshiring.
- Fayl yuklanganda qizil xabar chiqsa, xabarni yozib yuboring: hisobot tuzilishi o'zgargan bo'lishi mumkin.
