import Reveal from '@/components/Reveal';
import { t, getLang } from '@/lib/i18n-server';

type ColumnKey = 'type' | 'criminals' | 'police' | 'hostages' | 'outside';

type Column = {
  key: ColumnKey;
  labelAr: string;
  labelEn: string;
};

type Row = {
  typeAr: string;
  typeEn: string;
  criminals: string;
  police: string;
  hostages: string;
  outside: string;
};

type TableRule = {
  type: 'table';
  columns: Column[];
  rows: Row[];
};

const RULE_SECTIONS = [
    {
        category: 'rp',
        titleAr: 'تعريف الرول بلاي (Roleplay)',
        titleEn: 'What is Roleplay?',
        textAr: `تقمص وتمثيل الشخصية قولًا وفعلًا مع مراعاة أحداث اللعبة وما يدور حولك، ومقارنة اللعب داخل السيرفر بالحياة الواقعية وعدم الخروج عن الواقعية أثناء تمثيل شخصيتك.`,
        textEn: `Fully embody your character in words and actions. React to in-game events as you would in real life and stay realistic at all times.`,
    },
    {
        category: 'rp',
        titleAr: 'VDM — الدهس والصدم بالمركبة',
        titleEn: 'VDM — Vehicle Deathmatch',
        textAr: `استخدام المركبة كسلاح لقتل الأشخاص أو صدم المركبات ممنوع حتى لو كنت مسعفًا أو شرطيًا.`,
        textEn: `Using vehicles as weapons to hit/kill players or ram vehicles is forbidden — even for EMS or police.`,
    },
    {
        category: 'rp',
        titleAr: 'RDM — القتل العشوائي',
        titleEn: 'RDM — Random Deathmatch',
        textAr: `قتل الأشخاص دون سبب أو تهديد أو بدون عداوة يُعد مخالفة. يجب أن يكون هناك حوار/تهديد/سياق يبرر إطلاق النار.`,
        textEn: `Killing without valid reason, threat, or conflict is prohibited. You need dialogue/threat/context to justify force.`,
    },
    {
        category: 'rp',
        titleAr: 'Meta Gaming — الميتا جيمنج',
        titleEn: 'Meta Gaming',
        textAr: `لا تستخدم معلومات من خارج اللعبة (Discord/Twitch/Streams/Chats) داخل اللعبة.
        مثال: يخبرك صديق بموقع شخص على الديسكورد فتذهب لقتله = Meta = مخالفة.`,
        textEn: `Do not use out-of-game info (Discord/Twitch/streams/chats) in game.
        Example: friend shares someone’s location on Discord and you go kill them → Meta → violation.`,
    },
    {
        category: 'rp',
        titleAr: 'PowerGaming — الباور جيمنج',
        titleEn: 'Powergaming',
        textAr: `فعل أشياء غير ممكنة واقعيًا أو استخدام الصلاحيات بشكل خاطئ لمصلحتك الشخصية.`,
        textEn: `Doing things your character could not realistically do or abusing systems/powers for personal gain.`,
    },
    {
        category: 'rp',
        titleAr: 'Fear RP — قانون تقدير حياتك',
        titleEn: 'Fear RP — Value of Life',
        textAr: `حافظ على حياتك وحياة الآخرين؛ لا تتهور أو تستهين بالقتل. لا تقاوم مسلحًا وأنت أعزل. يجوز الدفاع عن النفس عند الضرورة. تفاوض وتحاور قبل أي فعل يعرض الآخرين للخطر.`,
        textEn: `Value your life and others’. Don’t act recklessly. Do not resist an armed person when unarmed. Self-defense is allowed only when necessary. Negotiate first before risking lives.`,
    },

    {
        category: 'rp',
        titleAr: 'NLR — الحياة الجديدة (لازم تنسى)',
        titleEn: 'NLR — New Life Rule',
        textAr: `NLR تعني "قاعدة الحياة الجديدة".
        بعد موتك، تنسى جميع الأحداث التي حصلت قبل موتك (السيناريو، الأشخاص، المكان).
        يمنع الرجوع لنفس المكان أو الانتقام أو استخدام معلومات من حياتك السابقة.`,
        textEn: `NLR means "New Life Rule".
        After you die, you forget all events that happened before your death (scene, people, location).
        You cannot return to the same situation, take revenge, or use previous-life information.`,
    },
    {
        category: 'rp',
        titleAr: 'NVL — عدم تقدير الحياة',
        titleEn: 'NVL — No Value of Life',
        textAr: `عدم تقدير حياتك أو التصرف بدون خوف من الخطر.
        يجب عليك الخوف على حياتك مثل الواقع.

        أمثلة:
        • سحب سلاح وأنت موجه عليك سلاح.
        • مقاومة أكثر من شخص مسلح وأنت أعزل.
        • الاستهزاء أو الضحك أثناء التهديد.`,
        textEn: `Failing to value your life or acting without fear of danger.
        You must treat your life as if it's real.

        Examples:
        • Pulling a weapon while being aimed at.
        • Fighting multiple armed people while unarmed.
        • Laughing or trolling during a threat.`,
    },
    {
        category: 'general',
        titleAr: 'NRP Driving — القيادة غير الواقعية',
        titleEn: 'NRP Driving',
        textAr: `القيادة بشكل غير واقعي مثل:
        • القفز من أماكن عالية بدون ضرر.
        • القيادة بسرعة جنونية داخل المدينة.
        • صدم كل شيء بدون اهتمام.`,
        textEn: `Unrealistic driving such as:
        • Jumping from high places without damage.
        • Driving at extreme speeds in the city.
        • Crashing into everything without care.`,
    },
    {
        category: 'general',
        titleAr: 'Stream Sniping — استغلال البث',
        titleEn: 'Stream Sniping',
        textAr: `استغلال البث المباشر للحصول على معلومات داخل اللعبة أو مضايقة اللاعبين ممنوع.`,
        textEn: `Using live streams to gain in-game information or harass players is forbidden.`,
    },
    {
        category: 'general',
        titleAr: 'مخالفات عامة',
        titleEn: 'General Offenses',
        textAr: `NRP Drive: قيادة غير واقعية ومتهورة.
        COP BAITING: استفزاز الشرطة للهروب/القتل/الخطف.
        Stream Sniping: استغلال البث المباشر للمعلومات أو المضايقة.
        Combat Logging: الخروج للشفاء/الهرب/قطع سيناريو نشط.
        Fail RP: كسر قوانين الرول بلاي.
        Mixing: يمنع استخدام أكثر من شخصية لنفس اللاعب في نفس السيناريو أو نقل الممتلكات بينها.
        Toxic: يمنع جميع أنواع التوكسيك.
        Racism: ممنوعة بجميع أشكالها.
        Green Zone: مناطق منزوعة السلاح يحددها السيرفر.
        CIA | الأدمنز: ظهورهم خروج عن الرول بلاي ويجب اتباع أوامرهم.`,
        textEn: `NRP Driving: unreal/reckless driving.
        Cop Baiting: provoking police to chase/kill/kidnap.
        Stream Sniping: using streams for info or harassment.
        Combat Logging: leaving to heal/escape or to avoid active scenes.
        Fail RP: breaking roleplay fundamentals.
        Mixing: using multiple characters in the same scenario or transferring assets between them is not allowed.
        Toxicity: strictly prohibited.
        Racism: zero tolerance.
        Green Zones: weapon-free areas defined by the server.
        CIA/Admins: when visible, treat as out of RP and follow instructions.`,
    },
    {
        category: 'admin',
        titleAr: 'التعويضات',
        titleEn: 'Compensation',
        textAr: `التعويض الكامل يتطلب:
        • أن تكون المشكلة من السيرفر.
        • توفر فيديو كامل.
        • توضيح جميع الخسائر داخل الفيديو.
        • في حال عدم وجود فيديو، يجب تقديم شرح مفصل قبل اختفاء الأغراض.`,
        textEn: `Full compensation requires:
        • The issue must be server-side.
        • A full video must be provided.
        • All losses must be clearly shown in the video.
        • If no video is available, a detailed explanation is required before items disappear.`,
    },
    {
        category: 'admin',
        titleAr: 'الشكاوى',
        titleEn: 'Reports',
        textAr: `يمكنك الشكوى على أي لاعب مع دليل واضح. سيتم تحويل التذكرة للجهة المناسبة والتعامل بشفافية.`,
        textEn: `You may report any player with clear evidence. Tickets are handled transparently by the appropriate team.`,
    },
    {
        category: 'admin',
        titleAr: 'التواصل مع الإدارة والرقابة',
        titleEn: 'Contacting Staff & Moderation',
        textAr: `• يُمنع مراسلة الأدمن خاص.
        • أبلغ عن المخربين/الثغرات؛ عدم التبليغ مشاركة بالمخالفة.
        • لا تتحدث مع الرقابي إلا إذا بدأ معك.
        • لا تتجاهل الرقابي أو تغادر عند استدعائك؛ الهروب/الاعتداء = حظر نهائي.
        • احترم الرقابي ونفّذ التعليمات.
        • يُمنع الاقتراب أو التحدث مع أي إداري أثناء وجود سيناريو شغال.
        • في حال احتجت مساعدة استخدم أمر /report داخل اللعبة أو افتح تذكرة في الديسكورد.
        • يُمنع طلب المساعدة أو التحدث مع الإداريين داخل الرول بلاي.
        • أي مخالفة لذلك قد تؤدي إلى حظر فوري.
        • يمنع التعرف على شخصية الأدمن.`,
        textEn: `• Do not DM admins.
        • Report griefers/bugs; failure to report is a violation.
        • Don’t initiate talk with moderators; respond when addressed.
        • Do not ignore/leave when summoned; evasion/assault = permanent ban.
        • Be respectful and follow instructions.
        • Do not approach or talk to staff during active scenarios.
        • If you need help, use /report in-game or open a Discord ticket.
        • Do not request help or speak to staff within roleplay.
        • Violating this may result in an instant ban.
        • Do not try to identify admins’ personal characters.`,
    },
    {
        category: 'admin',
        titleAr: 'الإبلاغ عن Fail RP',
        titleEn: 'Reporting Fail RP',
        textAr: `• يمكنك الإبلاغ عن أي لاعب مع دليل واضح.
        • يتم التعامل مع التذاكر بشفافية من قبل فريق الإدارة (CIA).
        • يُمنع التحدث مع الإداري مباشرة بخصوص مشكلة مع لاعب.
        • يجب إكمال السيناريو للنهاية ثم فتح تذكرة.
        • يُمنع قول "هذا Fail RP" داخل السيناريو.`,
        textEn: `• You may report any player with clear evidence.
        • Reports are handled transparently by the staff team (CIA).
        • Do not directly contact admins about player issues.
        • Always finish the scenario, then open a ticket.
        • Do not call out "Fail RP" during a scenario.`,
    },
    {
        category: 'crime',
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
        • Safe escape: no outside help; don’t run to gang HQ; you may flee to a pre-agreed spot.
        • If the escape fails, escape conditions are void; police may use any weapons.
        • No music/dancing/mockery during robberies.`,
    },
    {
        category: 'crime',
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
        category: 'crime',
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
        category: 'gangs',
        titleAr: 'ملابس العصابة',
        titleEn: 'Gang Outfit',
        textAr: `• يُمنع لبس قناع/درع خارج الأعمال الإجرامية خاصة بالمناطق الآمنة.
        • التزم بلبس موحّد وأبلغ الإدارة بكامل اللبس.`,
        textEn: `• No masks/armor outside criminal actions — especially in safe zones.
        • Use a unified gang outfit and register it with staff.`,
    },
    {
        category: 'kidnap',
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
        category: 'kidnap',
        titleAr: 'قوانين الخطف — الشرطة',
        titleEn: 'Kidnapping — Police',
        textAr: `• تواجد 5 أفراد شرطة.
        • تفوق باثنين (3/1).
        • لا تخطف أكثر من شرطي واحد في نفس الوقت.
        • أقصى فدية للشرطي 60 ألف، وللقيادات/رؤساء الوحدات 100 ألف.
        • يُمنع سحب عتاد الشرطة.`,
        textEn: `• At least 5 police online.
        • Criminals must outnumber by two (3v1).
        • Only one officer may be kidnapped at a time.
        • Max ransom: $60,000 (officer), $100,000 (command/unit heads).
        • Do not strip police gear/ammo.`,
    },
    {
        category: 'kidnap',
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
        • Remove items from the hostage (weapon/phone/radio/GPS); verbal \"take\" is not valid.
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
        category: 'robbery',
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
        • لا يوجد أفراد من نفس المجموعة خارج مكان السرقة.
        • يُمنع كسر الرول بلاي أثناء التفاوض (مثل الهروب المفاجئ أو الغدر بدون تمهيد).
        • يُمنع طلب حذف سجل إجرامي أو إسقاط تهم أو تسليم أحراز.
        • يُمنع استكمال التفاوض عبر الهاتف.
        • يُمنع إجبار المدني على دفع مبالغ كبيرة أو التنازل عن ممتلكاته بدون سبب منطقي.
        • يُمنع تهديد أي شخص لإجباره على تسليم ممتلكاته (مثل مفاتيح المنزل).
        • الحد الأقصى للفدية: 70,000.
        • يجب وجود سبب رول بلاي واضح لعملية الخطف والتفاوض.`,
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
        • No members of the same group outside the robbery area.
        • Breaking roleplay during negotiation (sudden escape or betrayal without buildup) is forbidden.
        • You may not request criminal record removal, dropped charges, or seized evidence.
        • Negotiation may not continue via phone.
        • Forcing civilians to pay large amounts or give up property without valid RP reason is not allowed.
        • Threatening someone to hand over property (like house keys) is forbidden.
        • Maximum ransom: $70,000.
        • A valid roleplay reason for the kidnapping and negotiation is required.`,
    },
    {
        category: 'robbery',
        titleAr: 'قواعد التفاوض — الشرطة',
        titleEn: 'Negotiation Rules — Police',
        textAr: `• يُمنع طلب طلبات تعجيزية (مثل حذف السجل الإجرامي).
        • يُمنع طلب إسقاط تهم أو إخراج متهم من قضية أو تسليم أحراز.
        • يُمنع استكمال التفاوض عبر الهاتف.
        • يجب الالتزام بعدد المشاركين وقوانين التوازن.
        • في حال كسر التفاوض أو بدء إطلاق النار، يحق للشرطة الاقتحام مباشرة.`,
        textEn: `• Unrealistic demands (such as clearing criminal records) are forbidden.
        • You may not request dropping charges, releasing suspects, or returning seized evidence.
        • Negotiation may not continue via phone.
        • Participant limits and balance rules must be respected.
        • If negotiation is broken or shooting starts, police may breach immediately.`,
    },
    {
        category: 'crime',
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
        • No jail/fines without sufficient cause or evidence; in-flagrante is sufficient evidence.`,
    },
    {
        category: 'robbery',
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
        category: 'gangs',
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
        • Inter-gang cooperation allowed only for weapons/drug trade.
        • Gang leaders are accountable; entire gangs can be penalized.
        • Violations may lead to gang removal.
        • Police may seize gang HQ if discovered through RP.
        • Police may negotiate or breach directly upon confirming suspicious activity.
        • Police must announce approach within 10 minutes prior.
        • If police take control, HQ can be closed up to 24 hours; avoid the area.`,
    },
    {
        category: 'robbery',
        titleAr: 'حدود المشاركين في السرقات',
        titleEn: 'Robbery Limits & Participants',
        type: 'table',

        columns: [
            { key: 'type', labelAr: 'نوع السرقة', labelEn: 'Robbery Type' },
            { key: 'criminals', labelAr: 'عدد المجرمين', labelEn: 'Criminals' },
            { key: 'police', labelAr: 'عدد الشرطة', labelEn: 'Police' },
            { key: 'hostages', labelAr: 'الرهائن', labelEn: 'Hostages' },
            { key: 'outside', labelAr: 'الأطراف الخارجية', labelEn: 'Outside Parties' },
        ],

        rows: [
            { typeAr: 'البقالة', typeEn: 'Store', criminals: '2', police: '3', hostages: '1', outside: '1' },
            { typeAr: 'كليك لافر', typeEn: 'Click Lovers', criminals: '3', police: '4', hostages: '1', outside: '2' },
            { typeAr: 'الامونيشن', typeEn: 'Ammunation', criminals: '4', police: '5', hostages: '1', outside: '2' },
            { typeAr: 'البنك الفرعي', typeEn: 'Fleeca Bank', criminals: '5', police: '6', hostages: '2', outside: '2' },
            { typeAr: 'موني اكستشانج', typeEn: 'Money Exchange', criminals: '5', police: '6', hostages: '2', outside: '2' },
            { typeAr: 'البنك المركزي', typeEn: 'Pacific Bank', criminals: '7', police: '9', hostages: '3', outside: '1' },
        ],

        textArBelow: `• يجب الالتزام بعدد المشاركين المحدد لكل سرقة.
        • أي تدخل خارجي يتجاوز الحد يعتبر مخالفة.
        • الرهائن يجب أن يكونوا لاعبين حقيقيين داخل السيناريو.`,

        textEnBelow: `• Participant limits must be respected for each robbery.
        • Any external interference beyond limits is a violation.
        • Hostages must be real players within the scenario.`,
    },
    {
        category: 'general',
        titleAr: 'المناطق الآمنة (Green Zones)',
        titleEn: 'Safe Zones (Green Zones)',
        textAr: `• مقر الشرطة والشارع المجاور.
        • الكراجات العامة.
        • المستشفى والجراج التابع له.
        • أماكن العمل والكراجات التابعة لها.
        • المطاعم.
        • أماكن الوظائف واستلام المهام.
        • معرض السيارات.
        • الفندق.
        • السيتي هول.
        • المحكمة.
        • محلات الملابس.
        • محلات الحلاقة.
        • محلات التاتو.

        • يُمنع حمل السلاح أو التهديد أو التثبيت أو الخطف داخل هذه المناطق.
        • يُمنع تنفيذ أي نشاط إجرامي داخل المناطق الآمنة.
        • يُمنع التدخل مع أي شخص أثناء تأديته لعمله.
        • في حال المطاردة، يجب الخروج من المنطقة الآمنة فورًا وعدم استخدامها للحماية.`,
        textEn: `• Police department and surrounding street.
        • Public garages.
        • Hospital and its garage.
        • Work locations and their garages.
        • Restaurants.
        • Job locations and task pickup areas.
        • Car dealership.
        • Hotel.
        • City Hall.
        • Courthouse.
        • Clothing stores.
        • Barbershops.
        • Tattoo shops.

        • Carrying weapons, threatening, restraining, or kidnapping is not allowed in these areas.
        • No criminal activity may take place in safe zones.
        • Do not interfere with anyone while they are working.
        • During chases, you must leave safe zones immediately and cannot use them for protection.`,
    },
    {
        category: 'crime',
        titleAr: 'قانون سرقة السيارات (Boosting)',
        titleEn: 'Vehicle Boosting Rules',
        textAr: `Class S:
        • الحد الأقصى 6 أشخاص.
        • يُمنع تسليم السيارة للشرطة (يُعتبر فشل).
        • مسموح لشخص واحد فقط بالتدخل لعمل سويتش أو بلوك بدون اعتداء.
        • يُمنع تخبيط سيارات الشرطة بالسيارة المسروقة.
        • يجب أن لا يزيد عدد الشرطة عن المجرمين بفارق كبير.

        Class A:
        • الحد الأقصى 4 أشخاص.
        • يُمنع تسليم السيارة للشرطة (يُعتبر فشل).
        • مسموح لشخص واحد فقط بالتدخل لعمل سويتش أو بلوك بدون اعتداء.
        • يُمنع تخبيط سيارات الشرطة بالسيارة المسروقة.
        • يجب أن لا يزيد عدد الشرطة عن المجرمين بفارق كبير.`,
        textEn: `Class S:
        • Maximum of 6 participants.
        • Delivering the vehicle to police is not allowed (counts as failure).
        • Only one person may intervene to assist (switch/block) without aggression.
        • Ramming police vehicles with the stolen car is forbidden.
        • Police numbers must not heavily exceed criminals.

        Class A:
        • Maximum of 4 participants.
        • Delivering the vehicle to police is not allowed (counts as failure).
        • Only one person may intervene to assist (switch/block) without aggression.
        • Ramming police vehicles with the stolen car is forbidden.
        • Police numbers must not heavily exceed criminals.`,
    },
    {
        category: 'crime',
        titleAr: 'الإعدام (قتل الشخصية)',
        titleEn: 'Execution (Character Kill)',
        textAr: `• يُمنع إعدام أي شخص (قتل الشخصية بشكل نهائي) بدون موافقة الـ Godfather.
        • يجب وجود سبب رول بلاي قوي وواضح يبرر الإعدام.
        • أي إعدام بدون موافقة يُعد مخالفة جسيمة ويُعاقب عليها بشدة.`,
        textEn: `• Executing a character (permanent kill) is strictly forbidden without Godfather approval.
        • A strong and valid roleplay reason is required for any execution.
        • Any unauthorized execution is a severe violation and will be punished.`,
    },
    {
        category: 'crime',
        titleAr: 'أثناء Beef',
        titleEn: 'During Beef',
        textAr: `يُسمح بسرقة:
        - المخدرات.
        - الأسلحة.`,
        textEn: `Allowed to steal:
        - Drugs.
        - Weapons.`,
    },
    {
        category: 'crime',
        titleAr: 'أثناء الحرب الرسمية (بموافقة الجاد فازر)',
        titleEn: 'During Official War (Godfather Approved)',
        textAr: `يُسمح بسرقة:
        - المخدرات.
        - الأسلحة.
        - الأموال المحمولة.`,
        textEn: `Allowed to steal:
        - Drugs.
        - Weapons.
        - Carried cash.`,
    },
    {
        category: 'crime',
        titleAr: 'اقتحام البيت أو مقر العصابة',
        titleEn: 'House / Gang HQ Raid',
        textAr: `• يُسمح للشرطة باقتحام البيت أو مقر العصابة في حال اكتشافه عن طريق الرول بلاي.
        • يحق للشرطة طلب التفاوض أو الاقتحام المباشر في حال وجود نشاط مشبوه.
        • يجب الإعلان قبل الاقتحام بمدة لا تتجاوز 5 دقائق.
        • يلتزم الطرفان بنتيجة التفاوض أو الاقتحام.
        • في حال سيطرة الشرطة، يتم إغلاق المقر لمدة تصل إلى 24 ساعة.
        • يُمنع التواجد داخل أو بالقرب من المقر خلال فترة الإغلاق.
        • يجب أن يكون مقر العصابة مخفي وغير معروف للشرطة (عن طريق RP فقط).`,
        textEn: `• Police may raid a house or gang HQ if it is discovered through roleplay.
        • Police may choose to negotiate or breach if suspicious activity is confirmed.
        • An announcement must be made up to 5 minutes before the raid.
        • Both sides must respect the outcome of negotiation or breach.
        • If police take control, the location may be closed for up to 24 hours.
        • Players may not enter or stay near the location during closure.
        • Gang HQ must remain hidden and only discovered through roleplay.`,
    },
    {
        category: 'crime',
        titleAr: 'تفتيش وسحب المحتويات',
        titleEn: 'Search & Confiscation',
        textAr: `في حال الاقتحام، يحق للشرطة سحب جميع المواد المخالفة مثل:
        - الأسلحة.
        - المخدرات.
        - مواد التصنيع.
        - الكروت أو الأدوات غير القانونية.
        • يُمنع سحب الممتلكات الشخصية غير المرتبطة بالنشاط الإجرامي.`,
        textEn: `During a raid, police may confiscate illegal items such as:
        - Weapons.
        - Drugs.
        - Crafting materials.
        - Illegal cards/tools.
        • Personal belongings not مرتبط with criminal activity may not be taken.`,
    },
    {
        category: 'crime',
        titleAr: 'RED ZONE',
        titleEn: 'Red Zone',
        textAr: `يُسمح بسحب جميع الممتلكات ما عدا:
        - الفلوس (الكاش).
        - الهاتف.
        - مفاتيح المنازل.
        - البطاقة الشخصية.`,
        textEn: `All items can be taken except:
        - Cash.
        - Phone.
        - House keys.
        - ID card.`,
    },
    {
        category: 'crime',
        titleAr: 'المناطق المسيطر عليها (SPRAY)',
        titleEn: 'Controlled Areas (Spray)',
        textAr: `• يُسمح بسحب المخدرات فقط.
        • يجب أن يكون داخل منطقة العصابة المسيطرة.`,
        textEn: `• Only drugs can be taken.
        • Must be inside the controlling gang’s area.`,
    },
    {
        category: 'law',
        titleAr: 'الغاية من السيرفر',
        titleEn: 'Purpose of the Server',
        textAr: `هذا السيرفر موجود لخلق رول بلاي طويل المدى قائم على الشخصيات، في مدينة حيّة تكون للأفعال فيها قيمة حقيقية، وتبقى العواقب قائمة، وتتطور القصص مع مرور الوقت.
        الميكانيكيات والسكربتات والأنظمة وُجدت لخدمة الرول بلاي لا لاستبداله. ولا يمنح أي نظام أو ميكانيكية الحق في تعطيل الرول بلاي، أو السيطرة على الآخرين، أو اختصار مسار القصة.
        ما نُقدّره في هذا السيرفر هو أن تكون القصة أهم من النتيجة؛ فالفوز في المشهد لا يعني الحصول على المال أو القوة أو القتل أو الهروب من العواقب، بل يعني تقمّصًا مقنعًا للشخصية وتطورًا حقيقيًا فيها وفتح المجال لسيناريوهات قادمة. كما أن الخسارة، أو القبض عليك، أو إصابتك، أو تغلّب الآخرين عليك لا يُعد فشلًا، بل جزءًا طبيعيًا من المحتوى الذي يصنع القصة.`,
        textEn: `This server exists to create long-term, character-driven roleplay in a living city where actions carry real weight, consequences persist, and stories evolve over time.
        Mechanics, scripts, and systems are designed to support roleplay — not replace it. No system or mechanic gives you the right to override roleplay, control others, or shortcut the story.
        What we value most is that the story matters more than the outcome. Winning is not about money, power, killing, or escaping consequences — it is about convincing character portrayal, meaningful development, and creating future scenarios. Likewise, losing, being arrested, injured, or overpowered is not failure, but a natural and important part of storytelling.`,
    },
    {
        category: 'law',
        titleAr: 'مبدأ العواقب',
        titleEn: 'Consequences Principle',
        textAr: `يقوم الرول بلاي هنا على مبدأ العواقب، حيث يجب أن يحمل كل تصرف مخاطرة منطقية بالخسارة مثل الاعتقال أو الإصابة أو تضرر السمعة أو تكوين أعداء على المدى الطويل أو مواجهة تبعات قانونية أو اجتماعية.
        أما الهروب المتكرر من العواقب حتى باستخدام الميكانيكيات فيُعد رول بلاي ضعيفًا ولا ينسجم مع فلسفة السيرفر.
        الخسارة، أو القبض عليك، أو إصابتك، أو تغلّب الآخرين عليك ليست فشلًا بل جزء أساسي من الرول بلاي.`,
        textEn: `Roleplay on this server is built on the principle of consequences. Every action should carry a logical risk of loss such as arrest, injury, damaged reputation, long-term enemies, or legal and social consequences.
        Repeatedly avoiding consequences — even through mechanics — is considered weak roleplay and goes against the server’s philosophy.
        Losing, being arrested, injured, or overpowered is not failure, but a core part of roleplay.`,
    },
    {
        category: 'law',
        titleAr: 'التصعيد المنطقي',
        titleEn: 'Logical Escalation',
        textAr: `في هذا السيرفر يقوم الرول بلاي على مبدأ التصعيد الواضح والمنطقي داخل القصة. أي صراع أو تغيير في مسار حياة الشخصية يجب أن يكون مفهومًا ومبررًا ضمن قصتها، وأن يتطور خطوة بخطوة بحيث يكون واضحًا لمن حولك داخل الرول بلاي.
        لا يمكن أن تستيقظ شخصية تعمل طبيبًا مثلًا وتقرر فجأة أن تعيش حياة الجريمة دون سبب قصصي واضح يبرر هذا التحول. التصعيد المفاجئ أو المبالغ فيه من دون أساس يكسر واقعية العالم ويضعف جودة الرول بلاي.
        كما أن الرول بلاي عمل جماعي، ولا يجوز سحب قدرة لاعب آخر على الرد أو التفاعل أو فرض نتيجة عليه بالقوة. أي تصرف يغلق المشهد بدل أن يطوره غالبًا ما يكون تصرفًا خاطئًا.
        الشخصيات في هذا السيرفر ليست أدوات مؤقتة، بل شخصيات تتطور ويكون لها تاريخ يتأثر بالمدينة وأحداثها، والتعامل مع الشخصيات المدنية أو شخصيات الإسعاف والشرطة وكأنها مجرد أدوات أو بوتات يضر بتجربة الرول بلاي وبالسيرفر ككل.`,
        textEn: `Roleplay in this server is based on clear and logical escalation within the story. Any conflict or major change in a character’s life must be justified within their story and develop step by step in a way that is understandable to others in roleplay.
        For example, a doctor cannot suddenly decide to become a criminal without a clear narrative reason. Sudden or exaggerated escalation without foundation breaks realism and weakens roleplay quality.
        Roleplay is also a collaborative experience. You may not remove another player’s ability to respond or force outcomes on them. Any action that shuts down a scene instead of developing it is generally incorrect.
        Characters in this server are not temporary tools — they evolve over time and are shaped by the city and its events. Treating civilians, EMS, or police as tools or bots harms the roleplay experience for everyone.`,
    },
    {
        category: 'law',
        titleAr: 'طلب تدخل الإدارة',
        titleEn: 'Admin Intervention',
        textAr: `يُمنع منعًا باتًا طلب تدخل الإدارة أو مخاطبة الإداريين والستاف داخل الرول بلاي لأي سبب كان. لا يجوز للاعب أن يطلب مساعدة إداري، أو يستدعي ستاف، أو يتعامل مع شخصيات الإدارة وكأنها جهة يمكن اللجوء إليها داخل القصة. الإدارة ليست جزءًا من أحداث الرول بلاي، ولن تتدخل في أي سيناريو داخل اللعبة بناءً على طلب يُطرح داخل الرول بلاي.
        إذا احتاج اللاعب مساعدة من الإدارة لأي سبب، يجب استخدام أمر /report داخل اللعبة، وسيقوم أحد أفراد الطاقم بمراجعة البلاغ والتواصل معك عند توفره. كما يمكن فتح تذكرة دعم على ديسكورد في أي وقت لطلب المساعدة أو الإبلاغ عن مشكلة.
        أي محاولة لإقحام الإدارة في أحداث الرول بلاي، أو الضغط على الستاف للتدخل داخل السيناريوهات، تُعد مخالفة مباشرة للقواعد وسيتم التعامل معها إداريًا.`,
        textEn: `It is strictly forbidden to request admin intervention or contact staff within roleplay for any reason. Players may not call admins, request help, or treat staff characters as entities within the story. Staff are not part of roleplay and will not interfere in any in-game scenario based on in-character requests.
        If assistance is needed, players must use the /report command in-game. A staff member will review the report and respond when available. You may also open a support ticket on Discord at any time.
        Any attempt to involve staff in roleplay scenarios or pressure them to intervene is a direct rule violation and will be handled administratively.`,
    },
    {
        category: 'gangs',
        titleAr: 'Beef بين العصابات',
        titleEn: 'Gang Beef',
        textAr: `• الـ Beef هو تصعيد تدريجي بين عصابتين بسبب واضح داخل الرول بلاي.
        • يجب أن يكون السبب منطقي ومفهوم للطرفين.
        • يُمنع التصعيد المباشر بدون تمهيد أو تطور في القصة.
        • يُسمح فقط بالأسلحة الخفيفة (مثل: مسدس / سكين).
        • يُمنع استخدام الأسلحة الثقيلة أو المتفجرات.
        • يجب وجود مدة تهدئة لا تقل عن ساعة بين كل مواجهة.
        • يُمنع قتل نفس الشخص بشكل متكرر (RDM).
        • لا يتحول الـ Beef إلى War إلا بموافقة الإدارة.
        • يُمنع استهداف نفس العصابة بشكل متكرر خلال فترة قصيرة بدون تطوير في الرول بلاي.`,
        
        textEn: `• Beef is gradual escalation between two gangs with a clear RP reason.
        • The reason must be logical and understood by both sides.
        • Instant escalation without buildup is not allowed.
        • Only light weapons are allowed (pistol / knife).
        • Heavy weapons and explosives are forbidden.
        • A cooldown of at least 1 hour is required between encounters.
        • Repeated killing of the same player (RDM) is not allowed.
        • Beef cannot turn into War without admin approval.
        • Repeated targeting of the same gang without RP development is forbidden.`,
    },
    {
        category: 'gangs',
        titleAr: 'قانون الحرب (War)',
        titleEn: 'Gang War Rules',
        textAr: `• الحرب هي أعلى مستوى تصعيد وتتطلب موافقة الإدارة.
        • الهدف من الحرب إنهاء النزاع بين العصابات.
        • الحد الأقصى للمشاركين هو 8 أشخاص لكل عصابة.
        • مدة الحرب القصوى 3 أيام.
        • يوجد تهدئة لمدة 15 يوم بعد انتهاء الحرب.
        • يجب ارتداء ملابس تميز العصابة أثناء الحرب.
        • يمنع استخدام المركبات العشوائية أو المدنية.
        • يُسمح بالاشتباك في جميع أنحاء المدينة (عدا المناطق الآمنة).
        • جميع الخسائر يجب تمثيلها داخل الرول بلاي.
        • الفوز يكون بتحقيق الهدف وليس بعدد القتلى.`,
        
        textEn: `• War is the highest escalation level and requires admin approval.
        • The goal is to resolve conflict between gangs.
        • Maximum participants: 8 per gang.
        • Maximum duration: 3 days.
        • 15-day cooldown after war ends.
        • Gang-identifying outfits must be worn.
        • Random civilian vehicles are not allowed.
        • Combat is allowed city-wide (except safe zones).
        • All losses must be roleplayed properly.
        • Victory is based on objectives, not kill count.`,
    },
    {
        category: 'gangs',
        titleAr: 'قانون 8 أشخاص',
        titleEn: '8 Player Rule',
        textAr: `• الحد الأقصى لأي سيناريو إجرامي هو 8 أشخاص.
        • يشمل ذلك جميع المشاركين (المجرمين والمصابين).
        • إذا سقط شخص لا يمكن تعويضه أثناء السيناريو.
        • الاستثناء الوحيد داخل مقر العصابة.
        • يُمنع تدخل أطراف خارجية لإنقاذ المشاركين.
        • يُمنع استخدام Combat Medics.`,
        
        textEn: `• Maximum of 8 participants in any criminal scenario.
        • Includes all involved (criminals and injured).
        • Downed players cannot be replaced during the scenario.
        • Exception applies only inside gang HQ.
        • External interference to assist is not allowed.
        • Combat Medics are not allowed.`,
    },

];

export default function RulesPage() {
  const L = t(getLang());

  const CATEGORIES = [
    { key: 'rp', titleEn: 'Roleplay Fundamentals', titleAr: 'أساسيات الرول بلاي' },
    { key: 'general', titleEn: 'General Server Rules', titleAr: 'قوانين عامة' },
    { key: 'law', titleEn: 'Server Philosophy', titleAr: 'فلسفة السيرفر' },
    { key: 'admin', titleEn: 'Administration & Support', titleAr: 'الإدارة والدعم' },
    { key: 'crime', titleEn: 'Criminal Activity Rules', titleAr: 'قوانين الأعمال الإجرامية' },
    { key: 'robbery', titleEn: 'Robbery System', titleAr: 'نظام السرقات' },
    { key: 'kidnap', titleEn: 'Kidnapping & Hostages', titleAr: 'الخطف والرهائن' },
    { key: 'gangs', titleEn: 'Gang System', titleAr: 'نظام العصابات' },
  ];

  const categorized = CATEGORIES.map((cat) => {
    const title = L.isAr ? cat.titleAr : cat.titleEn;

    const items = RULE_SECTIONS
      .filter((s) => s.category === cat.key)
      .map((s) => ({
        ...s, // 🔥 THIS IS THE FIX
        title: L.isAr ? s.titleAr : s.titleEn,
        text: L.isAr ? s.textAr : s.textEn,
    }));

    return { title, items };
  }).filter(c => c.items.length > 0); // 🔥 hides empty categories

  return (
    <div className="relative min-h-[100dvh] w-full">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/50" />

      <main className="mx-auto max-w-5xl px-4 pb-14 pt-24 sm:pt-28 md:pt-32">
        <Reveal>
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
              {L.nav.rules}
            </h2>
            <p className="mt-3 text-base text-white/80">{L.rules.body}</p>
          </div>

          <div className="space-y-6">
            {categorized.map((category, i) => (
              <div key={i}>
                {/* Category Title */}
                <h3 className="mb-3 text-xl font-bold text-[#a865fa]">
                  {category.title}
                </h3>

                {/* Rules */}
                <div className="space-y-3">
                  {category.items.map((r, j) => (
                    <details
                        key={j}
                        className="group rounded-2xl border border-[#a865fa] bg-white/10 p-4 open:bg-[#170930]"
                    >
                        {/* 🔥 HEADER (YOU MISSED THIS) */}
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <span className="text-base font-semibold">{r.title}</span>
                        <svg
                            className="h-5 w-5 transition-transform group-open:rotate-180"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                        </summary>

                        {/* 🔥 CONTENT */}
                            {r.type === 'table' && r.columns && r.rows ? (() => {
                                const safeBelowText = (L.isAr ? r.textArBelow : r.textEnBelow) ?? '';

                                return (
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full text-sm text-white/90 border border-red-500/30 rounded-xl overflow-hidden">
                                            <thead className="bg-red-600 text-white">
                                                <tr>
                                                    {r.columns.map((col, idx) => (
                                                        <th key={idx} className="px-3 py-2 text-center">
                                                            {L.isAr ? col.labelAr : col.labelEn}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {r.rows.map((row, i) => (
                                                    <tr
                                                        key={i}
                                                        className={`border-t border-red-500/20 text-center ${
                                                            i % 2 ? 'bg-white/5' : ''
                                                        }`}
                                                    >
                                                        {r.columns.map((col, j) => (
                                                            <td key={j} className="px-3 py-2">
                                                                {col.key === 'type'
                                                                    ? (L.isAr ? row.typeAr : row.typeEn)
                                                                    : (row[col.key as keyof typeof row] ?? '-')}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {safeBelowText && (
                                            <ul
                                                className="mt-4 list-disc ps-5 text-white/80 space-y-1"
                                                dir={L.isAr ? 'rtl' : 'ltr'}
                                            >
                                                {safeBelowText
                                                    .split(/\r?\n+/)
                                                    .map((s) => s.trim())
                                                    .filter(Boolean)
                                                    .map((line, k) => (
                                                        <li key={k}>
                                                            {line.replace(/^([•\-*]|\d+[.)])\s*/, '')}
                                                        </li>
                                                    ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })() : typeof r.text === 'string' && /\r?\n/.test(r.text) ? (
                                <ul
                                    className="mt-3 list-disc ps-5 text-white/80 space-y-1"
                                    dir={L.isAr ? 'rtl' : 'ltr'}
                                >
                                    {r.text
                                        .split(/\r?\n+/)
                                        .map((s) => s.trim())
                                        .filter(Boolean)
                                        .map((line, k) => (
                                            <li key={k}>
                                                {line.replace(/^([•\-*]|\d+[.)])\s*/, '')}
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <p className="mt-3 text-white/80">{r.text ?? ''}</p>
                            )}
                    </details>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </main>
    </div>
  );

}


