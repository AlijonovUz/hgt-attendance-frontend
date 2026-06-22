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
     delete: {
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
     save: {
          uz: "Saqlash",
          cy: "Сақлаш",
          en: "Save",
          ru: "Сохранение"
     },
     select: {
          uz: "Tanlash",
          cy: "Танлаш",
          en: "Selection",
          ru: "Выбор"
     },
     search: {
          uz: "Qidirish...",
          cy: "Қидириш...",
          en: "Search...",
          ru: "Поиск..."
     },
     searchBtn: {
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
     view: {
          uz: "Ko'rish",
          cy: "Кўриш",
          en: "View",
          ru: "Просмотр"
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
     selected_count_label: {
          uz: "ta tanlangan",
          cy: "та танланган",
          en: "selected",
          ru: "выбрано"
     },
     confirm_delate_title: {
          uz: "Haqiqatan ham o'chirmoqchimisiz?",
          cy: "Ҳақиқатан ҳам ўчирмоқчимисиз?",
          en: "Are you sure you want to delete ?",
          ru: "Вы уверены, что хотите удалить это?"
     },
     confirm_delate_desc: {
          uz: "Ushbu ma'lumotni o'chirgandan so'ng, uni tiklash imkoni bo'lmaydi va siz hamma narsani boshidan boshlashingiz kerak bo'ladi!",
          cy: "Ушбу маълумотларни ўчириб ташлаганингиздан сўнг, уларни қайта тиклаш имконсиз бўлади ва ҳаммасини бошидан бошлашингизга тўғри келади!",
          en: "After deleting this information, it will be impossible to restore and you will have to start everything from scratch!",
          ru: "После того как вы удалите эти данные, их восстановление станет невозможным, и вам придется начинать всё сначала!"
     },

     start_date: {
          uz: "Boshlanish sanasi",
          cy: "Бошланиш санаси",
          en: "Start date",
          ru: "Дата начала"
     },
     end_date: {
          uz: "Tugash sanasi",
          cy: "Тугаш санаси",
          en: "End date",
          ru: "Дата окончания"
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
     actions: {
          uz: "Amallar",
          cy: "Амаллар",
          en: "Actions",
          ru: "Действия"
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
     trend_vs_yesterday: {
          uz: "o'tgan kunga nisbatan",
          cy: "ўтган кунга нисбатан",
          en: "vs previous day",
          ru: "по сравнению с прошлым днём"
     },
     trend_vs_last_week: {
          uz: "o'tgan haftaga nisbatan",
          cy: "ўтган ҳафтага нисбатан",
          en: "vs last week",
          ru: "по сравнению с прошлой неделей"
     },
     trend_vs_last_month: {
          uz: "o'tgan oyga nisbatan",
          cy: "ўтган ойга нисбатан",
          en: "vs last month",
          ru: "по сравнению с прошлым месяцем"
     },
     trend_vs_last_quarter: {
          uz: "o'tgan chorakka nisbatan",
          cy: "ўтган чоракка нисбатан",
          en: "vs last quarter",
          ru: "по сравнению с прошлым кварталом"
     },
     trend_vs_last_year: {
          uz: "o'tgan yilga nisbatan",
          cy: "ўтган йилга нисбатан",
          en: "vs last year",
          ru: "по сравнению с прошлым годом"
     },
     trend_vs_period: {
          uz: "tanlangan davrga nisbatan",
          cy: "танланган даврга нисбатан",
          en: "vs selected period",
          ru: "по сравнению с выбранным периодом"
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
          uz: "Viloyat",
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
          uz: "Tuman",
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
     all_regions: {
          uz: "Barcha viloyatlar",
          cy: "Барча вилоятлар",
          en: "All regions",
          ru: "Все регионы"
     },
     all_districts: {
          uz: "Barcha tumanlar",
          cy: "Барча туманлар",
          en: "All districts",
          ru: "Все районы"
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
     jshsh_number: {
          uz: "JSHSHIR raqami",
          cy: "JSHSHIR рақами",
          en: "JSHSHIR number",
          ru: "JSHSHIR номер"
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
     work_schedule: {
          uz: "Ish jadvali",
          cy: "Иш жадвали",
          en: "Work schedule",
          ru: "График работы"
     },
     work_schedule_subtitle: {
          uz: "Ish grafigini tanlash",
          cy: "Иш графигини танлаш",
          en: "Select work schedule",
          ru: "Выберите график работы"
     },
     select_work_schedule: {
          uz: "Ish grafigini tanlash",
          cy: "Иш графигини танлаш",
          en: "Select work schedule",
          ru: "Выберите график работы"
     },
     work_start_time: {
          uz: "Ish boshlanishi",
          cy: "Иш бошланиши",
          en: "Work start time",
          ru: "Начало работы"
     },
     work_end_time: {
          uz: "Ish tugashi",
          cy: "Иш тугаши",
          en: "Work end time",
          ru: "Окончание работы"
     },
     lunch_start_time: {
          uz: "Tushlik boshlanishi",
          cy: "Тушлик бошланиши",
          en: "Lunch start time",
          ru: "Начало обеда"
     },
     lunch_end_time: {
          uz: "Tushlik tugashi",
          cy: "Тушлик тугаши",
          en: "Lunch end time",
          ru: "Окончание обеда"
     },
     work_days: {
          uz: "Ish kunlari",
          cy: "Иш кунлари",
          en: "Work days",
          ru: "Рабочие дни"
     },
     field_required: {
          uz: "Ushbu maydon majburiy",
          cy: "Ушбу майдон мажбурий",
          en: "This field is required",
          ru: "Это поле обязательно для заполнения"
     },
     jshshir_length_error: {
          uz: "JSHSHIR 14 ta raqamdan iborat bo'lishi kerak",
          cy: "ЖШШИР 14 та рақамдан иборат бўлиши керак",
          en: "JSHSHIR must be exactly 14 digits",
          ru: "ПИНФЛ должен состоять ровно из 14 цифр"
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
     all_analytics: {
          uz: "Barcha analitikasi",
          cy: "Барча аналитикаси",
          en: "All analytics",
          ru: "Вся аналитика"
     },
     department_analytics: {
          uz: "Bo'lim analitikasi",
          cy: "Бўлим аналитикаси",
          en: "Department analytics",
          ru: "Аналитика отдела"
     },
     audit_logs: {
          uz: "Audit loglari",
          cy: "Аудит логлари",
          en: "Audit logs",
          ru: "Аудит логи"
     },
     view_my_kpi: {
          uz: "O'zining KPI ni ko'rish",
          cy: "Ўзининг КПИ ни кўриш",
          en: "View my KPI",
          ru: "Просмотр своего KPI"
     },
     geozone: {
          uz: "Geozona",
          cy: "Геозона",
          en: "Geozone",
          ru: "Геозона"
     },
     role: {
          uz: "Rol",
          cy: "Рол",
          en: "Role",
          ru: "Рол"
     },
     block_employee: {
          uz: "Bloklash",
          cy: "Блоклаш",
          en: "Block",
          ru: "Заблокировать"
     },
     fire_employee: {
          uz: "Ishdan chetlatish",
          cy: "Ишдан четлатиш",
          en: "Dismissal",
          ru: "Отстранение от работы"
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
     employee_details: {
          uz: "Xodim ma’lumotlari",
          cy: "Ходим маълумотлари",
          en: "Employee data",
          ru: "Данные сотрудника"
     },
     select_role_hint: {
          uz: "Rol tanlang — ruxsatlar ko'rinadi",
          cy: "Рол танланг — рухсатлар кўринади",
          en: "Select a role to see permissions",
          ru: "Выберите роль — отобразятся разрешения"
     },
     block_employee: {
          uz: "Bloklash",
          cy: "Блоклаш",
          en: "Block",
          ru: "Заблокировать"
     },
     unblock_employee: {
          uz: "Blokdan chiqarish",
          cy: "Блокдан чиқариш",
          en: "Unblock",
          ru: "Разблокировать"
     },
     fire_employee: {
          uz: "Ishdan chetlatish",
          cy: "Ишдан четлатиш",
          en: "Fire",
          ru: "Уволить"
     },
     block_employee_title: {
          uz: "Xodimni bloklash?",
          cy: "Ходимни блоклаш?",
          en: "Block employee?",
          ru: "Заблокировать сотрудника?"
     },
     unblock_employee_title: {
          uz: "Xodimni blokdan chiqarish?",
          cy: "Ходимни блокдан чиқариш?",
          en: "Unblock employee?",
          ru: "Разблокировать сотрудника?"
     },
     fire_employee_title: {
          uz: "Ishdan bo'shatish!",
          cy: "Ишдан бўшатиш!",
          en: "Fire employee!",
          ru: "Уволить сотрудника!"
     },
     block_employee_description: {
          uz: "Bloklangan xodim tizimga kira olmaydi va davomat qayd etolmaydi. Keyinchalik blokdan chiqarish mumkin.",
          cy: "Блокланган ходим тизимга кира олмайди ва давомат қайд этолмайди. Кейинчалик блокдан чиқариш мумкин.",
          en: "Blocked employee cannot log in to the system and cannot record attendance. Can be unblocked later.",
          ru: "Заблокированный сотрудник не может войти в систему и не может отмечать посещаемость. Позже можно разблокировать."
     },
     unblock_employee_description: {
          uz: "Blokdan chiqarilgan xodim tizimga kira oladi va davomat qayd eta oladi.",
          cy: "Блокдан чиқарилган ходим тизимга кира олади ва давомат қайд эта олади.",
          en: "Unblocked employee can log in to the system and record attendance.",
          ru: "Разблокированный сотрудник может войти в систему и отмечать посещаемость."
     },
     fire_employee_description: {
          uz: "Bu xodim faollar ro'yxatidan olib tashlanadi. Ma'lumotlari arxivda saqlanadi. Bu amalni qaytarib bo'lmaydi.",
          cy: "Бу ходим фаоллар рўйхатидан олиб ташланади. Маълумотлари архивда сақланади. Бу амални қайтариб бўлмайди.",
          en: "This employee will be removed from the active list. Their data will be stored in the archive. This action cannot be undone.",
          ru: "Этот сотрудник будет удален из списка активных. Его данные будут сохранены в архиве. Это действие нельзя отменить."
     },
     block: {
          uz: "Bloklash",
          cy: "Блоклаш",
          en: "Block",
          ru: "Заблокировать"
     },
     unblock: {
          uz: "Blokdan chiqarish",
          cy: "Блокдан чиқариш",
          en: "Unblock",
          ru: "Разблокировать"
     },
     fire: {
          uz: "Bo'shatish",
          cy: "Бўшатиш",
          en: "Fire",
          ru: "Уволить"
     },
     cancel: {
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
     branch: {
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
          uz: "Viloyat",
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
     ref_dept_ph: { uz: "Bo'lim tanlang", cy: "Бўлим танланг", en: "Select department", ru: "Выберите отдел" },
     blocked: {
          uz: "Bloklangan",
          cy: "Блокланган",
          en: "Blocked",
          ru: "Заблокирован"
     },
     unblocked: {
          uz: "Blokdan chiqarilgan",
          cy: "Блокдан чиқарилган",
          en: "Unblocked",
          ru: "Разблокирован"
     },
     regions: { uz: "Viloyatlar", cy: "Вилоятлар", en: "Regions", ru: "Районы" },
     districts: { uz: "Tumanlar", cy: "Туманлар", en: "Districts", ru: "Округа" },
     analytics: { uz: "Analitika", cy: "Аналитика", en: "Analytics", ru: "Аналитика" },
     holidays: { uz: "Bayramlar", cy: "Байрамлар", en: "Holidays", ru: "Праздники" },
     schedules: { uz: "Ish grafiklari", cy: "Иш графиклари", en: "Schedules", ru: "Графики" },
     schedule: { uz: "Ish grafigi", cy: "Иш графиги", en: "Schedule", ru: "График" },
     audits: { uz: "Audit", cy: "Аудит", en: "Audit", ru: "Аудит" },
     positions: { uz: "Lavozimlar", cy: "Лавозимлар", en: "Positions", ru: "Должности" },
     departments: { uz: "Bo'limlar", cy: "Бўлимлар", en: "Departments", ru: "Отделы" },
     branchs: { uz: "Filiallar", cy: "Филиаллар", en: "Branches", ru: "Филиалы" },
     reports: { uz: "Hisobotlar", cy: "Ҳисоботлар", en: "Reports", ru: "Отчёты" },
     kpis: { uz: "KPI", cy: "KPI", en: "KPI", ru: "KPI" },
     gps: { uz: "GPS", cy: "GPS", en: "GPS", ru: "GPS" },
     geozones: { uz: "Geozonalar", cy: "Геозоналар", en: "Geozones", ru: "Геозоны" },
     attendances: { uz: "Davomat", cy: "Давомат", en: "Attendance", ru: "Посещаемость" },
     employees: { uz: "Xodimlar", cy: "Ходимлар", en: "Employees", ru: "Сотрудники" },

     employee_added: {
          uz: "- muvaffaqiyatli qo'shildi",
          cy: "- муваффақиятли қўшилди",
          en: "- successfully added",
          ru: "- успешно добавлен"
     },
     update: {
          uz: "Yangilandi!",
          cy: "Янгиланди!",
          en: "Updated successfully!",
          ru: "Обновлено!"
     },
     employee_updated: {
          uz: "- muvaffaqiyatli tahrirlandi",
          cy: "- муваффақиятли таҳрирланди",
          en: "- successfully updated",
          ru: "- успешно обновлен"
     },
     employee_blocked: {
          uz: "- bloklandi",
          cy: "- блокланди",
          en: "- blocked",
          ru: "- заблокирован"
     },
     employee_unblocked: {
          uz: "- blokdan chiqarildi",
          cy: "- блокдан чиқарилди",
          en: "- unblocked",
          ru: "- разблокирован"
     },
     employee_fired: {
          uz: "- ishdan bo'shatildi",
          cy: "- ишдан бўшатилди",
          en: "- fired",
          ru: "- уволен"
     },
     no_data_to_export: {
          uz: "Eksport qilish uchun ma'lumot yo'q",
          cy: "Экспорт қилиш учун маълумот йўқ",
          en: "No data to export",
          ru: "Нет данных для экспорта"
     },
     export_success: {
          uz: "Excel fayl muvaffaqiyatli yuklandi",
          cy: "Excel файл муваффақиятли юкланди",
          en: "Excel file successfully downloaded",
          ru: "Excel файл успешно загружен"
     },
     export_error: {
          uz: "Excel faylni yuklashda xatolik yuz berdi",
          cy: "Excel файлни юклашда хатолик юз берди",
          en: "Error exporting Excel file",
          ru: "Ошибка при экспорте Excel файла"
     },
     download: {
          uz: "Yuklash",
          cy: "Юклаш",
          en: "Download",
          ru: "Скачать"
     },
     export_empty_warning: {
          uz: "Eksport qilish uchun ma'lumot yo'q",
          cy: "Экспорт қилиш учун маълумот йўқ",
          en: "No data to export",
          ru: "Нет данных для экспорта"
     },
     export_excel_success: {
          uz: "Excel fayl muvaffaqiyatli yuklandi",
          cy: "Excel файл муваффақиятли юкланди",
          en: "Excel file successfully downloaded",
          ru: "Excel файл успешно загружен"
     },
     export_pdf_success: {
          uz: "PDF fayl muvaffaqiyatli yuklandi",
          cy: "PDF файл муваффақиятли юкланди",
          en: "PDF file successfully downloaded",
          ru: "PDF файл успешно загружен"
     },
     export_csv_success: {
          uz: "CSV fayl muvaffaqiyatli yuklandi",
          cy: "CSV файл муваффақиятли юкланди",
          en: "CSV file successfully downloaded",
          ru: "CSV файл успешно загружен"
     },

     // bayramlar
     ref_t_holiday: {
          uz: "Bayramlar",
          cy: "Байрамлар",
          en: "Holidays",
          ru: "Праздники"
     },
     ref_sub_holiday: {
          uz: "{n} ta bayram mavjud",
          cy: "{n} та байрам мавжуд",
          en: "{n} holidays found",
          ru: "{n} праздников"
     },
     ref_add_holiday: {
          uz: "Bayram qo'shish",
          cy: "Байрам қўшиш",
          en: "Add holiday",
          ru: "Добавить праздник"
     },
     ref_col_holiday_name: {
          uz: "Bayram",
          cy: "Байрам",
          en: "Holiday",
          ru: "Праздник"
     },
     ref_col_holiday_start: {
          uz: "Boshlanish sanasi",
          cy: "Бошланиш санаси",
          en: "Start date",
          ru: "Дата начала"
     },
     ref_col_holiday_end: {
          uz: "Tugash sanasi",
          cy: "Тугаш санаси",
          en: "End date",
          ru: "Дата окончания"
     },
     ref_name_holiday: {
          uz: "Bayram nomi",
          cy: "Байрам номи",
          en: "Holiday name",
          ru: "Название праздника"
     },
     ref_ph_holiday: {
          uz: "Bayram nomini kiriting",
          cy: "Байрам номини киритинг",
          en: "Enter holiday name",
          ru: "Введите название праздника"
     },
     ref_name_holiday_start: {
          uz: "Boshlanish sanasi",
          cy: "Бошланиш санаси",
          en: "Start date",
          ru: "Дата начала"
     },
     ref_name_holiday_end: {
          uz: "Tugash sanasi",
          cy: "Тугаш санаси",
          en: "End date",
          ru: "Дата окончания"
     },
     gz_date_ph: {
          uz: "kk.oo.yyyy",
          cy: "кк.оо.йийй",
          en: "dd.mm.yyyy",
          ru: "дд.мм.гггг"
     },
     gz_date_time_ph: {
          uz: "kk.oo.yyyy hh:mm",
          cy: "кк.оо.йийй хх:мм",
          en: "dd.mm.yyyy hh:mm",
          ru: "дд.мм.гггг хх:мм"
     },
     ref_delete_confirm: {
          uz: "O'chirishni tasdiqlaysizmi?",
          cy: "Ўчиришни тасдиқлайсизми?",
          en: "Confirm deletion?",
          ru: "Подтвердить удаление?"
     },

     logs: {
          uz: "Loglar",
          cy: "Логлар",
          en: "Logs",
          ru: "Логи"
     },
     dailys: {
          uz: "Kunlik davomatlar",
          cy: "Кунлик давоматлар",
          en: "Daily attendance",
          ru: "Ежедневные посещения"
     },

     // ─── Rollar ───
     ref_t_role: { uz: "Rollar", cy: "Роллар", en: "Roles", ru: "Роли" },
     ref_sub_role: { uz: "{n} ta rol mavjud", cy: "{n} та рол мавжуд", en: "{n} roles available", ru: "Доступно ролей: {n}" },
     ref_add_role: { uz: "Rol qo'shish", cy: "Рол қўшиш", en: "Add role", ru: "Добавить роль" },
     ref_col_role: { uz: "Rol", cy: "Рол", en: "Role", ru: "Роль" },
     ref_name_role: { uz: "Rol nomi", cy: "Рол номи", en: "Role name", ru: "Название роли" },
     ref_ph_role: { uz: "Rol nomini kiriting", cy: "Рол номини киритинг", en: "Enter role name", ru: "Введите название роли" },
     ref_permissions: { uz: "Ruxsatlar", cy: "Рухсатлар", en: "Permissions", ru: "Разрешения" },
     ref_no_permissions: { uz: "Ruxsatlar topilmadi", cy: "Рухсатлар топилмади", en: "No permissions found", ru: "Разрешения не найдены" },

     // ─── Ish jadvali ───
     ref_t_schedule: { uz: "Ish jadvali", cy: "Иш жадвали", en: "Work schedule", ru: "График работы" },
     ref_sub_schedule: { uz: "{n} ta ish jadvali mavjud", cy: "{n} та иш жадвали мавжуд", en: "{n} schedules available", ru: "Доступно графиков: {n}" },
     ref_add_schedule: { uz: "Jadval qo'shish", cy: "Жадвал қўшиш", en: "Add schedule", ru: "Добавить график" },
     ref_col_schedule: { uz: "Ish jadvali", cy: "Иш жадвали", en: "Work schedule", ru: "График" },
     ref_col_work_start: { uz: "Ish boshlanishi", cy: "Иш бошланиши", en: "Work start", ru: "Начало работы" },
     ref_col_work_end: { uz: "Ish tugashi", cy: "Иш тугаши", en: "Work end", ru: "Конец работы" },
     ref_col_lunch_start: { uz: "Tushlik boshlanishi", cy: "Тушлик бошланиши", en: "Lunch start", ru: "Начало обеда" },
     ref_col_lunch_end: { uz: "Tushlik tugashi", cy: "Тушлик тугаши", en: "Lunch end", ru: "Конец обеда" },
     ref_name_schedule: { uz: "Jadval nomi", cy: "Жадвал номи", en: "Schedule name", ru: "Название графика" },
     ref_ph_schedule: { uz: "Ish jadval nomi kiriting", cy: "Иш жадвал номини киритинг", en: "Enter schedule name", ru: "Введите название графика" },
     sch_no_lunch: { uz: "Tushliksiz", cy: "Тушликсиз", en: "No lunch", ru: "Без обеда" },
     sch_time_ph: { uz: "--:--", cy: "--:--", en: "--:--", ru: "--:--" },

     // ─── Sozlamalar ───
     settings_subtitle: { uz: "Tizimning oddiy sozlamalari", cy: "Тизимнинг оддий созламалари", en: "Basic system settings", ru: "Основные настройки системы" },
     set_lang_title: { uz: "Interfeys tili", cy: "Интерфейс тили", en: "Interface language", ru: "Язык интерфейса" },
     set_lang_sub: { uz: "Lotin yoki kirill yozuvi", cy: "Лотин ёки кирилл ёзуви", en: "Latin or Cyrillic script", ru: "Латиница или кириллица" },
     set_theme_title: { uz: "Rang rejimi", cy: "Ранг режими", en: "Color mode", ru: "Цветовой режим" },
     set_theme_sub: { uz: "Yorug' yoki tungi ko'rinish", cy: "Ёруғ ёки тунги кўриниш", en: "Light or dark appearance", ru: "Светлый или тёмный вид" },
     set_notif_title: { uz: "Bildirishnomalar", cy: "Билдиришномалар", en: "Notifications", ru: "Уведомления" },
     set_notif_sub: { uz: "Tizim bildirishnomalarini ko'rsatish", cy: "Тизим билдиришномаларини кўрсатиш", en: "Show system notifications", ru: "Показывать системные уведомления" },
     set_sound_title: { uz: "Ovozli signal", cy: "Овозли сигнал", en: "Sound alert", ru: "Звуковой сигнал" },
     set_sound_sub: { uz: "Yangi bildirishnomada ovoz", cy: "Янги билдиришномада овоз", en: "Sound on new notification", ru: "Звук при новом уведомлении" },
     set_version_title: { uz: "Tizim versiyasi", cy: "Тизим версияси", en: "System version", ru: "Версия системы" },
     set_lang_latin: { uz: "Lotin", cy: "Lotin", en: "Lotin", ru: "Lotin" },
     set_lang_cyrillic: { uz: "Кирил", cy: "Кирил", en: "Cyrillic", ru: "Кирил" },
     set_lang_russian: { uz: "Русский", cy: "Русский", en: "Russian", ru: "Русский" },

     // ─── Profil (Mening profilim) ───
     profile_title: { uz: "Mening profilim", cy: "Менинг профилим", en: "My profile", ru: "Мой профиль" },
     prof_filial: { uz: "Filial", cy: "Филиал", en: "Branch", ru: "Филиал" },
     prof_dept: { uz: "Bo'lim", cy: "Бўлим", en: "Department", ru: "Отдел" },
     prof_region: { uz: "Viloyat", cy: "Вилоят", en: "Region", ru: "Область" },
     prof_district: { uz: "Tuman", cy: "Туман", en: "District", ru: "Район" },
     prof_phone: { uz: "Telefon", cy: "Телефон", en: "Phone", ru: "Телефон" },
     prof_empty: { uz: "Ma'lumot yo'q", cy: "Маълумот йўқ", en: "No data", ru: "Нет данных" },

     // ─── Sozlamalar: hisob (foto + parol) ───
     set_account_subtitle: { uz: "Hisob ma'lumotlari", cy: "Ҳисоб маълумотлари", en: "Account details", ru: "Данные аккаунта" },
     set_photo_title: { uz: "Profil fotosurati", cy: "Профил фотосурати", en: "Profile photo", ru: "Фото профиля" },
     set_photo_sub: { uz: "Yuzingiz aniq ko'rinadigan rasm yuklang (Face ID)", cy: "Юзингиз аниқ кўринадиган расм юкланг (Face ID)", en: "Upload a photo with your face clearly visible (Face ID)", ru: "Загрузите фото с чётко видимым лицом (Face ID)" },
     photo_error: { uz: "Rasmni yuklab bo'lmadi", cy: "Расмни юклаб бўлмади", en: "Could not upload photo", ru: "Не удалось загрузить фото" },
     photo_uploading: { uz: "Yuklanmoqda...", cy: "Юкланмоқда...", en: "Uploading...", ru: "Загрузка..." },
     set_change: { uz: "O'zgartirish", cy: "Ўзгартириш", en: "Change", ru: "Изменить" },
     set_password_title: { uz: "Parolni o'zgartirish", cy: "Паролни ўзгартириш", en: "Change password", ru: "Сменить пароль" },
     set_password_sub: { uz: "Xavfsizlik uchun parolni vaqti-vaqti bilan yangilang", cy: "Хавфсизлик учун паролни вақти-вақти билан янгиланг", en: "Update your password periodically for security", ru: "Периодически обновляйте пароль для безопасности" },
     photo_updated: { uz: "Profil fotosurati yangilandi", cy: "Профил фотосурати янгиланди", en: "Profile photo updated", ru: "Фото профиля обновлено" },
     photo_too_large: { uz: "Rasm hajmi 5 MB dan oshmasligi kerak", cy: "Расм ҳажми 5 МБ дан ошмаслиги керак", en: "Image must be 5 MB or smaller", ru: "Размер изображения не должен превышать 5 МБ" },
     photo_invalid: { uz: "Faqat rasm fayli yuklang", cy: "Фақат расм файли юкланг", en: "Please upload an image file", ru: "Загрузите файл изображения" },

     // ─── Parolni o'zgartirish modali ───
     pwd_modal_title: { uz: "Yangi parol yarating", cy: "Янги парол яратинг", en: "Create a new password", ru: "Создайте новый пароль" },
     pwd_old: { uz: "Eski parol", cy: "Эски парол", en: "Old password", ru: "Старый пароль" },
     pwd_new: { uz: "Yangi parol", cy: "Янги парол", en: "New password", ru: "Новый пароль" },
     pwd_confirm: { uz: "Yangi parolni tasdiqlang", cy: "Янги паролни тасдиқланг", en: "Confirm new password", ru: "Подтвердите новый пароль" },
     pwd_save: { uz: "Saqlash", cy: "Сақлаш", en: "Save", ru: "Сохранить" },
     pwd_saving: { uz: "Saqlanmoqda...", cy: "Сақланмоқда...", en: "Saving...", ru: "Сохранение..." },
     pwd_req_len: { uz: "Kamida 8 belgi", cy: "Камида 8 белги", en: "At least 8 characters", ru: "Минимум 8 символов" },
     pwd_req_upper: { uz: "Katta harf (A–Z)", cy: "Катта ҳарф (A–Z)", en: "Uppercase letter (A–Z)", ru: "Заглавная буква (A–Z)" },
     pwd_req_lower: { uz: "Kichik harf (a–z)", cy: "Кичик ҳарф (a–z)", en: "Lowercase letter (a–z)", ru: "Строчная буква (a–z)" },
     pwd_req_digit: { uz: "Raqam (0–9)", cy: "Рақам (0–9)", en: "Number (0–9)", ru: "Цифра (0–9)" },
     pwd_req_special: { uz: "Maxsus belgi (!@#$%...)", cy: "Махсус белги (!@#$%...)", en: "Special character (!@#$%...)", ru: "Спецсимвол (!@#$%...)" },
     pwd_old_required: { uz: "Eski parolni kiriting", cy: "Эски паролни киритинг", en: "Enter your old password", ru: "Введите старый пароль" },
     pwd_weak: { uz: "Yangi parol barcha talablarga javob bermayapti", cy: "Янги парол барча талабларга жавоб бермаяпти", en: "New password does not meet all requirements", ru: "Новый пароль не соответствует всем требованиям" },
     pwd_mismatch: { uz: "Parollar mos kelmadi", cy: "Пароллар мос келмади", en: "Passwords do not match", ru: "Пароли не совпадают" },
     pwd_success: { uz: "Parol muvaffaqiyatli o'zgartirildi", cy: "Парол муваффақиятли ўзгартирилди", en: "Password changed successfully", ru: "Пароль успешно изменён" },
     pwd_error: { uz: "Parolni o'zgartirib bo'lmadi", cy: "Паролни ўзгартириб бўлмади", en: "Could not change password", ru: "Не удалось изменить пароль" },
     pwd_old_wrong: { uz: "Eski parol noto'g'ri", cy: "Эски парол нотўғри", en: "Old password is incorrect", ru: "Старый пароль неверный" },


     // loglar qismi
     history_menu_title: {
          uz: "Umumiy tarix",
          cy: "Умумий тарих",
          en: "History",
          ru: "История"
     },
     history_m_actions: {
          uz: "Harakatlar tarixi",
          cy: "Ҳаракатлар тарихи",
          en: "Action history",
          ru: "История действий"
     },
     history_m_faceid: {
          uz: "Yuz tanish tarixi",
          cy: "Юз таниш тарихи",
          en: "Face recognition history",
          ru: "История распознавания лиц"
     },
     history_m_location: {
          uz: "Joylashuv tarixi",
          cy: "Жойлашув тарихи",
          en: "Location history",
          ru: "История местоположений"
     },
     history_m_signature: {
          uz: "Imzo tarixi",
          cy: "Имзо тарихи",
          en: "Signature history",
          ru: "История подписей"
     },

     search_action_history: {
          uz: "Qidirish...",
          cy: "Қидириш...",
          en: "Search...",
          ru: "Поиск..."
     },
     col_user: {
          uz: "Foydalanuvchi",
          cy: "Фойдаланувчи",
          en: "User",
          ru: "Пользователь"
     },
     action_type: {
          uz: "Harakat turi",
          cy: "Ҳаракат тури",
          en: "Action type",
          ru: "Тип действия"
     },
     table_name_col: {
          uz: "Jadval nomi",
          cy: "Жадвал номи",
          en: "Table name",
          ru: "Название таблицы"
     },
     object_name_col: {
          uz: "Obyekt nomi",
          cy: "Объект номи",
          en: "Object name",
          ru: "Название объекта"
     },
     col_time: {
          uz: "Vaqti",
          cy: "Вақти",
          en: "Time",
          ru: "Время"
     },
     select_user: {
          uz: "Foydalanuvchi tanlang",
          cy: "Фойдаланувчи танланг",
          en: "Select user",
          ru: "Выберите пользователя"
     },
     select_action_type: {
          uz: "Harakat turini tanlang",
          cy: "Ҳаракат турини танланг",
          en: "Select action type",
          ru: "Выберите тип действия"
     },
     select_table_name: {
          uz: "Jadval nomini tanlang",
          cy: "Жадвал номини танланг",
          en: "Select table name",
          ru: "Выберите таблицу"
     },
     upload: {
          uz: "Yuklash",
          cy: "Юклаш",
          en: "Download",
          ru: "Загрузить"
     },
     action_create: {
          uz: "Yaratildi",
          cy: "Яратилди",
          en: "Created",
          ru: "Создано"
     },
     action_update: {
          uz: "Yangilandi",
          cy: "Янгиланди",
          en: "Updated",
          ru: "Обновлено"
     },
     action_delete: {
          uz: "O'chirildi",
          cy: "Ўчирилди",
          en: "Deleted",
          ru: "Удалено"
     },
     table_user: { uz: "Foydalanuvchi", cy: "Фойдаланувчи", en: "User", ru: "Пользователь" },
     table_geozone: { uz: "Geozona", cy: "Геозона", en: "Geozone", ru: "Геозона" },
     table_attendance_event: { uz: "Davomat hodisasi", cy: "Давомат ҳодисаси", en: "Attendance event", ru: "Событие посещаемости" },
     table_daily_attendance: { uz: "Kunlik davomat", cy: "Кунлик давомат", en: "Daily attendance", ru: "Ежедневная посещаемость" },
     table_kpi_result: { uz: "KPI natijasi", cy: "KPI натижаси", en: "KPI result", ru: "Результат KPI" },
     table_faceid_log: { uz: "Face ID logi", cy: "Face ID логи", en: "Face ID log", ru: "Лог Face ID" },
     table_gps_log: { uz: "GPS logi", cy: "GPS логи", en: "GPS log", ru: "Лог GPS" },

     status_success: {
          uz: "Ishonchli",
          cy: "Ишончли",
          en: "Trusted",
          ru: "Надежный"
     },
     status_failed: {
          uz: "Shubhali",
          cy: "Шубҳали",
          en: "Suspicious",
          ru: "Подозрительный"
     },

     distance_m: {
          uz: "Masofa (metr)",
          cy: "Масофа (метр)",
          en: "Distance (meters)",
          ru: "Расстояние (метры)"
     },

     user: {
          uz: "Foydalanuvchi",
          cy: "Фойдаланувчи",
          en: "User",
          ru: "Пользователь"
     },
     attendance_event: {
          uz: "Davomat hodisasi",
          cy: "Давомат ҳодисаси",
          en: "Attendance event",
          ru: "Событие посещаемости"
     },
     daily_attendance: {
          uz: "Kunlik Davomat",
          cy: "Кунлик Давомат",
          en: "Daily attendance",
          ru: "Ежедневная посещаемость"
     },
     kpi_result: {
          uz: "KPI Natijasi",
          cy: "KPI Натижаси",
          en: "KPI result",
          ru: "Результат KPI"
     },
     branch: {
          uz: "Filial",
          cy: "Филиал",
          en: "Branch",
          ru: "Филиал"
     },
     department: {
          uz: "Bo'lim",
          cy: "Бўлим",
          en: "Department",
          ru: "Отдел"
     },
     position: {
          uz: "Lavozim",
          cy: "Лавозим",
          en: "Position",
          ru: "Должность"
     },
     role: {
          uz: "Rol",
          cy: "Рол",
          en: "Role",
          ru: "Роль"
     },
     permission: {
          uz: "Ruxsat",
          cy: "Рухсат",
          en: "Permission",
          ru: "Разрешение"
     },
     work_schedule: {
          uz: "Ish grafigi",
          cy: "Иш графиги",
          en: "Work schedule",
          ru: "График работы"
     },
     geofence: {
          uz: "Geozona",
          cy: "Геозона",
          en: "Geofence",
          ru: "Геозона"
     },
     weekday: {
          uz: "Hafta kuni",
          cy: "Ҳафта куни",
          en: "Weekday",
          ru: "День недели"
     },
     notification: {
          uz: "Xabarnoma",
          cy: "Хабарнома",
          en: "Notification",
          ru: "Уведомление"
     },
     detail_title: {
          uz: "Foydalanuvchi va so'rov haqida ma'lumot",
          cy: "Фойдаланувчи ва сўров ҳақида маълумот",
          en: "User and request information",
          ru: "Информация о пользователе и запросе"
     },
     record_id: {
          uz: "Yozuv ID",
          cy: "Ёзув ID",
          en: "Record ID",
          ru: "ID записи"
     },
     old_values: {
          uz: "Eski qiymat",
          cy: "Эски қиймат",
          en: "Old value",
          ru: "Старое значение"
     },
     new_values: {
          uz: "Yangi qiymat",
          cy: "Янги қиймат",
          en: "New value",
          ru: "Новое значение"
     },
     close: {
          uz: "Yopish",
          cy: "Ёпиш",
          en: "Close",
          ru: "Закрыть"
     },
     distance: {
          uz: "Masofa",
          cy: "Масофа",
          en: "Distance",
          ru: "Расстояние"
     },
     meter: {
          uz: "metr",
          cy: "метр",
          en: "meter",
          ru: "метр"
     },
     created_at: {
          uz: "Yaratilgan vaqti",
          cy: "Яратилган вақти",
          en: "Created at",
          ru: "Дата создания"
     },
     updated_at: {
          uz: "Yangilangan vaqti",
          cy: "Янгиланган вақти",
          en: "Updated at",
          ru: "Дата обновления"
     },
     message: {
          uz: "Xabar",
          cy: "Хабар",
          en: "Message",
          ru: "Сообщение"
     },
     map_normal: {
          uz: "Ko'cha xaritasi",
          cy: "Кўча харитаси",
          en: "Street map",
          ru: "Карта улиц"
     },
     map_satellite: {
          uz: "Sun'iy yo'ldosh",
          cy: "Сун'ий йўлдош",
          en: "Satellite",
          ru: "Спутник"
     },

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
