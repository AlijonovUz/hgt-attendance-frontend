import { useEffect, useState } from "react"

// Umumiy maxfiylik siyosati — login talab qilinmaydi (Layout'dan tashqarida).
// Ikki tilli (O'zbek / English), til almashtirgich bilan.
// Uslublar `.pp-root` ostida skoplangan, shuning uchun ilovaning qolgan
// qismiga (Tailwind/global) ta'sir qilmaydi.
const PrivacyPolicy = () => {
  const [lang, setLang] = useState(
    () => localStorage.getItem("privacyPolicyLanguage") || "uz"
  )

  useEffect(() => {
    const prev = document.title
    document.title =
      lang === "en"
        ? "Privacy Policy — HGT kelish ketish"
        : "Maxfiylik siyosati — HGT kelish ketish"
    document.documentElement.lang = lang
    return () => { document.title = prev }
  }, [lang])

  const changeLang = (next) => {
    setLang(next)
    localStorage.setItem("privacyPolicyLanguage", next)
  }

  return (
    <div className="pp-root">
      <style>{`
        .pp-root {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.7;
          color: #1f2937;
          background: #f8fafc;
          min-height: 100vh;
        }
        .pp-root .container {
          max-width: 980px;
          margin: 0 auto;
          padding: 32px 24px 44px;
          background: #ffffff;
          min-height: 100vh;
        }
        .pp-root .language-bar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #e5e7eb;
          padding: 14px 0;
          margin: -32px -24px 28px;
        }
        .pp-root .language-inner {
          max-width: 980px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        .pp-root .language-label { color: #64748b; font-size: 14px; margin-right: 6px; }
        .pp-root .lang-btn {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #0f172a;
          padding: 9px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 15px;
          transition: 0.2s ease;
        }
        .pp-root .lang-btn:hover { border-color: #2563eb; color: #1d4ed8; }
        .pp-root .lang-btn.active { background: #2563eb; border-color: #2563eb; color: #ffffff; }
        .pp-root h1, .pp-root h2, .pp-root h3 { color: #0f172a; line-height: 1.3; }
        .pp-root h1 { font-size: 30px; margin: 0 0 10px; }
        .pp-root h2 { font-size: 22px; margin-top: 34px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .pp-root p, .pp-root li { font-size: 16px; }
        .pp-root .meta { color: #64748b; margin-bottom: 28px; }
        .pp-root .note { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 16px; margin: 22px 0; border-radius: 0 10px 10px 0; }
        .pp-root table { width: 100%; border-collapse: collapse; margin: 14px 0 24px; font-size: 15px; }
        .pp-root th, .pp-root td { border: 1px solid #e5e7eb; padding: 10px; vertical-align: top; text-align: left; }
        .pp-root th { background: #f1f5f9; }
        .pp-root footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 14px; }
        @media (max-width: 640px) {
          .pp-root .container { padding: 24px 14px 34px; }
          .pp-root .language-bar { margin: -24px -14px 24px; }
          .pp-root .language-inner { justify-content: flex-start; padding: 0 14px; }
          .pp-root h1 { font-size: 24px; }
          .pp-root h2 { font-size: 19px; }
          .pp-root table { display: block; overflow-x: auto; white-space: nowrap; }
        }
      `}</style>

      <main className="container">
        <div className="language-bar">
          <div className="language-inner">
            <span className="language-label">Til / Language:</span>
            <button
              type="button"
              className={`lang-btn${lang === "uz" ? " active" : ""}`}
              onClick={() => changeLang("uz")}
            >
              O‘zbek
            </button>
            <button
              type="button"
              className={`lang-btn${lang === "en" ? " active" : ""}`}
              onClick={() => changeLang("en")}
            >
              English
            </button>
          </div>
        </div>

        {lang === "uz" ? (
          <section>
            <h1>“HGT kelish ketish” mobil axborot tizimi uchun Maxfiylik siyosati</h1>
            <p className="meta">Oxirgi yangilangan sana: 2026-yil 19-iyun</p>

            <div className="note">
              Ushbu Maxfiylik siyosati xodimlarning kelish-ketishini nazorat qilish, davomatni yuritish,
              GPS/geozona tekshiruvi va Face ID orqali shaxsni tasdiqlash uchun mo‘ljallangan
              “HGT kelish ketish” mobil axborot tizimidan foydalanishda shaxsiy ma’lumotlar qanday
              yig‘ilishi, ishlatilishi, saqlanishi va himoya qilinishini tushuntiradi.
            </div>

            <h2>1. Umumiy qoidalar</h2>
            <p>
              “HGT kelish ketish” axborot tizimi tashkilot xodimlarining ishga kelishi, tushlikka chiqishi,
              tushlikdan qaytishi va ishdan ketishini elektron tarzda qayd etish uchun ishlab chiqiladi.
            </p>
            <p>
              Tizimdan foydalanish orqali foydalanuvchi ushbu Maxfiylik siyosatida ko‘rsatilgan shartlarga
              rozilik bildiradi.
            </p>

            <h2>2. Qanday ma’lumotlar yig‘iladi?</h2>
            <p>Tizim quyidagi turdagi ma’lumotlarni qayta ishlashi mumkin:</p>

            <table>
              <thead>
                <tr>
                  <th>Ma’lumot turi</th>
                  <th>Misollar</th>
                  <th>Maqsad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Shaxsiy identifikatsiya ma’lumotlari</td>
                  <td>F.I.Sh., telefon raqam, lavozim, bo‘lim, filial, xodim ID</td>
                  <td>Xodimni tizimda aniqlash va davomatni yuritish</td>
                </tr>
                <tr>
                  <td>Autentifikatsiya ma’lumotlari</td>
                  <td>Login, parol, JWT token, MFA ma’lumotlari</td>
                  <td>Tizimga xavfsiz kirishni ta’minlash</td>
                </tr>
                <tr>
                  <td>Biometrik ma’lumotlar</td>
                  <td>Face ID uchun yuz tasviri yoki yuzni tekshirish natijalari</td>
                  <td>Xodim shaxsini tasdiqlash va soxta qaydlarni oldini olish</td>
                </tr>
                <tr>
                  <td>Geolokatsiya ma’lumotlari</td>
                  <td>GPS latitude, longitude, geozona tekshiruvi natijasi</td>
                  <td>Xodim belgilangan ish joyida ekanini tekshirish</td>
                </tr>
                <tr>
                  <td>Davomat ma’lumotlari</td>
                  <td>Ishga kelish, tushlikka chiqish, tushlikdan qaytish, ishdan ketish vaqtlari</td>
                  <td>Davomat nazorati, kechikish va erta ketishni aniqlash</td>
                </tr>
                <tr>
                  <td>Audit va texnik loglar</td>
                  <td>Kirish, chiqish, ma’lumot kiritish, o‘zgartirish, o‘chirish, admin harakatlari</td>
                  <td>Xavfsizlik, monitoring va tekshiruvlar</td>
                </tr>
                <tr>
                  <td>Qurilma va texnik ma’lumotlar</td>
                  <td>Mobil qurilma turi, tizim versiyasi, ilova versiyasi, IP-manzil</td>
                  <td>Xavfsizlik, nosozliklarni aniqlash va tizim barqarorligini ta’minlash</td>
                </tr>
              </tbody>
            </table>

            <h2>3. Ma’lumotlardan foydalanish maqsadlari</h2>
            <p>Yig‘ilgan ma’lumotlar quyidagi maqsadlarda ishlatiladi:</p>
            <ul>
              <li>davomat jarayonlarini avtomatlashtirish;</li>
              <li>xodimning ish joyiga kelganini GPS va geozona orqali tekshirish;</li>
              <li>Face ID orqali xodim shaxsini tasdiqlash;</li>
              <li>kechikish, tushlikdan kech qaytish, erta ketish va kelmaganlik holatlarini aniqlash;</li>
              <li>KPI va intizom ko‘rsatkichlarini hisoblash;</li>
              <li>rahbariyat, kadrlar bo‘limi va administratorlar uchun hisobotlar shakllantirish;</li>
              <li>tizim xavfsizligini ta’minlash va audit yuritish;</li>
              <li>foydalanuvchilarga push, SMS, Telegram yoki email xabarnomalar yuborish.</li>
            </ul>

            <h2>4. Geolokatsiya va Face IDdan foydalanish</h2>
            <p>
              Tizim xodimning davomat qaydini tasdiqlash uchun GPS koordinatalarni qabul qiladi va
              belgilangan geozona bilan solishtiradi. Geozona radiusi tashkilot tomonidan tasdiqlangan
              ish joyi yoki obyekt koordinatalari asosida belgilanadi.
            </p>
            <p>
              Face ID xodimning shaxsini tasdiqlash uchun ishlatiladi. Tizim yuzni ro‘yxatdan o‘tkazish,
              qayta yangilash, liveness tekshiruvi va foto orqali aldashdan himoya mexanizmlarini qo‘llashi mumkin.
            </p>

            <h2>5. Ma’lumotlarni himoya qilish</h2>
            <p>Tizimda ma’lumotlarni himoya qilish uchun quyidagi xavfsizlik choralaridan foydalaniladi:</p>
            <ul>
              <li>HTTPS/TLS 1.3 orqali himoyalangan ulanish;</li>
              <li>AES-256 shifrlash mexanizmlari;</li>
              <li>JWT autentifikatsiya;</li>
              <li>MFA — ikki bosqichli autentifikatsiya;</li>
              <li>RBAC — rollar asosida kirish huquqlarini boshqarish;</li>
              <li>audit log yuritish;</li>
              <li>IP whitelist va device binding mexanizmlari;</li>
              <li>ma’lumotlar bazasining muntazam backup nusxalarini yaratish.</li>
            </ul>

            <h2>6. Ma’lumotlarga kimlar kira oladi?</h2>
            <p>
              Ma’lumotlarga kirish foydalanuvchi roli va vakolatlariga qarab cheklanadi.
              Tizimda quyidagi rollar bo‘lishi mumkin:
            </p>
            <ul>
              <li>xodim;</li>
              <li>bo‘lim boshlig‘i;</li>
              <li>kadrlar bo‘limi;</li>
              <li>filial rahbariyati;</li>
              <li>markaziy apparat;</li>
              <li>tizim administratori.</li>
            </ul>
            <p>
              Oddiy xodim odatda faqat o‘ziga tegishli davomat va profil ma’lumotlarini ko‘radi.
              Rahbarlar esa o‘z vakolati doirasida bo‘lim, filial yoki umumiy tizim bo‘yicha ma’lumotlarni
              ko‘rishi mumkin.
            </p>

            <h2>7. Ma’lumotlarni uchinchi tomonlarga berish</h2>
            <p>
              Shaxsiy ma’lumotlar qonunchilikda belgilangan holatlardan tashqari uchinchi tomonlarga
              berilmaydi. Tizim kelgusida 1C, ERP, korporativ portal, SMS gateway, Telegram Bot,
              Active Directory yoki elektron hujjat aylanishi tizimlari bilan integratsiya qilinishi mumkin.
              Bunday integratsiyalar faqat xizmat zarurati va tashkilotning ichki tartiblariga muvofiq amalga oshiriladi.
            </p>

            <h2>8. Offline rejim va sinxronizatsiya</h2>
            <p>
              Internet mavjud bo‘lmagan holatda tizim ayrim ma’lumotlarni qurilmada vaqtincha saqlashi mumkin.
              Internet tiklangach, lokal saqlangan ma’lumotlar serverga yuboriladi va sinxronizatsiya qilinadi.
            </p>

            <h2>9. Foydalanuvchi huquqlari</h2>
            <p>Foydalanuvchi o‘z vakolati va amaldagi qonunchilik doirasida quyidagi huquqlarga ega:</p>
            <ul>
              <li>o‘ziga tegishli ma’lumotlarni ko‘rish;</li>
              <li>noto‘g‘ri ma’lumotlarni tuzatishni so‘rash;</li>
              <li>ma’lumotlar qanday maqsadda ishlatilayotganini bilish;</li>
              <li>tizimdan foydalanish bo‘yicha tushuntirish olish;</li>
              <li>qonunchilikda nazarda tutilgan boshqa huquqlardan foydalanish.</li>
            </ul>

            <h2>10. Parol va akkaunt xavfsizligi</h2>
            <p>
              Foydalanuvchi login va parolini uchinchi shaxslarga bermasligi kerak.
              Parol kamida 8 belgidan iborat bo‘lishi, katta harf, kichik harf, raqam va maxsus belgi
              saqlashi tavsiya etiladi. Noto‘g‘ri kirish urinishlari 5 marta ketma-ket takrorlansa,
              akkaunt vaqtincha bloklanishi mumkin.
            </p>

            <h2>11. Backup va ma’lumotlarni tiklash</h2>
            <p>
              Ma’lumotlar bazasi bo‘yicha kunlik, haftalik va oylik backup siyosati qo‘llanadi.
              Tizimda ma’lumotlarni tiklash uchun RPO ≤ 1 soat va RTO ≤ 4 soat talablari ko‘zda tutiladi.
            </p>

            <h2>12. Bolalar ma’lumotlari</h2>
            <p>
              Tizim korxona xodimlari uchun mo‘ljallangan bo‘lib, voyaga yetmagan shaxslar uchun
              ommaviy xizmat sifatida taqdim etilmaydi.
            </p>

            <h2>13. Maxfiylik siyosatiga o‘zgartirish kiritish</h2>
            <p>
              Ushbu Maxfiylik siyosati tizim funksiyalari, qonunchilik talablari yoki tashkilot ichki qoidalari
              o‘zgargan taqdirda yangilanishi mumkin. Yangilangan versiya tizimda e’lon qilingan kundan boshlab kuchga kiradi.
            </p>

            <h2>14. Aloqa ma’lumotlari</h2>
            <p>
              Maxfiylik siyosati, shaxsiy ma’lumotlar yoki tizim xavfsizligi bo‘yicha savollar yuzasidan
              tashkilotning mas’ul bo‘limiga murojaat qilinadi.
            </p>
            <p>
              <strong>Tashkilot:</strong> “Raqamli Nazorat” MCHJ<br />
              <strong>Telefon:</strong> +998 50 200 21 22<br />
              <strong>Email:</strong> raqamlinazorat3@gmail.com
            </p>

            <footer>
              Ushbu ikki tilli hujjat “HGT kelish ketish” mobil axborot tizimi uchun maxfiylik siyosati namunasi sifatida tayyorlandi.
            </footer>
          </section>
        ) : (
          <section>
            <h1>Privacy Policy for the “HGT kelish ketish” Mobile Information System</h1>
            <p className="meta">Last updated: June 19, 2026</p>

            <div className="note">
              This Privacy Policy explains how personal data is collected, used, stored, and protected
              when using the “HGT kelish ketish” mobile information system, which is designed to monitor
              employee attendance, record check-in and check-out activities, verify location through GPS/geofence
              checks, and confirm identity using Face ID.
            </div>

            <h2>1. General Provisions</h2>
            <p>
              The “HGT kelish ketish” information system is developed to electronically record employees’
              arrival at work, lunch break start, return from lunch, and departure from work.
            </p>
            <p>
              By using the system, the user agrees to the terms described in this Privacy Policy.
            </p>

            <h2>2. What Data Is Collected?</h2>
            <p>The system may process the following types of data:</p>

            <table>
              <thead>
                <tr>
                  <th>Data Type</th>
                  <th>Examples</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Personal identification data</td>
                  <td>Full name, phone number, position, department, branch, employee ID</td>
                  <td>To identify the employee in the system and maintain attendance records</td>
                </tr>
                <tr>
                  <td>Authentication data</td>
                  <td>Login, password, JWT token, MFA data</td>
                  <td>To ensure secure access to the system</td>
                </tr>
                <tr>
                  <td>Biometric data</td>
                  <td>Face image for Face ID or face verification results</td>
                  <td>To verify the employee’s identity and prevent fraudulent attendance records</td>
                </tr>
                <tr>
                  <td>Geolocation data</td>
                  <td>GPS latitude, longitude, geofence verification result</td>
                  <td>To verify that the employee is at the designated workplace</td>
                </tr>
                <tr>
                  <td>Attendance data</td>
                  <td>Work arrival, lunch start, lunch return, and work departure times</td>
                  <td>Attendance control, detecting lateness and early departure</td>
                </tr>
                <tr>
                  <td>Audit and technical logs</td>
                  <td>Login, logout, data entry, editing, deletion, administrator actions</td>
                  <td>Security, monitoring, and audit checks</td>
                </tr>
                <tr>
                  <td>Device and technical data</td>
                  <td>Mobile device type, operating system version, app version, IP address</td>
                  <td>Security, troubleshooting, and ensuring system stability</td>
                </tr>
              </tbody>
            </table>

            <h2>3. Purposes of Data Use</h2>
            <p>The collected data is used for the following purposes:</p>
            <ul>
              <li>to automate attendance processes;</li>
              <li>to verify that the employee has arrived at the workplace using GPS and geofence checks;</li>
              <li>to confirm the employee’s identity using Face ID;</li>
              <li>to detect lateness, late return from lunch, early departure, and absence;</li>
              <li>to calculate KPI and discipline indicators;</li>
              <li>to generate reports for management, HR, and system administrators;</li>
              <li>to ensure system security and maintain audit records;</li>
              <li>to send push, SMS, Telegram, or email notifications to users.</li>
            </ul>

            <h2>4. Use of Geolocation and Face ID</h2>
            <p>
              The system receives GPS coordinates to confirm an employee’s attendance record and compares
              them with the approved geofence. The geofence radius is determined based on workplace or
              facility coordinates approved by the organization.
            </p>
            <p>
              Face ID is used to confirm the employee’s identity. The system may support face enrollment,
              face data renewal, liveness checks, and protection against photo-based spoofing.
            </p>

            <h2>5. Data Protection</h2>
            <p>The system uses the following security measures to protect data:</p>
            <ul>
              <li>secure connection through HTTPS/TLS 1.3;</li>
              <li>AES-256 encryption mechanisms;</li>
              <li>JWT authentication;</li>
              <li>MFA — multi-factor authentication;</li>
              <li>RBAC — role-based access control;</li>
              <li>audit logging;</li>
              <li>IP whitelist and device binding mechanisms;</li>
              <li>regular database backups.</li>
            </ul>

            <h2>6. Who Can Access the Data?</h2>
            <p>
              Access to data is restricted based on user roles and permissions. The system may include
              the following roles:
            </p>
            <ul>
              <li>employee;</li>
              <li>department manager;</li>
              <li>HR department;</li>
              <li>branch management;</li>
              <li>central office;</li>
              <li>system administrator.</li>
            </ul>
            <p>
              A regular employee can usually view only their own attendance and profile data.
              Managers may view data related to their department, branch, or the overall system
              according to their authorized scope.
            </p>

            <h2>7. Disclosure of Data to Third Parties</h2>
            <p>
              Personal data is not disclosed to third parties except where required by law. In the future,
              the system may be integrated with 1C, ERP, a corporate portal, SMS gateway, Telegram Bot,
              Active Directory, or an electronic document management system. Such integrations are performed
              only when necessary for service purposes and in accordance with the organization’s internal rules.
            </p>

            <h2>8. Offline Mode and Synchronization</h2>
            <p>
              If the internet connection is unavailable, the system may temporarily store certain data on the device.
              Once the connection is restored, locally stored data is sent to the server and synchronized.
            </p>

            <h2>9. User Rights</h2>
            <p>Within their authority and applicable law, the user has the following rights:</p>
            <ul>
              <li>to view their own data;</li>
              <li>to request correction of inaccurate data;</li>
              <li>to know for what purposes their data is being used;</li>
              <li>to receive explanations regarding system usage;</li>
              <li>to exercise other rights provided by applicable law.</li>
            </ul>

            <h2>10. Password and Account Security</h2>
            <p>
              The user must not share their login and password with third parties. It is recommended that
              the password contain at least 8 characters, including an uppercase letter, lowercase letter,
              number, and special character. If incorrect login attempts occur 5 times in a row, the account
              may be temporarily blocked.
            </p>

            <h2>11. Backup and Data Recovery</h2>
            <p>
              Daily, weekly, and monthly backup policies are applied to the database. The system provides
              for data recovery requirements of RPO ≤ 1 hour and RTO ≤ 4 hours.
            </p>

            <h2>12. Children’s Data</h2>
            <p>
              The system is intended for organization employees and is not provided as a public service for minors.
            </p>

            <h2>13. Changes to This Privacy Policy</h2>
            <p>
              This Privacy Policy may be updated if system functionality, legal requirements, or the organization’s
              internal rules change. The updated version becomes effective from the date it is published in the system.
            </p>

            <h2>14. Contact Information</h2>
            <p>
              For questions regarding this Privacy Policy, personal data, or system security, users may contact
              the organization’s responsible department.
            </p>
            <p>
              <strong>Organization:</strong> “Raqamli Nazorat” LLC<br />
              <strong>Phone:</strong> +998 50 200 21 22<br />
              <strong>Email:</strong> raqamlinazorat3@gmail.com
            </p>

            <footer>
              This bilingual document is prepared as a sample Privacy Policy for the “HGT kelish ketish” mobile information system.
            </footer>
          </section>
        )}
      </main>
    </div>
  )
}

export default PrivacyPolicy
