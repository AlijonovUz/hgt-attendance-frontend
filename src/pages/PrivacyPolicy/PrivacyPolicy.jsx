import { useEffect } from "react"

// Umumiy maxfiylik siyosati — login talab qilinmaydi (Layout'dan tashqarida).
// Uslublar `.pp-root` ostida skoplangan, shuning uchun ilovaning qolgan
// qismiga (Tailwind/global) ta'sir qilmaydi.
const PrivacyPolicy = () => {
  useEffect(() => {
    const prev = document.title
    document.title = "Maxfiylik siyosati — HGT kelish ketish"
    return () => { document.title = prev }
  }, [])

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
          padding: 40px 24px;
          background: #ffffff;
        }
        .pp-root h1, .pp-root h2, .pp-root h3 { color: #0f172a; line-height: 1.3; }
        .pp-root h1 { font-size: 30px; margin-bottom: 10px; }
        .pp-root h2 { font-size: 22px; margin-top: 34px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .pp-root p, .pp-root li { font-size: 16px; }
        .pp-root .meta { color: #64748b; margin-bottom: 28px; }
        .pp-root .note { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 16px; margin: 22px 0; }
        .pp-root table { width: 100%; border-collapse: collapse; margin: 14px 0 24px; font-size: 15px; }
        .pp-root th, .pp-root td { border: 1px solid #e5e7eb; padding: 10px; vertical-align: top; text-align: left; }
        .pp-root th { background: #f1f5f9; }
        .pp-root footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 14px; }
      `}</style>

      <main className="container">
        <h1>“HGT kelish ketish” mobil axborot tizimi uchun Maxfiylik siyosati</h1>
        <p className="meta">Oxirgi yangilangan sana: 2026-yil 19-iyun</p>

        <div className="note">
          Ushbu Maxfiylik siyosati xodimlarining kelish-ketishini nazorat qilish,
          davomatni yuritish, GPS/geozona tekshiruvi va Face ID orqali shaxsni tasdiqlash uchun
          mo‘ljallangan “HGT kelish ketish” mobil axborot tizimidan foydalanishda shaxsiy ma’lumotlar
          qanday yig‘ilishi, ishlatilishi, saqlanishi va himoya qilinishini tushuntiradi.
        </div>

        <h2>1. Umumiy qoidalar</h2>
        <p>
          “HGT kelish ketish” axborot tizimi ning markaziy apparati,
          hududiy filiallari, tuman va shahar gaz ta’minoti bo‘limlari xodimlarining ishga kelishi,
          tushlikka chiqishi, tushlikdan qaytishi va ishdan ketishini elektron tarzda qayd etish uchun
          ishlab chiqiladi.
        </p>
        <p>
          Tizimdan foydalanish orqali foydalanuvchi ushbu Maxfiylik siyosatida ko‘rsatilgan
          shartlarga rozilik bildiradi.
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
        <p>
          Tizimda ma’lumotlarni himoya qilish uchun quyidagi xavfsizlik choralaridan foydalaniladi:
        </p>
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
          Parol kamida 8 belgidan iborat bo‘lishi, katta harf, kichik harf, raqam va maxsus belgi saqlashi tavsiya etiladi.
          Noto‘g‘ri kirish urinishlari 5 marta ketma-ket takrorlansa, akkaunt vaqtincha bloklanishi mumkin.
        </p>

        <h2>11. Backup va ma’lumotlarni tiklash</h2>
        <p>
          Ma’lumotlar bazasi bo‘yicha kunlik, haftalik va oylik backup siyosati qo‘llanadi.
          Tizimda ma’lumotlarni tiklash uchun RPO ≤ 1 soat va RTO ≤ 4 soat talablari ko‘zda tutiladi.
        </p>

        <h2>12. Bolalar ma’lumotlari</h2>
        <p>
          Tizim korxona xodimlari uchun mo‘ljallangan bo‘lib, voyaga yetmagan shaxslar uchun ommaviy xizmat
          sifatida taqdim etilmaydi.
        </p>

        <h2>13. Maxfiylik siyosatiga o‘zgartirish kiritish</h2>
        <p>
          Ushbu Maxfiylik siyosati tizim funksiyalari, qonunchilik talablari yoki tashkilot ichki qoidalari
          o‘zgargan taqdirda yangilanishi mumkin. Yangilangan versiya tizimda e’lon qilingan kundan boshlab kuchga kiradi.
        </p>

        <h2>14. Aloqa ma’lumotlari</h2>
        <p>
          Maxfiylik siyosati, shaxsiy ma’lumotlar yoki tizim xavfsizligi bo‘yicha savollar yuzasidan
          ning mas’ul bo‘limiga murojaat qilinadi.
        </p>
        <p>
          <strong>Tashkilot:</strong> "Raqamli Nazorat" MCHJ<br />
          <strong>Telefon:</strong> +998 50 200 21 22<br />
          <strong>Email:</strong> raqamlinazorat3@gmail.com
        </p>
      </main>
    </div>
  )
}

export default PrivacyPolicy
