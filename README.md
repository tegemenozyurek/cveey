# cveey

CV / resume platformu: özgeçmiş oluşturma ve yükleme, profil, yetenek havuzu, ağ bağlantıları. React + Vite SPA; backend olarak Firebase (Auth, Firestore, Storage, Analytics, Functions).

Canlı site: [https://cveey-a7faa.web.app](https://cveey-a7faa.web.app)

## Stack

- React 19, Vite 8, React Router
- Firebase Auth (e-posta/şifre, Google, GitHub), Firestore, Storage
- Google AdSense (onaylı çerez banner’ı ile)
- TR / EN arayüz

## Kurulum

```bash
npm install
cp .env.example .env   # gerekirse AdSense değişkenlerini doldur
npm run dev
```

Yerel geliştirmede reklamlar için `.env` içinde `VITE_ADS_ENABLED=false` bırakmak güvenlidir.

## Scripts

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim build → `dist/` |
| `npm run preview` | Build’i yerel önizle |
| `npm run lint` | Oxlint |
| `npm run firebase:login` | Firebase CLI oturumu |
| `npm run firebase:deploy:rules` | Yalnızca Firestore rules |
| `npm run firebase:deploy:storage` | Yalnızca Storage rules |
| `npm run storage:cors` | Storage CORS (`cors.json`) uygula |
| `npm run firebase:deploy:hosting` | Yalnızca Hosting (`dist/`) |

Cloud Functions için `functions/` klasörüne bakın.

## Firebase Hosting (hazırlık)

Hosting, **yalnızca** `dist/` klasörünü yayınlar. Repo kökünü (`"."`) veya `public/` kaynak klasörünü hosting `public` olarak kullanmayın; aksi halde `README.md` ve kaynak dosyalar siteye çıkar (sık yapılan hata).

Yayın öncesi:

```bash
npm run build
# dist içinde README olmamalı; index.html + assets olmalı
npm run firebase:deploy:hosting   # bunu bilerek, ayrı bir adımda çalıştırın
```

SPA rotaları (`/privacy`, `/terms`, `/profile/:uid`, …) için `firebase.json` içinde `**` → `/index.html` rewrite tanımlıdır.

## Yasal sayfalar

- Gizlilik: `/privacy`
- Kullanım şartları: `/terms`

Metinler `src/i18n/translations.js` içinde TR/EN.
