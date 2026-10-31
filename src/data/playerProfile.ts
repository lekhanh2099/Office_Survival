export interface PlayerPersonality {
  id: 'caffeine_addict' | 'social_butterfly' | 'speed_demon' | 'zen_master' | 'fortune_blessed' | 'perfectionist';
  name: string;
  emoji: string;
  badge: string;
  desc: string;
  buffText: string;
}

export const PLAYER_PERSONALITIES: PlayerPersonality[] = [
  {
    id: 'caffeine_addict',
    name: 'Nghiện Caffeine & Trà Sữa',
    emoji: '☕',
    badge: '☕ TÍN ĐỒ CAFFEINE',
    desc: 'Lấy trà sữa làm niềm tin, lấy cà phê làm động lực sống sót qua các deadline khốc liệt.',
    buffText: 'Uống cà phê / trà sữa hồi +60% ⚡ Năng lượng và bứt tốc chạy 14s!'
  },
  {
    id: 'social_butterfly',
    name: 'Chúa Tể Ngoại Giao',
    emoji: '🧋',
    badge: '🧋 TRÙM NGOẠI GIAO',
    desc: 'Biết cách làm vừa lòng mọi người trong công ty, từ bác bảo vệ đến Tổng Giám Đốc.',
    buffText: 'Tương tác đồng nghiệp tăng thêm +40% Độ Thân Thiết; Sếp giảm 50% phạt khi gặp!'
  },
  {
    id: 'speed_demon',
    name: 'Chiến Thần Tốc Độ',
    emoji: '⚡',
    badge: '⚡ CHIẾN THẦN TỐC ĐỘ',
    desc: 'Đôi chân thoăn thoắt, đi làm như chạy marathon, không bao giờ để khách hàng đợi 1 giây.',
    buffText: 'Tốc độ di chuyển cơ bản của Chibi tăng +25% toàn bộ ca trực!'
  },
  {
    id: 'zen_master',
    name: 'Tâm Bất Biến Giữa Dòng Đời',
    emoji: '🧘',
    badge: '🧘 TÂM BẤT BIẾN',
    desc: 'Khách dí, sếp giục, hàng trễ tàu cũng không làm lung lay được sự bình thản bên trong.',
    buffText: 'Giảm 35% lượng Áp Lực Stress nhận vào từ mọi biến cố và sự cố!'
  },
  {
    id: 'fortune_blessed',
    name: 'Con Cưng Thần Tài',
    emoji: '🧧',
    badge: '🧧 CON CƯNG THẦN TÀI',
    desc: 'Số hưởng, sáng mua vé số chiều trúng độc đắc, làm việc gì cũng có quý nhân phù trợ.',
    buffText: 'Tăng gấp đôi may mắn Thần Tài trúng 2 tỷ; Nhặt thưởng nhận thêm +50% KPI!'
  },
  {
    id: 'perfectionist',
    name: 'Cầu Toàn Chuẩn Chỉ',
    emoji: '🎯',
    badge: '🎯 CẦU TOÀN CHUẨN CHỈ',
    desc: 'Từng đường kim mũi chỉ, thông số đo Delta E quang phổ phải chính xác tuyệt đối 100%.',
    buffText: 'Mỗi bước nhiệm vụ xuất xưởng hoàn thành được cộng thêm +25% điểm KPI!'
  }
];

export interface PlayerCustomProfile {
  name: string;
  title: string;
  personality: PlayerPersonality['id'];
  shirtColor: string;
  hairColor: string;
  accessory: 'none' | 'glasses' | 'headphone' | 'gold_badge' | 'coffee_thermos';
}

export const SHIRT_COLOR_PALETTE = [
  { label: 'Xanh Navy Xuất Khẩu', hex: '#1e3a8a' },
  { label: 'Tím Indigo Công Nghệ', hex: '#4f46e5' },
  { label: 'Trắng Sơ Mi Thanh Lịch', hex: '#f8fafc' },
  { label: 'Hồng Pastel Gen Z', hex: '#f472b6' },
  { label: 'Cam Năng Động FPT', hex: '#ea580c' },
  { label: 'Xanh Ngọc Lab QC', hex: '#06b6d4' },
  { label: 'Đen Huyền Bí Cú Đêm', hex: '#0f172a' }
];

export const HAIR_COLOR_PALETTE = [
  { label: 'Đen Tự Nhiên', hex: '#1e1b4b' },
  { label: 'Nâu Hạt Dẻ', hex: '#78350f' },
  { label: 'Vàng Bạch Kim', hex: '#fde047' },
  { label: 'Xanh Pastel', hex: '#38bdf8' },
  { label: 'Hồng Khói Thời Thượng', hex: '#f43f5e' }
];

export const ACCESSORY_OPTIONS = [
  { id: 'none', label: 'Không Đeo', emoji: '✖️' },
  { id: 'glasses', label: 'Kính Cận Tri Thức', emoji: '👓' },
  { id: 'headphone', label: 'Tai Nghe Chống Ồn ANC', emoji: '🎧' },
  { id: 'gold_badge', label: 'Thẻ Nhân Viên Vàng VIP', emoji: '🪪' },
  { id: 'coffee_thermos', label: 'Bình Giữ Nhiệt Cà Phê', emoji: '🥤' }
];

const STORAGE_KEY = 'os_player_profile_v2';

export function getSavedPlayerProfile(): PlayerCustomProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) {
        return parsed;
      }
    }
  } catch {}

  return {
    name: 'Bạn',
    title: 'Chiến Thần Merchandiser',
    personality: 'caffeine_addict',
    shirtColor: '#4f46e5',
    hairColor: '#1e1b4b',
    accessory: 'headphone'
  };
}

export function savePlayerProfile(profile: PlayerCustomProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}
