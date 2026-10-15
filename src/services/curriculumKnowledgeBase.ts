/**
 * Comprehensive Course Knowledge Base for Computer Science & Engineering Year 2
 * Supplies detailed lecture content, curriculum topics, formulas, and worked exam problems.
 */

export interface LectureCurriculumData {
  subject: string;
  lecture: number;
  title: string;
  sections: {
    title: string;
    englishTerms: string[];
    coreDefinition: string;
    simpleExplanation: string;
    detailedExplanation: string;
    formulas?: {
      latex: string;
      description: string;
      variables: { name: string; symbol: string; unit: string; description: string }[];
      derivationNotes?: string;
    }[];
    solvedProblem?: {
      problemStatement: string;
      stepByStep: string[];
      finalAnswer: string;
      interpretation: string;
    };
    realWorldUse: string;
    commonMistakes: string[];
    summary: string;
  }[];
}

export const CURRICULUM_DATA: Record<string, Record<number, LectureCurriculumData>> = {
  'Computer Architecture': {
    1: {
      subject: 'Computer Architecture',
      lecture: 1,
      title: 'Introduction to Computer Abstractions, Technology & Quantitative Performance',
      sections: [
        {
          title: 'مستويات التجريد والعتاد الحاسوبي (Levels of Abstraction & Computer Organization)',
          englishTerms: ['Instruction Set Architecture (ISA)', 'Datapath', 'Control Unit', 'Application Binary Interface (ABI)'],
          coreDefinition: 'معمارية الحاسب هي الجسر الهندسي بين البرمجيات المكتوبة بلغات عالية المستوى وبين العتاد الفيزيائي المكون من بوابات الترانزستور.',
          simpleExplanation: 'الحاسوب لا يفهم الأكواد مثل C++ أو Python مباشرة، بل يحولها المترجم (Compiler) إلى تعليمات أسمبلي ثم إلى أصفار وآحاد (Machine Code). المعمارية تحدد شكل هذه الأوامر وكيف ينفذها المعالج.',
          detailedExplanation: 'ينقسم المعالج (CPU) إلى شقين أساسيين: مسار البيانات (Datapath) وهو العتاد المسؤول عن معالجة البيانات وإجراء العمليات الحسابية والمنطقية (ALU, Registers, Program Counter, Multiplexers)، ووحدة التحكم (Control Unit) وهي المنسق الذي يرسل إشارات التحكم (Control Signals) لتحديد العملية المراد تنفيذها في كل نبضة ساعة.',
          realWorldUse: 'تصميم معالجات ARM في الهواتف الذكية ومعالجات x86 في أجهزة الحواسيب والخوادم.',
          commonMistakes: ['الخلط بين معمارية مجموعة التعليمات (ISA) وبين التنفيذ المادي للمعالج (Microarchitecture).'],
          summary: 'الـ ISA هو العقد بين المبرمج والعتاد، والـ Microarchitecture هو طريقة تطبيق هذا العقد سيليكونياً.',
        },
        {
          title: 'قوانين الأداء الكلاسيكية وزمن تنفيذ البرامج (CPU Performance Equations)',
          englishTerms: ['Clock Cycles', 'CPI (Cycles Per Instruction)', 'Clock Frequency', 'Execution Time'],
          coreDefinition: 'زمن المعالج (CPU Execution Time) هو الزمن الفعلي المستغرق في تنفيذ تعليمات برنامج معين بدون احتساب أوقات انتظار الإدخال والإخراج.',
          simpleExplanation: 'سرعة انتهاء البرنامج تعتمد على ثلاثة عوامل مضروبة في بعضها: كم تعليمة في البرنامج، كم نبضة يحتاجها كل أمر، وسرعة النبضة الواحدة.',
          detailedExplanation: 'القانون الأساسي للأداء يعبر عن العلاقة الرياضية بين المعمارية والتردد وتصميم خط الأنابيب:',
          formulas: [
            {
              latex: '\\text{CPU Execution Time} = \\text{Instruction Count (IC)} \\times \\text{CPI} \\times T_{\\text{clock}}',
              description: 'قانون زمن المعالج بدلالة زمن دورة الساعة',
              variables: [
                { name: 'Instruction Count', symbol: 'IC', unit: 'instructions', description: 'عدد التعليمات المنفذة في البرنامج' },
                { name: 'Cycles Per Instruction', symbol: 'CPI', unit: 'cycles/instruction', description: 'متوسط عدد دورات الساعة لإتمام تعليمة واحدة' },
                { name: 'Clock Cycle Time', symbol: 'T_{\\text{clock}}', unit: 'seconds (s)', description: 'زمن الدورة الواحدة ($T = 1/f$)' },
              ],
              derivationNotes: 'مشتق مباشرة من تعريف التردد: الزمن الكلي = (عدد الدورات الكلية) / (تردد الساعة f).',
            },
            {
              latex: '\\text{CPU Time} = \\frac{\\text{IC} \\times \\text{CPI}}{f_{\\text{clock}}}',
              description: 'صيغة زمن المعالج بدلالة تردد الساعة (Clock Rate)',
              variables: [
                { name: 'Clock Rate', symbol: 'f_{\\text{clock}}', unit: 'Hertz (Hz)', description: 'تردد المعالج بالجيجاهرتز' },
              ],
            },
          ],
          solvedProblem: {
            problemStatement: 'برنامج حاسوبي يتكون من 15,000,000 تعليمة ($15 \\times 10^6$ instructions). يعمل المعالج بتردد $2.5 \\text{ GHz}$ ومتوسط عدد الدورات للتعليمة الواحدة $\\text{CPI} = 1.6$. احسب زمن تنفيذ البرنامج بالمللي ثانية (ms)؟',
            stepByStep: [
              '1. حساب إجمالي عدد دورات الساعة (Total Clock Cycles): $\\text{Total Cycles} = \\text{IC} \\times \\text{CPI} = 15 \\times 10^6 \\times 1.6 = 24 \\times 10^6 \\text{ دورة}$.',
              '2. تحويل التردد إلى الصيغة المعيارية: $2.5 \\text{ GHz} = 2.5 \\times 10^9 \\text{ Hz}$.',
              '3. التعويض في قانون زمن المعالج: $\\text{CPU Time} = \\frac{24 \\times 10^6}{2.5 \\times 10^9} = 0.0096 \\text{ ثانية}$.',
              '4. التحويل إلى مللي ثانية: $0.0096 \\times 1000 = 9.6 \\text{ ms}$.',
            ],
            finalAnswer: 'CPU Time = 9.6 ms',
            interpretation: 'يستغرق المعالج 9.6 مللي ثانية لإتمام البرنامج بالكامل، ويمكن خفض هذا الزمن بتحسين المترجم أو رفع التردد.',
          },
          realWorldUse: 'المقارنة بين أداء معالجات Intel Core i7 ومعالجات Apple Silicon M-series.',
          commonMistakes: ['نسيان تحويل الجيجاهرتز ($10^9$) أو الميجا هرتز ($10^6$) أثناء التعويض الحسابي.'],
          summary: 'الأداء يتناسب طردياً مع التردد وعكسياً مع كل من عدد التعليمات ومتوسط CPI.',
        },
        {
          title: 'قانون أمدال للتحسين وحدود التسريع (Amdahl\'s Law for System Speedup)',
          englishTerms: ['Amdahl\'s Law', 'Fraction Enhanced (f)', 'Speedup Factor (s)', 'Diminishing Returns'],
          coreDefinition: 'قانون أمدال يحدد الحد الأقصى للتسريع الممكن تحقيقه في نظام حاسوبي عند ترقية أو تسريع جزء محدد منه فقط.',
          simpleExplanation: 'إذا كان البرنامج يقضي 20% فقط من وقته في معالجة العمليات الحسابية، فحتى لو جعلت المعالج الحسابي أسرع بمليون مرة، فإن أقصى تسريع عام للبرنامج لن يتجاوز 1.25x، لأن بقية الـ 80% لم تتغير!',
          detailedExplanation: 'ينص القانون رياضياً على أن التسريع الكلي للنظام محكوم بنسبة الجزء المحسن ومقدار تسريعه:',
          formulas: [
            {
              latex: '\\text{Speedup}_{\\text{overall}} = \\frac{1}{(1 - f) + \\frac{f}{s}}',
              description: 'معادلة قانون أمدال للتسريع الإجمالي',
              variables: [
                { name: 'Fraction Enhanced', symbol: 'f', unit: 'dimensionless (0 to 1)', description: 'النسبة المئوية من زمن التشغيل الأصلي الخاضعة للتسريع' },
                { name: 'Speedup Factor', symbol: 's', unit: 'dimensionless multiplier', description: 'مقدار مضاعفة سرعة الجزء المحسن فقط' },
              ],
            },
          ],
          solvedProblem: {
            problemStatement: 'في تطبيق لمعالجة الصور، تقضي العمليات الحسابية نسبة 60% من زمن التشغيل ($f = 0.60$). قمنا بتصميم معالج رسومي مخصص (GPU) يسرع العمليات الحسابية بمقدار 5 أضعاف ($s = 5$). احسب التسريع الكلي للتطبيق (Overall Speedup)؟',
            stepByStep: [
              '1. تحديد المعطيات: $f = 0.60$ ، والجزء غير المحسن $(1 - f) = 1 - 0.60 = 0.40$ ، وعامل التسريع $s = 5$.',
              '2. التعويض في مقام قانون أمدال: $(1 - f) + \\frac{f}{s} = 0.40 + \\frac{0.60}{5} = 0.40 + 0.12 = 0.52$.',
              '3. حساب التسريع الإجمالي: $\\text{Speedup} = \\frac{1}{0.52} \\approx 1.923$.',
            ],
            finalAnswer: 'Overall Speedup = 1.92x (حوالي 92% تحسن في السرعة)',
            interpretation: 'رغم أن الـ GPU أسرع بـ 5 أضعاف، إلا أن النظام بالكامل تسارع بمقدار 1.92 ضعف فقط بسبب الـ 40% التي لم تتأثر بالـ GPU.',
          },
          realWorldUse: 'تحديد ما إذا كان الاستثمار في إضافة أنوية إضافية للمعالج (Multi-core) مجدياً اقتصادياً لبرنامج معين أم لا.',
          commonMistakes: ['افتراض أن تسريع جزء بنسبة 10 أضعاف يجعل النظام ككل أسرع 10 أضعاف.'],
          summary: 'قاعدة ذهبية: اجعل الحالة الشائعة سريعة (Make the common case fast).',
        },
      ],
    },
  },
  'Digital Logic Design': {
    1: {
      subject: 'Digital Logic Design',
      lecture: 1,
      title: 'Boolean Algebra, Logic Gates & Canonical Forms',
      sections: [
        {
          title: 'الجبر البولياني وقوانين دي مورغان (Boolean Algebra & De Morgan\'s Theorems)',
          englishTerms: ['Boolean Algebra', 'Truth Table', 'De Morgan\'s Laws', 'Duality Principle'],
          coreDefinition: 'الجبر البولياني هو النظام الرياضي القائم على المتغيرات الثنائية (0 و 1) والعمليات المنطقية الأساسية: الجمع المنطقي (OR)، الضرب المنطقي (AND)، والنفي (NOT).',
          simpleExplanation: 'هو أساس عمل كل المعالجات الرقمية. قوانين دي مورغان تتيح لنا تحويل بوابات AND إلى OR والعكس بمجرد وضع عواكس (Inverters).',
          detailedExplanation: 'قوانين دي مورغان تعتبر الركيزة الأساسية لتبسيط المعادلات وتحويل التصاميم إلى بوابات NAND أو NOR الشاملة:',
          formulas: [
            {
              latex: '(A + B)\' = A\' \\cdot B\'',
              description: 'قانون دي مورغان الأول: نفي الجمع المنطقي يساوي ضرب المنفيات',
              variables: [
                { name: 'Variable A', symbol: 'A', unit: 'binary (0, 1)', description: 'المدخل المنطقي الأول' },
                { name: 'Variable B', symbol: 'B', unit: 'binary (0, 1)', description: 'المدخل المنطقي الثاني' },
              ],
            },
            {
              latex: '(A \\cdot B)\' = A\' + B\'',
              description: 'قانون دي مورغان الثاني: نفي الضرب المنطقي يساوي جمع المنفيات',
              variables: [],
            },
          ],
          solvedProblem: {
            problemStatement: 'باستخدام الجبر البولياني وقوانين دي مورغان، قم بتبسيط التعبير المنطقي التالي إلى أبسط صورة: $F = (A + B\') \\cdot (A + B)$؟',
            stepByStep: [
              '1. تطبيق خاصية التوزيع (Distributive Law): $F = A + (B\' \\cdot B)$.',
              '2. من خصائص العاكس المنطقي: ضرب أي متغير في منفيه يساوي صفراً دائماً: $B\' \\cdot B = 0$.',
              '3. التعويض: $F = A + 0$.',
              '4. من خصائص المحايد الجمعي: $A + 0 = A$.',
            ],
            finalAnswer: 'F = A',
            interpretation: 'الدائرة بالكامل تختصر إلى خط إشارة مباشر للمتغير A، مع توفير تام للبوابات واستهلاك الطاقة.',
          },
          realWorldUse: 'تقليل عدد الترانزستورات في معالجات الهواتف لتحسين عمر البطارية وتقليل الانبعاث الحراري.',
          commonMistakes: ['توزيع علامة النفي دون تغيير علامة الجمع إلى ضرب أو العكس.'],
          summary: 'دي مورغان: اكسر الخط وغير الإشارة (Break the line, change the sign).',
        },
        {
          title: 'تبسيط الدوال المنطقية باستخدام خرائط كارنو (Karnaugh Maps - K-Maps)',
          englishTerms: ['Karnaugh Map (K-Map)', 'Minterms (m)', 'Maxterms (M)', 'Gray Code Ordering', 'Prime Implicant'],
          coreDefinition: 'خريطة كارنو هي تمثيل رسومي ثنائي الأبعاد لجدول الحقيقة يستخدم ترميز Gray Code لتسهيل التبسيط البصري للدوال المنطقية بحذف المتغيرات المتغيرة.',
          simpleExplanation: 'بدل المعادلات الطويلة المعقدة، نرسم جدولاً ونجمع الواحدات المتجاورة في مجموعات بحجم 2 أو 4 أو 8 أو 16، وكل متغير يتغير بين الصفر والواحد داخل المجموعة يُحذف تلقائياً.',
          detailedExplanation: 'قاعدة التجاور تعتمد على أن كل خليتين متجاورتين أفقياً أو عمودياً تختلفان في بت واحد فقط (Gray Code). كل تجميعة بحجم $2^k$ تحذف $k$ من المتغيرات.',
          formulas: [
            {
              latex: 'F = \\sum m(1, 3, 5, 7) \\implies F = C',
              description: 'مثال على تبسيط K-Map ثلاثية المتغيرات',
              variables: [
                { name: 'Minterm sum', symbol: '\\sum m', unit: 'integers', description: 'أرقام الخلايا التي يكون الخرج عندها مساوياً 1' },
              ],
            },
          ],
          solvedProblem: {
            problemStatement: 'قم بتبسيط الدالة المنطقية ذات 4 متغيرات: $F(A, B, C, D) = \\sum m(0, 2, 8, 10)$؟',
            stepByStep: [
              '1. رسم خريطة K-Map بحجم $4 \\times 4$ (16 خلية) بترتيب Gray Code: $AB$ على الصفوف ($00, 01, 11, 10$) و $CD$ على الأعمدة ($00, 01, 11, 10$).',
              '2. وضع الواحدات في الأركان الأربعة: الخلية 0 ($0000$)، الخلية 2 ($0010$)، الخلية 8 ($1000$)، والخلية 10 ($1010$).',
              '3. ملاحظة الالتفاف (Corner Wrap-around): الأركان الأربعة متجاورة منطقياً وتشكل مجموعة رباعية بحجم 4 (Quad).',
              '4. تحديد المتغيرات الثابتة: الصفوف $00$ و $10$ يثبت فيها $B = 0$ (أي $B\'$). الأعمدة $00$ و $10$ يثبت فيها $D = 0$ (أي $D\'$).',
            ],
            finalAnswer: 'F(A, B, C, D) = B\' · D\'',
            interpretation: 'تم اختصار دالة من 4 متغيرات إلى ضرب متغيرين منفيين فقط، مما يقلل التأخير الزمني (Propagation Delay).',
          },
          realWorldUse: 'تصميم وحدات الحساب والمنطق (ALU) ودوائر فك التشفير (Decoders).',
          commonMistakes: ['تجميع الواحدات في مجموعات فردية (مثل مجموعات بحجم 3 أو 5)، التجميع يجب أن يكون دائماً قوى للعدد 2 ($1, 2, 4, 8, 16$).'],
          summary: 'كلما كبر حجم المجموعة في خريطة كارنو، قل عدد البوابات وأصبحت الدائرة أسرع وأقل كلفة.',
        },
      ],
    },
  },
  'Data Structure and Algorithms': {
    1: {
      subject: 'Data Structure and Algorithms',
      lecture: 1,
      title: 'Algorithmic Analysis, Asymptotic Notations & Linear Data Structures',
      sections: [
        {
          title: 'تحليل الخوارزميات والتعقيد الزمني (Asymptotic Analysis & Big-O Notation)',
          englishTerms: ['Big-O Notation O(n)', 'Omega Notation Ω(n)', 'Theta Notation Θ(n)', 'Time Complexity', 'Space Complexity'],
          coreDefinition: 'تحليل الخوارزميات هو دراسة رياضية لكيفية نمو زمن التنفيذ أو استهلاك الذاكرة مع زيادة حجم المدخلات ($n$) متجهاً نحو المالانهاية.',
          simpleExplanation: 'لا نقيس سرعة الخوارزمية بالثواني لأن الثواني تعتمد على سرعة الجهاز، بل نقيسها بعدد العمليات الأساسية كدالة في حجم المدخلات $n$.',
          detailedExplanation: 'الرموز المقاربة تعبر عن الحدود الرياضية العليا والدنيا ومطابقة النمو:',
          formulas: [
            {
              latex: 'f(n) = O(g(n)) \\iff \\exists c > 0, n_0 > 0 \\text{ such that } f(n) \\le c \\cdot g(n), \\forall n \\ge n_0',
              description: 'التعريف الرياضي الصارم للحد الأعلى (Big-O Upper Bound)',
              variables: [
                { name: 'Input size', symbol: 'n', unit: 'elements', description: 'حجم بيانات الدخل' },
                { name: 'Constant factor', symbol: 'c', unit: 'real number', description: 'ثابت التكبير' },
              ],
            },
          ],
          solvedProblem: {
            problemStatement: 'أوجد التعقيد الزمني الدقيق للشيفرة التالية بدلالة $n$:\n```cpp\nint sum = 0;\nfor (int i = 1; i <= n; i *= 2) {\n    for (int j = 1; j <= n; j++) {\n        sum += (i * j);\n    }\n}\n```',
            stepByStep: [
              '1. تحليل الحلقة الخارجية: المتغير $i$ يبدأ من 1 ويتضاعف ($i = 1, 2, 4, 8, \\dots, n$). عدد مرات التكرار هو $k$ حيث $2^k \\le n \\implies k = \\log_2(n)$. إذن الحلقة الخارجية تنفذ $O(\\log n)$ مرة.',
              '2. تحليل الحلقة الداخلية: المتغير $j$ يزداد بمقدار 1 في كل خطوة من $1$ إلى $n$، وتنفذ $n$ مرة في كل تكرار للحلقة الخارجية.',
              '3. ضرب عدد تكرارات الحلقات المتداخلة: $\\text{Total Operations} = \\log_2(n) \\times n = n \\log n$.',
            ],
            finalAnswer: 'Time Complexity = O(n log n)',
            interpretation: 'الخوارزمية تنتمي لفئة النمو شبه الخطي (Linearithmic)، وهي ذات كفاءة عالية مقارنة بالفئة التربيعية $O(n^2)$.',
          },
          realWorldUse: 'اختيار خوارزميات الفرز الفعالة مثل QuickSort و MergeSort لملايين السجلات في محركات البحث.',
          commonMistakes: ['الاعتقاد بأن كل حلقة متداخلة تعني $O(n^2)$ دون فحص خطوة تحديث المتغير ($i *= 2$ تعني لوغاريتمي).'],
          summary: 'التدرج التصاعدي للتعقيد: $O(1) < O(\\log n) < O(n) < O(n \\log n) < O(n^2) < O(2^n) < O(n!)$.',
        },
      ],
    },
  },
  'Computer Networks': {
    1: {
      subject: 'Computer Networks',
      lecture: 1,
      title: 'Network Architectures, OSI & TCP/IP Reference Models, and Subnetting',
      sections: [
        {
          title: 'طبقات الشبكة ونموذج OSI مقابل TCP/IP (Layered Architecture & Encapsulation)',
          englishTerms: ['OSI 7-Layer Model', 'TCP/IP Protocol Stack', 'Encapsulation / Decapsulation', 'PDU (Protocol Data Unit)'],
          coreDefinition: 'هيكلية الطبقات هي تقسيم وظائف الاتصال الشبكي إلى 7 مستويات تجريدية مستقلة حيث تقدم كل طبقة خدمة محددة للطبقة التي تعلوها.',
          simpleExplanation: 'مثل إرسال طرد بريدي: تكتب الرسالة (تطبيق)، تترجمها (عرض)، تضعها في ظرف (جلسة)، تحدد رقم الصندوق (نقل - TCP)، تضع العنوان الجغرافي (شبكة - IP)، وتنقله الشاحنة على الطريق المعبّد (فيزيائي وربط بيانات).',
          detailedExplanation: 'وحدات البيانات في كل طبقة (PDUs): في طبقة النقل تسمى Segment (TCP) أو Datagram (UDP)، في طبقة الشبكة تسمى Packet، وفي طبقة ربط البيانات تسمى Frame، وعلى السلك تسمى Bits.',
          realWorldUse: 'استكشاف الأخطاء وإصلاحها (Troubleshooting) بعزل المشكلة في الطبقة المسؤولة (كابل vs إعدادات IP vs إعدادات المتصفح).',
          commonMistakes: ['الخلط بين طبقة النقل (مسؤولة عن التوصيل بين العمليات Port-to-Port) وطبقة الشبكة (مسؤولة عن التوجيه بين الأجهزة Host-to-Host).'],
          summary: 'التغليف (Encapsulation) يضيف ترويسة (Header) عند الإرسال، وفك التغليف ينزعها عند الاستلام.',
        },
        {
          title: 'عنونة الشبكات والتقسيم الفرعي (IPv4 Addressing & Subnetting - FLSM)',
          englishTerms: ['IPv4 Address', 'Subnet Mask', 'CIDR Notation', 'Network ID', 'Broadcast Address', 'Usable Hosts'],
          coreDefinition: 'عنوان IPv4 هو معرّف رقمي ثنائي بطول 32-بت مقسم إلى 4 بايتات يحدد بدقة هوية الشبكة والجهاز المتصل بها.',
          simpleExplanation: 'قناع الشبكة (Subnet Mask) يفصل عنوان الشارع (Network ID) عن رقم المنزل (Host ID).',
          detailedExplanation: 'حساب عدد الأجهزة المتاحة في أي شبكة فرعية يعتمد على الصيغة التالية:',
          formulas: [
            {
              latex: '\\text{Usable Hosts} = 2^{(32 - \\text{CIDR})} - 2',
              description: 'قانون عدد العناوين الصالحة للأجهزة في أي شبكة فرعية',
              variables: [
                { name: 'CIDR Prefix', symbol: '\\text{CIDR}', unit: 'bits', description: 'عدد بتات قناع الشبكة (مثال: /26)' },
              ],
              derivationNotes: 'نطرح 2 دائماً لأن العنوان الأول مخصص كعنوان للشبكة (Network Address) والعنوان الأخير مخصص للبث الشامل (Broadcast Address).',
            },
          ],
          solvedProblem: {
            problemStatement: 'لديك عنوان الشبكة $192.168.10.0/26$. احسب:\n1. قناع الشبكة العشري المنقط (Subnet Mask).\n2. إجمالي عدد الأجهزة القابلة للاستخدام (Usable Hosts).\n3. عنوان الشبكة وعنوان البث الشامل ونطاق العناوين الصالحة للأجهزة؟',
            stepByStep: [
              '1. حساب قناع الشبكة: البادئة /26 تعني 26 واحد متتالية في القناع: 11111111.11111111.11111111.11000000. بالتحويل للعشري: $255.255.255.192$.',
              '2. عدد بتات المضيفين المتبقية: $H = 32 - 26 = 6$ بت.',
              '3. حساب العناوين الصالحة: $\\text{Usable Hosts} = 2^6 - 2 = 64 - 2 = 62$ جهاز.',
              '4. حساب حجم القفزة (Block Size): $256 - 192 = 64$.',
              '5. عنوان الشبكة: $192.168.10.0$.',
              '6. عنوان البث (Broadcast): $192.168.10.63$.',
              '7. نطاق الأجهزة القابلة للاستخدام: من $192.168.10.1$ إلى $192.168.10.62$.',
            ],
            finalAnswer: 'Subnet Mask = 255.255.255.192 | Usable Hosts = 62 | Usable Range: 192.168.10.1 - 192.168.10.62',
            interpretation: 'تم تقسيم الشبكة بكفاءة لتخدم قاعة تدريس أو معمل يتسع لـ 62 جهاز حاسوب دون هدر في مساحة العناوين.',
          },
          realWorldUse: 'تصميم شبكات الشركات والجامعات وتوزيع نطاقات الـ IP على الأقسام.',
          commonMistakes: ['نسيان طرح 2 لحساب العناوين الصالحة للأجهزة، أو كتابة عنوان البث كعنوان مخصص لجهاز مستخدم.'],
          summary: 'عدد الشبكات $= 2^{\\text{borrowed bits}}$ ، وعدد الأجهزة في كل شبكة $= 2^{\\text{host bits}} - 2$.',
        },
      ],
    },
  },
};
