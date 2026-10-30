export interface Trait {
  id: string;
  name: string;
  emoji: string;
  motto: string;
  desc: string;
  buff: string;
}

export const ALL_TRAITS: Trait[] = [
  {
    id: 'sassy',
    name: 'Lươn Chúa Bật Sếp',
    emoji: '🦹',
    motto: '"Sếp nói 1 câu cãi 3 câu, lý lẽ đanh thép như hợp đồng ngoại"',
    desc: 'Bậc thầy tranh luận và bảo vệ ranh giới cá nhân.',
    buff: 'Khi chọn đàm phán hoặc cãi lý bảo vệ ranh giới, được thưởng thêm +1 Uy Tín (⭐ +1)!'
  },
  {
    id: 'delegator',
    name: 'Bậc Thầy Đùn Đẩy',
    emoji: '🦥',
    motto: '"Việc hôm nay cứ để ngày mai... cho người khác làm hộ"',
    desc: 'Chuyên gia né task, gài việc khéo léo cho đồng nghiệp và xưởng may.',
    buff: 'Mỗi khi dùng mánh khóe né việc hoặc đổ vạ, giảm thêm 1 Việc Tồn (📋 -1)!'
  },
  {
    id: 'boba_addict',
    name: 'Tâm Hồn Nghiện Trà Sữa',
    emoji: '🧋',
    motto: '"Có đường mới có tương lai, trà sữa full topping là chân ái"',
    desc: 'Được tiếp thêm sức mạnh thần thánh từ trân châu và đường sữa.',
    buff: 'Các sự kiện liên quan đến ăn uống, trà sữa, cà phê hồi thêm +2 Năng Lượng (⚡ +2)!'
  },
  {
    id: 'gambler',
    name: 'Con Bạc Cát Lái',
    emoji: '🎲',
    motto: '"50/50 thì có gì phải sợ? Liều ăn nhiều, rớt tàu tính sau!"',
    desc: 'Luôn sẵn sàng all-in vào các quyết định liều lĩnh nhất.',
    buff: 'Tất cả các lựa chọn xúc xắc May Rủi (🎲) được cộng thêm +15% tỉ lệ thắng!'
  }
];
