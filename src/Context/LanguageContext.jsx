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
     branch: {
          uz: "Filial",
          cy: "Филиал",
          en: "Branch",
          ru: "Филиал"
     },
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
     }
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
