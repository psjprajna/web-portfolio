export type JourneyType = 'work' | 'edu'
export type JourneySide = 'left' | 'right'

// All `translations.ar` fields are machine-authored best-effort. Native-speaker
// review required pre-launch — see Slice 5.4c handoff. Proper nouns (place,
// placeLong: "Scale AI" / "MITRE" / "Syneren" / etc.) deliberately stay Latin
// in all locales.

export interface JourneyEntryAr {
  shortRole?: string
  role?: string
  location?: string
  date?: string
  bullets?: readonly [string, string?, string?]
}

export interface JourneyEntry {
  key: string
  // place: short form rendered in the desktop lineage timeline cards.
  // placeLong: full legal name rendered in iPad/mobile lineage cards AND in the desktop detail card.
  //   Education names ≥ 3 words use an embedded \n to break at the 2-word mark;
  //   .tl-place--long and .detail-place honor this via white-space: pre-line.
  place: string
  placeLong: string
  shortRole: string
  // role: title-only (no location decorator). Location lives in its own field.
  role: string
  // location: state-level place of work (e.g. "Virginia, USA", "Bengaluru, India", "Remote, USA").
  location: string
  type: JourneyType
  side: JourneySide
  logoText: string
  logoStyle: string
  logoSrc?: string
  date: string
  // 1-3 bullets. Education entries often need only 1; internships 2; full roles 3.
  bullets: readonly [string, string?, string?]
  translations?: { ar?: JourneyEntryAr }
}

export const JOURNEY_ENTRIES: readonly JourneyEntry[] = [
  {
    key: 'syneren',
    place: 'Syneren Tech',
    placeLong: 'Syneren Technology Corporation',
    shortRole: 'Software Engineer',
    role: 'Software Engineer',
    location: 'Virginia, USA',
    type: 'work',
    side: 'left',
    logoText: 'SY',
    logoStyle: 'background: linear-gradient(135deg, #1a2744, #0c6e6a); color: #e2e8f0;',
    logoSrc: '/logos/syneren.png',
    date: 'Feb 2023 — Present',
    bullets: [
      'Three years shipping production GenAI into a live federal workflow — LangGraph multi-agent pipelines, RAG with full evaluation, and LLM systems running for real users, not demo dashboards.',
      'Two production LangGraph multi-agent systems — one automating NHTSA safety document processing, one cross-referencing federal motor vehicle safety standards — both Pinecone-backed and fully Langfuse-traced across every agent step.',
      'Eval-first by default — RAGAS faithfulness and context recall on every retrieval, Langfuse traces on every agent step, SHAP explainability on every classifier; nothing ships untraced.',
    ],
    translations: {
      ar: {
        shortRole: 'مهندسة برمجيات',
        role: 'مهندسة برمجيات',
        location: 'فيرجينيا، الولايات المتحدة',
        date: 'فبراير ٢٠٢٣ — حالياً',
        bullets: [
          'ثلاث سنوات من شحن أنظمة GenAI الإنتاجية إلى سير عمل فيدرالي مباشر — خطوط متعددة الوكلاء على LangGraph، وRAG مع تقييم كامل، وأنظمة LLM تعمل لمستخدمين حقيقيين، لا لواجهات تجريبية.',
          'نظامان إنتاجيان متعددا الوكلاء على LangGraph — أحدهما يؤتمت معالجة وثائق سلامة NHTSA، والآخر يُقارن المعايير الفيدرالية لسلامة المركبات الآلية — كلاهما مدعوم بـPinecone ومُتعقَّب بالكامل عبر Langfuse في كل خطوة وكيل.',
          'التقييم أولاً افتراضياً — RAGAS لقياس الوفاء واسترداد السياق في كل عملية استرجاع، وLangfuse للتتبع في كل خطوة وكيل، وSHAP لتفسير كل مُصنِّف؛ لا شيء يُشحن دون تتبع.',
        ],
      },
    },
  },
  {
    key: 'scale-ai',
    place: 'Scale AI',
    placeLong: 'Scale AI',
    shortRole: 'Team Lead',
    role: 'RLHF Specialist & Team Lead',
    location: 'Remote, USA',
    type: 'work',
    side: 'right',
    logoText: 'SA',
    logoStyle: 'background: linear-gradient(135deg, #111, #2a2a2a);',
    logoSrc: '/logos/scale-ai.png',
    date: 'Jun 2023 — Jun 2024',
    bullets: [
      'Team Lead at Scale AI — led 50+ annotators on a frontier-LLM alignment project, guided their work on complex reasoning evaluations, corrected their labels, and maintained team-wide consistency across the alignment task at scale.',
      "Hands inside OpenAI's alignment loop — every evaluation I shipped became preference data that PPO/DPO training optimized against.",
      'Sat one layer away from the model: my judgments on code, reasoning, and instruction-following were the reward signal that shaped how a frontier LLM reasons about code.',
    ],
    translations: {
      ar: {
        shortRole: 'قائدة فريق',
        role: 'متخصصة RLHF وقائدة فريق',
        location: 'عن بُعد، الولايات المتحدة',
        date: 'يونيو ٢٠٢٣ — يونيو ٢٠٢٤',
        bullets: [
          'قائدة فريق في Scale AI — قُدتُ أكثر من ٥٠ مُعَلِّقاً في مشروع محاذاة نموذج لغوي رائد، ووجَّهتُ عملهم على تقييمات استدلال معقدة، وصحَّحتُ تعليقاتهم، وحافظتُ على اتساق الفريق عبر مهمة المحاذاة بمقياس واسع.',
          'يداي داخل حلقة محاذاة OpenAI — كل تقييم شحنته أصبح بيانات تفضيلية يُحسِّن PPO/DPO ضدها أثناء التدريب.',
          'جلستُ على بُعد طبقة واحدة من النموذج: أحكامي على الكود والاستدلال واتباع التعليمات كانت إشارة المكافأة التي شكَّلت طريقة تفكير نموذج لغوي رائد في الكود.',
        ],
      },
    },
  },
  {
    key: 'george-mason',
    place: 'GMU',
    placeLong: 'George Mason University',
    shortRole: 'MS Data Analytics',
    role: 'M.S. Data Analytics',
    location: 'Virginia, USA',
    type: 'edu',
    side: 'left',
    logoText: 'GM',
    logoStyle: 'background: linear-gradient(135deg, #006633, #f7c700); color: #fff;',
    logoSrc: '/logos/george-mason.png',
    date: 'Dec 2022',
    bullets: [
      'Graduate coursework in statistical learning, machine learning, and large-scale data engineering — the theoretical foundation under everything that came after.',
      'Ran a MITRE Data Engineer internship in parallel — graduate theory and federal-data engineering on the same calendar.',
    ],
    translations: {
      ar: {
        shortRole: 'ماجستير تحليلات البيانات',
        role: 'ماجستير العلوم في تحليلات البيانات',
        location: 'فيرجينيا، الولايات المتحدة',
        date: 'ديسمبر ٢٠٢٢',
        bullets: [
          'مقررات دراسات عليا في التعلم الإحصائي والتعلم الآلي وهندسة البيانات واسعة النطاق — الأساس النظري الذي يقوم عليه كل ما تلاه.',
          'أنجزتُ تدريباً كمهندسة بيانات في MITRE بالتوازي — النظرية الدراسية وهندسة البيانات الفيدرالية على التقويم نفسه.',
        ],
      },
    },
  },
  {
    key: 'mitre',
    place: 'MITRE',
    placeLong: 'The MITRE Corporation',
    shortRole: 'Data Engineer Intern',
    role: 'Data Engineer Intern',
    location: 'Virginia, USA',
    type: 'work',
    side: 'right',
    logoText: 'MI',
    logoStyle: 'background: linear-gradient(135deg, #003366, #0073cf);',
    logoSrc: '/logos/mitre.svg',
    date: 'Aug — Dec 2022',
    bullets: [
      "Built the pipeline end-to-end — scraping, HTML cleaning, spaCy NER for entity tagging, LDA topic modeling with MLflow-tracked coherence sweeps, and DCAT-standard output into MITRE's research catalog.",
      'Tracked every experiment in MLflow even as an intern — topic-count sweeps optimized against c_v coherence, the same eval-first discipline I now apply with RAGAS and Langfuse.',
    ],
    translations: {
      ar: {
        shortRole: 'متدربة هندسة بيانات',
        role: 'متدربة هندسة بيانات',
        location: 'فيرجينيا، الولايات المتحدة',
        date: 'أغسطس — ديسمبر ٢٠٢٢',
        bullets: [
          'بنيتُ خط المعالجة من البداية إلى النهاية — كَشط البيانات، وتنظيف HTML، واستخراج الكيانات المُسمَّاة عبر spaCy NER، ونمذجة الموضوعات بـLDA مع متابعة الاتساق عبر MLflow، ومخرجات بمعيار DCAT في كتالوج أبحاث MITRE.',
          'تتبَّعتُ كل تجربة في MLflow حتى كمتدربة — اجتياحات عدد الموضوعات مُحسَّنة ضد اتساق c_v، الانضباط ذاته القائم على التقييم الذي أطبِّقه الآن مع RAGAS وLangfuse.',
        ],
      },
    },
  },
  {
    key: 'navigem',
    place: 'Navigem Data',
    placeLong: 'Navigem Data',
    shortRole: 'ML Intern',
    role: 'Machine Learning Intern',
    location: 'Bengaluru, India',
    type: 'work',
    side: 'left',
    logoText: 'ND',
    logoStyle: 'background: linear-gradient(135deg, #0a4a6e, #06324a);',
    logoSrc: '/logos/navigem.png',
    date: 'May — Dec 2020',
    bullets: [
      'Trained dense embeddings the hard way in 2020 — ResNet pre-trained with softmax, then fine-tuned with triplet loss to learn an identity-matching embedding space; the same conceptual playbook I now apply with sentence-transformers in RAG.',
      'Shipped AI to a phone, not a server — TFLite + INT8 quantization for on-device deployment with a 4× footprint reduction and sub-second inference; the kind of optimization work that becomes relevant again with on-device LLMs.',
    ],
    translations: {
      ar: {
        shortRole: 'متدربة تعلم آلي',
        role: 'متدربة تعلم آلي',
        location: 'بنغالورو، الهند',
        date: 'مايو — ديسمبر ٢٠٢٠',
        bullets: [
          'درَّبتُ تضمينات كثيفة بالطريقة الصعبة عام ٢٠٢٠ — ResNet مُدرَّب مسبقاً بـsoftmax، ثم ضُبط دقيقاً بخسارة الثلاثية لتعلُّم فضاء تضمين يطابق الهوية؛ نفس الكتاب المفاهيمي الذي أطبِّقه الآن مع sentence-transformers في RAG.',
          'شحنتُ الذكاء الاصطناعي إلى هاتف، لا إلى خادم — TFLite + تكميم INT8 للنشر على الجهاز مع تقليل البصمة ٤× واستدلال دون الثانية؛ نوع التحسين الذي يعود ذا صلة مع نماذج LLM التي تعمل على الجهاز.',
        ],
      },
    },
  },
  {
    key: 'nmit',
    place: 'NMIT',
    placeLong: 'Nitte Meenakshi\nInstitute of Technology',
    shortRole: 'BE Computer Science',
    role: 'B.E. Computer Science',
    location: 'Bengaluru, India',
    type: 'edu',
    side: 'right',
    logoText: 'N',
    logoStyle: 'background: linear-gradient(135deg, #b71c1c, #7a0f0f); color: #fff;',
    logoSrc: '/logos/nmit.png',
    date: 'Aug 2020',
    bullets: [
      'Foundations in algorithms, data structures, systems, and applied ML — the engineering scaffold under everything that came after.',
      'Final-year ML internship at Navigem ran in parallel — undergrad coursework and quantized ML shipping to Android on the same calendar.',
    ],
    translations: {
      ar: {
        shortRole: 'بكالوريوس علوم حاسوب',
        role: 'بكالوريوس الهندسة في علوم الحاسوب',
        location: 'بنغالورو، الهند',
        date: 'أغسطس ٢٠٢٠',
        bullets: [
          'أسس في الخوارزميات وهياكل البيانات والأنظمة والتعلم الآلي التطبيقي — السقالة الهندسية التي يقوم عليها كل ما تلاه.',
          'تدريب التعلم الآلي في السنة الأخيرة في Navigem جرى بالتوازي — مقررات البكالوريوس وشحن تعلم آلي مُكمَّم إلى Android على التقويم نفسه.',
        ],
      },
    },
  },
]

export function localizeJourneyEntry(entry: JourneyEntry, locale: string): JourneyEntry {
  if (locale === 'ar' && entry.translations?.ar) {
    return { ...entry, ...entry.translations.ar }
  }
  return entry
}
