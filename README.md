# חבר מחויבות - Admin Dashboard

מערכת ניהול מתקדמת לאפליקציית חבר מחויבות. דשבורד אדמין מקיף לניהול משתמשים, קבוצות, סטטיסטיקות והתראות.

## תכונות עיקריות

### 🏠 דשבורד ראשי
- סקירה כללית של KPIs
- פעילות אחרונה
- קבוצות פופולריות

### 👥 ניהול משתמשים
- טבלת משתמשים עם חיפוש וסינון
- עריכת פרטי משתמש
- ניהול הרשאות ותפקידים
- חסימת/ביטול חסימת משתמשים

### 📊 ניהול קבוצות
- צפייה בכל הקבוצות
- ניהול חברי קבוצה
- סטטיסטיקות קבוצה
- סינון לפי קטגוריה וסטטוס

### 📈 סטטיסטיקות ואנליטיקה
- גרפי צמיחת משתמשים
- נתוני Check-ins יומיים
- התפלגות קטגוריות
- Top 10 משתמשים וקבוצות

### 🔔 ניהול התראות
- שליחת התראות כלליות
- התראות לקבוצות ספציפיות
- התראות למשתמשים בודדים
- היסטוריית התראות

### ⚙️ הגדרות מערכת
- הגדרות כלליות
- ניהול קטגוריות
- תנאי שימוש ומדיניות פרטיות
- הודעות ברירת מחדל

## טכנולוגיות

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Lucide React Icons
- **Charts**: Recharts
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth

## התקנה והפעלה

1. **שכפול הפרויקט**
```bash
git clone <repository-url>
cd chaver-mechuyvut-dashboard
```

2. **התקנת תלויות**
```bash
npm install
```

3. **הגדרת משתני סביבה**
```bash
cp .env.example .env.local
```
ערוך את קובץ `.env.local` והוסף את פרטי Firebase שלך.

4. **הפעלת שרת הפיתוח**
```bash
npm run dev
```

5. **פתח בדפדפן**
גש ל-[http://localhost:3000](http://localhost:3000)

## מבנה הפרויקט

```
app/
├── admin/
│   ├── dashboard/          # דף דשבורד ראשי
│   ├── users/             # ניהול משתמשים
│   ├── groups/            # ניהול קבוצות
│   ├── stats/             # סטטיסטיקות
│   ├── notifications/     # ניהול התראות
│   ├── settings/          # הגדרות מערכת
│   └── layout.tsx         # לייאאוט אדמין
├── components/
│   └── Sidebar.tsx        # תפריט ניווט
├── lib/
│   └── firebase.ts        # הגדרות Firebase
└── page.tsx               # דף בית
```

## הגדרת Firebase

1. צור פרויקט חדש ב-[Firebase Console](https://console.firebase.google.com)
2. הפעל Firestore Database
3. הפעל Authentication
4. העתק את פרטי הקונפיגורציה לקובץ `.env.local`

## מבנה Firestore נדרש

```
collections:
├── users
│   ├── role: string
│   ├── permissions: array
│   └── isBlocked: boolean
├── groups
├── group_members
├── daily_checkins
├── notifications
├── admin_logs
├── reports
└── system_settings
```

## פיתוח

הפרויקט בנוי עם Next.js 14 ו-App Router. כל דף הוא Server Component עם Client Components לאינטראקטיביות.

### הוספת דף חדש
1. צור תיקייה חדשה תחת `app/admin/`
2. הוסף `page.tsx`
3. עדכן את התפריט ב-`Sidebar.tsx`

### הוספת רכיב חדש
1. צור קובץ ב-`app/components/`
2. ייצא כ-default export
3. השתמש ברכיב בדפים הרלוונטיים

## פריסה

הפרויקט מוכן לפריסה ב-Vercel:

1. חבר את הריפוזיטורי ל-Vercel
2. הוסף את משתני הסביבה
3. פרוס

## תמיכה

לשאלות ותמיכה, פנה למפתח הפרויקט.
