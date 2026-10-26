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
    line: 'علامت طلایی بالا و خاکستری پایینِ لوگو، این بار شدن دو تا کره‌ی نورانی. اسم مهمون درست وسط این دو تا می‌شینه.',
    note: 'از همه به هویت سینتکس نزدیک‌تره. اسم‌های سه‌کلمه‌ای سه خط می‌شن و یه کم کوچیک‌تر.',
    jury: { design: 9, usability: 8, creativity: 8.5, content: 8.5 },
  },
  {
    id: 'liquid',
    num: '۰۲',
    name: 'دعوتی!',
    ref: 'از پوستر Art Exhibition',
    line: 'یه کارت کاغذی روشن، با دو تا علامت لوگو از فلز براق که تو نور می‌چرخن. تیتر با اسم کوچیک خود مهمون شروع می‌شه.',
    note: 'از همه خواناتره و تنها کارت روشنِ جمعه. متنش بیشتره و رو گوشی باید از نزدیک خوند.',
    jury: { design: 8.5, usability: 9, creativity: 8, content: 7.5 },
  },
  {
    id: 'lineup',
    num: '۰۳',
    name: 'لاین‌آپ',
    ref: 'از پوستر Summer Sonic',
    line: 'عین پوستر فستیوال: اسم همه روی کارته و هر کی روی کارت خودش سرِ لاین‌آپه.',
    note: 'حس جمع رو از همه بهتر می‌رسونه. مهمون‌ها که زیاد بشن، فهرست پایین کارت ریزتر می‌شه.',
    jury: { design: 8.5, usability: 8, creativity: 9.5, content: 9 },
  },
];

export const scoreOf = c => WEIGHTS.reduce((s, [k, , w]) => s + c.jury[k] * w, 0);
