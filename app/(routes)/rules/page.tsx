import Reveal from '@/components/Reveal';
import { t, getLang } from '@/lib/i18n-server';

const RULE_SECTIONS = [
    {
        titleAr: 'تعريف الرول بلاي (Roleplay)',
        titleEn: 'What is Roleplay?',
        textAr: `تقمص وتمثيل الشخصية قولًا وفعلًا مع مراعاة أحداث اللعبة وما يدور حولك، ومقارنة اللعب داخل السيرفر بالحياة الواقعية وعدم الخروج عن الواقعية أثناء تمثيل شخصيتك.`,
        textEn: `Fully embody your character in words and actions. React to in‑game events as you would in real life and stay realistic at all times.`,
    },
    {
        titleAr: 'VDM — الدهس والصدم بالمركبة',
        titleEn: 'VDM — Vehicle Deathmatch',
        textAr: `استخدام المركبة كسلاح لقتل الأشخاص أو صدم المركبات ممنوع حتى لو كنت مسعفًا أو شرطيًا.`,
        textEn: `Using vehicles as weapons to hit/kill players or ram vehicles is forbidden — even for EMS or police.`,
    },
    {
        titleAr: 'RDM — القتل العشوائي',
        titleEn: 'RDM — Random Deathmatch',
        textAr: `قتل الأشخاص دون سبب أو تهديد أو بدون عداوة يُعد مخالفة. يجب أن يكون هناك حوار/تهديد/سياق يبرر إطلاق النار.`,
        textEn: `Killing without valid reason, threat, or conflict is prohibited. You need dialogue/threat/context to justify force.`,
    },
    {
        titleAr: 'Meta Gaming — الميتا جيمنج',
        titleEn: 'Meta Gaming',
        textAr: `لا تستخدم معلومات من خارج اللعبة (Discord/Twitch/Streams/Chats) داخل اللعبة.
        مثال: يخبرك صديق بموقع شخص على الديسكورد فتذهب لقتله = Meta = مخالفة.`,
        textEn: `Do not use out‑of‑game info (Discord/Twitch/streams/chats) in game.
        Example: friend shares someone’s location on Discord and you go kill them → Meta → violation.`,
    },
    {
        titleAr: 'PowerGaming — الباور جيمنج',
        titleEn: 'Powergaming',
        textAr: `فعل أشياء غير ممكنة واقعيًا أو استخدام الصلاحيات بشكل خاطئ لمصلحتك الشخصية.`,
        textEn: `Doing things your character could not realistically do or abusing systems/powers for personal gain.`,
    },
    {
        titleAr: 'Fear RP — قانون تقدير حياتك',
        titleEn: 'Fear RP — Value of Life',
        textAr: `حافظ على حياتك وحياة الآخرين؛ لا تتهور أو تستهين بالقتل. لا تقاوم مسلحًا وأنت أعزل. يجوز الدفاع عن النفس عند الضرورة. تفاوض وتحاور قبل أي فعل يعرض الآخرين للخطر.`,
        textEn: `Value your life and others’. Don’t act recklessly. Do not resist an armed person when unarmed. Self‑defense is allowed only when necessary. Negotiate first before risking lives.`,
    },
    {
        titleAr: 'مخالفات عامة',
        titleEn: 'General Offenses',
        textAr: `NRP Drive: قيادة غير واقعية ومتهورة.
        COP BAITING: استفزاز الشرطة للهروب/القتل/الخطف.
        Stream Sniping: استغلال البث المباشر للمعلومات أو المضايقة.
        Combat Logging: الخروج للشفاء/الهرب/قطع سيناريو نشط.
        Fail RP: كسر قوانين الرول بلاي.
        Toxic: يمنع جميع أنواع التوكسيك.
        Racism: ممنوعة بجميع أشكالها.
        Green Zone: مناطق منزوعة السلاح يحددها السيرفر.
        CIA | الأدمنز: ظهورهم خروج عن الرول بلاي ويجب اتباع أوامرهم.`,
        textEn: `NRP Driving: unreal/reckless driving.
        Cop Baiting: provoking police to chase/kill/kidnap.
        Stream Sniping: using streams for info or harassment.
        Combat Logging: leaving to heal/escape or to avoid active scenes.
        Fail RP: breaking roleplay fundamentals.
        Toxicity: strictly prohibited.
        Racism: zero tolerance.
        Green Zones: weapon‑free areas defined by the server.
        CIA/Admins: when visible, treat as out of RP and follow instructions.`,
    },
    {
        titleAr: 'التعويضات',
        titleEn: 'Compensation',
        textAr: `تعويض كامل عند: مشكلة برمجية + فيديو كامل + لا تتجاوز ٣ أيام من الواقعة + تحديد الخسائر بالفيديو.`,
        textEn: `Full compensation requires: server‑side issue + full video + within 3 days + list all losses in the video.`,
    },
    {
        titleAr: 'الشكاوى',
        titleEn: 'Reports',
        textAr: `يمكنك الشكوى على أي لاعب مع دليل واضح. سيتم تحويل التذكرة للجهة المناسبة والتعامل بشفافية.`,
        textEn: `You may report any player with clear evidence. Tickets are handled transparently by the appropriate team.`,
    },
    {
        titleAr: 'التواصل مع الإدارة والرقابة',
        titleEn: 'Contacting Staff & Moderation',
        textAr: `• يُمنع مراسلة الأدمن خاص.
        • أبلغ عن المخربين/الثغرات؛ عدم التبليغ مشاركة بالمخالفة.
        • لا تتحدث مع الرقابي إلا إذا بدأ معك.
        • لا تتجاهل الرقابي أو تغادر عند استدعائك؛ الهروب/الاعتداء = حظر نهائي.
        • احترم الرقابي ونفّذ التعليمات.
        • يمنع التعرف على شخصية الأدمن.`,
        textEn: `• Do not DM admins.
        • Report griefers/bugs; failure to report is a violation.
        • Don’t initiate talk with moderators; respond when addressed.
        • Do not ignore/leave when summoned; evasion/assault = permanent ban.
        • Be respectful and follow instructions.
        • Do not try to identify admins’ personal characters.`,
    },
    {
        titleAr: 'قوانين الأعمال الإجرامية — مبادئ عامة',
        titleEn: 'Criminal Activities — General',
        textAr: `• ممنوع عمليات بلا سيناريو منطقي.
        • لا تقتحم سيناريو نشط؛ انتظر انتهاءه.
        • بعد بدء السرقة: ممنوع الدخول بعد وصول الشرطة (يسمح قبل وصولهم لاستكمال العدد).
        • هروب آمن: لا تدخل خارجي؛ لا تلجأ لمقر العصابة؛ يمكن لمكان متفق عليه.
        • عند فشل الهروب تُلغى شروطه وللشرطة حرية نوع السلاح.
        • ممنوع الأغاني/الرقص/الاستهزاء أثناء السرقة.`,
        textEn: `• No operations without a logical scenario.
        • Do not intrude on active scenes.
        • Once robbery starts, entry is forbidden after police arrive (allowed before to complete numbers).
        • Safe escape: no outside help; don’t run to gang HQ; you may flee to a pre‑agreed spot.
        • If the escape fails, escape conditions are void; police may use any weapons.
        • No music/dancing/mockery during robberies.`,
    },
    {
        titleAr: 'التوازن بين أعداد العصابة والشرطة',
        titleEn: 'Balance Between Gangs & Police',
        textAr: `• لا تنفذ عملية إذا كان عدد المجرمين يتجاوز الشرطة بشكل غير عادل (مثل 6 ضد 1).
        • يُمنع قيادة/سرقة سيارات الشرطة.
        • ممنوع الاقتحام على مركز الشرطة.
        • حدّد المتفاوض قبل السرقة وأظهر الرهينة قبل وصول الشرطة.
        • عدم وجود رهينة قد يعرّضك لإطلاق نار فورًا.
        • الشرطة تستخدم نفس نوع سلاح اللصوص.
        • ميّز بين (الهروب الآمن) و(الخروج لمكان محدد) والتزم بالاتفاق.`,
        textEn: `• Don’t start if criminals outnumber police unfairly (e.g., 6v1).
        • No driving/stealing police vehicles.
        • No raiding police HQ.
        • Assign a negotiator before robbery and show the hostage before police arrive.
        • No hostage may result in immediate use of force.
        • Police should mirror weapon class (pistol vs pistol, SMG vs SMG).
        • Distinguish between safe escape vs agreed shootout and honor the terms.`,
    },
    {
        titleAr: 'الخروج لمكان محدد vs الهروب الآمن',
        titleEn: 'Agreed Shootout vs Safe Escape',
        textAr: `الخروج: تبادل إطلاق نار في مكان محدد، يُمنع الهروب ويلتزم الطرفان بنوع السلاح.
        الهروب الآمن: هدفه تسهيل الهروب؛ عند فشل الهروب لا تُلزم الشرطة بنوع السلاح.
        ممنوع الكذب حول تدخل خارجي ويجب الالتزام بالأعداد المنصوص عليها.`,
        textEn: `Shootout: both sides agree on a location to fight; no running; stick to the agreed weapon class.
        Safe escape: helps criminals flee; if it fails, police aren’t bound by weapon limits.
        No lying about external assistance; obey the specified participant limits.`,
    },
    {
        titleAr: 'ملابس العصابة',
        titleEn: 'Gang Outfit',
        textAr: `• يُمنع لبس قناع/درع خارج الأعمال الإجرامية خاصة بالمناطق الآمنة.
        • التزم بلبس موحّد وأبلغ الإدارة بكامل اللبس.`,
        textEn: `• No masks/armor outside criminal actions — especially in safe zones.
        • Use a unified gang outfit and register it with staff.`,
    },
    {
        titleAr: 'قوانين الخطف — المواطن',
        titleEn: 'Kidnapping — Civilians',
        textAr: `• تواجد 4 أفراد شرطة على الأقل.
        • عددكم أكثر بواحد (2/1, 3/2...).
        • امتلاك سلاح ناري.
        • منطقة آمنة.
        • ممنوع البدء بالموتوسيكل أو مركبات الوظائف.
        • تأكد من توفر الأعمال إلا في التحضير لسيناريو.
        • الحد الأقصى للفدية: 10 آلاف.`,
        textEn: `• At least 4 police online.
        • Criminals must outnumber by one (2v1, 3v2...).
        • Must carry a firearm.
        • Ensure area safety.
        • No starting on bikes or with job vehicles.
        • Ensure jobs are available except when prepping a scenario.
        • Max ransom for civilians: $10,000.`,
    },
    {
        titleAr: 'قوانين الخطف — الشرطة',
        titleEn: 'Kidnapping — Police',
        textAr: `• تواجد 5 أفراد شرطة.
        • تفوق باثنين (3/1).
        • لا تخطف أكثر من شرطي واحد في نفس الوقت.
        • أقصى فدية للشرطي 15 ألف، وللقيادات/رؤساء الوحدات 25 ألف.
        • يُمنع سحب عتاد الشرطة.`,
        textEn: `• At least 5 police online.
        • Criminals must outnumber by two (3v1).
        • Only one officer may be kidnapped at a time.
        • Max ransom: $15,000 (officer), $25,000 (command/unit heads).
        • Do not strip police gear/ammo.`,
    },
    {
        titleAr: 'قواعد عامة للرهائن والخطف',
        titleEn: 'Hostages — General Rules',
        textAr: `• يُمنع أخذ رهينة من نفس العصابة أو استخدام صديقك كرهينة.
        • اسحب من الرهينة (سلاح/هاتف/راديو/GPS) — يمنع السحب الشفوي.
        • مدة الخطف دون تفاوض لا تتجاوز 15 دقيقة.
        • يمنع استفزاز/إهانة الرهينة.
        • استخدم الكلبشات.
        • إن هرب الهدف لملكية/منطقة آمنة يجوز استكمال السيناريو ويعاقَب الهارب (وثّق).
        • على الرهينة تنفيذ أوامر الخاطف.
        • إذا خرج الخاطف من المدينة فجأة انتظر 10 دقائق ثم يمكنك الهرب (وثّق).
        • إن ابتعد الخاطف بلا تهديد يمكنك الهرب.
        • عند خطأ من الخاطف استمر وسجّل، لا توقف العملية.`,
        textEn: `• No hostages from your own gang or using friends as hostages.
        • Remove items from the hostage (weapon/phone/radio/GPS); verbal "take" is not valid.
        • Kidnapping without negotiation may not exceed 15 minutes.
        • No provoking/insulting hostages.
        • Use cuffs.
        • If the target flees to property/safe area you may continue; the runner is punishable (record proof).
        • Hostages must obey captors’ orders.
        • If the kidnapper disconnects, wait 10 minutes before escaping (record it).
        • If the kidnapper leaves you unguarded, you may escape.
        • If the kidnapper breaks rules, continue and record; don’t stop the scene.`,
    },
    {
        titleAr: 'التفاوض',
        titleEn: 'Negotiation',
        textAr: `• ممنوع طلب دروع/أسلحة/رصاص من المفاوض.
        • طلب واحد لكل رهينة.
        • الشرطة لا تترك السيناريو.
        • يعلن المجرم نجاح/فشل التفاوض.
        • يدخل المفاوض مكان السرقة بإذن فقط.
        • عند نجاح التفاوض تُسلّم الرهائن أولًا ثم تُنفّذ الشروط.
        • في السرقات الكبيرة: تفاوض عبر راديو مُعلن (مفاوض واحد من كل طرف).
        • إن لم يدخل مفاوض الشرطة الراديو خلال دقيقة: اقتحام.
        • الهدف من التفاوض تقليل الخسائر أو الهروب؛ الطلبات واضحة وغير تعجيزية.
        • وجود رهينة = رغبة بالتفاوض؛ يمنع الاحتماء بالرهينة مع إطلاق النار.
        • إطلاق النار مباشرةً = رفض التفاوض ويحق للشرطة الاقتحام.
        • تأكد من عدد الشرطة قبل البدء.
        • لكل فرد درعان كحد أقصى.
        • لا يوجد أفراد من نفس المجموعة خارج مكان السرقة.
        • عند توقف الأعمال الإجرامية: السرقات ممنوعة؛ يسمح بخطف رهينة للتحضير فقط.`,
        textEn: `• Do not request armor/weapons/ammo from the negotiator.
        • One request per hostage.
        • Police must not abandon the scene.
        • Criminal must state whether negotiation succeeded or failed.
        • Negotiator enters the robbery location only with permission.
        • On success: hand over hostages first, then execute terms.
        • Big robberies: use a public radio (one negotiator per side).
        • If no police negotiator joins within 60s, police may breach.
        • Negotiation aims for escape or minimal losses; requests must be clear and reasonable.
        • A hostage indicates willingness to negotiate; do not hide behind hostages while shooting.
        • Shooting first = rejecting negotiation → police may breach.
        • Verify police count before starting.
        • Max two armor vests per participant.
        • No members of the same group outside the robbery area.
        • When criminal activity is paused: robberies are forbidden; you may only kidnap to prep.`,
    },
    {
        titleAr: 'الأسلحة بعد السيناريو والتحقيق',
        titleEn: 'Weapons After Scenes & Investigation',
        textAr: `• إذا تعذر إنعاش الشخص بعد السيناريو يمنع على الشرطة سحب سلاحه.
        • عند الإنعاش يُسحب السلاح في القسم ويُسلّم لمركز العمليات.
        • يمنع على المجرم رمي سلاحه على الأرض.
        • قبل التحقيق يسأل الضابط عن وجود محامٍ (مكالمة واحدة مسموحة).
        • يجب توجيه التهم وبيان العقوبة قبل التنفيذ.
        • لا سجن/مخالفة دون سبب مقنع أو أدلة؛ التلبس دليل قاطع.`,
        textEn: `• If a suspect cannot be revived after a scene, police may NOT seize their weapon.
        • If revived, the weapon is seized at the station and handed to operations.
        • Criminals may not ditch weapons by throwing them on the ground.
        • Before investigation, the officer must ask if the suspect wants a lawyer (one phone call allowed).
        • Charges and penalties must be explained before applying them.
        • No jail/fines without sufficient cause or evidence; in‑flagrante is sufficient evidence.`,
    },
    {
        titleAr: 'مدد التفاوض والاقتحام واحتلال المواقع',
        titleEn: 'Timers & Locations',
        textAr: `• مدة التفاوض ≤ 10 دقائق.
        • مدة الاقتحام 20 دقيقة بعد انتهاء التفاوض (مثال: 5 تفاوض + 20 اقتحام = 25 دقيقة).
        • ممنوع احتلال مواقع لاستدراج الشرطة؛ يمكن للشرطة الحصار أو الانسحاب. يطبّق على مقرات العصابات حفاظًا على سريتها.`,
        textEn: `• Negotiation time ≤ 10 minutes.
        • Breach time = 20 minutes after negotiation ends (e.g., 5 + 20 = 25 total).
        • Do not occupy locations just to lure police; police may siege or withdraw. Applies to gang HQs to preserve secrecy.`,
    },
    {
        titleAr: 'قوانين العصابات',
        titleEn: 'Gang Rules',
        textAr: `• يُمنع تعاون العصابات ضد عصابات أخرى أو الشرطة في الحروب أو السرقات.
        • يسمح بخطف/تفتيش أفراد عصابة أخرى إذا ضُبطوا يعملون في منطقتك.
        • الخطف/التثبيت ضمن السيناريو فقط — يمنع العشوائي.
        • يمنع الانتساب لأكثر من عصابة بشخصيات أخرى.
        • حروب العصابات ضمن نطاق الرول بلاي.
        • يمنع إطلاق النار العشوائي دون عداوة/سيناريو.
        • يسمح التعاون بين العصابات في تجارة السلاح/المخدرات فقط.
        • رئيس العصابة مسؤول عن الأعضاء؛ قد تُعاقَب العصابة كاملة.
        • مخالفة القوانين قد تؤدي لإزالة العصابة.
        • يحق للشرطة السيطرة على المقر إذا اكتشف عبر الرول بلاي.
        • يمكن التفاوض/الاقتحام مباشرةً عند كشف المقر ووجود نشاط مشبوه.
        • يجب الإعلان قبل التوجه للمقر بحد أقصى 10 دقائق.
        • إذا سيطرت الشرطة يُغلق المقر حتى 24 ساعة ويُحظر الاقتراب.`,
        textEn: `• No alliances between gangs against other gangs or police for wars/robberies.
        • You may kidnap/search rival members caught operating in your territory.
        • Kidnapping/holding only within scenarios — no random acts.
        • You cannot belong to multiple gangs on different characters.
        • Gang wars must remain in RP.
        • No random shooting without established hostility.
        • Inter‑gang cooperation allowed only for weapons/drug trade.
        • Gang leaders are accountable; entire gangs can be penalized.
        • Violations may lead to gang removal.
        • Police may seize gang HQ if discovered through RP.
        • Police may negotiate or breach directly upon confirming suspicious activity.
        • Police must announce approach within 10 minutes prior.
        • If police take control, HQ can be closed up to 24 hours; avoid the area.`,
    },
    {
        titleAr: 'أعداد المشاركين في السرقات',
        titleEn: 'Robbery Participant Limits',
        textAr: `سرقة البقالات: أقصى المجرمين 3 — أقصى الشرطة 4.
        Fleeca/Paleto: أقصى المجرمين 4 — أقصى الشرطة 5.
        Pacific (البنك المركزي): أقصى المجرمين 8 — أقصى الشرطة 10.
        Vangelico (المجوهرات): أقصى المجرمين 4 — أقصى الشرطة 5.`,
        textEn: `Stores: max 3 criminals — max 4 police.
        Fleeca/Paleto: max 4 criminals — max 5 police.
        Pacific Bank (Central): max 8 criminals — max 10 police.
        Vangelico (Jewelry): max 4 criminals — max 5 police.`,
    },
    {
        titleAr: 'المناطق الآمنة (Green Zones)',
        titleEn: 'Safe Zones (Green Zones)',
        textAr: `مركز الشرطة والشارع المقابل له — المستشفى وكراجها — كراجات الميكانيكي — المطاعم — مناطق العمل والاستلام — محلات الملابس — معرض السيارات — الفندق — الريسايكل.
        *يمنع التعرض لأي شخص أثناء العمل*`,
        textEn: `Police HQ and adjacent street — Hospital and its garage — Mechanic garages — Restaurants — Work and job pickup areas — Clothing stores — Car dealership — Hotel — Recycle area.
        *Do not interfere with anyone while they are working.*`,
    },
];

export default function RulesPage() {
    const L = t(getLang());
    const items = RULE_SECTIONS.map((s) => ({
    title: L.isAr ? s.titleAr : s.titleEn,
    text: L.isAr ? s.textAr : s.textEn,
}));


return (
  <div className="relative min-h-[100dvh] w-full">
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat" />

    <div className="pointer-events-none fixed inset-0 -z-10 bg-black/50" />

    <main className="mx-auto max-w-5xl px-4 pb-14 pt-24 sm:pt-28 md:pt-32">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">{L.nav.rules}</h2>
        <p className="mt-3 text-base text-white/80">{L.rules.body}</p>
      </div>
      <Reveal>
      <div className="space-y-3">
        {items.map((r, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-[#a865fa] bg-white/10 p-4 open:bg-[#170930]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <span className="text-base font-semibold">{r.title}</span>
              <svg
                className="h-5 w-5 transition-transform group-open:rotate-180"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>

            {/(\r?\n)/.test(r.text) ? (
              <ul className="mt-3 list-disc ps-5 text-white/80 space-y-1" dir={L.isAr ? 'rtl' : 'ltr'}>
                {r.text
                  .split(/\r?\n+/)
                  .map(s => s.trim())
                  .filter(Boolean)
                  .map((line, j) => (
                    <li key={j}>{line.replace(/^([•\-*]|\d+[.)])\s*/, '')}</li>
                  ))}
              </ul>
            ) : (
              <p className="mt-3 text-white/80">{r.text}</p>
            )}
          </details>
        ))}
      </div>
      </Reveal>
    </main>
  </div>
);

}


