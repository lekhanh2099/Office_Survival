import { BattlerCard } from '../types/battler';

export const ALL_BATTLER_CARDS: BattlerCard[] = [
  {
    id: 'bongo_typing',
    name: 'Gõ Phím 150wpm',
    type: 'work',
    cost: 1,
    rarity: 'common',
    gif: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    fallbackEmoji: '🐱⌨️',
    desc: 'Cào bàn phím với tốc độ âm thanh. +2 Điểm Xử Lý việc.',
    progress: 2
  },
  {
    id: 'rage_smash',
    name: 'Đập Phím Nổi Giận',
    type: 'work',
    cost: 2,
    rarity: 'rare',
    gif: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
    fallbackEmoji: '💥⌨️',
    desc: 'Dồn hết uất ức vào từng phím bấm. +4 Điểm Xử Lý, -1 Việc Tồn.',
    progress: 4,
    backlogDelta: -1
  },
  {
    id: 'crying_pity',
    name: 'Gương Mặt Tội Nghiệp',
    type: 'defend',
    cost: 0,
    rarity: 'common',
    gif: 'https://media.giphy.com/media/OmqCxK0H355Cg/giphy.gif',
    fallbackEmoji: '😿👍',
    desc: 'Vừa khóc vừa giơ ngón cái. Sếp mủi lòng giảm 2 điểm yêu cầu.',
    reduceTarget: 2
  },
  {
    id: 'huh_confused',
    name: 'Ủa Gì Dợ Sếp?',
    type: 'defend',
    cost: 0,
    rarity: 'common',
    gif: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
    fallbackEmoji: '🐱❓',
    desc: 'Gương mặt ngơ ngác câu giờ. Chặn 50% nguy cơ, rút 1 lá bài.',
    drawCards: 1,
    reduceTarget: 1
  },
  {
    id: 'boss_cat_suit',
    name: 'Vẽ Báo Cáo Ảo Q3',
    type: 'troll',
    cost: 1,
    rarity: 'rare',
    gif: 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    fallbackEmoji: '🐱💼',
    desc: 'Chém gió biểu đồ tăng trưởng 300%. +3 Điểm Xử Lý, +1 Uy Tín.',
    progress: 3,
    repDelta: 1
  },
  {
    id: 'smudge_blame',
    name: 'Đổ Thừa Lỗi Do IT',
    type: 'troll',
    cost: 1,
    rarity: 'common',
    gif: 'https://media.giphy.com/media/VbnUQIRNNGLSpjMlNT/giphy.gif',
    fallbackEmoji: '🐱🍽️',
    desc: 'Chỉ tay đổ vạ cho hệ thống mạng. Giảm 2 Việc Tồn, +1 Tiến Độ.',
    progress: 1,
    backlogDelta: -2
  },
  {
    id: 'polite_smile',
    name: 'Nụ Cười Thân Thiện',
    type: 'buff',
    cost: 0,
    rarity: 'common',
    gif: 'https://media.giphy.com/media/BzyTuYCmvSORqs1ABM/giphy.gif',
    fallbackEmoji: '🐱😬',
    desc: 'Mỉm cười gượng gạo nhưng lễ phép. +1 Uy Tín (⭐ +1).',
    repDelta: 1
  },
  {
    id: 'cat_nap',
    name: 'Nằm Thẳng Buông Xuôi',
    type: 'buff',
    cost: 0,
    rarity: 'rare',
    gif: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif',
    fallbackEmoji: '🐟💤',
    desc: 'Kệ đời xô đẩy, ngủ một giấc. Hồi 3 Năng Lượng (⚡ +3), nhưng -1 Uy Tín.',
    energyDelta: 3,
    repDelta: -1
  },
  {
    id: 'coffee_salt',
    name: 'Cà Phê Muối 100% Đá',
    type: 'buff',
    cost: 0,
    rarity: 'common',
    gif: 'https://media.giphy.com/media/LHZyixOnHwDDy/giphy.gif',
    fallbackEmoji: '☕🐱',
    desc: 'Ngụm cà phê làm bừng tỉnh linh hồn. Hồi 2 Năng Lượng, rút 1 lá bài.',
    energyDelta: 2,
    drawCards: 1
  },
  {
    id: 'cat_party',
    name: 'Nhảy Múa Chúc Mừng',
    type: 'buff',
    cost: 1,
    rarity: 'rare',
    gif: 'https://media.giphy.com/media/GeimqsH0TLDt4tScGw/giphy.gif',
    fallbackEmoji: '💃🐱',
    desc: 'Vũ điệu lương về làm bừng sáng cả phòng. +50 Điểm, +1 Uy Tín.',
    rewardScore: 50,
    repDelta: 1
  },
  {
    id: 'matrix_refusal',
    name: 'Lắc Đầu Từ Chối',
    type: 'defend',
    cost: 1,
    rarity: 'rare',
    gif: 'https://media.giphy.com/media/nR4L10XlJcSeQ/giphy.gif',
    fallbackEmoji: '🙅‍♂️🐱',
    desc: 'Né tránh thần sầu như Ma Trận. Chặn 100% hậu quả của kiếp nạn lượt này!',
    blockThreat: true
  },
  {
    id: 'pop_cat_eat',
    name: 'Đớp Nhanh Deadline',
    type: 'work',
    cost: 1,
    rarity: 'common',
    gif: 'https://media.giphy.com/media/Opexamg2nZnuo/giphy.gif',
    fallbackEmoji: '🐱👄',
    desc: 'Mở mồm đớp trọn gói công việc. +2 Điểm Xử Lý, rút 1 lá bài.',
    progress: 2,
    drawCards: 1
  },
  {
    id: 'money_flex',
    name: 'Flex Lương Nghìn Đô',
    type: 'buff',
    cost: 1,
    rarity: 'legendary',
    gif: 'https://media.giphy.com/media/YJjvTqoq23xVNctjnn/giphy.gif',
    fallbackEmoji: '💸🐱',
    desc: 'Đếm tiền sột soạt át tiếng sếp la. +2 Uy Tín, +80 Điểm cống hiến.',
    repDelta: 2,
    rewardScore: 80
  },
  {
    id: 'panic_paperbag',
    name: 'Thở Vào Túi Giấy',
    type: 'buff',
    cost: 0,
    rarity: 'common',
    gif: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif',
    fallbackEmoji: '🛍️🐱',
    desc: 'Cấp cứu tâm lý khi thấy task. Hồi 1 Năng Lượng, giảm 1 Việc Tồn.',
    energyDelta: 1,
    backlogDelta: -1
  },
  {
    id: 'this_is_fine_burn',
    name: 'Mọi Thứ Vẫn Ổn',
    type: 'defend',
    cost: 1,
    rarity: 'legendary',
    gif: 'https://media.giphy.com/media/NTur7XlVDUdqM/giphy.gif',
    fallbackEmoji: '🐶🔥',
    desc: 'Tâm bất biến giữa dòng đời vạn biến. Chặn mọi sát thương & hồi 2 Năng Lượng.',
    blockThreat: true,
    energyDelta: 2
  },
  {
    id: 'shocked_task',
    name: 'Hốt Hoảng Tột Cùng',
    type: 'work',
    cost: 1,
    rarity: 'common',
    gif: 'https://media.giphy.com/media/PUBxelPJlRf0cAjs79/giphy.gif',
    fallbackEmoji: '🙀👀',
    desc: 'Sợ hãi sinh ra năng suất siêu phàm. +3 Điểm Xử Lý.',
    progress: 3
  },
  {
    id: 'leave_slip_nuke',
    name: 'Ném Đơn Xin Nghỉ',
    type: 'troll',
    cost: 2,
    rarity: 'legendary',
    gif: 'https://media.giphy.com/media/nR4L10XlJcSeQ/giphy.gif',
    fallbackEmoji: '📑💥',
    desc: 'Chiêu bài tối thượng: "Em nghỉ việc sếp tự làm đi!" Giải quyết ngay kiếp nạn!',
    instantClear: true
  }
];

export const STARTER_DECK_IDS = [
  'bongo_typing',
  'bongo_typing',
  'crying_pity',
  'huh_confused',
  'coffee_salt',
  'smudge_blame',
  'polite_smile',
  'pop_cat_eat'
];
