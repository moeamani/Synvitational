// The three directions, scored the way the Awwwards jury scores a site:
// design 40%, usability 30%, creativity 20%, content 10%.
export const WEIGHTS = [
  ['design', 'طراحی', 0.4],
  ['usability', 'کاربردپذیری', 0.3],
  ['creativity', 'خلاقیت', 0.2],
  ['content', 'محتوا', 0.1],
];

export const CONCEPTS = [
  {
    id: 'domes',
    num: '۰۱',
    name: 'دو نیم‌کره',
    ref: 'از پوستر DeepTech',
    line: 'علامت طلایی بالا و خاکستری پایینِ لوگو، این بار دو کره‌ی نورانی. اسم مهمان درست در شکاف بین آن‌ها می‌نشیند.',
    note: 'نزدیک‌ترین ایده به هویت سینتکس. اسم‌های سه‌کلمه‌ای سه خط می‌شوند و کمی کوچک‌تر.',
    jury: { design: 9, usability: 8, creativity: 8.5, content: 8.5 },
  },
  {
    id: 'liquid',
    num: '۰۲',
    name: 'دعوتی!',
    ref: 'از پوستر Art Exhibition',
    line: 'کارت کاغذی روشن و دو علامت لوگو از فلز صیقلی که در نور می‌چرخند. تیتر با اسم کوچک خود مهمان شروع می‌شود.',
    note: 'خواناترین کارت، و تنها کارت روشن جمع. متنش بیشتر است و روی گوشی باید از نزدیک خوانده شود.',
    jury: { design: 8.5, usability: 9, creativity: 8, content: 7.5 },
  },
  {
    id: 'lineup',
    num: '۰۳',
    name: 'لاین‌آپ',
    ref: 'از پوستر Summer Sonic',
    line: 'مثل پوستر فستیوال، همه‌ی اسم‌ها روی کارت هستند و هر کس روی کارت خودش سرِ لاین‌آپ است.',
    note: 'حس جمع را از همه بهتر می‌رساند. با مهمان‌های زیاد، فهرست پایین کارت ریزتر می‌شود.',
    jury: { design: 8.5, usability: 8, creativity: 9.5, content: 9 },
  },
];

export const scoreOf = c => WEIGHTS.reduce((s, [k, , w]) => s + c.jury[k] * w, 0);
