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
     full_name: {
          uz: "Ism familiya",
          cy: "Исм фамилия",
          en: "First and last name",
          ru: "Имя и фамилия"
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
          uz: "Xodimlar reestri",
          cy: "Ходимлар реэстри",
          en: "Employee Register",
          ru: "Реестр работников"
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
     present_today: {
          uz: "Bugun kelganlar",
          cy: "Бугун келганлар",
          en: "Present today",
          ru: "Присутствуют сегодня"
     },
     trend_attendance: {
          uz: "davomat",
          cy: "давомат",
          en: "attendance",
          ru: "посещаемость"
     },
     latecomers: {
          uz: "Kechikkanlar",
          cy: "Кечикканлар",
          en: "Latecomers",
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
          uz: "Kelmaganlar",
          cy: "Келмаганлар",
          en: "Absent",
          ru: "Отсутствуют"
     },
     on_time: {
          uz: "Vaqtida",
          cy: "Вақтида",
          en: "On time",
          ru: "Вовремя"
     },
     late: {
          uz: "Kechikdi",
          cy: "Кечикди",
          en: "Late",
          ru: "Опоздал"
     },
     early_left: {
          uz: "Erta ketdi",
          cy: "Эрта кетди",
          en: "Early left",
          ru: "Ушел раньше"
     },
     absent_today: {
          uz: "Kelmadi",
          cy: "Келмади",
          en: "Absent",
          ru: "Не пришел"
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
          uz: "Bugungi holat",
          cy: "Бугунги ҳолат",
          en: "Today's status",
          ru: "Сегодняшнее состояние"
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
