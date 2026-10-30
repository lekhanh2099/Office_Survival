import { GameState } from '../types/game';
import { ROLES } from '../data/roles';
import { showToast } from './Toast';
import { sounds } from '../audio/SoundManager';

export const QR_MATRIX: string[] = [
  "11111110001010100001101111111",
  "10000010101001110100001000001",
  "10111010000010001111101011101",
  "10111010111010111010001011101",
  "10111010010000110001101011101",
  "10000010110110100101001000001",
  "11111110101010101010101111111",
  "00000000011101101001000000000",
  "11111011110111110000110101010",
  "00001001101010101010011110001",
  "01010010001010110101110010000",
  "10001100100010101111000001010",
  "00010010111001010010100001100",
  "00010000100100101010011110001",
  "00101011010111110101101101100",
  "00011100000110101001011000010",
  "10110111000010111000000001100",
  "11100100101000101000011110101",
  "10101011110111100100111110100",
  "10110001110100111011010110010",
  "10000111010001011110111110111",
  "00000000111010001010100011111",
  "11111110101011100111101011100",
  "10000010011100100110100010001",
  "10111010111011111100111110101",
  "10111010100100001011100001110",
  "10111010100001100100010111110",
  "10000010100101001111110011010",
  "11111110100000011011100100100"
];

export interface MemeAvatarOption {
  id: string;
  emoji: string;
  name: string;
  quote: string;
}

export const MEME_AVATARS: MemeAvatarOption[] = [
  { id: 'this_is_fine', emoji: '🐶🔥', name: 'This Is Fine', quote: 'Mọi thứ vẫn ổn dù cháy rụi' },
  { id: 'crying_cat', emoji: '😿👍', name: 'Mèo Khóc Like', quote: 'Nước mắt rơi nhưng vẫn Ok' },
  { id: 'pepe', emoji: '🐸👔', name: 'Pepe Doanh Nhân', quote: 'Thần thái đỉnh cao trước khi bị soi' },
  { id: 'typing_cat', emoji: '🐱⌨️', name: 'Mèo Cào Phím', quote: 'Gõ 150wpm đơn xin thôi việc' },
  { id: 'lazy_fish', emoji: '🐟💤', name: 'Cá Ươn Công Sở', quote: 'Nằm thẳng mặc kệ đời xô đẩy' },
  { id: 'panda', emoji: '🐼☕', name: 'Gấu Thâm Quầng', quote: 'Sống bằng 90% caffeine' }
];

export function renderCertificateToCanvas(
  canvas: HTMLCanvasElement,
  state: GameState,
  playerName: string,
  avatarId: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 800;
  const H = 1000;
  canvas.width = W;
  canvas.height = H;

  // 1. Background (Warm vintage paper)
  ctx.fillStyle = '#fbf9f2';
  ctx.fillRect(0, 0, W, H);

  // Subtle border lines
  ctx.strokeStyle = '#17172b';
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  ctx.strokeStyle = '#7c7894';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 26, W - 52, H - 52);

  // 2. Top Header parody
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5c5875';
  ctx.font = 'bold 13px Nunito, sans-serif';
  ctx.fillText('CỘNG HÒA VĂN PHÒNG ĐỘC LẬP - TỰ DO - XIN ĐỪNG TĂNG CA', W / 2, 60);

  ctx.fillStyle = '#17172b';
  ctx.font = '900 17px Nunito, sans-serif';
  ctx.fillText('CÔNG TY TNHH HẾT HƠI VIỆT NAM', W / 2, 86);

  ctx.fillStyle = '#7c7894';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('Số: ' + String(state.total + 100).padStart(3, '0') + '/BB-SATHAI/2026', W / 2, 108);

  // Decorative divider
  ctx.beginPath();
  ctx.strokeStyle = '#17172b';
  ctx.lineWidth = 2;
  ctx.moveTo(120, 122);
  ctx.lineTo(W - 120, 122);
  ctx.stroke();

  // 3. Document Title
  const isDead = state.lives <= 0;
  ctx.fillStyle = isDead ? '#dc2626' : '#15803d';
  ctx.font = '900 32px Nunito, sans-serif';
  ctx.fillText(isDead ? 'BIÊN BẢN SA THẢI & ĐỀN HÀNG' : 'CHỨNG NHẬN CHIẾN THẦN XUẤT NHẬP KHẨU', W / 2, 172);

  ctx.fillStyle = '#5c5875';
  ctx.font = 'bold 13.5px Nunito, sans-serif';
  ctx.fillText(
    isDead
      ? '(V/v: Chấm dứt hợp đồng vì rớt tàu Cát Lái & lệch tồn kho vải)'
      : '(V/v: Tuyên dương nhân sự bất tử đã sống sót qua mùa bão cước tàu & audit)',
    W / 2,
    198
  );

  // 4. Profile Box (Avatar + Info)
  const role = ROLES[state.role || 'genz'] || ROLES.genz;
  const avatar = MEME_AVATARS.find(a => a.id === avatarId) || MEME_AVATARS[0];

  // Photo Frame
  const photoX = 60;
  const photoY = 240;
  const photoW = 150;
  const photoH = 175;

  ctx.fillStyle = '#fff';
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.strokeStyle = '#17172b';
  ctx.lineWidth = 3;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // Avatar inside
  ctx.font = '68px sans-serif';
  ctx.fillText(avatar.emoji, photoX + photoW / 2, photoY + 95);

  ctx.fillStyle = '#4c4863';
  ctx.font = 'bold 11px Nunito, sans-serif';
  ctx.fillText(avatar.name, photoX + photoW / 2, photoY + 140);
  ctx.fillStyle = '#8f8ca4';
  ctx.font = '9px Nunito, sans-serif';
  ctx.fillText('ẢNH THẺ NHÂN VIÊN', photoX + photoW / 2, photoY + 158);

  // Profile Info beside photo
  const infoX = 236;
  let infoY = 265;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#17172b';
  ctx.font = 'bold 14px Nunito, sans-serif';
  ctx.fillText('Họ và tên:', infoX, infoY);
  ctx.fillStyle = '#6957ec';
  ctx.font = '900 24px Nunito, sans-serif';
  ctx.fillText(playerName || 'Nhân Viên Gương Mẫu', infoX + 85, infoY + 2);

  infoY += 40;
  ctx.fillStyle = '#17172b';
  ctx.font = 'bold 14px Nunito, sans-serif';
  ctx.fillText('Chức danh:', infoX, infoY);
  ctx.fillStyle = '#17172b';
  ctx.font = '800 16px Nunito, sans-serif';
  ctx.fillText(role.title, infoX + 95, infoY);

  infoY += 32;
  ctx.fillStyle = '#17172b';
  ctx.font = 'bold 14px Nunito, sans-serif';
  ctx.fillText('Hệ tư tưởng:', infoX, infoY);
  ctx.fillStyle = '#4f46e5';
  ctx.font = '800 15px Nunito, sans-serif';
  ctx.fillText(`${role.emoji} ${role.name}`, infoX + 105, infoY);

  infoY += 32;
  ctx.fillStyle = '#17172b';
  ctx.font = 'bold 14px Nunito, sans-serif';
  ctx.fillText('Thời gian trụ:', infoX, infoY);
  ctx.fillStyle = '#b45309';
  ctx.font = '800 15px Nunito, sans-serif';
  ctx.fillText(`Ngày ${state.day} (Vượt qua ${state.total} sự kiện)`, infoX + 115, infoY);

  // 5. Performance Stats Table
  const tableY = 445;
  const tableH = 110;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(60, tableY, W - 120, tableH);
  ctx.strokeStyle = '#17172b';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(60, tableY, W - 120, tableH);

  // Vertical dividers
  const colW = (W - 120) / 4;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(60 + colW * i, tableY);
    ctx.lineTo(60 + colW * i, tableY + tableH);
    ctx.stroke();
  }

  // Table items
  const statsCols = [
    { label: '🏆 ĐIỂM SỐ', val: `${state.score.toLocaleString('vi-VN')}`, color: '#6957ec' },
    { label: '❤️ MẠNG CÒN', val: `${state.lives}/3`, color: state.lives > 0 ? '#15803d' : '#dc2626' },
    { label: '🔁 NGHIỆP TRẢ', val: `${state.triggerCount || 0} lần`, color: '#d97706' },
    { label: '📋 VIỆC TỒN', val: `${state.b}/8 task`, color: '#e11d48' }
  ];

  ctx.textAlign = 'center';
  statsCols.forEach((st, idx) => {
    const cx = 60 + colW * idx + colW / 2;
    ctx.fillStyle = '#5d5975';
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillText(st.label, cx, tableY + 36);

    ctx.fillStyle = st.color;
    ctx.font = '900 24px Nunito, sans-serif';
    ctx.fillText(st.val, cx, tableY + 80);
  });

  // 6. Reason Box / Incident Note
  const reasonY = 585;
  ctx.fillStyle = isDead ? '#fff1f2' : '#f0fdf4';
  ctx.fillRect(60, reasonY, W - 120, 110);
  ctx.strokeStyle = isDead ? '#f43f5e' : '#22c55e';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, reasonY, W - 120, 110);

  ctx.textAlign = 'left';
  ctx.fillStyle = isDead ? '#9f1239' : '#166534';
  ctx.font = '900 13px Nunito, sans-serif';
  ctx.fillText(isDead ? '⚠️ NGUYÊN NHÂN CHO THÔI VIỆC (BIÊN BẢN TAI NẠN):' : '🎖️ ĐÁNH GIÁ CỦA BAN LÃNH ĐẠO:', 80, reasonY + 32);

  ctx.fillStyle = '#1f1e29';
  ctx.font = 'italic 700 16px Nunito, sans-serif';
  const reasonText = state.deathReason || (state.lastResult?.title ? `Sự cố: ${state.lastResult.title}` : 'Đột quỵ vì deadline và những cuộc họp 17h30');
  
  // Wrap text if long
  const words = `"${reasonText}"`.split(' ');
  let line = '';
  let curY = reasonY + 62;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > W - 160 && n > 0) {
      ctx.fillText(line, 80, curY);
      line = words[n] + ' ';
      curY += 24;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 80, curY);

  // 7. Authentic Red Rubber Stamp (Rotated)
  ctx.save();
  ctx.translate(W - 210, 680);
  ctx.rotate((-13 * Math.PI) / 180);

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4.5;
  ctx.strokeRect(-90, -42, 180, 84);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-84, -36, 168, 72);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#dc2626';
  ctx.font = '900 10.5px Nunito, sans-serif';
  ctx.fillText('★ TẬP ĐOÀN DỆT MAY & XNK HẾT HƠI ★', 0, -18);
  ctx.font = '900 21px Nunito, sans-serif';
  ctx.fillText(isDead ? 'ĐÃ SA THẢI' : 'CHIẾN THẦN', 0, 10);
  ctx.font = 'bold 10px monospace';
  ctx.fillText(new Date().toLocaleDateString('vi-VN'), 0, 26);
  ctx.restore();

  // 8. Bottom Footer with real QR Code
  const qrX = 60;
  const qrY = 720;
  const qrSize = 130;
  const modSize = qrSize / QR_MATRIX.length;

  // QR container
  ctx.fillStyle = '#fff';
  ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
  ctx.strokeStyle = '#17172b';
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);

  // Draw QR Modules
  ctx.fillStyle = '#17172b';
  for (let r = 0; r < QR_MATRIX.length; r++) {
    for (let c = 0; c < QR_MATRIX[r].length; c++) {
      if (QR_MATRIX[r][c] === '1') {
        ctx.fillRect(qrX + c * modSize, qrY + r * modSize, modSize + 0.4, modSize + 0.4);
      }
    }
  }

  // QR info text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#17172b';
  ctx.font = '900 15px Nunito, sans-serif';
  ctx.fillText('QUÉT MÃ ĐỂ VÀO THI ĐUA!', qrX + qrSize + 24, qrY + 36);

  ctx.fillStyle = '#5c5875';
  ctx.font = '700 13px Nunito, sans-serif';
  ctx.fillText('Office Survival · Game Sinh Tồn Công Sở Số 1', qrX + qrSize + 24, qrY + 62);

  ctx.fillStyle = '#6957ec';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('https://lekhanh2099.github.io/Office_Survival/', qrX + qrSize + 24, qrY + 86);

  ctx.fillStyle = '#8f8ca4';
  ctx.font = 'italic 11px Nunito, sans-serif';
  ctx.fillText('"Đừng để công ty nuốt chửng bạn trước khi kịp nhận lương"', qrX + qrSize + 24, qrY + 112);

  // Right Signatory signature
  ctx.textAlign = 'center';
  ctx.fillStyle = '#17172b';
  ctx.font = 'bold 13px Nunito, sans-serif';
  ctx.fillText('GIÁM ĐỐC NHÂN SỰ ĐÃ KÝ', W - 140, qrY + 70);
  ctx.font = 'italic 11px Nunito, sans-serif';
  ctx.fillStyle = '#7c7894';
  ctx.fillText('(Ký bằng giọt nước mắt)', W - 140, qrY + 92);
}

export function downloadCertificate(canvas: HTMLCanvasElement, filename = 'office-survival-sa-thai.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
  sounds.success();
  showToast('🎉 Đã tải ảnh biên bản về máy!');
}

export async function shareCertificate(canvas: HTMLCanvasElement): Promise<void> {
  if (!navigator.share || !canvas.toBlob) {
    downloadCertificate(canvas);
    return;
  }

  canvas.toBlob(async (blob) => {
    if (!blob) {
      downloadCertificate(canvas);
      return;
    }
    const file = new File([blob], 'office-survival-sa-thai.png', { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Biên bản sa thải - Office Survival',
          text: 'Tui vừa bị công ty cho thôi việc trong Office Survival rồi nè sốp ơi 😭 Quét mã thi thử coi ai trụ lâu hơn!'
        });
        showToast('Đã chia sẻ thành công!');
      } else {
        downloadCertificate(canvas);
      }
    } catch {
      downloadCertificate(canvas);
    }
  }, 'image/png');
}
