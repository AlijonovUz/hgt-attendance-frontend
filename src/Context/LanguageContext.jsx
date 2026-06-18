import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(undefined);

export const translations = {
     // frequently used words
     add: {
          uz: "Qo'shish",
          cy: "Қўшиш",
          en: "Add",
          ru: "Добавить"
     },
     delate: {
          uz: "O‘chirish",
          cy: "Ўчириш",
          en: "Delete",
          ru: "Удалить"
     },
     clear: {
          uz: "Tozalash",
          cy: "Тозалаш",
          en: "Cleaning",
          ru: "Очистка"
     },
     edit: {
          uz: "Tahrirlash",
          cy: "Таҳрирлаш",
          en: "Edit",
          ru: "Редактировать"
     },
     select: {
          uz: "Tanlash",
          cy: "Танлаш",
          en: "Selection",
          ru: "Выбор"
     },
     search: {
          uz: "Qidirish",
          cy: "Қидириш",
          en: "Search",
          ru: "Поиск"
     },
     date: {
          uz: "Sana",
          cy: "Сана",
          en: "Date",
          ru: "Дата"
     },
     selectDate: {
          uz: "Sana tanlash",
          cy: "Сана танлаш",
          en: "Select date",
          ru: "Выберите дату"
     },
     no_data_found: {
          uz: "Ma'lumot topilmadi",
          cy: "Маълумот топилмади",
          en: "No data found",
          ru: "Данные не найдены"
     },
     filter: {
          uz: "Filter",
          cy: "Филтер",
          en: "Filter",
          ru: "Фильтр"
     },
     filter_title: {
          uz: "Filtrlash",
          cy: "Филтрлаш",
          en: "Filtr",
          ru: "Фильтровать"
     },
     filter_subtitle: {
          uz: "Kerakli filtrlarni tanlang, natijalar shunga qarab saralanadi",
          cy: "Керакли фильтрларни танланг, натижалар шунга қараб сараланади",
          en: "Select the filters you want, and we'll sort the results accordingly",
          ru: "Выберите нужные фильтры, чтобы результаты были отсортированы по ним"
     },
     click_to_select: {
          uz: "Belgilash uchun bosing",
          cy: "Белгилаш учун босинг",
          en: "Click to select",
          ru: "Нажмите для выбора"
     },
     full_name: {
          uz: "Ism familiya",
          cy: "Исм фамилия",
          en: "First and last name",
          ru: "Имя и фамилия"
     },
     status: {
          uz: "Holati",
          cy: "Ҳолати",
          en: "Status",
          ru: "Статус"
     },
     select_status: {
          uz: "Holatini tanlang",
          cy: "Ҳолатини танланг",
          en: "Select status",
          ru: "Выберите статус"
     },
     status_present: {
          uz: "Kelgan",
          cy: "Келган",
          en: "Present",
          ru: "Присутствовал"
     },
     status_absent: {
          uz: "Kelmagan",
          cy: "Келмаган",
          en: "Absent",
          ru: "Отсутствовал"
     },
     status_late: {
          uz: "Kech kelgan",
          cy: "Кеч келган",
          en: "Late",
          ru: "Опоздал"
     },
     select_region_first: {
          uz: "Avval viloyat tanlang",
          cy: "Аввал вилоят танланг",
          en: "Select a region first",
          ru: "Сначала выберите регион"
     },
     loading: {
          uz: "Yuklanmoqda...",
          cy: "Юкланмоқда...",
          en: "Loading...",
          ru: "Загрузка..."
     },

     region: {
          uz: "Viloyat",
          cy: "Вилоят",
          en: "Region",
          ru: "Область"
     },
     district: {
          uz: "Tuman",
          cy: "Туман",
          en: "District",
          ru: "Район"
     },
     position: {
          uz: "Lavozim",
          cy: "Лавозим",
          en: "Position",
          ru: "Должность"
     },
     department: {
          uz: "Bo'lim",
          cy: "Бўлим",
          en: "Department",
          ru: "Отдел"
     },
     phone: {
          uz: "Telefon",
          cy: "Телефон",
          en: "Phone",
          ru: "Телефон"
     },


     // login page
     login_title: {
          uz: "Tizimga kirish",
          cy: "Тизимга кириш",
          en: "System Login",
          ru: "Вход в систему"
     },
     login_subtitle: {
          uz: "Davomatni qayd etish uchun hisobingizga kiring",
          cy: "Давоматни қайд этиш учун ҳисобингизга киринг",
          en: "Log in to your account to record attendance",
          ru: "Войдите в свою учетную запись для записи посещаемости"
     },
     login_label: {
          uz: "Login",
          cy: "Логин",
          en: "Login",
          ru: "Логин"
     },
     password_label: {
          uz: "Parol",
          cy: "Пароль",
          en: "Password",
          ru: "Пароль"
     },
     login_btn: {
          uz: "Kirish",
          cy: "Кириш",
          en: "Login",
          ru: "Войти"
     },
     login_empty_error: {
          uz: "* Login yoki parolni kiritmadingiz.",
          cy: "* Логин ёки паролни киритмадингиз.",
          en: "* You did not enter login or password.",
          ru: "* Вы не ввели логин или пароль."
     },
     login_incorrect_error: {
          uz: "* Login yoki parol noto'g'ri. Yana {n} marta urinish mumkin.",
          cy: "* Логин ёки парол нотўғри. Яна {n} марта уриниш мумкин.",
          en: "* Incorrect login or password. {n} attempts remaining.",
          ru: "* Неверный логин или пароль. Осталось попыток: {n}."
     },
     account_blocked_title: {
          uz: "Hisob vaqtincha bloklandi",
          cy: "Ҳисоб вақтинча блокланди",
          en: "Account temporarily blocked",
          ru: "Аккаунт временно заблокирован"
     },
     account_blocked_desc: {
          uz: "5 marta noto'g'ri urinish aniqlandi. Xavfsizlik uchun hisobingiz 15 daqiqaga bloklandi.",
          cy: "5 марта нотўғри уриниш аниқланди. Хавфсизлик учун ҳисобингиз 15 дақиқага блокланди.",
          en: "5 incorrect attempts detected. Your account is blocked for 15 minutes for security.",
          ru: "Обнаружено 5 неверных попыток. В целях безопасности ваш аккаунт заблокирован на 15 минут."
     },
     retry_in: {
          uz: "Qayta urinish: ",
          cy: "Қайта уриниш: ",
          en: "Retry in: ",
          ru: "Повторная попытка через: "
     },
     brand_title: {
          uz: "Keldim–Ketdim",
          cy: "Келдим–Кетдим",
          en: "Come and Go",
          ru: "Приехал-Уехал"
     },
     brand_subtitle: {
          uz: "Hududgazta'minot AJ",
          cy: "Ҳудудгазтаъминот АЖ",
          en: "Hududgazta'minot JSC",
          ru: "АО «Худудгазтаъминот»"
     },
     system_title: {
          uz: "Respublika bo'yicha davomat nazorati",
          cy: "Республика бўйича давомат назорати",
          en: "Republic-wide Attendance Control",
          ru: "Республиканский контроль посещаемости"
     },
     system_desc: {
          uz: "Real vaqt rejimida monitoring, KPI hisoblash va filiallar kesimida intizom tahlili — yagona markazlashgan platforma",
          cy: "Реал вақт режимида мониторинг, KPI ҳисоблаш ва филиаллар кесимида интизом таҳлили — ягона марказлашган платформа",
          en: "Real-time monitoring, KPI calculation, and discipline analysis across branches — a single centralized platform",
          ru: "Мониторинг в реальном времени, расчет KPI и анализ дисциплины в разрезе филиалов — единая централизованная платформа"
     },
     secure_login_info: {
          uz: "Himoyalangan kirish · MFA + Face ID",
          cy: "Ҳимояланган кириш · MFA + Face ID",
          en: "Secure login · MFA + Face ID",
          ru: "Защищенный вход · MFA + Face ID"
     },
     light_theme: {
          uz: "Yorug'",
          cy: "Ёруғ",
          en: "Light",
          ru: "Светлая"
     },
     dark_theme: {
          uz: "Qorong'i",
          cy: "Қоронғи",
          en: "Dark",
          ru: "Темная"
     },

     // sidebar
     mainPage: {
          uz: "Asosiy sahifa",
          cy: "Асосий саҳифа",
          en: "Homepage",
          ru: "Главная страница"
     },
     employeeRestr: {
          uz: "Xodimlar ro'yxati",
          cy: "Ходимлар рўйхати",
          en: "Personnel list",
          ru: "Список сотрудников"
     },
     reports: {
          uz: "Hisobotlar",
          cy: "Ҳисоботлар",
          en: "Reports",
          ru: "Отчеты"
     },
     geozone: {
          uz: "Geozonalar",
          cy: "Геозоналар",
          en: "Geozones",
          ru: "Геозоны"
     },
     settings: {
          uz: "Sozlamalar",
          cy: "Созламалар",
          en: "Settings",
          ru: "Настройки"
     },
     help: {
          uz: "Yordam",
          cy: "Ёрдам",
          en: "Help",
          ru: "Помощь"
     },
     profile: {
          uz: "Shaxsiy kabinet",
          cy: "Шахсий кабинет",
          en: "Profile",
          ru: "Личный кабинет"
     },
     logging_out: {
          uz: "Chiqilmoqda...",
          cy: "Чиқилмоқда...",
          en: "Logging out...",
          ru: "Выход..."
     },
     logout: {
          uz: "Chiqish",
          cy: "Чиқиш",
          en: "Logout",
          ru: "Выйти"
     },


     // home page
     home_page_title: {
          uz: "Boshqaruv paneli",
          cy: "Бошқарув панели",
          en: "Control Panel",
          ru: "Панель управления"
     },
     home_page_subtitle: {
          uz: "Respublika boʼyicha real vaqtdagi davomat",
          cy: "Республика бўйича реал вақтдаги давомат",
          en: "Real-time attendance across the country",
          ru: "Посещаемость в реальном времени по республике"
     },
     day1: {
          uz: 'kun',
          cy: 'кун',
          ru: 'день'
     },
     month1: {
          uz: 'oy',
          cy: 'ой',
          ru: 'месяц'
     },
     byDate: {
          uz: "Sana bo'yicha",
          cy: "Сана бўйича",
          en: "By date",
          ru: "По дате"
     },

     // home page stats
     total_employees: {
          uz: "Jami xodimlar",
          cy: "Жами ходимлар",
          en: "Total employees",
          ru: "Всего сотрудников"
     },
     trend_this_month: {
          uz: "bu oy",
          cy: "бу ой",
          en: "this month",
          ru: "в этом месяце"
     },
     come: {
          uz: "Ishga kelganlar",
          cy: "Ишга келганлар",
          en: "Coming to work",
          ru: "Пришедшие на работу"
     },
     trend_attendance: {
          uz: "davomat",
          cy: "давомат",
          en: "attendance",
          ru: "посещаемость"
     },
     latecomers: {
          uz: "Kechikib kelganlar",
          cy: "Кечикиб келганлар",
          en: "Late arrivals",
          ru: "Опоздавшие"
     },
     trend_yesterday_down: {
          uz: "kecha",
          cy: "кеча",
          en: "yesterday",
          ru: "вчера"
     },
     early_leavers: {
          uz: "Erta ketganlar",
          cy: "Эрта кетганлар",
          en: "Early leavers",
          ru: "Ушедшие рано"
     },
     absent: {
          uz: "Ishga kelmaganlar",
          cy: "Ишга келмаганлар",
          en: "Absent",
          ru: "Неявки на работу"
     },
     on_time: {
          uz: "Vaqtida kelganlar",
          cy: "Вақтида келганлар",
          en: "Timely arrivals",
          ru: "Прибывшие вовремя"
     },
     late: {
          uz: "Kechikib kelganlar",
          cy: "Кечикиб келганлар",
          en: "Late arrivals",
          ru: "Опоздавшие"
     },
     early_left: {
          uz: "Erta ketganlar",
          cy: "Эрта кетганлар",
          en: "Early departures",
          ru: "Ранние отъезды"
     },
     weekly_dynamics: {
          uz: "Haftalik dinamika",
          cy: "Ҳафталик динамика",
          en: "Weekly dynamics",
          ru: "Еженедельная динамика"
     },
     weekly_dynamics_subtitle: {
          uz: "Vaqtida kelganlar va kechikkanlar ulushi",
          cy: "Вақтида келганлар ва кечикканлар улуши",
          en: "Share of on-time and late arrivals",
          ru: "Доля пришедших вовремя и опоздавших"
     },
     today_status: {
          uz: "Holat boʼyicha taqsimot",
          cy: "Ҳолат бўйича тақсимот",
          en: "Status distribution",
          ru: "Распределение по статусу"
     },
     today_status_subtitle: {
          uz: "Respublika bo'yicha",
          cy: "Республика бўйича",
          en: "Across the country",
          ru: "По республике"
     },
     at_workplace: {
          uz: "Ish joyida",
          cy: "Иш жойида",
          en: "At workplace",
          ru: "На рабочем месте"
     },
     discipline_rating_branches: {
          uz: "Intizom reytingi — filiallar",
          cy: "Интизом рейтинги — филиаллар",
          en: "Discipline rating — branches",
          ru: "Рейтинг дисциплины — филиалы"
     },
     branch_fallback: {
          uz: "Filial",
          cy: "Филиал",
          en: "Branch",
          ru: "Филиал"
     },
     late: {
          uz: "Kechikkanlar",
          cy: "Кечикканлар",
          en: "Delayed",
          ru: "Опоздавшие"
     },
     onTime: {
          uz: "O‘z vaqtida",
          cy: "Ўз вақтида",
          en: "On time",
          ru: "Вовремя"
     },

     // reports page
     reports_subtitle: {
          uz: "Davomat hisobotlarini shakllantirish va eksport qilish",
          cy: "Давомат ҳисоботларини шакллантириш ва экспорт қилиш",
          en: "Generate and export attendance reports",
          ru: "Формирование и экспорт отчетов посещаемости"
     },
     period_daily: {
          uz: "Kunlik",
          cy: "Кунлик",
          en: "Daily",
          ru: "Дневной"
     },
     period_weekly: {
          uz: "Haftalik",
          cy: "Ҳафталик",
          en: "Weekly",
          ru: "Недельный"
     },
     period_monthly: {
          uz: "Oylik",
          cy: "Ойлик",
          en: "Monthly",
          ru: "Месячный"
     },
     period_quarterly: {
          uz: "Choraklik",
          cy: "Чораклик",
          en: "Quarterly",
          ru: "Квартальный"
     },
     period_yearly: {
          uz: "Yillik",
          cy: "Йиллик",
          en: "Yearly",
          ru: "Годовой"
     },
     tab_by_branch: {
          uz: "Filiallar bo'yicha",
          cy: "Филиаллар бўйича",
          en: "By branch",
          ru: "По филиалам"
     },
     tab_by_employee: {
          uz: "Xodimlar bo'yicha",
          cy: "Ходимлар бўйича",
          en: "By employee",
          ru: "По сотрудникам"
     },
     col_branch: {
          uz: "Filial",
          cy: "Филиал",
          en: "Branch",
          ru: "Филиал"
     },
     col_employee: {
          uz: "Xodim",
          cy: "Ходим",
          en: "Employee",
          ru: "Сотрудник"
     },
     col_total: {
          uz: "Jami",
          cy: "Жами",
          en: "Total",
          ru: "Всего"
     },
     col_arrived: {
          uz: "Kelgan",
          cy: "Келган",
          en: "Arrived",
          ru: "Пришли"
     },
     col_late: {
          uz: "Kechikkan",
          cy: "Кечиккан",
          en: "Late",
          ru: "Опоздали"
     },
     col_absent: {
          uz: "Kelmagan",
          cy: "Келмаган",
          en: "Absent",
          ru: "Отсутствуют"
     },
     col_early: {
          uz: "Erta ketgan",
          cy: "Эрта кетган",
          en: "Left early",
          ru: "Ушли рано"
     },
     col_discipline_kpi: {
          uz: "Intizom KPI",
          cy: "Интизом KPI",
          en: "Discipline KPI",
          ru: "KPI дисциплины"
     },
     total_row: {
          uz: "Jami",
          cy: "Жами",
          en: "Total",
          ru: "Итого"
     },
     export_excel_success: {
          uz: "Davomat hisoboti - Excel hisoboti eksport qilindi",
          cy: "Давомат ҳисоботи - Excel ҳисоботи экспорт қилинди",
          en: "Attendance report - Excel report exported",
          ru: "Отчет посещаемости - Excel отчет экспортирован"
     },
     export_pdf_success: {
          uz: "Davomat hisoboti - PDF hisoboti eksport qilindi",
          cy: "Давомат ҳисоботи - PDF ҳисоботи экспорт қилинди",
          en: "Attendance report - PDF report exported",
          ru: "Отчет посещаемости - PDF отчет экспортирован"
     },
     reports_empty: {
          uz: "Ma'lumot topilmadi",
          cy: "Маълумот топилмади",
          en: "No data found",
          ru: "Данные не найдены"
     },
     export_empty_warning: {
          uz: "Eksport qilish uchun ma'lumot yo'q",
          cy: "Экспорт қилиш учун маълумот йўқ",
          en: "No data to export",
          ru: "Нет данных для экспорта"
     },
     region_branch_title: {
          uz: "Viloyat filiali",
          cy: "Вилоят филиали",
          en: "Regional branch",
          ru: "Областной филиал"
     },
     region_branch_placeholder: {
          uz: "Viloyat filialini tanlang",
          cy: "Вилоят филиалини танланг",
          en: "Select a regional branch",
          ru: "Выберите региональный филиал"
     },
     district_branch_title: {
          uz: "Tuman filiali",
          cy: "Туман филиали",
          en: "District branch",
          ru: "Районный филиал"
     },
     district_branch_placeholder: {
          uz: "Tuman filialini tanlang",
          cy: "Туман филиалини танланг",
          en: "Select a district branch",
          ru: "Выберите районный филиал"
     },

     // employee list
     employees_title: {
          uz: "Xodimlar ro'yxati",
          cy: "Ходимлар рўйхати",
          en: "Employee list",
          ru: "Список сотрудников"
     },
     employees_count_label: {
          uz: "ta xodim ko'rsatilmoqda",
          cy: "та ходим кўрсатилмоқда",
          en: "employees shown",
          ru: "сотрудников показано"
     },
     new_employee: {
          uz: "Yangi xodim",
          cy: "Янги ходим",
          en: "New employee",
          ru: "Новый сотрудник"
     },
     search_employee: {
          uz: "Qidirish ... (ism-familya, yoki tabel)",
          cy: "Қидириш ... (исм-фамилия, ёки табел)",
          en: "Search ... (name, or tab number)",
          ru: "Поиск ... (ФИО или табельный номер)"
     },
     all_branches: {
          uz: "Barcha fililar",
          cy: "Барча филиллар",
          en: "All branches",
          ru: "Все филиалы"
     },
     all_departments: {
          uz: "Barcha bo'limlar",
          cy: "Барча бўлимлар",
          en: "All departments",
          ru: "Все отделы"
     },
     work_start: {
          uz: "Kelgan vaqti",
          cy: "Келган вақти",
          en: "Arrival time",
          ru: "Время прихода"
     },
     add_employee_subtitle: {
          uz: "Xodim qo'shish",
          cy: "Ходим қўшиш",
          en: "Add employee",
          ru: "Добавить сотрудника"
     },
     create_password_placeholder: {
          uz: "Parol yarating",
          cy: "Пароль яратинг",
          en: "Create a password",
          ru: "Создайте пароль"
     },
     tabel_number: {
          uz: "Tabel raqami",
          cy: "Табел рақами",
          en: "Tab number",
          ru: "Табельный номер"
     },
     select_branch: {
          uz: "Filialni tanlang",
          cy: "Филиални танланг",
          en: "Select branch",
          ru: "Выберите филиал"
     },
     select_department: {
          uz: "Bo'limni tanlang",
          cy: "Бўлимни танланг",
          en: "Select department",
          ru: "Выберите отдел"
     },
     select_position: {
          uz: "Lavozimni tanlang",
          cy: "Лавозимни танланг",
          en: "Select position",
          ru: "Выберите должность"
     },
     role_permissions: {
          uz: "Rol va ruxsatlar",
          cy: "Рол ва рухсатлар",
          en: "Role & permissions",
          ru: "Роль и разрешения"
     },
     role_permissions_subtitle: {
          uz: "Rol tanlang — ruxsatlar avtomatik moslashadi",
          cy: "Рол танланг — рухсатлар автоматик мослашади",
          en: "Select role — permissions auto-apply",
          ru: "Выберите роль — права применятся автоматически"
     },
     select_role: {
          uz: "Rolni tanlang",
          cy: "Ролни танланг",
          en: "Select role",
          ru: "Выберите роль"
     },
     perm_attendance_mark: {
          uz: "Davomatni belgilash",
          cy: "Давоматни белгилаш",
          en: "Mark attendance",
          ru: "Отмечать посещаемость"
     },
     perm_attendance_view: {
          uz: "Davomatni ko'rish",
          cy: "Давоматни кўриш",
          en: "View attendance",
          ru: "Просмотр посещаемости"
     },
     perm_kpi_view: {
          uz: "KPI ko'rish",
          cy: "КПИ кўриш",
          en: "View KPI",
          ru: "Просмотр KPI"
     },
     perm_employee_manage: {
          uz: "Xodim qo'shish / tahrirlash",
          cy: "Ходим қўшиш / таҳрирлаш",
          en: "Add / edit employees",
          ru: "Добавить / редактировать сотрудников"
     },
     perm_reports_export: {
          uz: "Hisobotlarni eksport qilish",
          cy: "Ҳисоботларни экспорт қилиш",
          en: "Export reports",
          ru: "Экспорт отчётов"
     },
     perm_geozone_create: {
          uz: "Geozona yaratish",
          cy: "Геозона яратиш",
          en: "Create geozones",
          ru: "Создавать геозоны"
     },
     perm_roles_manage: {
          uz: "Rollarni boshqarish",
          cy: "Ролларни бошқариш",
          en: "Manage roles",
          ru: "Управление ролями"
     },
     role: {
          uz: "Rol",
          cy: "Рол",
          en: "Role",
          ru: "Рол"
     },
     addEmployee: {
          uz: "Xodim qo'shish",
          cy: "Ходим қўшиш",
          en: "Add employee",
          ru: "Добавить сотрудника"
     },

     // ─── Geozonalar ───
     gz_subtitle: {
          uz: "Ish hududlarini boshqarish — markaz, radius (50–500 m), holat",
          cy: "Иш ҳудудларини бошқариш — марказ, радиус (50–500 m), ҳолат",
          en: "Manage work zones — center, radius (50–500 m), status",
          ru: "Управление рабочими зонами — центр, радиус (50–500 м), статус"
     },
     gz_new: {
          uz: "Yangi geozona",
          cy: "Янги геозона",
          en: "New geozone",
          ru: "Новая геозона"
     },
     gz_name: {
          uz: "Geozona nomi",
          cy: "Геозона номи",
          en: "Geozone name",
          ru: "Название геозоны"
     },
     gz_type: {
          uz: "Geozona turi",
          cy: "Геозона тури",
          en: "Geozone type",
          ru: "Тип геозоны"
     },
     gz_type_ph: {
          uz: "Geozona turini tanlang",
          cy: "Геозона турини танланг",
          en: "Select geozone type",
          ru: "Выберите тип геозоны"
     },
     gz_lat: {
          uz: "Kenglik (Latitude)",
          cy: "Кенглик (Latitude)",
          en: "Latitude",
          ru: "Широта (Latitude)"
     },
     gz_lng: {
          uz: "Uzunlik (Longitude)",
          cy: "Узунлик (Longitude)",
          en: "Longitude",
          ru: "Долгота (Longitude)"
     },
     gz_radius: {
          uz: "Radius (metr)",
          cy: "Радиус (метр)",
          en: "Radius (meters)",
          ru: "Радиус (метр)"
     },
     gz_add_btn: {
          uz: "Geozona qo'shish",
          cy: "Геозона қўшиш",
          en: "Add geozone",
          ru: "Добавить геозону"
     },
     gz_save: {
          uz: "O'zgarishlarni saqlash",
          cy: "Ўзгаришларни сақлаш",
          en: "Save changes",
          ru: "Сохранить изменения"
     },
     gz_field_name: {
          uz: "Nomi",
          cy: "Номи",
          en: "Name",
          ru: "Название"
     },
     gz_attached_branch: {
          uz: "Biriktirilgan filial",
          cy: "Бириктирилган филиал",
          en: "Attached branch",
          ru: "Прикреплённый филиал"
     },
     gz_center_coord: {
          uz: "Koordinata (markaz nuqta)",
          cy: "Координата (марказ нуқта)",
          en: "Coordinate (center point)",
          ru: "Координата (центр)"
     },
     gz_attached_workers: {
          uz: "Biriktirilgan xodimlar",
          cy: "Бириктирилган ходимлар",
          en: "Attached employees",
          ru: "Прикреплённые сотрудники"
     },
     gz_workers_unit: {
          uz: "ta",
          cy: "та",
          en: "",
          ru: ""
     },
     gz_meter: {
          uz: "metr",
          cy: "метр",
          en: "meters",
          ru: "метр"
     },
     gz_meter_short: {
          uz: "m",
          cy: "m",
          en: "m",
          ru: "м"
     },
     gz_empty: {
          uz: "Geozona topilmadi",
          cy: "Геозона топилмади",
          en: "No geozones found",
          ru: "Геозоны не найдены"
     },
     gz_select_hint: {
          uz: "Ko'rish uchun geozonani tanlang",
          cy: "Кўриш учун геозонани танланг",
          en: "Select a geozone to view",
          ru: "Выберите геозону для просмотра"
     },
     gz_no_branch: {
          uz: "Biriktirilmagan",
          cy: "Бириктирилмаган",
          en: "Not attached",
          ru: "Не прикреплён"
     },
     gz_delete: {
          uz: "O'chirish",
          cy: "Ўчириш",
          en: "Delete",
          ru: "Удалить"
     },
     gz_cancel: {
          uz: "Bekor qilish",
          cy: "Бекор қилиш",
          en: "Cancel",
          ru: "Отмена"
     },
     gz_delete_title: {
          uz: "Geozonani o'chirish",
          cy: "Геозонани ўчириш",
          en: "Delete geozone",
          ru: "Удалить геозону"
     },
     gz_delete_confirm: {
          uz: "Ushbu geozonani o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.",
          cy: "Ушбу геозонани ўчиришни тасдиқлайсизми? Бу амални қайтариб бўлмайди.",
          en: "Are you sure you want to delete this geozone? This action cannot be undone.",
          ru: "Вы уверены, что хотите удалить эту геозону? Это действие необратимо."
     },
     gz_created: {
          uz: "Geozona qo'shildi",
          cy: "Геозона қўшилди",
          en: "Geozone created",
          ru: "Геозона создана"
     },
     gz_updated: {
          uz: "O'zgarishlar saqlandi",
          cy: "Ўзгаришлар сақланди",
          en: "Changes saved",
          ru: "Изменения сохранены"
     },
     gz_deleted: {
          uz: "Geozona o'chirildi",
          cy: "Геозона ўчирилди",
          en: "Geozone deleted",
          ru: "Геозона удалена"
     },
     gz_error: {
          uz: "Xatolik yuz berdi",
          cy: "Хатолик юз берди",
          en: "An error occurred",
          ru: "Произошла ошибка"
     },
     gz_validation: {
          uz: "Iltimos, majburiy maydonlarni to'ldiring",
          cy: "Илтимос, мажбурий майдонларни тўлдиринг",
          en: "Please fill in the required fields",
          ru: "Пожалуйста, заполните обязательные поля"
     },
     gz_coord_invalid: {
          uz: "Koordinata noto'g'ri (masalan: 41.3110, 69.2797)",
          cy: "Координата нотўғри (масалан: 41.3110, 69.2797)",
          en: "Invalid coordinate (e.g. 41.3110, 69.2797)",
          ru: "Неверная координата (например: 41.3110, 69.2797)"
     },
     gz_search_ph: {
          uz: "Qidirish ... (filial nomi)",
          cy: "Қидириш ... (филиал номи)",
          en: "Search ... (branch name)",
          ru: "Поиск ... (название филиала)"
     },
     gz_filter: {
          uz: "Filter",
          cy: "Фильтр",
          en: "Filter",
          ru: "Фильтр"
     },
     gz_filter_title: {
          uz: "Filtrlash",
          cy: "Фильтрлаш",
          en: "Filter",
          ru: "Фильтрация"
     },
     gz_filter_subtitle: {
          uz: "Kerakli filtrlarni tanlang, natijalar shunga qarab saralanadi",
          cy: "Керакли фильтрларни танланг, натижалар шунга қараб сараланади",
          en: "Select the filters you need, results will be sorted accordingly",
          ru: "Выберите нужные фильтры, результаты будут отсортированы соответственно"
     },
     gz_region: {
          uz: "Viloyat",
          cy: "Вилоят",
          en: "Region",
          ru: "Область"
     },
     gz_region_ph: {
          uz: "Viloyat tanlang",
          cy: "Вилоят танланг",
          en: "Select region",
          ru: "Выберите область"
     },
     gz_district: {
          uz: "Tuman",
          cy: "Туман",
          en: "District",
          ru: "Район"
     },
     gz_district_ph: {
          uz: "Tuman tanlang",
          cy: "Туман танланг",
          en: "Select district",
          ru: "Выберите район"
     },
     gz_filial: {
          uz: "Filial",
          cy: "Филиал",
          en: "Branch",
          ru: "Филиал"
     },
     gz_branch_ph: {
          uz: "Filial tanlang",
          cy: "Филиал танланг",
          en: "Select branch",
          ru: "Выберите филиал"
     },
     gz_select_region_first: {
          uz: "Avval viloyatni tanlang",
          cy: "Аввал вилоятни танланг",
          en: "Select a region first",
          ru: "Сначала выберите область"
     },
     gz_clear: {
          uz: "Tozalash",
          cy: "Тозалаш",
          en: "Clear",
          ru: "Очистить"
     },
     gz_search_btn: {
          uz: "Qidirish",
          cy: "Қидириш",
          en: "Search",
          ru: "Поиск"
     },
     zt_main_office: {
          uz: "Markaziy apparat",
          cy: "Марказий аппарат",
          en: "Main office",
          ru: "Центральный аппарат"
     },
     zt_region_branch: {
          uz: "Viloyat filiali",
          cy: "Вилоят филиали",
          en: "Region branch",
          ru: "Областной филиал"
     },
     zt_district_branch: {
          uz: "Tuman bo'limi",
          cy: "Туман бўлими",
          en: "District branch",
          ru: "Районное отделение"
     },
     zt_special_object: {
          uz: "Maxsus obyekt",
          cy: "Махсус объект",
          en: "Special object",
          ru: "Специальный объект"
     },
     zt_temp_object: {
          uz: "Vaqtinchalik obyekt",
          cy: "Вақтинчалик объект",
          en: "Temporary object",
          ru: "Временный объект"
     },

     // ─── Ma'lumotnomalar ───
     ref_menu_title: { uz: "Ma'lumotnomalar", cy: "Маълумотномалар", en: "References", ru: "Справочники" },
     ref_coming_soon: { uz: "Bu bo'lim tez orada qo'shiladi", cy: "Бу бўлим тез орада қўшилади", en: "This section is coming soon", ru: "Этот раздел скоро появится" },
     ref_created: { uz: "Muvaffaqiyatli qo'shildi", cy: "Муваффақиятли қўшилди", en: "Successfully added", ru: "Успешно добавлено" },

     // Menyu yorliqlari
     ref_m_region: { uz: "Viloyat", cy: "Вилоят", en: "Region", ru: "Область" },
     ref_m_district: { uz: "Tuman", cy: "Туман", en: "District", ru: "Район" },
     ref_m_branch: { uz: "Filial", cy: "Филиал", en: "Branch", ru: "Филиал" },
     ref_m_dept: { uz: "Bo'limlar", cy: "Бўлимлар", en: "Departments", ru: "Отделы" },
     ref_m_position: { uz: "Lavozimlar", cy: "Лавозимлар", en: "Positions", ru: "Должности" },
     ref_m_role: { uz: "Rollar", cy: "Роллар", en: "Roles", ru: "Роли" },
     ref_m_holiday: { uz: "Bayramlar", cy: "Байрамлар", en: "Holidays", ru: "Праздники" },
     ref_m_schedule: { uz: "Ish jadvali", cy: "Иш жадвали", en: "Work schedule", ru: "График работы" },

     // Sahifa sarlavhalari (H1)
     ref_t_region: { uz: "Viloyat", cy: "Вилоят", en: "Region", ru: "Область" },
     ref_t_district: { uz: "Tuman", cy: "Туман", en: "District", ru: "Район" },
     ref_t_branch: { uz: "Filial", cy: "Филиал", en: "Branch", ru: "Филиал" },
     ref_t_dept: { uz: "Bo'lim", cy: "Бўлим", en: "Department", ru: "Отдел" },
     ref_t_position: { uz: "Lavozimlar", cy: "Лавозимлар", en: "Positions", ru: "Должности" },

     // "X qo'shish" (tugma + modal sarlavha + saqlash)
     ref_add_region: { uz: "Viloyat qo'shish", cy: "Вилоят қўшиш", en: "Add region", ru: "Добавить область" },
     ref_add_district: { uz: "Tuman qo'shish", cy: "Туман қўшиш", en: "Add district", ru: "Добавить район" },
     ref_add_branch: { uz: "Filial qo'shish", cy: "Филиал қўшиш", en: "Add branch", ru: "Добавить филиал" },
     ref_add_dept: { uz: "Bo'lim qo'shish", cy: "Бўлим қўшиш", en: "Add department", ru: "Добавить отдел" },
     ref_add_position: { uz: "Lavozim qo'shish", cy: "Лавозим қўшиш", en: "Add position", ru: "Добавить должность" },

     // Subtitle ("{n} ta X mavjud")
     ref_sub_region: { uz: "{n} ta viloyat mavjud", cy: "{n} та вилоят мавжуд", en: "{n} regions available", ru: "Доступно областей: {n}" },
     ref_sub_district: { uz: "{n} ta tuman mavjud", cy: "{n} та туман мавжуд", en: "{n} districts available", ru: "Доступно районов: {n}" },
     ref_sub_branch: { uz: "{n} ta filial mavjud", cy: "{n} та филиал мавжуд", en: "{n} branches available", ru: "Доступно филиалов: {n}" },
     ref_sub_dept: { uz: "{n} ta bo'lim mavjud", cy: "{n} та бўлим мавжуд", en: "{n} departments available", ru: "Доступно отделов: {n}" },
     ref_sub_position: { uz: "{n} ta lavozim mavjud", cy: "{n} та лавозим мавжуд", en: "{n} positions available", ru: "Доступно должностей: {n}" },

     // Nom maydoni (label + placeholder)
     ref_name_region: { uz: "Viloyat nomi", cy: "Вилоят номи", en: "Region name", ru: "Название области" },
     ref_ph_region: { uz: "Viloyat nomini kiriting", cy: "Вилоят номини киритинг", en: "Enter region name", ru: "Введите название области" },
     ref_name_district: { uz: "Tuman nomi", cy: "Туман номи", en: "District name", ru: "Название района" },
     ref_ph_district: { uz: "Tuman nomini kiriting", cy: "Туман номини киритинг", en: "Enter district name", ru: "Введите название района" },
     ref_name_branch: { uz: "Filial nomi", cy: "Филиал номи", en: "Branch name", ru: "Название филиала" },
     ref_ph_branch: { uz: "Filial nomini kiriting", cy: "Филиал номини киритинг", en: "Enter branch name", ru: "Введите название филиала" },
     ref_name_dept: { uz: "Bo'lim nomi", cy: "Бўлим номи", en: "Department name", ru: "Название отдела" },
     ref_ph_dept: { uz: "Bo'lim nomini kiriting", cy: "Бўлим номини киритинг", en: "Enter department name", ru: "Введите название отдела" },
     ref_name_position: { uz: "Lavozim nomi", cy: "Лавозим номи", en: "Position name", ru: "Название должности" },
     ref_ph_position: { uz: "Lavozim nomini kiriting", cy: "Лавозим номини киритинг", en: "Enter position name", ru: "Введите название должности" },

     // Ustun / select yorliqlari
     ref_col_dept: { uz: "Bo'lim", cy: "Бўлим", en: "Department", ru: "Отдел" },
     ref_col_position: { uz: "Lavozim", cy: "Лавозим", en: "Position", ru: "Должность" },
     ref_dept_ph: { uz: "Bo'lim tanlang", cy: "Бўлим танланг", en: "Select department", ru: "Выберите отдел" }
}

export function LanguageProvider({ children }) {
     const [language, setLanguageState] = useState(() => {
          const saved = localStorage.getItem('language');
          if (saved === 'uz' || saved === 'cy' || saved === 'ru') {
               return saved;
          }
          return 'uz';
     });

     const setLanguage = (lang) => {
          setLanguageState(lang);
          localStorage.setItem('language', lang);
     };

     const t = (key) => {
          return translations[key]?.[language] || key;
     };

     return (
          <LanguageContext.Provider value={{ language, setLanguage, t }}>
               {children}
          </LanguageContext.Provider>
     );
}

export function useLanguage() {
     const context = useContext(LanguageContext);
     if (context === undefined) {
          throw new Error('useLanguage must be used within a LanguageProvider');
     }
     return context;
}
