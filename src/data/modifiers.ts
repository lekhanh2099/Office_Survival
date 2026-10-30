import { Modifier } from '../types/game';

export const MODIFIERS: Modifier[] = [
  { id: 'normal', name: 'BÌNH YÊN GIẢ TẠO', desc: 'Không có hiệu ứng đặc biệt. Sự bình yên là đáng nghi.' },
  { id: 'nocoffee', name: 'CẤM CÀ PHÊ', desc: 'Mọi lần hồi năng lượng từ thẻ bị giảm 1 (không xuống âm).' },
  { id: 'kpi', name: 'ĐẠI HỘI KPI', desc: 'Mọi lựa chọn tăng việc tồn sẽ cộng thêm 1 việc.' },
  { id: 'bonus', name: 'CÔNG TY PHÁT BÁNH', desc: 'Lần đầu giải quyết việc tồn trong ngày được +5 điểm thưởng.' },
  { id: 'wifi', name: 'WIFI CÓ LINH HỒN', desc: 'Cơ hội rút thẻ hiếm tăng đáng kể.' }
];
