# כל-זכות × AI

אתר הצגה: בדיקת GEO/SEO לאתר כל-זכות, ניתוח הצ'טבוט, דמו של בוט משופר ותוכנית ל-90 יום.

- **אתר חי:** https://kolzchut-geo.vercel.app
- **נבדק:** 15 באוקטובר 2026
- עבודה עצמאית, לא מטעם כל-זכות.

## מבנה
- `index.html` - כל האתר בקובץ אחד (HTML, CSS, JS), בלי build.
- `robots.txt`
- `test/check.mjs` - בדיקות נגישות (axe, WCAG 2.1 AA), גלישה רוחבית במובייל ודמו אינטראקטיבי.

## הרצת בדיקות
```bash
npm i -D playwright @axe-core/playwright
npx playwright install chromium
node test/check.mjs
```

## פרסום
Vercel, פרויקט `kolzchut-geo`, ללא framework (קובץ סטטי).
