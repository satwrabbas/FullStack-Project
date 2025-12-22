ALTER TABLE public.units
ADD COLUMN subject_id UUID;

-- ثانيًا، أضف قيد المفتاح الأجنبي (The Foreign Key Constraint)
ALTER TABLE public.units
ADD CONSTRAINT units_subject_id_fkey -- هذا مجرد اسم وصفي للقيد
FOREIGN KEY (subject_id)
REFERENCES public.subjects (id)
ON DELETE CASCADE; -- تحديد الإجراء عند الحذف

-- استخدام جملة WITH لتقسيم العملية إلى خطوات منطقية ومترابطة

WITH new_subject AS (
  -- الخطوة 1: إدخال المادة الدراسية "الفيزياء" والحصول على الـ ID الجديد الخاص بها
  INSERT INTO public.subjects (name)
  VALUES ('الفيزياء')
  RETURNING id
),
new_units AS (
  -- الخطوة 2: إدخال كل الوحدات وربطها بالـ ID الخاص بالفيزياء من الخطوة السابقة
  INSERT INTO public.units (title, subject_id, "order")
  VALUES
    ('الوحدة الأولى: الحركة والتحريك', (SELECT id FROM new_subject), 1),
    ('الوحدة الثانية: الكهرباء والمغناطيسية', (SELECT id FROM new_subject), 2),
    ('الوحدة الثالثة: الأمواج المستقرة', (SELECT id FROM new_subject), 3),
    ('الوحدة الرابعة: الإلكترونيات والجسم الصلب', (SELECT id FROM new_subject), 4),
    ('الوحدة الخامسة: الفيزياء الفلكية', (SELECT id FROM new_subject), 5)
  RETURNING id, title
)
-- الخطوة 3: إدخال جميع الدروس، وربط كل درس بالـ ID الخاص بالوحدة المناسبة
INSERT INTO public.lessons (title, xp_value, unit_id, "order")
SELECT
    lesson_title,
    xp,
    new_units.id,
    lesson_order
FROM (
  VALUES
    -- دروس الوحدة الأولى
    ('الحركة التوافقية البسيطة', 150, 'الوحدة الأولى: الحركة والتحريك', 1),
    ('الاهتزازات الجيبية الدورانية', 100, 'الوحدة الأولى: الحركة والتحريك', 2),
    ('نواس الفتل غير المتخامد', 125, 'الوحدة الأولى: الحركة والتحريك', 3),
    ('النواس الثقلي غير المتخامد', 125, 'الوحدة الأولى: الحركة والتحريك', 4),
    ('ميكانيك الموائع', 175, 'الوحدة الأولى: الحركة والتحريك', 5),
    ('النسبية الخاصة', 200, 'الوحدة الأولى: الحركة والتحريك', 6),
    -- دروس الوحدة الثانية
    ('المغناطيسية', 100, 'الوحدة الثانية: الكهرباء والمغناطيسية', 1),
    ('فعل الحقل المغناطيسي في التيار الكهربائي', 150, 'الوحدة الثانية: الكهرباء والمغناطيسية', 2),
    ('التحريض الكهرطيسي', 175, 'الوحدة الثانية: الكهرباء والمغناطيسية', 3),
    ('الدارات المهتزة والتيارات عالية التواتر', 150, 'الوحدة الثانية: الكهرباء والمغناطيسية', 4),
    ('التيار المتناوب', 125, 'الوحدة الثانية: الكهرباء والمغناطيسية', 5),
    ('المحولة الكهربائية', 100, 'الوحدة الثانية: الكهرباء والمغناطيسية', 6),
    -- دروس الوحدة الثالثة
    ('الأمواج المستقرة العرضية', 150, 'الوحدة الثالثة: الأمواج المستقرة', 1),
    ('الأمواج المستقرة الطولية', 150, 'الوحدة الثالثة: الأمواج المستقرة', 2),
    -- دروس الوحدة الرابعة
    ('النماذج الذرية والطيوف', 125, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 1),
    ('انتزاع الإلكترونات وتسريعها', 150, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 2),
    ('الأشعة المهبطية', 100, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 3),
    ('الفعل الكهروحراري', 125, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 4),
    ('نظرية الكم والمفعول الكهروضوئي', 200, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 5),
    ('الأشعة السينية', 150, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 6),
    ('أشعة الليزر', 175, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 7),
    -- دروس الوحدة الخامسة
    ('مقدمة في الفيزياء الفلكية', 150, 'الوحدة الخامسة: الفيزياء الفلكية', 1),
    ('دورة حياة النجوم والمجرات', 200, 'الوحدة الخامسة: الفيزياء الفلكية', 2),
    ('نشأة الكون وتوسعه', 250, 'الوحدة الخامسة: الفيزياء الفلكية', 3)
) AS v (lesson_title, xp, unit_title, lesson_order)
JOIN new_units ON v.unit_title = new_units.title;

-- أخيراً، إدخال بيانات الإنجازات (هذه العملية منفصلة)
INSERT INTO public.achievements (id, title, description, unlocked)
VALUES
  ('first_spark', 'شرارة المعرفة', 'أنهيت أول درس فيزياء لك. بداية ممتازة!', false),
  ('five_lessons', 'الفيزيائي الناشئ', 'أكملت 5 دروس بنجاح. قوة الدفع تتزايد!', false),
  ('ten_lessons', 'باحث مجتهد', 'أكملت 10 دروس! استمر في استكشاف قوانين الكون.', false),
  ('first_note', 'الملاحظ الدقيق', 'كتبت أول ملاحظة لك. الملاحظة مفتاح الاكتشافات العلمية.', false),
  ('unit1_conqueror', 'سيد الحركة', 'أتقنت وحدة الحركة والتحريك.', false),
  ('unit2_conqueror', 'عبقري الكهرومغناطيسية', 'أتقنت وحدة الكهرباء والمغناطيسية.', false),
  ('unit3_conqueror', 'خبير الأمواج', 'أتقنت وحدة الأمواج المستقرة.', false),
  ('unit4_conqueror', 'رائد الكوانتم', 'أتقنت وحدة الإلكترونيات والجسم الصلب.', false),
  ('unit5_conqueror', 'مستكشف الفضاء', 'أتقنت وحدة الفيزياء الفلكية.', false),
  ('halfway', 'في منتصف الرحلة', 'وصلت إلى 50% من رحلتك الفيزيائية! أنت رائع!', false),
  ('expert', 'خبير الفيزياء', 'أكملت جميع دروس الفيزياء بنجاح! لقد كشفت أسرار الكون!', false);


  
  DELETE FROM public.lessons;
DELETE FROM public.units;
DELETE FROM public.subjects;
DELETE FROM public.achievements;


-- الخطوة 1: احذف من الجداول التي لديها مفاتيح أجنبية (الجداول الابنة)
DELETE FROM public.user_achievements;
DELETE FROM public.user_lesson_progress;

-- الخطوة 2: احذف الدروس
DELETE FROM public.lessons;

-- الخطوة 3: احذف الوحدات
DELETE FROM public.units;

-- الخطوة 4: الآن يمكنك حذف المواد والإنجازات بأمان
DELETE FROM public.subjects;
DELETE FROM public.achievements;


SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';


SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'lessons';


SELECT * FROM public.units;





SELECT
  -- معلومات العمود الأساسية
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,

  -- التحقق مما إذا كان العمود مفتاحًا أساسيًا (Primary Key)
  CASE
    WHEN tc.constraint_type = 'PRIMARY KEY' THEN 'YES'
    ELSE ''
  END AS is_primary_key,

  -- الحصول على معلومات المفتاح الأجنبي (Foreign Key) إن وجدت
  CASE
    WHEN tc.constraint_type = 'FOREIGN KEY' THEN
      'REFERENCES ' || ccu.table_name || '(' || ccu.column_name || ')'
    ELSE ''
  END AS foreign_key_info

FROM
  -- نبدأ من جدول الأعمدة الرئيسي
  information_schema.columns AS c

LEFT JOIN
  -- نربطه بجدول استخدام الأعمدة في القيود لمعرفة أي عمود مرتبط بأي قيد
  information_schema.key_column_usage AS kcu
  ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name AND c.table_schema = kcu.table_schema

LEFT JOIN
  -- نربطه بجدول القيود لمعرفة نوع القيد (أساسي أم أجنبي)
  information_schema.table_constraints AS tc
  ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema

LEFT JOIN
  -- نربطه بجدول استخدام قيود الأعمدة لمعرفة إلى أين يشير المفتاح الأجنبي
  information_schema.constraint_column_usage AS ccu
  ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema

WHERE
  -- نحدد أننا نريد فقط الجداول في الـ schema العامة
  c.table_schema = 'public'
  -- نستثني بعض الجداول التي ينشئها Supabase داخلياً وليست جزءاً من تصميمنا
  AND c.table_name NOT LIKE 'pg_%'
  AND c.table_name NOT LIKE 'sql_%'

ORDER BY
  -- نرتب النتائج حسب اسم الجدول ثم ترتيب العمود داخل الجدول
  c.table_name, c.ordinal_position;


  

  -- ========= إصلاح جدول achievements =========

-- 1. إزالة القيم الافتراضية الخاطئة
ALTER TABLE public.achievements
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN title DROP DEFAULT;

-- 2. إضافة عمود "unlocked" الناقص وتحديد قيمته الافتراضية
ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS unlocked BOOLEAN NOT NULL DEFAULT FALSE;


-- ========= إصلاح جدول lessons =========

-- 1. إزالة القيم الافتراضية الخاطئة
ALTER TABLE public.lessons
  ALTER COLUMN title DROP DEFAULT,
  ALTER COLUMN xp_value DROP DEFAULT;

-- 2. التأكد من أن كل درس يجب أن ينتمي لوحدة (جعله إجباريًا)
ALTER TABLE public.lessons
  ALTER COLUMN unit_id SET NOT NULL;


-- ========= إصلاح جدول subjects =========

-- 1. حذف عمود created_at الذي لا نريده
ALTER TABLE public.subjects
  DROP COLUMN IF EXISTS created_at;


-- ========= إصلاح جدول units =========

-- 1. إزالة القيمة الافتراضية الخطيرة من subject_id
--    (هذه القيمة كانت ستسبب أخطاء عند محاولة إدخال وحدة بدون تحديد المادة)
ALTER TABLE public.units
  ALTER COLUMN subject_id DROP DEFAULT;


-- ========= إصلاح جدول user_achievements (مهم جدًا) =========

-- 1. إزالة القيمة الافتراضية الخاطئة من user_id
ALTER TABLE public.user_achievements
  ALTER COLUMN user_id DROP DEFAULT;

-- 2. ربط user_id بجدول المستخدمين الأساسي في Supabase (هذا هو أهم إصلاح)
ALTER TABLE public.user_achievements
  ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. التأكد من أن الإنجاز يجب أن يكون مرتبطًا بإنجاز معين
ALTER TABLE public.user_achievements
  ALTER COLUMN achievement_id SET NOT NULL;


-- ========= إصلاح جدول user_lesson_progress (مهم جدًا) =========

-- 1. إعطاء عمود id قيمته الافتراضية الصحيحة لإنشاء UUID تلقائي
ALTER TABLE public.user_lesson_progress
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. إزالة القيمة الافتراضية الخاطئة من user_id
ALTER TABLE public.user_lesson_progress
  ALTER COLUMN user_id DROP DEFAULT;

-- 3. ربط user_id بجدول المستخدمين الأساسي في Supabase
ALTER TABLE public.user_lesson_progress
  ADD CONSTRAINT user_lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. جعل الأعمدة الأساسية إجبارية وتحديد قيم افتراضية منطقية
ALTER TABLE public.user_lesson_progress
  ALTER COLUMN lesson_id SET NOT NULL,
  ALTER COLUMN completed SET NOT NULL,
  ALTER COLUMN completed SET DEFAULT FALSE,
  ALTER COLUMN confidence DROP DEFAULT; -- إزالة القيمة الافتراضية للنص الفارغ


  
  -- ========= إصلاح جدول achievements =========
ALTER TABLE public.achievements
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN title DROP DEFAULT;
ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS unlocked BOOLEAN NOT NULL DEFAULT FALSE;

-- ========= إصلاح جدول lessons =========
ALTER TABLE public.lessons
  ALTER COLUMN title DROP DEFAULT,
  ALTER COLUMN xp_value DROP DEFAULT;
ALTER TABLE public.lessons
  ALTER COLUMN unit_id SET NOT NULL;

-- ========= إصلاح جدول subjects =========
ALTER TABLE public.subjects
  DROP COLUMN IF EXISTS created_at;

-- ========= إصلاح جدول units =========
ALTER TABLE public.units
  ALTER COLUMN subject_id DROP DEFAULT;

-- ========= إصلاح جدول user_achievements (النسخة المحسّنة) =========
ALTER TABLE public.user_achievements
  ALTER COLUMN user_id DROP DEFAULT;

-- أولاً: نحذف القيد القديم إذا كان موجودًا لنتجنب الخطأ
ALTER TABLE public.user_achievements
  DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;

-- ثانيًا: نُنشئ القيد الجديد والصحيح
ALTER TABLE public.user_achievements
  ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_achievements
  ALTER COLUMN achievement_id SET NOT NULL;

-- ========= إصلاح جدول user_lesson_progress (النسخة المحسّنة) =========
ALTER TABLE public.user_lesson_progress
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.user_lesson_progress
  ALTER COLUMN user_id DROP DEFAULT;

-- أولاً: نحذف القيد القديم إذا كان موجودًا لنتجنب الخطأ
ALTER TABLE public.user_lesson_progress
  DROP CONSTRAINT IF EXISTS user_lesson_progress_user_id_fkey;

-- ثانيًا: نُنشئ القيد الجديد والصحيح
ALTER TABLE public.user_lesson_progress
  ADD CONSTRAINT user_lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_lesson_progress
  ALTER COLUMN lesson_id SET NOT NULL,
  ALTER COLUMN completed SET NOT NULL,
  ALTER COLUMN completed SET DEFAULT FALSE,
  ALTER COLUMN confidence DROP DEFAULT;


  
  -- استخدام جملة WITH لتقسيم العملية إلى خطوات منطقية ومترابطة

WITH new_subject AS (
  -- الخطوة 1: إدخال المادة الدراسية "الفيزياء" والحصول على الـ ID الجديد الخاص بها
  INSERT INTO public.subjects (name)
  VALUES ('الفيزياء')
  RETURNING id
),
new_units AS (
  -- الخطوة 2: إدخال كل الوحدات وربطها بالـ ID الخاص بالفيزياء من الخطوة السابقة
  INSERT INTO public.units (title, subject_id, "order")
  VALUES
    ('الوحدة الأولى: الحركة والتحريك', (SELECT id FROM new_subject), 1),
    ('الوحدة الثانية: الكهرباء والمغناطيسية', (SELECT id FROM new_subject), 2),
    ('الوحدة الثالثة: الأمواج المستقرة', (SELECT id FROM new_subject), 3),
    ('الوحدة الرابعة: الإلكترونيات والجسم الصلب', (SELECT id FROM new_subject), 4),
    ('الوحدة الخامسة: الفيزياء الفلكية', (SELECT id FROM new_subject), 5)
  RETURNING id, title
)
-- الخطوة 3: إدخال جميع الدروس، وربط كل درس بالـ ID الخاص بالوحدة المناسبة
INSERT INTO public.lessons (title, xp_value, unit_id, "order")
SELECT
    lesson_title,
    xp,
    new_units.id,
    lesson_order
FROM (
  VALUES
    -- دروس الوحدة الأولى
    ('الحركة التوافقية البسيطة', 150, 'الوحدة الأولى: الحركة والتحريك', 1),
    ('الاهتزازات الجيبية الدورانية', 100, 'الوحدة الأولى: الحركة والتحريك', 2),
    ('نواس الفتل غير المتخامد', 125, 'الوحدة الأولى: الحركة والتحريك', 3),
    ('النواس الثقلي غير المتخامد', 125, 'الوحدة الأولى: الحركة والتحريك', 4),
    ('ميكانيك الموائع', 175, 'الوحدة الأولى: الحركة والتحريك', 5),
    ('النسبية الخاصة', 200, 'الوحدة الأولى: الحركة والتحريك', 6),
    -- دروس الوحدة الثانية
    ('المغناطيسية', 100, 'الوحدة الثانية: الكهرباء والمغناطيسية', 1),
    ('فعل الحقل المغناطيسي في التيار الكهربائي', 150, 'الوحدة الثانية: الكهرباء والمغناطيسية', 2),
    ('التحريض الكهرطيسي', 175, 'الوحدة الثانية: الكهرباء والمغناطيسية', 3),
    ('الدارات المهتزة والتيارات عالية التواتر', 150, 'الوحدة الثانية: الكهرباء والمغناطيسية', 4),
    ('التيار المتناوب', 125, 'الوحدة الثانية: الكهرباء والمغناطيسية', 5),
    ('المحولة الكهربائية', 100, 'الوحدة الثانية: الكهرباء والمغناطيسية', 6),
    -- دروس الوحدة الثالثة
    ('الأمواج المستقرة العرضية', 150, 'الوحدة الثالثة: الأمواج المستقرة', 1),
    ('الأمواج المستقرة الطولية', 150, 'الوحدة الثالثة: الأمواج المستقرة', 2),
    -- دروس الوحدة الرابعة
    ('النماذج الذرية والطيوف', 125, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 1),
    ('انتزاع الإلكترونات وتسريعها', 150, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 2),
    ('الأشعة المهبطية', 100, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 3),
    ('الفعل الكهروحراري', 125, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 4),
    ('نظرية الكم والمفعول الكهروضوئي', 200, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 5),
    ('الأشعة السينية', 150, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 6),
    ('أشعة الليزر', 175, 'الوحدة الرابعة: الإلكترونيات والجسم الصلب', 7),
    -- دروس الوحدة الخامسة
    ('مقدمة في الفيزياء الفلكية', 150, 'الوحدة الخامسة: الفيزياء الفلكية', 1),
    ('دورة حياة النجوم والمجرات', 200, 'الوحدة الخامسة: الفيزياء الفلكية', 2),
    ('نشأة الكون وتوسعه', 250, 'الوحدة الخامسة: الفيزياء الفلكية', 3)
) AS v (lesson_title, xp, unit_title, lesson_order)
JOIN new_units ON v.unit_title = new_units.title;

-- أخيراً، إدخال بيانات الإنجازات (هذه العملية منفصلة)
INSERT INTO public.achievements (id, title, description, unlocked)
VALUES
  ('first_spark', 'شرارة المعرفة', 'أنهيت أول درس فيزياء لك. بداية ممتازة!', false),
  ('five_lessons', 'الفيزيائي الناشئ', 'أكملت 5 دروس بنجاح. قوة الدفع تتزايد!', false),
  ('ten_lessons', 'باحث مجتهد', 'أكملت 10 دروس! استمر في استكشاف قوانين الكون.', false),
  ('first_note', 'الملاحظ الدقيق', 'كتبت أول ملاحظة لك. الملاحظة مفتاح الاكتشافات العلمية.', false),
  ('unit1_conqueror', 'سيد الحركة', 'أتقنت وحدة الحركة والتحريك.', false),
  ('unit2_conqueror', 'عبقري الكهرومغناطيسية', 'أتقنت وحدة الكهرباء والمغناطيسية.', false),
  ('unit3_conqueror', 'خبير الأمواج', 'أتقنت وحدة الأمواج المستقرة.', false),
  ('unit4_conqueror', 'رائد الكوانتم', 'أتقنت وحدة الإلكترونيات والجسم الصلب.', false),
  ('unit5_conqueror', 'مستكشف الفضاء', 'أتقنت وحدة الفيزياء الفلكية.', false),
  ('halfway', 'في منتصف الرحلة', 'وصلت إلى 50% من رحلتك الفيزيائية! أنت رائع!', false),
  ('expert', 'خبير الفيزياء', 'أكملت جميع دروس الفيزياء بنجاح! لقد كشفت أسرار الكون!', false);



  
  -- ========= جدول subjects (المواد) =========
-- 1. تفعيل RLS على الجدول
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
-- 2. إنشاء سياسة تسمح للجميع بالقراءة
CREATE POLICY "Allow public read access to subjects"
ON public.subjects
FOR SELECT
USING (true);


-- ========= جدول units (الوحدات) =========
-- 1. تفعيل RLS على الجدول
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
-- 2. إنشاء سياسة تسمح للجميع بالقراءة
CREATE POLICY "Allow public read access to units"
ON public.units
FOR SELECT
USING (true);


-- ========= جدول lessons (الدروس) =========
-- 1. تفعيل RLS على الجدول
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
-- 2. إنشاء سياسة تسمح للجميع بالقراءة
CREATE POLICY "Allow public read access to lessons"
ON public.lessons
FOR SELECT
USING (true);


-- ========= جدول achievements (الإنجازات) =========
-- 1. تفعيل RLS على الجدول
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
-- 2. إنشاء سياسة تسمح للجميع بالقراءة
CREATE POLICY "Allow public read access to achievements"
ON public.achievements
FOR SELECT
USING (true);


-- !! مثال غير آمن - لا تستخدمه كما هو !!
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "UNSAFE - Allow public read access to all user progress"
ON public.user_lesson_progress
FOR SELECT
USING (true);


-- ========= جدول user_lesson_progress (تقدم المستخدم في الدروس) =========
-- 1. تفعيل RLS على الجدول
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- 2. إنشاء سياسة آمنة: يمكن للمستخدمين قراءة بيانات تقدمهم فقط
CREATE POLICY "Users can read their own lesson progress"
ON public.user_lesson_progress
FOR SELECT
USING (auth.uid() = user_id); -- الشرط: معرّف المستخدم الحالي يجب أن يطابق المعرّف في الصف


-- ========= جدول user_achievements (إنجازات المستخدم) =========
-- 1. تفعيل RLS على الجدول
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- 2. إنشاء سياسة آمنة: يمكن للمستخدمين قراءة إنجازاتهم فقط
CREATE POLICY "Users can read their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id); -- نفس الشرط السحري