export const groupA = [
  {
    slug: 'ats-uyumlu-cv',
    published: '2026-08-24',
    updated: '2026-08-24',
    en: {
      title: 'What ATS-friendly actually means for a CV',
      description:
        'How applicant-tracking systems read PDFs, which headings they expect, and what actually makes a CV ATS-friendly.',
      sections: [
        {
          heading: 'What the software is doing with your file',
          paragraphs: [
            'When you apply through Kariyer.net, a company career page in Istanbul or Ankara, or LinkedIn Easy Apply, your PDF often never reaches a person first. An applicant-tracking system stores the file, pulls text out of it, and tries to drop that text into fields: name, email, job titles, employers, dates, schools. Recruiters then search those fields. If the parse is messy, you can still sit in the database, but you will not appear for the query they actually run — job title plus city, or a tool name plus years of use.',
            'ATS-friendly is not a visual style. It is whether that extraction produced a usable record. A document can look expensive on a phone and still dump your last employer under education, scramble March 2022 into a skill, or miss your email because it lived inside a header graphic. Human readers at banks, factories in Kocaeli, and consultancies in Levent still open the PDF. The software decides whether they find you at all.',
            'Turkish companies do not all run the same stack. Some use the built-in parser on a local job board. Multinationals often sit on Workday, SAP SuccessFactors, or Greenhouse. The details differ. The failure modes do not: unselectable text, decorative headings, and layouts that read left-to-right through the wrong column. Write for the worst parser you might meet, not for the one screenshot on a design blog.',
          ],
        },
        {
          heading: 'How PDF text is actually extracted',
          paragraphs: [
            'A PDF is not a Word document with a lock on it. It is a set of drawing instructions: put this glyph at this coordinate. A parser reconstructs reading order by guessing which glyphs belong to a line, then which lines belong to a block. If two columns sit side by side, the guess is often “read across” instead of “finish the left column.” Your customer-service bullets can interleave with a skills list that was meant to live in the sidebar.',
            'That is why scanned pages fail so often. A photograph of a CV, or a PDF exported from a phone with no text layer, leaves the ATS with an image. Some systems run optical character recognition. OCR mangles Turkish characters first: ı becomes i, ğ disappears, Ş turns into S. Your name, university, and city are the fields you can least afford to misspell in a database. If you cannot highlight a sentence in Preview or Adobe Reader and copy it, the file is not a text PDF.',
            'Headers and footers are another trap. Repeating your name and page number on every page looks tidy. Parsers sometimes glue that repeated line into the middle of a job description. Keep identity and contact once, at the top of page one, in normal body text. Page numbers are optional on a one-page file and not worth the risk on a two-page one if they sit in a floating box.',
          ],
        },
        {
          heading: 'Headings parsers recognise — and ones they do not',
          paragraphs: [
            'Most systems look for a small set of English or Turkish labels: Experience or Work Experience or İş Deneyimi; Education or Eğitim; Skills or Yetenekler; Summary or Profil or Profesyonel Özet. They are not literary critics. A heading called “Where I have been” or “My journey” will often be treated as a blob of unknown text. Fancy names feel personal. They cost you structured fields.',
            'Match the language of the rest of the file. An English CV aimed at a shared-services centre in Istanbul should use Experience, Education, Skills. A Turkish CV for a domestic manufacturer should use İş Deneyimi, Eğitim, Yetenekler. Mixing “Experience” with a Turkish body, or inventing “Kariyer Hikâyem,” trains the parser to ignore the section break. Subheadings under a job — “Selected work,” “Stack” — are fine as ordinary bold lines, not as replacements for the main labels.',
            'Contact details belong in text, not in icons. A tiny envelope graphic with no email string next to it cannot be copied. Write the address in full: name@domain.com. The same rule applies to LinkedIn URLs and phone numbers. +90 with a space is readable for people and machines. A phone icon borrowed from a Canva pack is neither.',
          ],
        },
        {
          heading: 'Columns, tables, and reading order',
          paragraphs: [
            'Two-column templates are the most common reason a Turkish graduate’s CV collapses in a tracker. The left rail holds skills and languages; the right holds jobs. You see two stories. The parser sees one zigzag. Dates from the rail attach to the wrong employer. A three-month internship in Izmir becomes a skill called “2024.” Recruiters then think your timeline is dishonest when the file was only decorative.',
            'Tables have the same problem with a different costume. Word tables and invisible grids look aligned on your laptop. Extraction often reads cell by cell, left to right, so “Ankara” sits on the same line as a bullet from a different job. If you need alignment, use a single column and put the dates on the same line as the job title, after a middot or an en dash, in ordinary text. That pattern survives almost every parser used in Turkey and abroad.',
          ],
          list: [
            'One main column for experience and education; no sidebar of skills that sits beside job text.',
            'Dates on the same line as the role, in a consistent format such as Mar 2022 – Present or 03.2022 – Devam.',
            'No text boxes stacked in a design tool; they export as separate PDF objects with unstable order.',
            'No full-page table whose first column is labels and whose second column is content.',
            'Skills after experience, in their own section, not floating in a coloured rail.',
            'If you already designed a two-column file, paste it into a plain document and rebuild the order by hand before you apply.',
          ],
        },
        {
          heading: 'Images, icons, skill bars, and photos',
          paragraphs: [
            'Anything that is only a picture is invisible to a text parser. Skill bars, circular charts, and star rows look like assessment. They are not data. The ATS cannot store “four out of five dots in Python.” A human in a hurry cannot either, because the scale is undefined. Write the skill name. If you must show depth, use a short qualifier in words: daily use, classroom only, reading knowledge.',
            'Photos are a separate issue from parsing. A headshot in a Turkish application is often expected; a US resume usually omits it. Either way, the photo must not replace your name. Put the name in text larger than the picture, at the top. Do not lock the name into the image so that copying the page copies nothing. Logos of former employers are marketing, not evidence. They inflate file size and give the parser more junk objects.',
          ],
        },
        {
          heading: 'File types that survive and those that do not',
          paragraphs: [
            'A text-based PDF is the default for portals in Turkey and for most international ATS products. Export from Word, Google Docs, or a builder that writes real fonts, not from a screenshot. Cap the size; many career sites still reject files over a few megabytes, and a 12 MB portfolio-as-CV is a rejection before anyone reads a line. PDF is not automatically safe: a PDF of a JPEG is still a scan.',
            'DOCX can parse well when the document is simple, and some older Turkish HR tools prefer it. The risk is that your fonts, Turkish glyphs, and spacing shift on their machine. If a posting asks for Word, send Word. If it asks for PDF or does not specify, send a clean PDF and keep the source file. Do not send Pages, Keynote, Photoshop, or a Google Docs link and hope the recruiter will request access.',
            'Filenames are part of the record. CV_Elif_Kaya_Product.pdf is searchable in a crowded inbox. cvsonfinal2(1).pdf is not. Avoid Turkish characters in the filename if the portal is old; some still corrupt ğ and ı in the attachment name even when the file body is fine. Inside the document, keep proper Turkish spelling. The filename is a pipe. The body is your identity.',
          ],
        },
        {
          heading: 'What ATS-friendly does not mean',
          paragraphs: [
            'It does not mean empty. You can write strong bullets, a specific summary, and a tight skills list in a single column. It does not mean stuffing the job description as hidden white text; that trick is old, detectable, and a reason to discard you. It does not mean translating every heading into five synonyms so that some keyword hits. One clear heading and honest language beat a keyword cloud.',
            'It also does not mean one magic template that wins every parser. It means selectable text, conventional section names, dates next to roles, and a reading order a tired recruiter could reconstruct from the text layer alone. If you rebuild in a plain ATS builder — including the one on cveey — the point is the same: software and people should read the same story in the same order.',
          ],
        },
        {
          heading: 'A check you can do before you send',
          paragraphs: [
            'Do this on the file you will attach, not on the design view. Open the PDF, select all, copy, and paste into a blank note. Read the paste from top to bottom. That is close to what a simple parser sees. If names, dates, and employers arrive in a jumble, a person might still decode the layout. The database will not.',
          ],
          list: [
            'Your name, city, phone, and email appear as ordinary text at the top, not only inside a banner image.',
            'Section titles are the boring words: summary, experience, education, skills — in the language of the CV.',
            'Each job shows employer, title, and dates before the bullets, in that neighbourhood of the page.',
            'Turkish characters copy correctly; ı, ğ, ü, ş, ç, ö are not replaced by boxes or lookalikes.',
            'No column from a sidebar is interleaved with job bullets in the pasted text.',
            'The file is a PDF with a text layer, or a simple DOCX if the advert demanded Word, and the filename contains your name.',
          ],
        },
      ],
    },
    tr: {
      title: 'ATS uyumlu CV gerçekte ne demek',
      description:
        'Aday takip sistemlerinin PDF dosyalarını nasıl okuduğu, bekledikleri başlıklar ve ATS uyumunun aslında ne olduğu.',
      sections: [
        {
          heading: 'Yazılım dosyanızla ne yapıyor',
          paragraphs: [
            'Kariyer.net, İstanbul veya Ankara’daki bir şirket kariyer sayfası ya da LinkedIn Easy Apply üzerinden başvurduğunuzda PDF’iniz çoğu zaman önce bir insana ulaşmaz. Aday takip sistemi dosyayı saklar, metni çıkarır ve alanlara yerleştirmeye çalışır: ad, e-posta, unvan, işveren, tarih, okul. İşe alımcılar sonra bu alanlarda arama yapar. Ayrıştırma dağınıksa veritabanında durursunuz ama gerçek sorguda çıkmazsınız — unvan artı şehir, ya da bir araç adı artı yıl.',
            'ATS uyumu bir görsel stil değildir. O çıkarımın kullanılabilir bir kayıt üretip üretmediğidir. Telefon ekranında pahalı duran bir belge, son işvereninizi eğitimin altına düşürebilir, Mart 2022’yi bir yetenek sanabilir, e-postanızı başlık grafiğinin içinde bıraktığınız için kaçırabilir. Bankalardaki, Kocaeli’deki fabrikalardaki ve Levent’teki danışmanlıktaki insanlar hâlâ PDF açar. Sizi bulup bulamayacaklarına yazılım karar verir.',
            'Türkiye’deki şirketler aynı yazılımı kullanmaz. Kimi yerel iş sitesinin gömülü çözümleyicisine güvenir. Çokuluslular Workday, SAP SuccessFactors veya Greenhouse üzerinde durur. Ayrıntılar değişir. Bozulma biçimleri değişmez: seçilemeyen metin, süs başlıklar ve yanlış sütundan soldan sağa okunan düzenler. Tasarım blogundaki ekran görüntüsü için değil, karşılaşabileceğiniz en zayıf çözümleyici için yazın.',
          ],
        },
        {
          heading: 'PDF metni gerçekte nasıl çıkarılır',
          paragraphs: [
            'PDF, kilitli bir Word dosyası değildir. Çizim talimatlarıdır: bu glifi bu koordinata koy. Çözümleyici satırları ve blokları tahmin ederek okuma sırasını kurar. İki sütun yan yanaysa tahmin çoğu zaman “karşıdan karşıya oku” olur, “sol sütunu bitir” değil. Müşteri hizmetleri maddeleriniz, kenarda durması gereken yetenek listesiyle iç içe geçebilir.',
            'Taranmış sayfalar bu yüzden sık düşer. CV fotoğrafı veya metin katmanı olmayan telefon dışa aktarımı, ATS’ye bir görsel bırakır. Kimileri optik karakter tanır. OCR önce Türkçe karakterleri bozar: ı i olur, ğ kaybolur, Ş S’ye döner. Adınız, üniversiteniz ve şehriniz, bir veritabanında yanlış yazılmasını en az göze alabileceğiniz alanlardır. Preview veya Adobe Reader’da bir cümleyi seçip kopyalayamıyorsanız dosya metin PDF’si değildir.',
            'Üst bilgi ve alt bilgi ayrı bir tuzaktır. Her sayfada ad ve sayfa numarası tekrar etmek düzenli durur. Çözümleyiciler bazen o tekrarlayan satırı iş tanımının ortasına yapıştırır. Kimlik ve iletişimi bir kez, birinci sayfanın üstünde, normal gövde metninde tutun. Tek sayfalık dosyada sayfa numarası zaten gerekmez; iki sayfada kayan bir kutudaysa riske değmez.',
          ],
        },
        {
          heading: 'Çözümleyicilerin tanıdığı başlıklar — ve tanımadıkları',
          paragraphs: [
            'Çoğu sistem küçük bir İngilizce veya Türkçe etiket kümesine bakar: Experience, Work Experience veya İş Deneyimi; Education veya Eğitim; Skills veya Yetenekler; Summary, Profil veya Profesyonel Özet. Edebiyat eleştirmeni değillerdir. “Nerelerde bulundum” veya “Yolculuğum” başlığı çoğu zaman bilinmeyen metin yığını sayılır. Süslü adlar kişisel gelir. Yapılandırılmış alanları kaybettirir.',
            'Dosyanın geri kalanının diline uyun. İstanbul’daki bir paylaşılmış hizmet merkezine giden İngilizce CV’de Experience, Education, Skills kullanın. Yerli bir üretici için Türkçe CV’de İş Deneyimi, Eğitim, Yetenekler yazın. Gövde Türkçe iken “Experience” karıştırmak veya “Kariyer Hikâyem” uydurmak, çözümleyiciye bölüm kırılımını yok saymayı öğretir. Bir işin altındaki “Seçilmiş işler,” “Yığın” gibi ara başlıklar sıradan kalın satır olarak sorun olmaz; ana etiketlerin yerine geçmesin.',
            'İletişim bilgisi ikonda değil metinde dursun. Yanında e-posta dizgesi olmayan minik zarf kopyalanamaz. Adresi tam yazın: isim@alanadi.com. LinkedIn adresi ve telefon için aynı kural geçerlidir. Boşluklu +90 hem insan hem makine için okunur. Canva paketinden alınmış telefon ikonu ikisi için de değildir.',
          ],
        },
        {
          heading: 'Sütunlar, tablolar ve okuma sırası',
          paragraphs: [
            'İki sütunlu şablonlar, Türkiye’de yeni mezun CV’sinin takip sisteminde çökmesinin en sık nedenidir. Sol ray yetenek ve dil, sağ taraf işler. Siz iki hikâye görürsünüz. Çözümleyici bir zikzak görür. Raydaki tarihler yanlış işverene yapışır. İzmir’deki üç aylık staj “2024” adlı bir yetenek olur. İşe alımcı zaman çizelgenizin dürüst olmadığını sanır; dosya yalnızca süslüydü.',
            'Tablolar aynı sorunu başka kostümle taşır. Word tabloları ve görünmez ızgaralar dizüstü ekranda hizalı durur. Çıkarım çoğu zaman hücre hücre, soldan sağa okur; “Ankara” başka işin maddesiyle aynı satıra düşer. Hizalama istiyorsanız tek sütun kullanın, tarihleri unvanla aynı satıra, bir orta nokta veya tire ile, düz metin olarak koyun. Bu kalıp Türkiye’de ve yurt dışında kullanılan neredeyse her çözümleyicide ayakta kalır.',
          ],
          list: [
            'Deneyim ve eğitim için tek ana sütun; iş metninin yanında duran yetenek rayı yok.',
            'Tarihler rolle aynı satırda, Mar 2022 – Present veya 03.2022 – Devam gibi tutarlı bir biçimde.',
            'Tasarım aracında üst üste metin kutusu yok; PDF nesnesi olarak sırası kayar.',
            'Birinci sütunu etiket, ikinci sütunu içerik olan tam sayfa tablo yok.',
            'Yetenekler deneyimden sonra, kendi bölümünde; renkli rayda yüzmesin.',
            'İki sütunlu bir dosyanız varsa düz bir belgeye yapıştırıp sırayı elle yeniden kurun, ondan sonra başvurun.',
          ],
        },
        {
          heading: 'Görseller, ikonlar, yetenek çubukları ve fotoğraf',
          paragraphs: [
            'Yalnızca resim olan her şey metin çözümleyicisine görünmez. Yetenek çubukları, daire grafikler ve yıldız sıraları değerlendirme gibi durur. Veri değildir. ATS “Python’da beş üzerinden dört nokta”yı saklayamaz. Acele bir insan da saklayamaz, çünkü ölçek tanımsızdır. Yetenek adını yazın. Derinlik göstermek zorundaysanız kısa bir sözcük niteleyicisi kullanın: günlük kullanım, yalnızca ders, okuma bilgisi.',
            'Fotoğraf, ayrıştırmadan ayrı bir konudur. Türkiye başvurusunda vesikalık sık beklenir; ABD özgeçmişinde genelde yoktur. İkisinde de fotoğraf adınızın yerini tutmaz. Adı resimden büyük, metin olarak en üste koyun. Adı görselin içine kilitlemeyin; sayfayı kopyalayınca hiçbir şey gelmesin. Eski işveren logoları kanıt değil pazarlamadır. Dosyayı şişirir, çözümleyiciye çöp nesne ekler.',
          ],
        },
        {
          heading: 'Ayakta kalan dosya türleri ve kalmayanlar',
          paragraphs: [
            'Metin katmanlı PDF, Türkiye’deki portallar ve çoğu uluslararası ATS ürünü için varsayılandır. Word, Google Docs veya gerçek yazı tipi yazan bir oluşturucudan dışa aktarın; ekran görüntüsünden değil. Boyutu sınırlayın; birçok kariyer sitesi hâlâ birkaç megabaytın üstünü reddeder ve 12 MB’lık portföy-CV, kimse bir satır okumadan ret demektir. PDF otomatik güvenli değildir: JPEG’in PDF’si hâlâ taramadır.',
            'DOCX, belge sade olduğunda iyi ayrışabilir ve bazı eski Türk İK araçları onu tercih eder. Risk, yazı tiplerinin, Türkçe gliflerin ve boşlukların onların makinesinde kaymasıdır. İlan Word istiyorsa Word gönderin. PDF istiyorsa veya belirtmiyorsa temiz PDF gönderin, kaynak dosyayı saklayın. Pages, Keynote, Photoshop veya erişim isteyecekleri bir Google Docs bağlantısı umarak göndermeyin.',
            'Dosya adı kaydın parçasıdır. CV_Elif_Kaya_Urun.pdf kalabalık bir kutuda aranır. cvsonfinal2(1).pdf aranmaz. Portal eskiyse dosya adında Türkçe karakterden kaçının; kimileri gövde düzgünken ek adında ğ ve ı’yı bozar. Belgenin içinde doğru Türkçe yazın. Dosya adı bir borudur. Gövde kimliğinizdir.',
          ],
        },
        {
          heading: 'ATS uyumu ne demek değildir',
          paragraphs: [
            'Boş olmak demek değildir. Tek sütunda güçlü maddeler, somut bir özet ve sıkı bir yetenek listesi yazabilirsiniz. İlan metnini gizli beyaz yazı olarak gömmek demek değildir; bu numara eskidir, yakalanır ve sizi eleme gerekçesidir. Her başlığı beş eşanlamlıya çevirip anahtar sözcük çarptırmak da değildir. Tek net başlık ve dürüst dil, anahtar sözcük bulutunu yener.',
            'Her çözümleyiciyi kazanan sihirli bir şablon da değildir. Seçilebilir metin, alışılmış bölüm adları, rollerin yanındaki tarihler ve yorgun bir işe alımcının yalnızca metin katmanından aynı hikâyeyi kurabilmesi demektir. Sade bir ATS oluşturucuda — cveey’dekinde de — yeniden kuruyorsanız amaç aynıdır: yazılım ve insan aynı sırada aynı öyküyü okusun.',
          ],
        },
        {
          heading: 'Göndermeden önce yapabileceğiniz bir kontrol',
          paragraphs: [
            'Bunu tasarım görünümünde değil, ekleyeceğiniz dosyada yapın. PDF’i açın, tümünü seçin, kopyalayın, boş bir nota yapıştırın. Yapıştırmayı baştan sona okuyun. Basit bir çözümleyicinin gördüğüne yakındır. Adlar, tarihler ve işverenler karışık geliyorsa bir insan düzeni hâlâ çözebilir. Veritabanı çözemez.',
          ],
          list: [
            'Adınız, şehriniz, telefonunuz ve e-postanız üstte sıradan metin olarak görünür; yalnızca banner görselinin içinde değil.',
            'Bölüm başlıkları sıkıcı sözcüklerdir: özet, deneyim, eğitim, yetenekler — CV’nin dilinde.',
            'Her işte işveren, unvan ve tarihler maddelerden önce, sayfanın o bölgesinde durur.',
            'Türkçe karakterler doğru kopyalanır; ı, ğ, ü, ş, ç, ö kutu veya benzer harfe dönmez.',
            'Yapıştırılan metinde kenar çubuğundaki bir sütun iş maddeleriyle iç içe geçmez.',
            'Dosya metin katmanlı PDF’dir, ilan Word dediyse sade DOCX’tir ve dosya adında adınız vardır.',
          ],
        },
      ],
    },
  },
  {
    slug: 'turkiye-cv-formati',
    published: '2026-08-24',
    updated: '2026-08-24',
    en: {
      title: 'Turkish CV format versus US resumes and UK CVs',
      description:
        'Where a Turkish CV differs from a US resume and a UK CV: photo, dates, military service, length, and language.',
      sections: [
        {
          heading: 'Three documents, three hiring cultures',
          paragraphs: [
            'People in Turkey often say CV for every file they send. Abroad the word splits. A US resume is usually one page, sparse on private life, and allergic to photos. A UK CV is often two pages, still without a photo, with a short personal profile at the top. A Turkish CV sits closer to the continental European habit: more personal fields, a photograph more often than not, and a willingness to run to two pages even early in a career.',
            'None of these is a moral rule. They are habits of risk. US employers are trained to avoid age, family status, and appearance because discrimination law is loud. Turkish private employers still ask, informally, who you are beyond the job. UK recruiters sit in the middle: they want a narrative, not a family registry. If you keep one master file and fire it at every portal, you will look over-sharing in New York and under-sharing in Kayseri.',
            'Decide the market before you decide the template. A role in Şişli for a Turkish retailer is a Turkish-language CV with local conventions. A role in Dublin or a remote seat with a US manager is an English resume that drops the family fields. A London graduate scheme wants a UK CV: two pages, no photo, evidence. The rest of this guide is how to choose the fields, not how to decorate the page.',
          ],
        },
        {
          heading: 'Photograph: expected, optional, or a liability',
          paragraphs: [
            'In many Turkish private-sector processes a small, professional headshot is still normal. It should look like a passport photo taken recently, not a holiday crop, not a wedding close-up, not a story screenshot. Neutral background, face clearly visible, clothing you could wear to that office. Fashion and advertising teams may want a more styled image; accounting teams in Ankara do not.',
            'For the United States, omit the photo unless the posting is acting, modelling, or another field where appearance is the work. For the United Kingdom and Ireland, omit it for ordinary office roles. Some European countries still like a photo; some have moved away. If you are unsure, look at three employees on that company’s career site. If none of the sample CVs in their blog show faces, yours should not be the first.',
            'A photo is never a substitute for a name in text. It also never belongs as a full-bleed banner. Keep it small, right or left of the name block, and make sure the file still parses if the image is stripped. If you are applying while changing gender presentation or after a long gap, a current photo that matches who will walk into the interview is kinder to everyone than a five-year-old vesikalık.',
          ],
        },
        {
          heading: 'Birth date, marital status, and military service',
          paragraphs: [
            'Turkish CVs still often list date of birth, sometimes place of birth, marital status, and for men military service: completed, deferred, or exempt. Local HR uses these as logistics. Military status can affect start dates. Age is used, fairly or not, as a filter. You are not required to volunteer every field. You are required to know what silence will look like in that office.',
            'For US and UK applications, leave birth date, marital status, religion, and national ID off. Do not write TC kimlik numarası anywhere. Do not write your mother’s maiden name. City of residence is enough geography. If a Turkish form on Kariyer.net still has those boxes, fill only what the form forces; your attached CV can be cleaner than the form.',
            'Military service deserves a plain line when the reader is Turkish and the candidate is a man of typical call-up age: Askerlik: Tamamlandı, or Tecil, with a date if you know it. Do not bury a novel about the unit. For an English CV aimed at a foreign manager, you can omit it unless the job is in Turkey and HR asked. Women should not invent a military line to look complete. Empty rows that exist only because a classmate had them are clutter.',
          ],
        },
        {
          heading: 'Length: one page, two pages, and the five-page habit',
          paragraphs: [
            'US resumes for early and mid career are still one page in many competitive fields. Two pages become acceptable when the work is genuinely long: research, senior engineering, academia. UK CVs treat two pages as normal, not as failure. Turkish readers will accept two pages for a specialist in Istanbul; they will not reward five pages of every seminar since 2014.',
            'Students and new graduates should aim at one page in all three markets unless they have unusual publications or a second degree that needs space. Internships can share a short section instead of eating a page each. If you are forty with three serious employers, two pages in Turkey and the UK is reasonable. A one-page US resume may compress older roles to a single line each.',
          ],
          list: [
            'New graduate, any market: one page unless you have publications or a thesis that the job will actually discuss.',
            'Mid-level specialist applying in Turkey or the UK: two pages is fine if the second page is recent work, not hobbies.',
            'US resume for a corporate role: start from one page; add a second only when cutting would hide relevant scope.',
            'Academic or research CV: length follows publications; still lead with the role you want, not the full bibliography on page one.',
            'Public-sector packets in Turkey can be longer because they attach certificates; the CV itself should still be a short map, not the archive.',
            'If page two has only three lines, cut elsewhere and return to one page. A stranded stub looks unfinished.',
          ],
        },
        {
          heading: 'Which language to write, and when to keep two files',
          paragraphs: [
            'Write the CV in the language of the job advert. A Turkish advert from a Gaziantep manufacturer wants Turkish. An English advert from a German automotive supplier in Bursa wants English, even if the plant language is mixed. If the advert is bilingual, pick the language of the hiring manager’s team. LinkedIn Easy Apply into a global requisition is usually English.',
            'Do not mix languages inside one file except for proper names. “Sorumlu oldum for the SAP roll-out” reads as unfinished. Translate job titles into the language of the document, and keep the official employer name as it is legally known. Boğaziçi University can stay in that form on an English CV; you do not need to invent Bosphorus University unless the reader will not recognise the original.',
            'Keep two masters if you are seriously in both markets: a Turkish CV with the local fields you are willing to share, and an English resume without them. Update both when you change jobs. Sending the Turkish file to a London recruiter is how marital status and a photo arrive in a culture that did not ask. Sending the US resume to a family-owned firm in Konya can look evasive. The content of your work should match. The privacy layer should not.',
          ],
        },
        {
          heading: 'Education, titles, and public-sector extras',
          paragraphs: [
            'Turkish education lines should name the degree in a way both markets can parse: B.Sc. Computer Engineering, Hacettepe University, Ankara, 2019 – 2023, or Lisans, Bilgisayar Mühendisliği, same school. GPA helps when it is strong and the job is early career; a 2.10/4.00 on a senior CV helps no one. Lise belongs on a new-graduate file if university is recent; it drops off once you have a few years of work.',
            'KPSS scores, certificate photocopies, and residence documents belong in a public-sector application pack, not in a private-sector CV. If you are applying to a belediye or a bakanlık, follow their checklist. If you are applying to a bank’s technology graduate programme, the KPSS line signals that you copied the wrong template. Erasmus and exchange terms are useful when the job cares about language or mobility; they are not a substitute for a degree line.',
          ],
        },
        {
          heading: 'Address, phone, and what to stop publishing',
          paragraphs: [
            'City and district are enough: Kadıköy, Istanbul, or Çankaya, Ankara. A full home address on a PDF that will be forwarded is a gift to anyone who should not have it. Phone with country code. Email that you check. A LinkedIn URL if the profile matches the CV. WhatsApp as the only contact looks informal for corporate roles; it is common for shop-floor and some SME hiring. Match the channel to the employer.',
            'Drop “References available on request.” Everyone’s are. Drop an objective that restates the job title. Drop blood type, height, and religion. Those fields survive on some older Turkish forms; they do not make you more employable in 2026. If a local SME still wants a photo and birth year, you can include them on that version without putting them on the file you send to a US parent company.',
          ],
        },
        {
          heading: 'A practical pairing: what to send where',
          paragraphs: [
            'Think of format as a cover on the same facts. Your jobs, dates, and skills should not contradict each other across versions. Only the personal fields, photo, and length should change. If a recruiter in Istanbul already has your Turkish CV and a colleague in London asks for an English one, they should recognise the same career, not a different person who forgot a year.',
          ],
          list: [
            'Turkish private sector, local firm: Turkish CV, professional photo, city, military line if relevant, one or two pages.',
            'Multinational in Turkey with an English advert: English CV, photo optional — follow their careers site, not your classmates.',
            'US employer or US-style resume request: one page if you can, no photo, no birth date, no marital status, no ID number.',
            'UK or Ireland: two-page CV, no photo, short profile, evidence-heavy bullets, still no family fields.',
            'Public sector in Turkey: follow the institution’s list; keep the CV itself a map and put KPSS and certificates in the attachments they named.',
            'Remote role with mixed team: English unless they wrote in Turkish; omit fields that would look odd in the manager’s country.',
          ],
        },
      ],
    },
    tr: {
      title: 'Türkiye CV formatı, ABD özgeçmişi ve İngiltere CV’si',
      description:
        'Türk CV’sinin ABD özgeçmişi ve İngiltere CV’sinden farkı: fotoğraf, tarih, askerlik, uzunluk ve dil.',
      sections: [
        {
          heading: 'Üç belge, üç işe alım kültürü',
          paragraphs: [
            'Türkiye’de gönderilen her dosyaya CV denir. Yurt dışında sözcük ayrılır. ABD özgeçmişi çoğu zaman tek sayfa, özel hayata mesafeli ve fotoğrafa kapalıdır. İngiltere CV’si sıkça iki sayfadır, yine fotoğrafsız, üstte kısa bir profil ile. Türk CV’si kıta Avrupası alışkanlığına daha yakındır: daha çok kişisel alan, çoğu zaman fotoğraf ve kariyerin başında bile iki sayfaya uzama isteği.',
            'Bunların hiçbiri ahlak kuralı değildir. Risk alışkanlıklarıdır. ABD işverenleri yaş, aile durumu ve görünüşten kaçınmaya eğitilmiştir çünkü ayrımcılık hukuku gürültülüdür. Türk özel sektörü hâlâ, resmi olmasa da, işin ötesinde kim olduğunuzu sorar. İngiliz işe alımcılar ortadadır: nüfus cüzdanı değil anlatı isterler. Tek ana dosyayı her portala sıkarsanız New York’ta fazla açılmış, Kayseri’de fazla kapalı durursunuz.',
            'Şablondan önce pazarı seçin. Türk bir perakendecinin Şişli’deki rolü, yerel geleneklerle Türkçe CV ister. Dublin’deki bir rol veya ABD’li yöneticili uzak bir koltuk, aile alanlarını düşüren İngilizce özgeçmiş ister. Londra stajyer programı İngiltere CV’si ister: iki sayfa, fotoğraf yok, kanıt var. Bu rehberin gerisi süs değil, alan seçimidir.',
          ],
        },
        {
          heading: 'Fotoğraf: beklenen, isteğe bağlı veya yük',
          paragraphs: [
            'Birçok Türk özel sektör sürecinde küçük, profesyonel bir vesikalık hâlâ olağandır. Yakın zamanda çekilmiş pasaport fotoğrafı gibi durmalıdır; tatil kırpması, düğün yakın çekimi, hikâye ekran görüntüsü değil. Nötr arka plan, yüz net, o ofise gidebileceğiniz giysi. Moda ve reklam ekipleri daha stilize bir görsel isteyebilir; Ankara’daki muhasebe ekipleri istemez.',
            'Amerika Birleşik Devletleri için, ilan oyunculuk, mankenlik veya görünüşün işin kendisi olduğu bir alan değilse fotoğrafı çıkarın. Birleşik Krallık ve İrlanda’da sıradan ofis rolleri için çıkarın. Bazı Avrupa ülkeleri hâlâ ister; kimileri vazgeçmiştir. Emin değilseniz şirketin kariyer sitesinde üç çalışana bakın. Bloglarındaki örnek CV’lerde yüz yoksa sizinki ilk yüz olmasın.',
            'Fotoğraf, metindeki adın yerine geçmez. Tam sayfa banner da olmaz. Küçük tutun, ad bloğunun sağında veya solunda dursun; görsel silinse bile dosya ayrışsın. Sunumunuzu değiştirirken veya uzun bir aradan sonra başvuruyorsanız, mülakata girecek kişiye uyan güncel bir kare, beş yıllık vesikalıktan herkes için daha dürüsttür.',
          ],
        },
        {
          heading: 'Doğum tarihi, medeni hâl ve askerlik',
          paragraphs: [
            'Türk CV’lerinde hâlâ sıkça doğum tarihi, bazen doğum yeri, medeni hâl ve erkekler için askerlik yazılır: yapıldı, tecilli, muaf. Yerel İK bunları lojistik sanır. Askerlik işe başlama tarihini etkiler. Yaş, adil olsun olmasın, filtre olarak kullanılır. Her alanı gönüllü vermek zorunda değilsiniz. O ofiste sessizliğin nasıl duracağını bilmek zorundasınız.',
            'ABD ve İngiltere başvurularında doğum tarihi, medeni hâl, din ve ulusal kimlik numarası durmasın. Hiçbir yere TC kimlik numarası yazmayın. Anne kızlık soyadı yazmayın. İkamet şehri yeterli coğrafyadır. Kariyer.net’teki Türkçe form hâlâ o kutuları açıyorsa yalnızca formun zorladığını doldurun; ekteki CV formdan daha temiz olabilir.',
            'Askerlik, okur Türkse ve aday tipik askerlik çağındaki bir erkekse düz bir satırı hak eder: Askerlik: Tamamlandı veya Tecil, tarihinizi biliyorsanız tarih. Birlik üzerine roman gömmeyin. Yabancı yöneticiye giden İngilizce CV’de, iş Türkiye’de değilse ve İK sormadıysa çıkarabilirsiniz. Kadınlar tamam görünsün diye askerlik satırı uydurmasın. Sırf sınıf arkadaşında vardı diye duran boş satırlar kalabalıktır.',
          ],
        },
        {
          heading: 'Uzunluk: bir sayfa, iki sayfa ve beş sayfa alışkanlığı',
          paragraphs: [
            'ABD özgeçmişleri erken ve orta kariyerde birçok rekabetçi alanda hâlâ tek sayfadır. İş gerçekten uzunsa — araştırma, kıdemli mühendislik, akademi — iki sayfa kabul görür. İngiltere CV’si iki sayfayı başarısızlık değil norm sayar. Türk okur, İstanbul’daki bir uzman için iki sayfayı kabul eder; 2014’ten beri her seminerin beş sayfasını ödüllendirmez.',
            'Öğrenciler ve yeni mezunlar, işin gerçekten konuşacağı yayın veya ikinci derece yoksa üç pazarda da bir sayfayı hedeflemelidir. Stajlar birer sayfa kaplamak yerine kısa bir bölümde paylaşılabilir. Kırk yaşında üç ciddi işvereniniz varsa Türkiye ve İngiltere’de iki sayfa makuldür. ABD özgeçmişi eski rolleri tek satıra sıkıştırabilir.',
          ],
          list: [
            'Yeni mezun, her pazar: işin konuşacağı yayın veya tez yoksa bir sayfa.',
            'Türkiye veya İngiltere’de orta düzey uzman: ikinci sayfa son işlerse, hobiler değilse, iki sayfa sorun olmaz.',
            'Kurumsal ABD rolü: bir sayfadan başlayın; kesmek kapsamı gizleyecekse ikinciyi ekleyin.',
            'Akademik veya araştırma CV’si: uzunluğu yayınlar belirler; yine de birinci sayfada tam kaynakçadan önce istediğiniz rol önde dursun.',
            'Türkiye’de kamu paketleri belge eklediği için uzayabilir; CV yine arşiv değil kısa bir harita olsun.',
            'İkinci sayfada yalnızca üç satır varsa başka yerden kesip tek sayfaya dönün. Yarım kalan uç bitmemiş durur.',
          ],
        },
        {
          heading: 'Hangi dilde yazmalı, iki dosyayı ne zaman tutmalı',
          paragraphs: [
            'CV’yi ilanın dilinde yazın. Gaziantep’teki bir üreticinin Türkçe ilanı Türkçe ister. Bursa’daki Alman otomotiv tedarikçisinin İngilizce ilanı, tesis dili karışık olsa da İngilizce ister. İlan iki dilliyse işe alım yöneticisinin ekibinin dilini seçin. Küresel bir kadroya LinkedIn Easy Apply genelde İngilizcedir.',
            'Özel adlar dışında bir dosyanın içinde dil karıştırmayın. “Sorumlu oldum for the SAP roll-out” bitmemiş okunur. Unvanları belgenin diline çevirin, işverenin resmi adını yasal bilindiği gibi bırakın. İngilizce CV’de Boğaziçi University o haliyle kalabilir; okur özgün adı tanımayacaksa Bosphorus University uydurmak zorunda değilsiniz, tanıacaksa özgün hali yeter.',
            'İki pazarda da ciddiyseniz iki ana dosya tutun: paylaşmaya razı olduğunuz yerel alanlarla Türkçe CV, onlarsız İngilizce özgeçmiş. İş değişince ikisini de güncelleyin. Londra işe alımcısına Türkçe dosya göndermek, istemedikleri kültüre medeni hâl ve fotoğraf taşır. Konya’daki aile şirketini ABD özgeçmişi ile karşılamak kaçamak durabilir. İşinizin içeriği eşleşsin. Gizlilik katmanı eşleşmek zorunda değildir.',
          ],
        },
        {
          heading: 'Eğitim, unvanlar ve kamu ekleri',
          paragraphs: [
            'Türk eğitim satırları iki pazarın da ayrıştırabileceği biçimde dereceyi adlandırsın: B.Sc. Computer Engineering, Hacettepe University, Ankara, 2019 – 2023 veya Lisans, Bilgisayar Mühendisliği, aynı okul. Not ortalaması güçlüyse ve iş erken kariyerse işe yarar; kıdemli CV’de 2.10/4.00 kimseye yaramaz. Lise, üniversite yeniyse yeni mezun dosyasına girer; birkaç yıl işten sonra düşer.',
            'KPSS puanı, belge fotokopileri ve ikamet evrakı kamu başvuru paketine aittir, özel sektör CV’sine değil. Belediye veya bakanlığa başvuruyorsanız onların listesini izleyin. Bir bankanın teknoloji yeni mezun programına başvururken KPSS satırı yanlış şablonu kopyaladığınızı gösterir. Erasmus ve değişim dönemleri iş dil veya hareketlilik önemsiyorsa işe yarar; diploma satırının yerine geçmez.',
          ],
        },
        {
          heading: 'Adres, telefon ve yayımlamayı bırakmanız gerekenler',
          paragraphs: [
            'Şehir ve ilçe yeter: Kadıköy, İstanbul veya Çankaya, Ankara. İletilecek bir PDF’de tam ev adresi, sahip olmaması gereken herkese armağandır. Ülke kodlu telefon. Baktığınız e-posta. Profil CV ile örtüşüyorsa LinkedIn adresi. Yalnızca WhatsApp, kurumsal rollerde gayriresmi durur; saha ve bazı KOBİ işe alımlarında yaygındır. Kanalı işverene uydurun.',
            '“Referanslar talep halinde sunulur”u çıkarın. Herkesinkiler öyle. İş unvanını tekrarlayan hedef cümlesini çıkarın. Kan grubu, boy ve dini çıkarın. Bu alanlar bazı eski Türk formlarında yaşar; 2026’da sizi daha istihdam edilebilir kılmaz. Yerel bir KOBİ hâlâ fotoğraf ve doğum yılı istiyorsa o sürüme ekleyebilirsiniz; ABD ana şirketine giden dosyaya koymak zorunda değilsiniz.',
          ],
        },
        {
          heading: 'Pratik eşleme: nereye ne göndermeli',
          paragraphs: [
            'Formatı aynı olguların kapağı gibi düşünün. İşleriniz, tarihleriniz ve yetenekleriniz sürümler arasında çelişmesin. Yalnızca kişisel alanlar, fotoğraf ve uzunluk değişsin. İstanbul’daki bir işe alımcının Türkçe CV’si varken Londra’daki meslektaşı İngilizce isterse, bir yılı unutan başka biri değil, aynı kariyeri tanısınlar.',
          ],
          list: [
            'Türk özel sektörü, yerel firma: Türkçe CV, profesyonel fotoğraf, şehir, ilgiliyse askerlik satırı, bir veya iki sayfa.',
            'Türkiye’de İngilizce ilanlı çokuluslu: İngilizce CV, fotoğraf isteğe bağlı — sınıf arkadaşınıza değil onların kariyer sitesine bakın.',
            'ABD işvereni veya ABD tarzı özgeçmiş isteği: yetiyorsa bir sayfa, fotoğraf yok, doğum tarihi yok, medeni hâl yok, kimlik numarası yok.',
            'İngiltere veya İrlanda: iki sayfalık CV, fotoğraf yok, kısa profil, kanıt ağırlıklı maddeler, yine aile alanı yok.',
            'Türkiye’de kamu: kurumun listesini izleyin; CV’yi harita tutun, KPSS ve belgeleri adlandırdıkları eklere koyun.',
            'Karışık ekipli uzaktan rol: Türkçe yazmadılarsa İngilizce; yöneticinin ülkesinde tuhaf duracak alanları çıkarın.',
          ],
        },
      ],
    },
  },
  {
    slug: 'profesyonel-ozet',
    published: '2026-08-24',
    updated: '2026-08-24',
    en: {
      title: 'How to write a professional summary that targets a role',
      description:
        'Write a 3–5 line professional summary that names the role you want instead of recycling empty clichés.',
      sections: [
        {
          heading: 'What the summary is for, and what it is not',
          paragraphs: [
            'The professional summary is the first block a recruiter reads after your name. On a Turkish PDF it may be labelled Profil, Özet, or Kariyer Özeti. On an English resume it is Summary or Profile. Its job is narrow: in three to five lines, say what you do, for whom, at what level, and what you want next. It is not a biography. It is not a motivation letter. It is not a list of character traits.',
            'People skip it when it is generic, and they use it when it saves them a search. A hiring manager in Maslak who needs a mid-level backend engineer will forgive a plain layout if the opening sentence names backend, the stack, and the domain. They will not hunt for that fact inside a paragraph about being passionate and results-oriented. If the summary could be copied onto a classmate’s file without editing, it is not doing work.',
            'Leave the summary off only if you have a very short student CV and the rest of the page already states the target in the experience headings. Even then, one sentence under the name often helps. Do not replace the summary with an objective from a 2000s textbook. Objectives talk about what you hope to gain. Summaries talk about what you can be trusted to do.',
          ],
        },
        {
          heading: 'Three to five lines, aimed at one role',
          paragraphs: [
            'Pick the role you are applying for this week, not the average of every job you might accept. “Software engineer who also likes product and maybe data” forces the reader to choose. “Backend engineer, four years, payments and reconciliation, Java and PostgreSQL, open to Istanbul or remote-from-Turkey teams” lets them file you. If you are targeting two very different paths — teaching and sales — you need two summaries and two files, not a compromise sentence.',
            'A usable shape is: who you are now, the strongest proof, the environment you know, the next step. Proof is a domain, a scale, a toolset, or a type of stakeholder. Environment is B2B SaaS, factory planning, public hospital administration, retail operations. The next step should be close to the last step, not a fantasy career jump with no bridge. Five lines is a ceiling, not a quota. Three tight lines beat five that repeat the same adjective.',
            'Write in the same language as the CV. Keep it first person implied, not “I am a…” if the rest of the file is telegram style, and not “Elif is a…” in the third person. Third person summaries feel like a brochure. First person with “I” in every sentence feels like a cover letter stuffed into the wrong slot. Most strong summaries in both Turkish and English drop the pronoun and start with the role noun.',
          ],
        },
        {
          heading: 'Weak openings you can recognise immediately',
          paragraphs: [
            '“Hardworking team player seeking a challenging opportunity to grow with a dynamic company.” That sentence has no occupation. It could sit on a cook’s CV or a lawyer’s. “Motivated graduate with excellent communication skills and a passion for excellence” names a degree ceremony, not a job. “Results-oriented professional with a proven track record of success” is a stack of words that used to impress people who had not seen a thousand CVs.',
            'Turkish clichés have their own music. “Yenilikçi, çözüm odaklı, takım çalışmasına yatkın, insan ilişkilerinde başarılı.” Four traits, zero craft. “Sektöründe öncü firmalarda çalışma hayali.” The dream is not a qualification. “MS Office programlarına hâkim, esnek çalışma saatlerine uyumlu.” If the job is engineering, Office is assumed; flexibility is not a summary. If the job is office administration, then name the tools and the volume of work, not the willingness to stay late as a personality.',
          ],
        },
        {
          heading: 'Stronger openings, written as facts',
          paragraphs: [
            'A stronger English summary is specific enough to fail a different job. “Industrial engineer with three years in production planning at a white-goods plant in Manisa. Weekly scheduling for two lines, SAP PP as the daily system, overtime cut after a changeover rewrite. Looking for a planning or process role in Izmir or remote plants that still run a shift pattern.” You can disagree with that person. You cannot confuse them with a marketer.',
            'A stronger Turkish summary does the same job. “Ankara’da kamu hastanesinde üç yıldır hasta kayıt ve randevu operasyonu yürüten idari personel. Günlük çağrı ve gişe yükü, HBYS ekranları, şikâyet tutanakları. Özel hastane veya büyük poliklinikte operasyon veya hasta deneyimi ekibine geçmek istiyor.” The next employer learns the setting, the systems, and the direction. They do not learn that you are a nice person. That comes in the interview, or not.',
          ],
          list: [
            'Weak: passionate, dynamic, motivated, team player, results-oriented, detail-oriented as the only content.',
            'Weak: seeking a challenging role in a prestigious firm, with no craft named.',
            'Strong: job family plus years plus domain plus two concrete tools or methods.',
            'Strong: a result you could defend in a conversation, even if the number is modest.',
            'Strong: a geographic or work-mode constraint stated once, so they do not guess.',
            'Strong: a next-role sentence that is a neighbour of the last role, not a new identity.',
          ],
        },
        {
          heading: 'Clichés to delete on sight',
          paragraphs: [
            'Delete synergy, go-getter, think outside the box, and “hit the ground running.” Delete “responsible for” in the summary; save verbs for the bullets. Delete “best practices” unless you can name whose. Delete “stakeholder management” if you mean you answered emails. In Turkish, delete “vizyoner,” “proaktif yaklaşım,” and “katma değer yaratma” unless the next clause says what was created.',
            'Language lines do not belong in the summary if you already have a skills section. “Fluent English” as the first fact tells a software team you lead with a school subject. Put C1 English under languages. Use the summary for the work. The exception is when language is the work: export sales, consecutive interpreting, technical writing for a UK buyer. Then the language is a craft, not a hobby.',
          ],
        },
        {
          heading: 'New graduates and people changing fields',
          paragraphs: [
            'If you have little work, the summary should not pretend you have a decade. Name the degree, the strongest project or internship, and the role family you are applying into. “New computer-engineering graduate, thesis on time-series anomaly detection, summer internship in a fintech support team in Istanbul. Applying for junior data or backend roles that will tolerate a first year of production code.” That is honest and sortable.',
            'Career changers should name the bridge. “Five years as an English teacher in Bursa; last two years building the school’s enrolment spreadsheet and parent-reporting process. Retraining in operations analysis; looking for a junior operations or customer-operations seat, not another classroom.” Hide-and-seek — listing only the new certificate and omitting the teaching — makes HR think you are hiding a gap. The summary is the place to frame the turn so the dates below do not look like a mystery.',
          ],
        },
        {
          heading: 'Turkish and English summaries are not word-for-word twins',
          paragraphs: [
            'A good translation keeps the facts and changes the rhythm. English summaries can be denser with compound nouns. Turkish summaries often need an extra short sentence to carry the same load without a pile of suffixes. Do not run the English through a raw machine pass and paste it. “Deneyimli profesyonel” is as empty as “experienced professional.” Recast the proof in each language.',
            'Watch false friends. “Control” is not always “kontrol.” “Responsible” is not a personality. “Engineer” in a Turkish job title may be a union category; in English it may imply a degree. If you were a “uzman,” decide whether the English file should say specialist, associate, or the actual function — procurement, quality, treasury. The summary is where a mistranslated title does the most damage because it is the label they remember.',
          ],
        },
        {
          heading: 'Rewrite yours in one sitting',
          paragraphs: [
            'Take the posting you care about most this week. Highlight the job family, two tools, and one domain word. Write four facts from your own history that intersect those highlights. Discard the facts that only flatter you. Put the remainder into four lines. Read them aloud. If you would be embarrassed to say them in a phone screen, they are still decoration. Partner reviewers in a talent pool see this block before they decide whether to open the rest of the PDF — make it a filing label, not a speech.',
          ],
          list: [
            'Line 1: role + years + domain, no adjectives.',
            'Line 2: one proof a sceptic could ask about in five minutes.',
            'Line 3: tools, methods, or languages only if they are central to the work.',
            'Line 4: city, work mode, or the next role family, in one clause.',
            'Cut any sentence that would still be true if you changed careers tomorrow.',
            'Keep a second summary in a note for the other path you sometimes apply to; do not average them on the page.',
          ],
        },
      ],
    },
    tr: {
      title: 'Bir role yönelik profesyonel özet nasıl yazılır',
      description:
        'Boş klişeleri tekrarlamak yerine hedeflediğiniz rolü adlandıran 3–5 satırlık bir profesyonel özet yazın.',
      sections: [
        {
          heading: 'Özet ne işe yarar, ne işe yaramaz',
          paragraphs: [
            'Profesyonel özet, adınızdan sonra işe alımcının okuduğu ilk bloktur. Türkçe PDF’de Profil, Özet veya Kariyer Özeti yazabilir. İngilizce özgeçmişte Summary veya Profile’dır. İşi dardır: üç ile beş satırda ne yaptığınızı, kim için, hangi düzeyde ve bundan sonra ne istediğinizi söylemek. Biyografi değildir. Motivasyon mektubu değildir. Karakter özelliği listesi değildir.',
            'Genel olunca atlanır, bir aramayı kısaltınca kullanılır. Maslak’taki bir işe alım yöneticisi orta düzey backend mühendisi arıyorsa, açılış cümlesi backend’i, yığını ve alanı adlandırıyorsa sade düzeni affeder. Tutkulu ve sonuç odaklı olduğunuz paragrafının içinde o gerçeği avlamaz. Özet, düzenlemeden sınıf arkadaşınızın dosyasına yapıştırılabiliyorsa iş görmüyordur.',
            'Özeti yalnızca çok kısa bir öğrenci CV’sinde ve sayfanın geri kalanı hedefi deneyim başlıklarında zaten söylüyorsa bırakın. O durumda bile adın altında bir cümle sık işe yarar. Özeti 2000’ler ders kitabından bir hedef cümlesiyle değiştirmeyin. Hedef, sizin ne kazanmak istediğinizi konuşur. Özet, size neyin emanet edilebileceğini konuşur.',
          ],
        },
        {
          heading: 'Üç-beş satır, tek bir role nişanlanmış',
          paragraphs: [
            'Bu hafta başvurduğunuz rolü seçin, kabul edebileceğiniz her işin ortalamasını değil. “Yazılım mühendisi, ürünü de sever, belki veri” okuru seçim yapmaya zorlar. “Backend mühendisi, dört yıl, ödemeler ve mutabakat, Java ve PostgreSQL, İstanbul veya Türkiye’den uzaktan ekiplere açık” sizi dosyalamalarını sağlar. Öğretmenlik ve satış gibi iki çok farklı yol hedefliyorsanız uzlaşma cümlesi değil, iki özet ve iki dosya gerekir.',
            'İşleyen bir biçim şudur: şimdi kim olduğunuz, en güçlü kanıt, bildiğiniz ortam, sonraki adım. Kanıt bir alan, bir ölçek, bir araç seti veya bir paydaş türüdür. Ortam B2B SaaS, fabrika planlama, kamu hastanesi idaresi, perakende operasyonudur. Sonraki adım son adıma yakın olsun, köprüsüz bir fantezi sıçrama değil. Beş satır tavan, kota değil. Aynı sıfatı tekrarlayan beş satırdan üç sıkı satır yeğdir.',
            'CV ile aynı dilde yazın. Dosyanın geri kalanı telgraf üslubundaysa her cümlede “I am a…” olmasın, üçüncü kişide “Elif is a…” da olmasın. Üçüncü kişi özetleri broşür gibi durur. Her cümlede “I” olan birinci kişi, yanlış yuvaya sıkıştırılmış ön yazı gibi durur. Türkçe ve İngilizcede güçlü özetlerin çoğu zamiri düşürür ve rol adıyla başlar.',
          ],
        },
        {
          heading: 'Hemen tanıdığınız zayıf açılışlar',
          paragraphs: [
            '“Hardworking team player seeking a challenging opportunity to grow with a dynamic company.” Bu cümlenin mesleği yoktur. Aşçının CV’sine de avukatınkine de oturur. “Motivated graduate with excellent communication skills and a passion for excellence” bir iş değil, bir diploma töreni adlandırır. “Results-oriented professional with a proven track record of success,” bin CV görmemiş insanları etkilemeye çalışan bir sözcük yığınıdır.',
            'Türkçe klişelerin kendi müziği vardır. “Yenilikçi, çözüm odaklı, takım çalışmasına yatkın, insan ilişkilerinde başarılı.” Dört özellik, sıfır zanaat. “Sektöründe öncü firmalarda çalışma hayali.” Hayal nitelik değildir. “MS Office programlarına hâkim, esnek çalışma saatlerine uyumlu.” İş mühendislikse Office varsayılır; esneklik özet değildir. İş büro idaresiyse geç kalmaya kişilik olarak razı olmak değil, araçları ve iş hacmini adlandırın.',
          ],
        },
        {
          heading: 'Olgu olarak yazılmış daha güçlü açılışlar',
          paragraphs: [
            'Daha güçlü bir İngilizce özet, başka bir işe uymayacak kadar somuttur. “Industrial engineer with three years in production planning at a white-goods plant in Manisa. Weekly scheduling for two lines, SAP PP as the daily system, overtime cut after a changeover rewrite. Looking for a planning or process role in Izmir or remote plants that still run a shift pattern.” Bu kişiyle anlaşamayabilirsiniz. Bir pazarlamacıyla karıştıramazsınız.',
            'Daha güçlü bir Türkçe özet aynı işi görür. “Ankara’da kamu hastanesinde üç yıldır hasta kayıt ve randevu operasyonu yürüten idari personel. Günlük çağrı ve gişe yükü, HBYS ekranları, şikâyet tutanakları. Özel hastane veya büyük poliklinikte operasyon veya hasta deneyimi ekibine geçmek istiyor.” Sonraki işveren ortamı, sistemleri ve yönü öğrenir. İyi biri olduğunuzu öğrenmez. O, mülakatta gelir veya gelmez.',
          ],
          list: [
            'Zayıf: tek içerik olarak passionate, dynamic, motivated, team player, results-oriented, detaylara önem veren.',
            'Zayıf: zanaat adı olmadan prestijli firmada zorlu rol aramak.',
            'Güçlü: iş ailesi artı yıl artı alan artı iki somut araç veya yöntem.',
            'Güçlü: sayısı mütevazı olsa da beş dakikalık bir konuşmada savunabileceğiniz bir sonuç.',
            'Güçlü: tahmin etmesinler diye bir kez yazılmış coğrafi veya çalışma biçimi sınırı.',
            'Güçlü: son rolün komşusu olan, yeni kimlik olmayan bir sonraki rol cümlesi.',
          ],
        },
        {
          heading: 'Görür görmez silinecek klişeler',
          paragraphs: [
            'Synergy, go-getter, think outside the box ve “hit the ground running”i silin. Özette “responsible for”u silin; fiilleri maddelere saklayın. Kimin olduğunu söyleyemiyorsanız “best practices”i silin. E-posta yanıtladınız anlamına geliyorsa “stakeholder management”i silin. Türkçede sonraki cümle neyin yaratıldığını söylemiyorsa “vizyoner,” “proaktif yaklaşım” ve “katma değer yaratma”yı silin.',
            'Yetenekler bölümünüz varken dil satırları özete ait değildir. İlk olgu olarak “Fluent English,” bir yazılım ekibine okul dersiyle öne çıktığınızı söyler. C1 İngilizceyi dillerin altına koyun. Özeti iş için kullanın. İstisna, dilin işin kendisi olduğu durumlardır: ihracat satışı, ardıl çeviri, İngiliz alıcı için teknik yazım. O zaman dil hobi değil zanaattır.',
          ],
        },
        {
          heading: 'Yeni mezunlar ve alan değiştirenler',
          paragraphs: [
            'Az işiniz varsa özet on yılınız varmış gibi yapmasın. Diplomanızı, en güçlü proje veya stajı ve başvurduğunuz rol ailesini adlandırın. “Yeni bilgisayar mühendisliği mezunu, tezde zaman serisi anormallik tespiti, yazın İstanbul’da bir fintek destek ekibinde staj. Üretim kodunun ilk yılını kaldıracak junior veri veya backend rollerine başvuruyor.” Bu dürüst ve sıralanabilirdir.',
            'Alan değiştirenler köprüyü adlandırmalıdır. “Bursa’da beş yıl İngilizce öğretmeni; son iki yıl okulun kayıt tablosunu ve veli rapor sürecini kurdu. Operasyon analizine yöneliyor; başka bir sınıf değil, junior operasyon veya müşteri operasyonu koltuğu arıyor.” Yalnızca yeni sertifikayı yazıp öğretmenliği gizlemek, İK’nın boşluk sakladığınızı düşünmesine yol açar. Aşağıdaki tarihlerin sır olmamaması için dönüşü çerçeveleyecek yer özettir.',
          ],
        },
        {
          heading: 'Türkçe ve İngilizce özetler sözcüğü sözcüğüne ikiz değildir',
          paragraphs: [
            'İyi çeviri olguları tutar, ritmi değiştirir. İngilizce özetler birleşik adlarla daha sıkı olabilir. Türkçe özetler aynı yükü sonek yığını olmadan taşımak için ekstra kısa bir cümle isteyebilir. İngilizceyi ham makine çevirisinden geçirip yapıştırmayın. “Deneyimli profesyonel,” “experienced professional” kadar boştur. Kanıtı her dilde yeniden kurun.',
            'Yalancı dostlara dikkat. “Control” her zaman “kontrol” değildir. “Responsible” kişilik değildir. Türkçe unvandaki “mühendis” bir sendika kategorisi olabilir; İngilizcede diploma ima edebilir. “Uzman” idiyseniz İngilizce dosyanın specialist, associate veya asıl işlev — satın alma, kalite, hazine — deyip demeyeceğine karar verin. Yanlış çevrilmiş unvan en çok özette zarar verir çünkü hatırladıkları etikettir.',
          ],
        },
        {
          heading: 'Özeti bir oturuşta yeniden yazın',
          paragraphs: [
            'Bu hafta en çok önemsediğiniz ilanı alın. İş ailesini, iki aracı ve bir alan sözcüğünü işaretleyin. Kendi tarihinizden bu işaretlerle kesişen dört olgu yazın. Yalnızca yağ çeken olguları atın. Kalanı dört satıra koyun. Sesli okuyun. Telefon görüşmesinde söylemeye utanıyorsanız hâlâ süstür. Yetenek havuzundaki ortak inceleyenler PDF’in gerisini açmadan önce bu bloğu görür — nutuk değil, dosyalama etiketi yapın.',
          ],
          list: [
            'Satır 1: rol + yıl + alan, sıfat yok.',
            'Satır 2: kuşkucunun beş dakikada sorabileceği bir kanıt.',
            'Satır 3: işin merkezindeyse araç, yöntem veya dil.',
            'Satır 4: şehir, çalışma biçimi veya sonraki rol ailesi, tek bir yan cümlede.',
            'Yarın meslek değiştirseniz de doğru kalacak her cümleyi kesin.',
            'Bazen başvurduğunuz diğer yol için notta ikinci bir özet tutun; sayfada ortalamayın.',
          ],
        },
      ],
    },
  },
  {
    slug: 'is-deneyimi-maddeleri',
    published: '2026-08-24',
    updated: '2026-08-24',
    en: {
      title: 'Experience bullets that show work, not job titles',
      description:
        'Turn experience into verb-plus-result bullets, use numbers when you have them, and still write clearly when you do not.',
      sections: [
        {
          heading: 'The only pattern that consistently survives a skim',
          paragraphs: [
            'A hiring manager in Turkey or abroad does not read your experience like a novel. They skim for verbs and for signs that you operated at the level they need. The pattern that survives that skim is verb, task, result. Started with an action a colleague would recognise. Named the object you worked on. Closed with a change: faster, cheaper, fewer errors, more coverage, a launch, a handover that stuck.',
            '“Responsible for social media” is a duty from a job description. “Wrote weekly product posts for the Turkish Instagram account, grew saves on how-to reels after we moved from announcements to demonstrations” is work. You do not need a marketing budget of millions. You need a verb that is not “responsible.” Owned, shipped, rebuilt, reconciled, trained, escalated, scheduled, negotiated — pick the one you could still explain on a whiteboard.',
            'Keep one idea per bullet. A paragraph that lists six tools and two projects will be skipped. Three to six bullets per recent role is enough. Older roles can take two. If every bullet starts with the same verb, you have a vocabulary problem, not a career problem. Vary the verb only when the work varied. Fake variety — “spearheaded,” “orchestrated,” “leveraged” — is worse than repeating “built.”',
          ],
        },
        {
          heading: 'Numbers: where they live, and how not to invent them',
          paragraphs: [
            'Numbers are persuasive because they bound the claim. Volume, frequency, money, time, people, sites, SKUs, tickets, cities. A call-centre agent who handled a queue is different from one who handled about forty contacts a day in peak season in a Gaziantep operation. A teacher with “classes” is different from one with 18 hours a week across three grades. Ask what you counted while doing the job. That number is usually honest enough.',
            'Do not invent precision. “Increased sales 37.4 percent” when you mean “the stall was busier after the fair” will collapse in the interview. Round. Use hedges that are still factual: about, over, from-to. Percentages need a base. “Cut waiting time 30 percent” is a trap unless you can say 30 percent of what, measured how. “Cut average counter wait from roughly twelve minutes to under eight after we split payments from inquiries” is harder to attack.',
            'If your employer treats figures as confidential, use ratios and ranges instead of revenue. “Closed month-end for four legal entities” is safer than leaking turnover. “Second-largest client by volume in the Izmir warehouse” tells scale without a spreadsheet. When in doubt, describe the machine you were inside — two production lines, a 12-person shift, a national dealer network — rather than a vanity metric you cannot source.',
          ],
        },
        {
          heading: 'When you have no metrics at all',
          paragraphs: [
            'Plenty of real work is not measured. A paralegal who organised case files, a nurse who kept a ward from dropping tasks, a junior accountant who made the VAT return stop bouncing. In those jobs, result can be reliability, coverage, or a before-and-after in the process. “Built a checklist the night team still uses” is a result. “Answered questions” is not.',
            'Name the artefacts. Reports, dashboards, bills of materials, lesson plans, settlement files, quality forms. Name the users: operators, parents, store managers, the Ankara desk. Name the constraint: paper process, broken import, three systems that did not talk. Constraint plus artefact is often as strong as a percentage. It shows you were not a passenger.',
          ],
          list: [
            'Replace “helped with” with the artefact you left behind or the decision you unblocked.',
            'If the work was coverage, say when and for whom: weekends, month-end, a second site in Bursa.',
            'If the work was quality, say what stopped: duplicate invoices, missing serials, wrong shipment addresses.',
            'If the work was people, say the size and the cadence: eight interns each summer, daily stand-up with two technicians.',
            'If you truly only observed, it belongs under internships as learning, not as a heroic bullet.',
            'Ask a former colleague “what broke when you were on holiday?” The answer is often the bullet.',
          ],
        },
        {
          heading: 'Order inside a role, and which roles go first',
          paragraphs: [
            'Inside a job, put the most relevant bullets first, not the chronological first task you were given. If you are applying for analytics, the ad-hoc report you built for the CFO outranks the fact that you also booked meeting rooms. Chronology of your career still runs newest employer first. Chronology inside the employer should run most evidential first.',
            'Do not hide the employer. Company name, your title, city, dates. If the company is unknown outside Turkey, add a five-word gloss: regional cement producer, 800 employees. Do not write a paragraph of corporate marketing. Dates in months, not only years, stop the “were you unemployed in 2023?” question. If you left in the same month you joined, say so; a six-week contract is better explained than omitted.',
          ],
        },
        {
          heading: 'Internships, part-time work, and military time',
          paragraphs: [
            'Internships count when they produced work a staff member would recognise. “Stajyer” as a title is fine; empty stajyer bullets are not. Treat a three-month internship as a short role: two or three bullets, real tools, a supervisor’s world. Ten internships listed as job titles with no bullets look like stamp collecting. Merge tiny shadowing weeks into one Education or Early work line if they add nothing.',
            'Part-time retail, hospitality, and family-business work can show reliability if you are early career. One or two bullets on shift load and cash handling beat a shamefaced omission that opens a gap. They drop off a mid-level engineering CV unless the new job is operations. Military service, if you include it as a role, needs the same discipline: function, not patriotism. Logistics clerk in a unit of X is information. “Served honourably” is not.',
          ],
        },
        {
          heading: 'What to stop writing in bullets',
          paragraphs: [
            'Stop copying the human-resources job posting back to them. They know what the role was supposed to include. They do not know what you actually touched. Stop listing every system login you were given. SAP is a universe; say MM invoices or PP orders if that is what you did. Stop soft-skill bullets: “demonstrated leadership.” If you led, the task will show it.',
            'Stop stacking tools in a comma list that could be a skills section. The bullet is for the use of the tool. Stop English bullets that are Turkish syntax with English words. “Realized the inventory counting together with warehouse” is not how a UK reader hears the work. Recast: “Ran the quarterly stock count with the warehouse team and posted adjustments the same week.” Then put the Turkish version through the same recast, not a dictionary walk.',
          ],
        },
        {
          heading: 'Turkish and English bullets, side by side',
          paragraphs: [
            'Keep dates and employers identical across languages. Translate the work, not the swagger. Some Turkish verbs are heavier than their English cousins; “yürütmek” is not always “executed.” Prefer plain English: ran, wrote, checked, shipped. Prefer plain Turkish: yürüttüm only when you truly owned the process; otherwise hazırladım, kontrol ettim, devrettim. Past tense for finished jobs, present for the current one, and do not mix them in the same role.',
            'Avoid false precision in both languages. Avoid empty scale words: globally, holistically, end-to-end, 360 derece. If the loop was you and one supplier in Gebze, say that. International readers are not impressed by “global” on a domestic SME. Turkish readers are not impressed by English jargon on a local operations CV. Match the room.',
          ],
        },
        {
          heading: 'A rewrite pass you can do on last week’s file',
          paragraphs: [
            'Print or copy the three most recent roles. Under each bullet, write one word: duty, story, or evidence. Duties go back to the job description. Stories go to interviews. Evidence stays. Then add a number or an artefact to every evidence line that lacks one. Cut the rest until each recent job is a handful of lines a stranger could retell. That stranger is the first human after the ATS, and they are tired.',
          ],
          list: [
            'Start every surviving bullet with a verb you would use at work, not a thesaurus verb.',
            'Put the object next: report, line, portfolio, class, queue, store.',
            'Close with a result, a cadence, or a user who depended on it.',
            'Newest job first; inside the job, most relevant to this posting first.',
            'Internships: fewer bullets, same pattern, no empty title rows.',
            'Read the English and Turkish files against each other for matching dates and employers before you send either.',
          ],
        },
      ],
    },
    tr: {
      title: 'Unvan değil iş gösteren deneyim maddeleri',
      description:
        'Deneyimi fiil ve sonuç maddelerine çevirin; sayı varsa kullanın, yoksa yine net yazın.',
      sections: [
        {
          heading: 'Göz gezdirmede ayakta kalan tek kalıp',
          paragraphs: [
            'Türkiye’de veya yurt dışında bir işe alım yöneticisi deneyiminizi roman gibi okumaz. Fiillere ve ihtiyaç duydukları düzeyde çalıştığınıza dair işaretlere bakarlar. O bakışta ayakta kalan kalıp fiil, iş, sonuçtur. Bir meslektaşın tanıyacağı bir eylemle başlayın. Üzerinde çalıştığınız nesneyi adlandırın. Bir değişiklikle kapatın: daha hızlı, daha ucuz, daha az hata, daha çok kapsam, bir canlıya alma, tutan bir devir.',
            '“Sosyal medyadan sorumlu” iş tanımından bir görevdir. “Türkçe Instagram hesabı için haftalık ürün yazıları yazdım, duyurudan gösterime geçince nasıl yapılır reel’lerinde kaydetmeleri arttı” iştir. Milyonluk pazarlama bütçesi gerekmez. “Sorumlu” olmayan bir fiil gerekir. Sahiplendim, canlıya aldım, yeniden kurdum, mutabakat yaptım, eğittim, yükselttim, çizelgeledim, müzakere ettim — tahtada hâlâ açıklayabileceğiniz olanı seçin.',
            'Maddede tek fikir tutun. Altı araç ve iki proje sayan paragraf atlanır. Son rol başına üç ile altı madde yeter. Eski roller iki madde alabilir. Her madde aynı fiille başlıyorsa kariyer değil sözcük dağarcığı sorununuz vardır. İş değiştiyse fiili değiştirin. Sahte çeşitlilik — “spearheaded,” “orchestrated,” “leveraged” — “kurdum”u tekrarlamaktan kötüdür.',
          ],
        },
        {
          heading: 'Sayılar: nerede yaşarlar, nasıl uydurulmazlar',
          paragraphs: [
            'Sayılar iddiayı sınırladığı için ikna eder. Hacim, sıklık, para, zaman, insan, tesis, SKU, bilet, şehir. Bir kuyruğu yöneten çağrı merkezi çalışanı, Gaziantep operasyonunda yoğun sezonda günde yaklaşık kırk temas alan kişiden farklıdır. “Sınıfları olan” öğretmen, üç kademede haftada 18 saati olandan farklıdır. İşi yaparken ne saydığınızı sorun. O sayı genelde yeterince dürüsttür.',
            'Hassasiyet uydurmayın. “Satışlar yüzde 37,4 arttı” derken “fuardan sonra tezgâh kalabalıklaştı” demek istiyorsanız mülakatta çökersiniz. Yuvarlayın. Hâlâ olgusal çekinceler kullanın: yaklaşık, üzerinde, şundan şuna. Yüzdelerin tabanı gerekir. “Bekleme süresini yüzde 30 kestim,” neyin yüzde 30’u, nasıl ölçüldü diyemiyorsanız tuzaktır. “Ödemeleri sorulardan ayırdıktan sonra gişe beklemesini kabaca on iki dakikadan sekizin altına indirdim” saldırılması daha zordur.',
            'İşveren rakamları gizli sayıyorsa ciro sızdırmak yerine oran ve aralık kullanın. “Dört tüzel kişilik için ay sonunu kapattım,” ciro sızdırmaktan güvenlidir. “İzmir deposunda hacimce ikinci büyük müşteri” tablo olmadan ölçek söyler. Kuşkudaysanız övünç metriği uydurmak yerine içinde durduğunuz makineyi tarif edin — iki üretim hattı, 12 kişilik vardiya, ulusal bayi ağı.',
          ],
        },
        {
          heading: 'Hiç metriğiniz yokken',
          paragraphs: [
            'Pek çok gerçek iş ölçülmez. Dava dosyalarını düzenleyen hukuk asistanı, servisin iş düşürmemesini sağlayan hemşire, KDV beyanının geri dönmesini durduran junior muhasebeci. Bu işlerde sonuç güvenilirlik, kapsam veya süreçteki önce-sonra olabilir. “Gece ekibinin hâlâ kullandığı bir kontrol listesi kurdum” sonuçtur. “Soruları yanıtladım” değildir.',
            'Çıktıları adlandırın. Raporlar, panolar, ürün ağaçları, ders planları, mutabakat dosyaları, kalite formları. Kullanıcıları adlandırın: operatörler, veliler, mağaza müdürleri, Ankara masası. Kısıtı adlandırın: kâğıt süreç, bozuk içe aktarma, konuşmayan üç sistem. Kısıt artı çıktı çoğu zaman yüzde kadar güçlüdür. Yolcu olmadığınızı gösterir.',
          ],
          list: [
            '“Yardım ettim”i geride bıraktığınız çıktı veya önünü açtığınız kararla değiştirin.',
            'İş kapsama idiyse ne zaman ve kim için deyin: hafta sonu, ay sonu, Bursa’daki ikinci tesis.',
            'İş kalite idiyse neyin durduğunu deyin: mükerrer fatura, eksik seri, yanlış sevkiyat adresi.',
            'İş insan idiyse büyüklüğü ve ritmi deyin: her yaz sekiz stajyer, iki teknisyenle günlük ayaküstü.',
            'Gerçekten yalnızca gözlemlediyseniz kahraman madde değil, staj altında öğrenme olsun.',
            'Eski bir meslektaşa sorun: “tatildeyken ne bozulurdu?” Yanıt çoğu zaman maddedir.',
          ],
        },
        {
          heading: 'Rol içi sıra ve hangi roller önce gelir',
          paragraphs: [
            'Bir işin içinde en ilgili maddeleri ilk koyun, size verilen ilk görevin kronolojisini değil. Analitik işe başvuruyorsanız CFO için kurduğunuz anlık rapor, toplantı odası rezervasyonundan öndedir. Kariyerinizin kronolojisi yine en yeni işveren önce gider. İşveren içindeki kronoloji en kanıtlayıcı önce gitmelidir.',
            'İşvereni gizlemeyin. Şirket adı, unvanınız, şehir, tarihler. Şirket Türkiye dışında bilinmiyorsa beş sözcüklük bir açıklama ekleyin: bölgesel çimento üreticisi, 800 çalışan. Kurumsal pazarlama paragrafı yazmayın. Yalnızca yıl değil ay da içeren tarihler “2023’te işsiz miydiniz?” sorusunu keser. Girdiğiniz ay çıktıysanız deyin; altı haftalık sözleşme omaktan iyidir.',
          ],
        },
        {
          heading: 'Stajlar, yarı zamanlı iş ve askerlik süresi',
          paragraphs: [
            'Stajlar, bir kadrolu çalışanın tanıyacağı iş ürettiyse sayılır. Unvan olarak “Stajyer” sorun olmaz; boş stajyer maddeleri olur. Üç aylık stajı kısa bir rol gibi işleyin: iki veya üç madde, gerçek araçlar, yöneticinin dünyası. Madde olmadan on staj unvanı pul koleksiyonu gibi durur. Küçük gölge haftaları hiçbir şey eklemiyorsa Eğitim veya Erken iş satırında birleştirin.',
            'Yarı zamanlı perakende, hizmet ve aile işi, erken kariyerde güvenilirlik gösterebilir. Vardiya yükü ve kasa üzerine bir-iki madde, boşluk açan utanarak atlamaktan iyidir. Yeni iş operasyon değilse orta düzey mühendislik CV’sinden düşerler. Askerliği bir rol olarak yazıyorsanız aynı disiplin gerekir: vatanseverlik değil işlev. X birliğinde lojistik memuru bilgidir. “Şerefle görev yaptım” değildir.',
          ],
        },
        {
          heading: 'Maddelerde yazmayı bırakmanız gerekenler',
          paragraphs: [
            'İnsan kaynakları iş ilanını onlara geri kopyalamayı bırakın. Rolün ne içermesi gerektiğini bilirler. Sizin gerçekten neye dokunduğunuzu bilmezler. Verilen her sistem girişini listelemeyi bırakın. SAP bir evrendir; yaptığınız buysa MM faturaları veya PP siparişleri deyin. Yumuşak yetenek maddelerini bırakın: “liderlik sergiledim.” Liderlik ettiyseniz iş gösterir.',
            'Yetenekler bölümü olabilecek virgüllü araç yığınlarını bırakın. Madde aracın kullanımı içindir. Türkçe sözdizimli İngilizce maddeleri bırakın. “Realized the inventory counting together with warehouse” Birleşik Krallık okurunun işi duyduğu biçim değildir. Yeniden kurun: “Ran the quarterly stock count with the warehouse team and posted adjustments the same week.” Sonra Türkçe sürümü sözlük gezintisi değil, aynı yeniden kurma ile yazın.',
          ],
        },
        {
          heading: 'Türkçe ve İngilizce maddeler, yan yana',
          paragraphs: [
            'Diller arasında tarihleri ve işverenleri aynı tutun. Caka değil işi çevirin. Bazı Türkçe fiiller İngilizce kuzenlerinden daha ağırdır; “yürütmek” her zaman “executed” değildir. Yalın İngilizce yeğleyin: ran, wrote, checked, shipped. Yalın Türkçe yeğleyin: süreci gerçekten sahiplendiyseniz yürüttüm; yoksa hazırladım, kontrol ettim, devrettim. Bitmiş işlerde geçmiş zaman, mevcut işte şimdiki zaman, aynı rolde karıştırmayın.',
            'İki dilde de sahte hassasiyetten kaçının. Boş ölçek sözcüklerinden kaçının: globally, holistically, end-to-end, 360 derece. Döngü Gebze’de siz ve bir tedarikçi idiyse onu deyin. Uluslararası okur, yerli KOBİ’de “global” ile etkilenmez. Türk okur, yerel operasyon CV’sinde İngilizce jargon ile etkilenmez. Odaya uyun.',
          ],
        },
        {
          heading: 'Geçen haftaki dosyada yapabileceğiniz bir yeniden yazım',
          paragraphs: [
            'En son üç rolü yazdırın veya kopyalayın. Her maddenin altına bir sözcük yazın: görev, hikâye veya kanıt. Görevler iş tanımına döner. Hikâyeler mülakata gider. Kanıt kalır. Sonra kanıt satırlarının eksik olanına bir sayı veya çıktı ekleyin. Her son iş, bir yabancının anlatabileceği bir avuç satır kalana kadar gerisini kesin. O yabancı ATS’ten sonraki ilk insandır ve yorgundur.',
          ],
          list: [
            'Ayakta kalan her maddeye işte kullanacağınız fiille başlayın, sözlük fiiliyle değil.',
            'Yanına nesneyi koyun: rapor, hat, portföy, sınıf, kuyruk, mağaza.',
            'Bir sonuç, bir ritim veya buna bağlı bir kullanıcı ile kapatın.',
            'En yeni iş önce; işin içinde bu ilana en ilgili madde önce.',
            'Stajlar: daha az madde, aynı kalıp, boş unvan satırı yok.',
            'Göndermeden önce İngilizce ve Türkçe dosyaları eşleşen tarihler ve işverenler için karşılaştırın.',
          ],
        },
      ],
    },
  },
  {
    slug: 'yetenekler-bolumu',
    published: '2026-08-24',
    updated: '2026-08-24',
    en: {
      title: 'A skills section that can survive a sceptical reader',
      description:
        'Group hard skills, tools, and languages honestly — and drop star ratings and beginner software you will not be tested on.',
      sections: [
        {
          heading: 'Three kinds of skill, not one laundry list',
          paragraphs: [
            'A skills block is a filter, not a personality test. Recruiters use it to search and to sanity-check the story in your jobs. Mix three kinds of line and the filter breaks. Hard skills are methods and domains you can be examined on: financial statement analysis, injection moulding process control, civil procedure, paediatric triage. Tools are named software and equipment: SolidWorks, Python, Bloomberg, Fanuc, HBYS. Languages are human languages with a level.',
            'When you dump them in one comma-separated row — “leadership, Excel, English, innovation, SAP, driving licence” — nothing is searchable and everything looks inflated. Leadership belongs in bullets if it happened. A driving licence belongs in additional information if the job is field sales in Anatolia, not in skills if you are a compiler engineer in Teknopark. Excel can be a tool. It is not a personality.',
            'Soft skills are not forbidden because they are immoral. They are weak here because they cannot be verified in a list. “Communication” on a CV in Istanbul means you have seen other CVs. If you negotiate dealer terms, that is a hard commercial skill and should be phrased as such under commercial work or in a bullet, not as a star next to a smiley.',
          ],
        },
        {
          heading: 'Group so a human can scan in four seconds',
          paragraphs: [
            'Use three or four short subheads: Domain or methods, Tools, Languages, and optionally Licences. Keep each group to the items you would not be ashamed to demo. A backend engineer might list Domain: APIs, relational modelling, payment retries. Tools: Java, PostgreSQL, Kafka, Git. Languages: Turkish native, English C1. That is a map. Twenty frameworks including a weekend tutorial is a wish.',
            'Order within a group by relevance to the job you want, not by love. If you are moving from academia to industry, put the industrial tools first even if you are prouder of LaTeX. If you are a nurse applying to a private hospital in Antalya, the hospital information system and the speciality sit above a one-day Excel course. Do not rank yourself with bars. Rank the list by the reader’s problem.',
          ],
        },
        {
          heading: 'Honesty is a practical filter, not a moral speech',
          paragraphs: [
            'You will be asked to use the first tools on the list. In technical interviews in Istanbul, that can be a live exercise. In accounting, it can be a sample reconciliation. In design, a file in the native format. Listing what you touched once in 2019 is how people fail the first hour. A fair test: could you explain a mistake you made with this tool? If not, it is too stale or too shallow.',
            'Classroom-only knowledge can stay if you label it. “Python, coursework and thesis, not production” is adult. “Python” beside a senior title is a bet you will lose. The same rule applies to language. B1 English is useful and common. Calling it fluent will be obvious on a call with a manager in Reading. CEFR letters are kinder than “good / very good / excellent,” which mean nothing between schools.',
          ],
          list: [
            'If you would need a tutorial open to complete a basic task, do not list the tool as a professional skill.',
            'If you used it daily in the last two years, it can sit without a disclaimer.',
            'If you used it years ago, either refresh and be ready or drop it.',
            'If the job posting named it and you only have adjacent knowledge, say the adjacent tool honestly in the cover note, not as a fake twin on the CV.',
            'If a certificate is the only contact you have with a method, list the certificate with a date, not the method as mastery.',
            'If two tools do the same job, keep the one you would actually open on day one.',
          ],
        },
        {
          heading: 'What not to list — especially later in a career',
          paragraphs: [
            'A senior engineer does not need Microsoft Word. A finance manager does not need “Internet Explorer” or “Windows.” A teacher does not need “email.” These were once differentiators. They now signal that you copied a 2012 template. Microsoft Office as a bundle is acceptable for assistants, students, and roles where the work is documents and calendars. Even then, name Outlook or Excel if that is the actual craft, and skip PowerPoint if you barely present.',
            'Do not list every module of SAP you walked past. Do not list Adobe Creative Suite if you used Photoshop to crop a photo. Do not list “social media” as a skill when you mean you have a private Instagram. Do not list hobbies as skills unless the job is that hobby: climbing instructor, chef, photographer. “Travel” and “cinema” waste a line that could have held a licence number or a laboratory technique.',
          ],
        },
        {
          heading: 'Stars, pies, and other graphics that cannot be searched',
          paragraphs: [
            'Five-dot scales and circular charts fail twice. The ATS cannot store them as text. A human cannot interpret your private scale. Four dots in Java versus three in C# might mean “I like Java more,” not “I am safer in Java.” If you need nuance, use words in the group: production, academic, reading. Or omit the weak item. Silence is cleaner than a half-filled star.',
            'Icon rows with no labels are worse. A parser sees nothing. A recruiter who does not recognise the mark sees nothing. Write the word PostgreSQL. Brand marks are not a language. The same is true of flag icons for languages. They look lively in Canva. They fail in a tracker and they fail in black-and-white printouts still used on some factory floors.',
          ],
        },
        {
          heading: 'Human languages, exams, and the Turkey-specific extras',
          paragraphs: [
            'State languages with a level you can defend on a call. Native or mother tongue, C2, C1, B2, B1 is clearer than fluent / advanced / intermediate. If you have YDS, YÖKDİL, IELTS, or TOEFL, put the score and year once, under languages or certificates, not in three places. Expired scores can still show history; do not pretend a 2014 IELTS is current if the employer asked for two years.',
            'KPDS and public-exam language scores belong when the reader is a public institution. A product company in Levent does not staff by KPDS. Driving licences, forklift certificates, first aid, and hygiene certificates belong when the work is warehouses, field service, or food. They are noise on a research CV. Match the extras to the job family the way you match tools.',
          ],
        },
        {
          heading: 'Matching the posting without stuffing',
          paragraphs: [
            'Mirror the posting’s vocabulary only for things you truly have. If they asked for Power BI and you have Tableau, say Tableau and, if honest, “similar to Power BI, not certified.” Do not hide a comma-separated clone of the advert at the bottom in tiny type. Parsers and people have seen it. Keyword stuffing is how you get a screening call you cannot survive.',
            'Ten to twenty items across all groups is plenty for most professionals. Students can be shorter. If you need more, you are using skills as a dumping ground for courses. Move coursework under education. Move old tools you no longer accept work in to a spare note on your computer, not the live CV. The live list should match the jobs you want this quarter.',
          ],
        },
        {
          heading: 'A clean skills block you can actually maintain',
          paragraphs: [
            'Rewrite the section whenever you change target role, not whenever you feel insecure. Insecurity adds tools. A new target removes them. Keep a long private list if you like. Publish the short one. When a recruiter searches “PLC” and “Bursa,” they should hit you because those words appear in tools and in a job line, not because you wallpapered the footer. Skills and experience must agree. A tool that never appears in a bullet is a claim waiting to be tested — write the bullet or drop the tool.',
          ],
          list: [
            'Subheads: methods or domain, tools, languages, licences if the job uses them.',
            'No star ratings, no pie charts, no unlabelled icons.',
            'No Word/Windows/email on specialist and senior files.',
            'Language levels you would repeat on a video call.',
            'Items you could demo or explain a failure in.',
            'The same tool names as in your bullets, spelled the same way, including capitalisation.',
          ],
        },
      ],
    },
    tr: {
      title: 'Kuşkucu okurda ayakta kalan bir yetenekler bölümü',
      description:
        'Teknik yetenekleri, araçları ve dilleri dürüstçe gruplayın; yıldız puanı ve test edilmeyeceğiniz başlangıç yazılımlarını çıkarın.',
      sections: [
        {
          heading: 'Tek çamaşır listesi değil, üç tür yetenek',
          paragraphs: [
            'Yetenek bloğu kişilik testi değil filtredir. İşe alımcılar arama yapmak ve işlerinizdeki öyküyü yoklamak için kullanır. Üç tür satırı karıştırınca filtre bozulur. Teknik yetenekler, sınanabileceğiniz yöntem ve alanlardır: mali tablo analizi, enjeksiyon kalıplama süreç kontrolü, hukuk usulü, çocuk triyajı. Araçlar adlı yazılım ve donanımdır: SolidWorks, Python, Bloomberg, Fanuc, HBYS. Diller, düzeyli insan dilleridir.',
            'Hepsini tek virgüllü satıra dökünce — “liderlik, Excel, İngilizce, inovasyon, SAP, ehliyet” — hiçbir şey aranamaz, her şey şişmiş durur. Liderlik olduysa maddelere aittir. Ehliyet, iş Anadolu’da saha satışıysa ek bilgidedir; Teknopark’ta derleyici mühendisiyseniz yeteneklerde değildir. Excel araç olabilir. Kişilik değildir.',
            'Yumuşak yetenekler ahlaksız oldukları için yasak değildir. Listede doğrulanamadıkları için burada zayıftırlar. İstanbul’daki bir CV’de “iletişim” başka CV gördüğünüz anlamına gelir. Bayi koşullarını müzakere ediyorsanız bu sert ticari bir yetenektir; gülücük yanındaki yıldız olarak değil, ticari iş altında veya bir maddede öyle yazılmalıdır.',
          ],
        },
        {
          heading: 'İnsanın dört saniyede tarayacağı gruplar',
          paragraphs: [
            'Üç veya dört kısa alt başlık kullanın: Alan veya yöntemler, Araçlar, Diller, isteğe bağlı Belgeler. Her grupta göstermekten utanmayacağınız öğeleri tutun. Bir backend mühendisi Alan: API’ler, ilişkisel modelleme, ödeme yeniden denemeleri yazabilir. Araçlar: Java, PostgreSQL, Kafka, Git. Diller: Türkçe ana dil, İngilizce C1. Bu bir haritadır. Hafta sonu eğitimi dahil yirmi çerçeve bir dilektir.',
            'Grup içinde sırayı sevginize göre değil, istediğiniz işe göre kurun. Akademiden sanayiye geçiyorsanız LaTeX ile gururunuz daha büyük olsa da endüstri araçlarını öne alın. Antalya’da özel hastaneye başvuran hemşirede hastane bilgi sistemi ve uzmanlık, bir günlük Excel kursunun üstünde durur. Kendinizi çubuklarla sıralamayın. Listeyi okurun sorununa göre sıralayın.',
          ],
        },
        {
          heading: 'Dürüstlük ahlak nutku değil pratik bir filtredir',
          paragraphs: [
            'Listedeki ilk araçları kullanmanız istenir. İstanbul’daki teknik mülakatlarda bu canlı bir alıştırma olabilir. Muhasebede örnek bir mutabakat olabilir. Tasarımda yerli biçiminde bir dosya olabilir. 2019’da bir kez dokunduğunuzu yazmak, ilk saatte düşmenin yoludur. Adil bir test: bu araçla yaptığınız bir hatayı anlatabilir misiniz? Anlatamıyorsanız fazla eski veya fazla sığdır.',
            'Yalnızca sınıfta kalan bilgi, etiketlerseniz durabilir. “Python, ders ve tez, üretim değil” yetişkindir. Kıdemli unvanın yanında “Python” kaybedeceğiniz bir bahistir. Dil için aynı kural geçerlidir. B1 İngilizce yararlı ve yaygındır. Akıcı demek, Reading’deki yöneticiyle görüşmede belli olur. CEFR harfleri, okullar arasında hiçbir şey demeyen “iyi / çok iyi / mükemmel”den daha naziktir.',
          ],
          list: [
            'Temel bir işi bitirmek için eğitimi açık tutmanız gerekiyorsa aracı profesyonel yetenek yazmayın.',
            'Son iki yılda her gün kullandıysanız dipnot olmadan durabilir.',
            'Yıllar önce kullandıysanız ya tazeleyip hazır olun ya çıkarın.',
            'İlan adlandırdı ve sizde yalnızca komşu bilgi varsa sahte ikiz olarak CV’ye değil, dürüstçe ön yazıya yazın.',
            'Bir yöntemle tek temasınız sertifikaysa yöntemi ustalık diye değil, tarihli sertifika diye yazın.',
            'İki araç aynı işi görüyorsa birinci günde gerçekten açacağınızı tutun.',
          ],
        },
        {
          heading: 'Neyi listelememeli — özellikle kariyerin ilerisinde',
          paragraphs: [
            'Kıdemli mühendisin Microsoft Word’e ihtiyacı yoktur. Finans müdürünün “Internet Explorer” veya “Windows”a ihtiyacı yoktur. Öğretmenin “e-posta”ya ihtiyacı yoktur. Bunlar bir zamanlar ayırt ederdi. Şimdi 2012 şablonunu kopyaladığınızı gösterir. Microsoft Office paketi asistanlar, öğrenciler ve işi belge ile takvim olan roller için kabul edilebilir. O durumda bile asıl zanaat buysa Outlook veya Excel deyin; neredeyse hiç sunum yapmıyorsanız PowerPoint’i atlayın.',
            'Yanından geçtiğiniz her SAP modülünü yazmayın. Fotoğraf kırmak için Photoshop kullandıysanız Adobe Creative Suite yazmayın. Özel Instagram’ınız var diye “sosyal medya” yazmayın. İş o hobi değilse hobileri yetenek yazmayın: tırmanış eğitmeni, aşçı, fotoğrafçı. “Seyahat” ve “sinema,” belge numarası veya laboratuvar tekniği durabilecek bir satırı yer.',
          ],
        },
        {
          heading: 'Yıldızlar, pasta dilimleri ve aranamayan diğer grafikler',
          paragraphs: [
            'Beş noktalı ölçekler ve daire grafikler iki kez düşer. ATS onları metin olarak saklayamaz. İnsan sizin özel ölçeğinizi yorumlayamaz. Java’da dört nokta, C#’ta üç nokta “Java’da daha güvenliyim” değil “Java’yı daha çok severim” anlamına gelebilir. Nüans gerekiyorsa grupta sözcük kullanın: üretim, akademik, okuma. Ya da zayıf öğeyi çıkarın. Yarım yıldızdan sessizlik daha temizdir.',
            'Etiketsiz ikon sıraları daha kötüdür. Çözümleyici hiçbir şey görmez. İşareti tanımayan işe alımcı hiçbir şey görmez. PostgreSQL sözcüğünü yazın. Marka işaretleri dil değildir. Diller için bayrak ikonları da öyle. Canva’da canlı dururlar. Takip sisteminde düşerler, bazı fabrika katlarında hâlâ kullanılan siyah-beyaz çıktıda da düşerler.',
          ],
        },
        {
          heading: 'İnsan dilleri, sınavlar ve Türkiye’ye özgü ekler',
          paragraphs: [
            'Dilleri bir görüşmede savunabileceğiniz düzeyle yazın. Ana dil, C2, C1, B2, B1; fluent / advanced / intermediate’den nettir. YDS, YÖKDİL, IELTS veya TOEFL’iniz varsa puanı ve yılı bir kez, diller veya belgeler altında yazın, üç yerde değil. Süresi dolmuş puanlar geçmiş gösterebilir; işveren iki yıl istediyse 2014 IELTS’ini güncel gibi göstermeyin.',
            'KPDS ve kamu dil puanları okur kamu kurumuysa aittir. Levent’teki bir ürün şirketi KPDS ile kadro açmaz. Ehliyet, forklift, ilk yardım ve hijyen belgeleri depo, saha servisi veya gıda işiyse aittir. Araştırma CV’sinde gürültüdür. Ekleri, araçları uydurduğunuz gibi iş ailesine uydurun.',
          ],
        },
        {
          heading: 'İlanı doldurmadan eşlemek',
          paragraphs: [
            'İlanın sözcük dağarcığını yalnızca gerçekten sahip olduklarınız için yansıtın. Power BI istediler, sizde Tableau varsa Tableau deyin ve dürüstse “Power BI’ya yakın, sertifikasız” ekleyin. İlanın virgüllü kopyasını altta küçük puntoyla gizlemeyin. Çözümleyiciler ve insanlar görmüştür. Anahtar sözcük doldurmak, dayanamayacağınız bir eleme araması getirmenin yoludur.',
            'Tüm gruplarda on ile yirmi öğe çoğu uzman için yeter. Öğrenciler daha kısa olabilir. Daha fazlası gerekiyorsa yetenekleri kurs çöplüğü olarak kullanıyorsunuzdur. Dersleri eğitimin altına alın. Artık iş kabul etmediğiniz eski araçları canlı CV’ye değil, bilgisayarınızdaki yedek nota koyun. Canlı liste bu çeyrek istediğiniz işlerle örtüşsün.',
          ],
        },
        {
          heading: 'Gerçekten bakabileceğiniz temiz bir yetenek bloğu',
          paragraphs: [
            'Bölümü güvensiz hissettiğiniz her anda değil, hedef rol değişince yeniden yazın. Güvensizlik araç ekler. Yeni hedef araç çıkarır. Uzun özel liste tutabilirsiniz. Kısa olanı yayımlayın. Bir işe alımcı “PLC” ve “Bursa” aradığında sizi, alt bilgiyi kapladığınız için değil, bu sözcükler araçlarda ve bir iş satırında geçtiği için bulmalıdır. Yetenekler ve deneyim anlaşmalıdır. Maddede hiç geçmeyen bir araç, sınanmayı bekleyen bir iddiadır — maddeyi yazın veya aracı çıkarın.',
          ],
          list: [
            'Alt başlıklar: yöntem veya alan, araçlar, diller, iş kullanıyorsa belgeler.',
            'Yıldız puanı yok, pasta grafik yok, etiketsiz ikon yok.',
            'Uzman ve kıdemli dosyalarda Word/Windows/e-posta yok.',
            'Görüntülü görüşmede tekrarlayacağınız dil düzeyleri.',
            'Gösterebileceğiniz veya bir hatasını anlatabileceğiniz öğeler.',
            'Maddelerinizdekiyle aynı araç adları, aynı yazım, büyük harf dahil.',
          ],
        },
      ],
    },
  },
  {
    slug: 'sik-yapilan-cv-hatalari',
    published: '2026-08-24',
    updated: '2026-08-24',
    en: {
      title: 'CV mistakes that still sink applications in Turkey',
      description:
        'The mistakes that still sink applications in Turkey: selfie photos, broken Canva columns, five-page files, and missing dates.',
      sections: [
        {
          heading: 'The selfie, the holiday crop, and the borrowed vesikalık',
          paragraphs: [
            'Turkish processes still often want a face. That is not permission to use the last story you posted. A bathroom mirror shot, a sunglasses crop from Çeşme, a wedding table close-up, or a heavily filtered portrait tells the reader you did not switch context. Offices in conservative cities will read it as careless. Fashion teams will read it as the wrong kind of styled. Nobody reads it as professional intent.',
            'Use a recent, well-lit headshot with a plain background if you include a photo at all. Shoulders up, face visible, clothes that match the job’s floor — factory, bank, studio. Do not use a photograph of another person, an old university ID that no longer looks like you, or a cartoon avatar. Do not put the photo so large that your name becomes a caption. And if the market is US or UK, remember that the same selfie is not only informal; it is often a reason to discard the file on policy.',
          ],
        },
        {
          heading: 'Two-column Canva files that look finished and parse broken',
          paragraphs: [
            'Canva, PowerPoint, and Instagram-carousel templates are how a large share of Turkish students “design” a CV. The result is pretty in a grid of stories and hostile in Workday. Text lives in disconnected boxes. Icons replace headings. A coloured rail eats a third of the page. You feel like you shipped a brand. The ATS ships scrambled dates.',
            'If you like the look, rebuild the content in a single column with normal headings, then decide whether a light visual layer is still worth it for email applications to humans who asked for a PDF. For portals, skip the layer. A quiet layout that copies cleanly will beat a decorated one that cannot. That is the entire reason plain ATS builders exist; use one if your current file fails the select-all paste test.',
          ],
          list: [
            'Select all in the PDF, paste into Notes; if columns interleave, do not upload that file to a tracker.',
            'Replace icon headings with the words Experience, Education, Skills or their Turkish pair.',
            'Move skills below jobs, not beside them.',
            'Export a text PDF, not a flattened image of the design.',
            'Check Turkish characters after export; some design tools still subset fonts badly.',
            'Keep a designed version only for a human who asked for it by email, and a plain version for every form.',
          ],
        },
        {
          heading: 'Spelling, the ı/i split, and English that was never read aloud',
          paragraphs: [
            'Spelling is not decoration in a country where names, laws, and products depend on dotted and dotless i. İstanbul with a dotted i in the wrong place, üniversite missing ü, a company name respelled because the font lacked glyphs — these look like you never opened the file. Run a Turkish spellcheck on Turkish CVs. Then read the English CV out loud. Machine translation leaves “responsible from the invoices” and “I made internship in a company” on thousands of files a year.',
            'Consistent names matter as much as grammar. If your surname has a ğ, use it the same way on the CV, the portal, and the diploma. Recruiter search is literal. Also consistent is capitalisation of tools: GitHub is not GITHUB is not github in three adjacent bullets. Pick the vendor’s writing. Pick one date format. Mixing 12.03.2022, March 2022, and 2022-03 on one page looks like three authors.',
          ],
        },
        {
          heading: 'Five pages, three fonts, and the seminar graveyard',
          paragraphs: [
            'Length is the mistake people defend most warmly. Every certificate felt expensive. Every seminar had a buffet. None of that is a reason to hand a store manager in Bursa a pamphlet. Early career: one page. Most specialists: two. If page three is conferences, webinars, and “personal interests: travelling, music, cinema,” you have not edited, you have archived.',
            'Three typefaces and a rainbow of heading colours have the same root: fear that plain text will look cheap. Plain text looks like you respect the reader’s time. Save colour for a single accent at most, or none. If the PDF is so designed that printing it on a factory laser in Gebze produces black slabs where the photos were, you have built a poster, not a hiring document.',
          ],
        },
        {
          heading: 'Missing dates, fuzzy titles, and overlapping jobs with no explanation',
          paragraphs: [
            'Month and year on each role stop a kind of suspicion that is very Turkish and very international: what happened in the gap? A year-only line that says 2022 – 2023 can hide eleven months or one. If you were studying, say so in education. If you were in military service, a single dated line is enough. If you were unemployed, you do not owe a confession on the CV; you do owe continuous dating so they do not invent a worse story.',
            'Titles should be the ones on the contract or the ones the team actually used, not the ones you wish LinkedIn had. Inflating uzman to müdür will be checked with the previous HR file. Inflating intern to specialist will be obvious from the dates. Concurrent jobs — family firm plus campus job — can exist; mark them as concurrent instead of stacking them so they look like a promotion ladder you did not climb.',
          ],
        },
        {
          heading: 'The 2005 objective, the reference pledge, and other fossils',
          paragraphs: [
            '“My objective is to work in a well-established company where I can utilise my skills and grow.” That sentence was already tired when internet cafés still charged by the hour. Replace it with a summary that names a job, or with nothing. “References available upon request” wastes a line; they will ask if they want them. Do not list your uncle as a reference. Do not list a current manager if a confidential search would put that person at risk — handle that on the call.',
            'Other fossils: “I hereby declare that the information is true,” blood type, religion, full home address, TC number, a scanned imza, a border made of clip-art. Some public-sector PDFs still ask you to declare truth; follow that form when you fill their form. Do not copy the declaration onto a startup application in Maslak. Fossils signal that you assembled the file from relatives’ examples without looking at a live posting.',
          ],
        },
        {
          heading: 'Contact details, filenames, and the WhatsApp-only habit',
          paragraphs: [
            'An email you no longer open is a silent rejection. University addresses expire. Hotmail from 2008 with a nickname will be read as a joke at a corporate bank and as normal at some SMEs — know which room you are in. Phone numbers should include +90. A second number labelled “my father” is not a professional channel. If you must be reached on WhatsApp, add it as well as an email, not instead of one, for office roles.',
            'Filename and portal fields are part of the application. Paste the same dates into Kariyer.net as you printed. Do not upload “cv.pdf” five times with different contents. Do not leave the summary box on a job board filled with the default “I am looking for a job.” That box is often indexed. Treat it as a second summary, or leave it empty if the site allows and your PDF already carries the message.',
          ],
        },
        {
          heading: 'A short pre-send pass for Turkish and international files',
          paragraphs: [
            'Read the posting once more. If it is in Turkish, send Turkish unless they asked for English. If it is in English, send English. Check the photo policy of that market. Check that dates exist. Check that the paste test still works after the last export. Then send. Most of the damage in Turkish applications is not a lack of talent. It is a file that asks the reader to forgive selfies, scrambled columns, missing months, and a paragraph that could have been written in 2005.',
          ],
          list: [
            'Photo: vesikalık or none; never a selfie, never a full-bleed party shot.',
            'Layout: one column for trackers; designed files only when a human asked.',
            'Language: spellchecked Turkish or spoken-aloud English, not a raw machine mix.',
            'Length: one or two pages; seminars and hobbies cut first.',
            'Dates: months on every role; gaps dated elsewhere or left without fiction.',
            'Fossils gone: old objectives, reference pledges, ID numbers, clip-art borders.',
            'Contact: live email, +90 phone, filename with your name, portal boxes matching the PDF.',
          ],
        },
      ],
    },
    tr: {
      title: 'Türkiye başvurularını hâlâ batıran CV hataları',
      description:
        'Türkiye başvurularını hâlâ batıran hatalar: selfie fotoğraf, bozulan Canva sütunları, beş sayfalık dosyalar ve eksik tarihler.',
      sections: [
        {
          heading: 'Selfie, tatil kırpması ve ödünç vesikalık',
          paragraphs: [
            'Türk süreçleri hâlâ sıkça bir yüz ister. Bu, son paylaştığınız hikâyeyi kullanma izni değildir. Banyo aynası, Çeşme’den güneş gözlüklü kırpma, düğün masası yakın çekimi veya ağır filtreli portre, okura bağlam değiştirmediğinizi söyler. Muhafazakâr şehirlerdeki ofisler bunu özensiz okur. Moda ekipleri yanlış türde stil okur. Kimse bunu profesyonel niyet okumaz.',
            'Fotoğraf koyacaksanız düz arka planlı, iyi ışıklı, yakın tarihli bir baş çekimi kullanın. Omuzlar görünsün, yüz net olsun, giysi işin katına uysun — fabrika, banka, stüdyo. Başka birinin fotoğrafını, artık size benzemeyen eski üniversite kimliğini veya çizgi avatarı kullanmayın. Fotoğrafı adınızın alt yazı olacağı kadar büyütmeyin. Pazar ABD veya İngiltere ise aynı selfienin yalnızca gayriresmi olmadığını, çoğu zaman politika gereği dosyayı eleme nedeni olduğunu unutmayın.',
          ],
        },
        {
          heading: 'Bitmiş görünüp ayrıştırması bozulan iki sütunlu Canva dosyaları',
          paragraphs: [
            'Canva, PowerPoint ve Instagram kaydırma şablonları, Türkiye’de öğrencilerin büyük bir kısmının CV’yi “tasarlama” yoludur. Sonuç, hikâye ızgarasında güzel, Workday’de düşmandır. Metin birbirinden kopuk kutularda yaşar. İkonlar başlıkların yerini alır. Renkli bir ray sayfanın üçte birini yer. Bir marka teslim ettiğinizi sanırsınız. ATS karışmış tarihler teslim eder.',
            'Görünümü seviyorsanız içeriği normal başlıklarla tek sütunda yeniden kurun; sonra hafif bir görsel katmanın, PDF isteyen insanlara e-postayla gitmeye değip değmediğine karar verin. Portallar için katmanı atlayın. Temiz kopyalanan sakin bir yerleşim, kopyalanamayan süslü olanı yener. Sade ATS oluşturucuların var olma nedeni budur; mevcut dosyanız tümünü seç-yapıştır testinde düşüyorsa birini kullanın.',
          ],
          list: [
            'PDF’de tümünü seçip Notlar’a yapıştırın; sütunlar iç içe giriyorsa o dosyayı takip sistemine yüklemeyin.',
            'İkon başlıklarını Experience, Education, Skills veya Türkçe karşılıklarıyla değiştirin.',
            'Yetenekleri işlerin yanına değil altına alın.',
            'Tasarımın düzleştirilmiş görseli değil, metin PDF’si dışa aktarın.',
            'Dışa aktardıktan sonra Türkçe karakterleri kontrol edin; bazı tasarım araçları yazı tipi alt kümesini hâlâ bozar.',
            'Tasarlanmış sürümü yalnızca e-postayla isteyen insan için saklayın; her form için sade sürüm tutun.',
          ],
        },
        {
          heading: 'Yazım, ı/i ayrımı ve hiç sesli okunmamış İngilizce',
          paragraphs: [
            'Adların, yasaların ve ürünlerin noktalı ve noktasız i’ye bağlı olduğu bir ülkede yazım süs değildir. Yanlış yerde noktalı i ile İstanbul, ü’sü düşmüş üniversite, yazı tipinde glif yok diye yeniden yazılmış şirket adı — dosyayı hiç açmadığınız gibi durur. Türkçe CV’lerde Türkçe yazım denetimi çalıştırın. Sonra İngilizce CV’yi sesli okuyun. Makine çevirisi her yıl binlerce dosyada “responsible from the invoices” ve “I made internship in a company” bırakır.',
            'Tutarlı adlar dilbilgisi kadar önemlidir. Soyadınızda ğ varsa CV’de, portalde ve diplomada aynı yazın. İşe alımcı araması düz anlamdır. Araçların büyük harfi de tutarlı olsun: yan yana üç maddede GitHub, GITHUB ve github olmasın. Üreticinin yazımını seçin. Bir tarih biçimi seçin. Aynı sayfada 12.03.2022, March 2022 ve 2022-03 karıştırmak üç yazar gibi durur.',
          ],
        },
        {
          heading: 'Beş sayfa, üç yazı tipi ve seminer mezarlığı',
          paragraphs: [
            'Uzunluk, insanların en hararetle savunduğu hatadır. Her belgenin pahası vardı. Her seminerin ikramı vardı. Hiçbiri Bursa’daki bir mağaza müdürüne broşür uzatmanın gerekçesi değildir. Erken kariyer: bir sayfa. Çoğu uzman: iki. Üçüncü sayfa konferans, webinar ve “kişisel ilgi: seyahat, müzik, sinema” ise düzenlememişsinizdir, arşivlemişsinizdir.',
            'Üç yazı tipi ve gökkuşağı başlık renkleri aynı kökten gelir: sade metnin ucuz duracağı korkusu. Sade metin, okurun zamanına saygı gibi durur. Rengi en fazla tek vurguya saklayın, ya da hiç kullanmayın. PDF o kadar tasarlanmışsa ki Gebze’deki fabrika lazerinde fotoğrafların yerinde siyah lekeler çıkıyorsa işe alım belgesi değil afiş kurmuşsunuzdur.',
          ],
        },
        {
          heading: 'Eksik tarihler, bulanık unvanlar ve açıklamasız örtüşen işler',
          paragraphs: [
            'Her rolde ay ve yıl, hem çok Türk hem çok uluslararası bir kuşkuyu keser: boşlukta ne oldu? Yalnızca yıl yazan 2022 – 2023 satırı on bir ay da gizler, bir ay da. Okuyorsanız eğitimde deyin. Askerlikteydiyseniz tek tarihli satır yeter. İşsizdiniz diye CV’de itiraf borçlu değilsiniz; daha kötü bir öykü uydurmasınlar diye sürekli tarihlemeye borçlusunuz.',
            'Unvanlar LinkedIn’de olmasını diledikleriniz değil, sözleşmedekiler veya ekibin gerçekten kullandıkları olsun. Uzmanı müdüre şişirmek önceki İK dosyasıyla yoklanır. Stajyeri uzmana şişirmek tarihlerden belli olur. Eşzamanlı işler — aile şirketi artı kampüs işi — olabilir; tırmanmadığınız bir terfi merdiveni gibi üst üste koymak yerine eşzamanlı işaretleyin.',
          ],
        },
        {
          heading: '2005 hedef cümlesi, referans vaadi ve diğer fosiller',
          paragraphs: [
            '“My objective is to work in a well-established company where I can utilise my skills and grow.” Bu cümle internet kafelerin saatle ücret aldığı dönemde bile yorgundu. Bir iş adlandıran özetle değiştirin, ya da hiçbir şey koyun. “Referanslar talep halinde sunulur” bir satır yer; isterlerse sorarlar. Amcanızı referans yazmayın. Gizli bir arama o kişiyi riske atacaksa mevcut yöneticiyi yazmayın — onu görüşmede yönetin.',
            'Diğer fosiller: “Bilgilerin doğru olduğunu beyan ederim,” kan grubu, din, tam ev adresi, TC numarası, taranmış imza, klişe kenarlık. Bazı kamu PDF’leri hâlâ doğruluk beyanı ister; onların formunu doldururken onu izleyin. Maslak’taki bir girişim başvurusuna beyannameyi kopyalamayın. Fosiller, canlı bir ilana bakmadan akraba örneklerinden dosya derlediğinizi gösterir.',
          ],
        },
        {
          heading: 'İletişim, dosya adları ve yalnızca WhatsApp alışkanlığı',
          paragraphs: [
            'Artık açmadığınız e-posta sessiz bir rettir. Üniversite adreslerinin süresi dolar. 2008’den lakaplı Hotmail, kurumsal bankada şaka, bazı KOBİ’lerde olağan okunur — hangi odada olduğunuzu bilin. Telefonlara +90 koyun. “Babam” etiketli ikinci numara profesyonel kanal değildir. WhatsApp’tan ulaşılmanız gerekiyorsa ofis rolleri için e-postanın yerine değil, yanına ekleyin.',
            'Dosya adı ve portal alanları başvurunun parçasıdır. Kariyer.net’e bastığınız aynı tarihleri yapıştırın. Farklı içerikle beş kez “cv.pdf” yüklemeyin. İş sitesindeki özet kutusunu varsayılan “iş arıyorum” ile bırakmayın. O kutu sıkça dizinlenir. İkinci bir özet gibi davranın; site boş bırakmaya izin veriyorsa ve PDF mesajı zaten taşıyorsa boş bırakın.',
          ],
        },
        {
          heading: 'Türkçe ve uluslararası dosyalar için kısa bir gönderme öncesi geçiş',
          paragraphs: [
            'İlanı bir kez daha okuyun. Türkçeyse İngilizce istemedikçe Türkçe gönderin. İngilizceyse İngilizce gönderin. O pazarın fotoğraf kuralına bakın. Tarihlerin var olduğuna bakın. Son dışa aktarmadan sonra yapıştırma testinin hâlâ işlediğine bakın. Sonra gönderin. Türk başvurularındaki hasarın çoğu yetenek eksikliği değildir. Okurdan selfie, karışmış sütun, eksik ay ve 2005’te yazılmış olabilecek bir paragrafı affetmesini isteyen bir dosyadır.',
          ],
          list: [
            'Fotoğraf: vesikalık veya yok; asla selfie, asla tam sayfa parti karesi.',
            'Yerleşim: takip sistemleri için tek sütun; tasarlanmış dosya yalnızca insan istediğinde.',
            'Dil: denetimli Türkçe veya sesli okunmuş İngilizce, ham makine karışımı değil.',
            'Uzunluk: bir veya iki sayfa; önce seminerler ve hobiler kesilir.',
            'Tarihler: her rolde ay; boşluklar başka yerde tarihli veya uydurma olmadan.',
            'Fosiller yok: eski hedefler, referans vaatleri, kimlik numaraları, klişe kenarlıklar.',
            'İletişim: canlı e-posta, +90 telefon, adınızı içeren dosya adı, PDF ile örtüşen portal kutuları.',
          ],
        },
      ],
    },
  },
]
