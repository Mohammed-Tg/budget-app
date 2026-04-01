# Budget App

ميزانيتك بطريقة بسيطة ومرنة.

## نظرة عامة

مشروع ميزانيات شخصي يتضمن:
- واجهة خلفية `FastAPI` مع `SQLModel` و `Alembic`
- واجهة أمامية `Next.js` داخل `budget-frontend`
- مصادقة JWT لتأمين النقاط النهائية
- إدارة المصروفات والإيرادات وتلخيص الميزانية

## تشغيل المشروع

1. إنشاء وتفعيل البيئة الافتراضية

```bash
python -m venv .venv
source .venv/bin/activate    # Linux / macOS
.\.venv\Scripts\activate   # Windows
```

2. تثبيت التبعيات

```bash
python -m pip install --upgrade pip
python -m pip install poetry
poetry install
```

3. إعداد المتغيرات البيئية

انشئ ملف `.env` في جذر المشروع وعيّن المتغيرات المطلوبة مثل `DATABASE_URL` و `SECRET_KEY`.

4. ترحيل المخطط باستخدام Alembic

```bash
poetry run alembic upgrade head
```

5. تشغيل الواجهة الخلفية

```bash
poetry run uvicorn app.main:app --reload
```

6. تشغيل الواجهة الأمامية

```bash
cd budget-frontend
npm install
npm run dev
```

## قاعدة البيانات والتخطيط

تعتمد إدارة المخطط هنا على Alembic. لا يتم استخدام `SQLModel.metadata.create_all()` في مسار التشغيل العادي للواجهة الخلفية.

## الاختبارات

لتشغيل اختبارات الواجهة الخلفية:

```bash
poetry run pytest tests -q
```

## ملاحظات

- تم الاعتماد على `EmailStr` للتحقق من البريد الإلكتروني بالاعتماد على `pydantic`.
- يتم الآن تشغيل حدث `authchange` بعد تسجيل الدخول لتحديث حالة المصادقة في الواجهة الأمامية بسرعة.
- يتم عزل اختبارات SQLite داخليًا باستخدام قاعدة بيانات في الذاكرة وعمليات إعادة إنشاء المخطط لكل اختبار.
