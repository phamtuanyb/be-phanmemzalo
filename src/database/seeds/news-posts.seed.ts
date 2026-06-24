import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Post, PostStatus } from '../../entities/post.entity';

type NewsSeed = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  categorySlug: string;
};

const UNSPLASH = (id: string, w = 1280, h = 720) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const NEWS_SEED: NewsSeed[] = [
  // ─── Case Study (5 bài) ─────────────────────────────────────────────────
  {
    title: 'Case Study: Chuỗi Spa 15 chi nhánh tiết kiệm 50 triệu/tháng nhờ phần mềm MKT Software',
    slug: 'case-study-chuoi-spa-15-chi-nhanh-tiet-kiem-50-trieu-thang',
    categorySlug: 'case-study',
    excerpt: 'Saigon Beauty Spa đã thay thế 4 phần mềm rời rạc bằng 1 hệ thống MKT Software đồng nhất — tiết kiệm 50 triệu/tháng chi phí vận hành và giảm 70% lỗi đặt lịch trùng.',
    thumbnail: UNSPLASH('photo-1560750588-73207b1ef5b8'),
    content: `<h2>Bối cảnh khách hàng</h2><p>Saigon Beauty Spa là chuỗi 15 chi nhánh tại TP.HCM, có 200+ nhân viên và phục vụ ~5000 khách/tháng. Trước khi dùng MKT Software, họ đang vận hành trên 4 phần mềm rời rạc: 1 cho đặt lịch, 1 cho thẻ thành viên, 1 cho kho mỹ phẩm, 1 cho kế toán.</p><h2>Vấn đề gặp phải</h2><ul><li>Dữ liệu khách hàng không đồng bộ giữa các chi nhánh — khách book lịch ở chi nhánh A nhưng nhân viên chi nhánh B không thấy lịch sử</li><li>Tồn kho mỹ phẩm chênh lệch giữa phần mềm và thực tế lên đến 30%</li><li>Mỗi tháng tốn 50 triệu chi phí license + bảo trì cho 4 phần mềm</li></ul><h2>Giải pháp MKT Software</h2><p>Đội MKT Software đã triển khai 1 hệ thống ERP đặt làm riêng trong 8 tuần, tích hợp toàn bộ luồng đặt lịch — thanh toán — kho — chăm khách. Sau 3 tháng vận hành: tỉ lệ khách quay lại tăng 35%, tồn kho khớp 99.5%, và chi phí phần mềm giảm 60%.</p><h2>Kết quả sau 6 tháng</h2><ul><li>Doanh thu tăng 28% so với cùng kỳ</li><li>Tiết kiệm 50 triệu/tháng chi phí phần mềm</li><li>Giảm 70% lỗi đặt lịch trùng giữa các chi nhánh</li></ul>`,
  },
  {
    title: 'Case Study: Nhà hàng F&B tăng doanh thu 40% sau khi tích hợp AI Agent đặt bàn',
    slug: 'case-study-nha-hang-fb-tang-doanh-thu-40-tich-hop-ai-agent-dat-ban',
    categorySlug: 'case-study',
    excerpt: 'Hệ thống AI Agent đặt bàn tự động qua Zalo + Facebook giúp chuỗi nhà hàng Phố Cổ tăng 40% lượng booking trong 3 tháng, giảm 80% công sức nhân viên lễ tân.',
    thumbnail: UNSPLASH('photo-1517248135467-4c7edcad34c4'),
    content: `<h2>Bài toán</h2><p>Chuỗi nhà hàng Phố Cổ với 6 chi nhánh nhận booking qua điện thoại + Zalo cá nhân của lễ tân. Đêm trễ thường mất khách vì không ai trả lời, peak hour thì lễ tân quá tải.</p><h2>Triển khai</h2><p>MKT Software deploy AI Agent đặt bàn 24/7 tích hợp Zalo Mini App + Messenger. Khách hỏi giờ, đặt bàn, đổi lịch — AI xử lý hết.</p><h2>Kết quả</h2><p>Sau 3 tháng: booking tăng 40%, no-show giảm 25% nhờ AI tự nhắc lịch, lễ tân chỉ còn phải handle 20% case phức tạp.</p>`,
  },
  {
    title: 'Case Study: CRM MKT Software giúp công ty bất động sản chốt deal nhanh hơn 3x',
    slug: 'case-study-crm-vsoftware-giup-cong-ty-bds-chot-deal-nhanh-3x',
    categorySlug: 'case-study',
    excerpt: 'Công ty BĐS Hưng Phát đã giảm thời gian từ lead-to-close từ 21 ngày xuống 7 ngày nhờ pipeline tự động hoá và scoring AI trong CRM MKT Software.',
    thumbnail: UNSPLASH('photo-1560518883-ce09059eeffa'),
    content: `<h2>Trước khi dùng MKT Software</h2><p>Sales theo lead bằng Excel + Zalo cá nhân. Mất 21 ngày trung bình từ lead về đến chốt deal. Lead nguội bị bỏ rơi.</p><h2>MKT Software CRM triển khai</h2><p>Pipeline 7 stage, AI scoring lead nóng/lạnh, auto-assign cho sales chuyên môn, nhắc lịch tự động.</p><h2>Sau 4 tháng</h2><p>Thời gian close giảm còn 7 ngày. Tỉ lệ chuyển đổi tăng 2.5 lần. Sales hài lòng vì không phải nhập tay.</p>`,
  },
  {
    title: 'Case Study: Gym 500 hội viên tự động gia hạn thẻ tập, tăng doanh thu 22%',
    slug: 'case-study-gym-500-hoi-vien-tu-dong-gia-han-the-tap-tang-doanh-thu-22',
    categorySlug: 'case-study',
    excerpt: 'Iron Body Gym đã tự động hóa luồng nhắc gia hạn thẻ qua Zalo OA — tỉ lệ renew tăng từ 45% lên 72%, doanh thu cộng dồn tăng 22%.',
    thumbnail: UNSPLASH('photo-1571902943202-507ec2618e8f'),
    content: `<h2>Bài toán</h2><p>Hội viên hết hạn thẻ nhưng quên gia hạn. Nhân viên gọi nhắc 1-1 không xuể, tỉ lệ renew chỉ 45%.</p><h2>Giải pháp</h2><p>Workflow auto trên MKT Software: trước hết hạn 14 ngày → gửi reminder Zalo OA + email + SMS. Tích hợp link thanh toán 1 click.</p><h2>Kết quả</h2><p>Renew rate lên 72%. Doanh thu định kỳ tăng 22%. Lễ tân không phải gọi nhắc nữa, có thời gian chăm khách mới.</p>`,
  },
  {
    title: 'Case Study: Trung tâm đào tạo 1500 học viên quản lý đồng bộ trên 1 dashboard',
    slug: 'case-study-trung-tam-dao-tao-1500-hoc-vien-quan-ly-dong-bo-tren-1-dashboard',
    categorySlug: 'case-study',
    excerpt: 'Vstar Edu đã thay thế Google Sheets bằng dashboard MKT Software — quản lý 1500 học viên, 60 giảng viên, 80 lớp cùng lúc với 0 sai sót học phí.',
    thumbnail: UNSPLASH('photo-1523240795612-9a054b0db644'),
    content: `<h2>Hiện trạng</h2><p>Quản lý bằng 12 file Google Sheets chia nhỏ. Mỗi cuối tháng tốn 3 ngày để đối soát học phí.</p><h2>Giải pháp</h2><p>MKT Software xây dashboard với module: học viên, lớp học, giảng viên, học phí, điểm danh. Auto-calc học phí theo gói + auto-gửi hóa đơn.</p><h2>Kết quả</h2><p>0 sai sót học phí trong 6 tháng. Tiết kiệm 9 ngày công/tháng. Giảng viên xem lương online 24/7.</p>`,
  },

  // ─── Tin tổng hợp (4 bài) ───────────────────────────────────────────────
  {
    title: '5 xu hướng AI Agent định hình SME Việt Nam 2026',
    slug: '5-xu-huong-ai-agent-dinh-hinh-sme-viet-nam-2026',
    categorySlug: 'tin-tong-hop',
    excerpt: 'AI Agent đang trở thành công cụ chiến lược cho SME Việt — từ chăm sóc khách hàng tự động đến phân tích kinh doanh thời gian thực. Đâu là 5 xu hướng đáng chú ý nhất 2026?',
    thumbnail: UNSPLASH('photo-1620712943543-bcc4688e7485'),
    content: `<h2>1. AI Agent chăm sóc khách hàng đa kênh</h2><p>Tích hợp Zalo + Messenger + Email + SMS trong 1 AI duy nhất. Hiểu ngữ cảnh, chuyển tay người thật khi cần.</p><h2>2. AI Sales tự động qualify lead</h2><p>Đọc lead, đánh giá nóng/lạnh, follow-up tự động đến khi lead sẵn sàng gặp sales.</p><h2>3. AI Marketing tạo nội dung</h2><p>Viết content social, viết email campaign, A/B test tự động.</p><h2>4. AI Phân tích báo cáo</h2><p>Cảnh báo bất thường KPI, gợi ý hành động cụ thể.</p><h2>5. AI Vận hành nội bộ</h2><p>Tự động hoá quy trình HR, kế toán, vận hành.</p>`,
  },
  {
    title: 'Vì sao chuyển đổi số SME Việt vẫn chậm dù tiềm năng lớn?',
    slug: 'vi-sao-chuyen-doi-so-sme-viet-van-cham-du-tiem-nang-lon',
    categorySlug: 'tin-tong-hop',
    excerpt: 'Theo báo cáo VCCI 2026, chỉ 22% SME Việt thực sự áp dụng phần mềm vào vận hành. Đâu là rào cản và làm sao vượt qua?',
    thumbnail: UNSPLASH('photo-1551288049-bebda4e38f71'),
    content: `<h2>3 rào cản chính</h2><ul><li>Phần mềm đại trà không vừa với quy trình thực tế</li><li>Chi phí license quá cao so với SME</li><li>Thiếu đội IT nội bộ để triển khai</li></ul><h2>Giải pháp MKT Software</h2><p>Phần mềm theo yêu cầu, vừa vặn quy trình, giá phù hợp SME.</p>`,
  },
  {
    title: 'Cập nhật chính sách thuế điện tử 2026: Doanh nghiệp cần chuẩn bị gì?',
    slug: 'cap-nhat-chinh-sach-thue-dien-tu-2026-doanh-nghiep-can-chuan-bi-gi',
    categorySlug: 'tin-tong-hop',
    excerpt: 'Tổng cục Thuế ban hành quy định mới về hóa đơn điện tử và báo cáo thuế tự động. Doanh nghiệp cần phần mềm kế toán hỗ trợ đầy đủ chuẩn mới.',
    thumbnail: UNSPLASH('photo-1454165804606-c3d57bc86b40'),
    content: `<h2>Quy định mới</h2><p>Từ Q3/2026, doanh nghiệp phải nộp báo cáo thuế qua API trực tiếp lên Tổng cục Thuế.</p><h2>MKT Software hỗ trợ</h2><p>Module kế toán MKT Software tích hợp sẵn API thuế, tự động nộp báo cáo định kỳ.</p>`,
  },
  {
    title: 'Top 10 phần mềm SaaS Việt được SME ưa chuộng nhất 2026',
    slug: 'top-10-phan-mem-saas-viet-duoc-sme-ua-chuong-nhat-2026',
    categorySlug: 'tin-tong-hop',
    excerpt: 'Bảng xếp hạng phần mềm SaaS "made in Vietnam" được SME ưa chuộng nhất theo khảo sát 1500 doanh nghiệp tháng 5/2026.',
    thumbnail: UNSPLASH('photo-1460925895917-afdab827c52f'),
    content: `<h2>Top 10</h2><ol><li>MKT Software ERP — phần mềm theo yêu cầu</li><li>Misa AMIS — kế toán</li><li>KiotViet — bán hàng</li><li>Sapo — POS</li><li>Base.vn — HR</li></ol><p>... và 5 sản phẩm khác.</p>`,
  },

  // ─── Hướng dẫn sử dụng (4 bài) ──────────────────────────────────────────
  {
    title: 'Hướng dẫn thiết lập CRM MKT Software từ A-Z trong 30 phút',
    slug: 'huong-dan-thiet-lap-crm-vsoftware-tu-a-z-trong-30-phut',
    categorySlug: 'huong-dan-su-dung',
    excerpt: 'Step-by-step setup CRM MKT Software cho công ty mới: import lead từ Excel, cấu hình pipeline 7 stage, gán role nhân viên, kết nối Zalo OA.',
    thumbnail: UNSPLASH('photo-1551434678-e076c223a692'),
    content: `<h2>Bước 1: Đăng nhập admin</h2><p>Vào /admin, login bằng tài khoản admin được MKT Software cấp.</p><h2>Bước 2: Import lead từ Excel</h2><p>Module Khách hàng → Import → Chọn file .xlsx → Map cột.</p><h2>Bước 3: Thiết lập pipeline</h2><p>Default 7 stage: Mới → Tiếp xúc → Demo → Báo giá → Thương lượng → Chốt → Mất.</p>`,
  },
  {
    title: 'Cách kết nối Zalo OA với MKT Software để tự động gửi tin nhắn',
    slug: 'cach-ket-noi-zalo-oa-voi-vsoftware-de-tu-dong-gui-tin-nhan',
    categorySlug: 'huong-dan-su-dung',
    excerpt: 'Hướng dẫn chi tiết tích hợp Zalo Official Account vào MKT Software để gửi tin nhắn ZNS tự động cho khách hàng (nhắc lịch, thông báo, marketing).',
    thumbnail: UNSPLASH('photo-1611162617474-5b21e879e113'),
    content: `<h2>Bước 1: Tạo Zalo OA</h2><p>Vào oa.zalo.me, đăng ký doanh nghiệp.</p><h2>Bước 2: Lấy API key</h2><p>Trong dashboard Zalo OA → Developer → tạo app → copy access token.</p><h2>Bước 3: Cấu hình MKT Software</h2><p>/admin/integrations/zalo → paste token → save.</p>`,
  },
  {
    title: 'Hướng dẫn tạo workflow tự động đầu tiên trong MKT Software Automation',
    slug: 'huong-dan-tao-workflow-tu-dong-dau-tien-trong-vsoftware-automation',
    categorySlug: 'huong-dan-su-dung',
    excerpt: 'Tạo workflow auto-send email chào mừng khi có lead mới: 5 bước đơn giản, không cần code.',
    thumbnail: UNSPLASH('photo-1518770660439-4636190af475'),
    content: `<h2>Bước 1: Trigger</h2><p>Chọn "Lead mới được tạo" làm trigger.</p><h2>Bước 2: Action</h2><p>Add "Gửi email" → Chọn template.</p><h2>Bước 3: Test</h2><p>Tạo lead test, kiểm tra email gửi.</p>`,
  },
  {
    title: 'Tích hợp MKT Software với Misa AMIS — đồng bộ kế toán + bán hàng',
    slug: 'tich-hop-vsoftware-voi-misa-amis-dong-bo-ke-toan-ban-hang',
    categorySlug: 'huong-dan-su-dung',
    excerpt: 'Hướng dẫn kết nối MKT Software Sales/CRM với Misa AMIS Kế toán để đồng bộ hóa đơn 2 chiều, tiết kiệm 5 giờ/tuần thao tác tay.',
    thumbnail: UNSPLASH('photo-1454165804606-c3d57bc86b40'),
    content: `<h2>Yêu cầu</h2><p>Có gói Misa AMIS + MKT Software Pro trở lên.</p><h2>Setup</h2><p>/admin/integrations/misa → input API key → chọn entity cần sync (Invoice / Customer / Product).</p>`,
  },

  // ─── Kiến thức Marketing (4 bài) ────────────────────────────────────────
  {
    title: '10 chiến thuật email marketing có conversion rate trên 25% năm 2026',
    slug: '10-chien-thuat-email-marketing-co-conversion-rate-tren-25-nam-2026',
    categorySlug: 'kien-thuc-marketing',
    excerpt: 'Tổng hợp 10 chiến thuật email marketing thực chiến: từ subject line A/B test đến segment theo behavior — tăng open rate gấp 3 và conversion 25%+.',
    thumbnail: UNSPLASH('photo-1596526131083-e8c633c948d2'),
    content: `<h2>1. Subject line dưới 50 ký tự</h2><h2>2. Personalize theo tên + công ty</h2><h2>3. Segment list theo behavior</h2><h2>4. A/B test 2 version mỗi campaign</h2><h2>5. Gửi vào thứ Ba/Năm 10h sáng</h2>`,
  },
  {
    title: 'Cách viết content social tăng engagement 3x bằng AI và phân tích đối thủ',
    slug: 'cach-viet-content-social-tang-engagement-3x-bang-ai-va-phan-tich-doi-thu',
    categorySlug: 'kien-thuc-marketing',
    excerpt: 'Quy trình 5 bước viết content Facebook/TikTok dùng AI hỗ trợ + phân tích đối thủ, đã giúp 50+ SME tăng engagement gấp 3 lần.',
    thumbnail: UNSPLASH('photo-1611162616475-46b635cb6868'),
    content: `<h2>Bước 1: Phân tích top 10 đối thủ</h2><h2>Bước 2: Tìm topic cluster</h2><h2>Bước 3: AI viết draft</h2><h2>Bước 4: Edit + visual</h2><h2>Bước 5: Post + analyze</h2>`,
  },
  {
    title: 'Funnel chuyển đổi cho SME: từ lead lạnh đến khách hàng trung thành',
    slug: 'funnel-chuyen-doi-cho-sme-tu-lead-lanh-den-khach-hang-trung-thanh',
    categorySlug: 'kien-thuc-marketing',
    excerpt: 'Mô hình funnel 5 stage tối ưu cho SME Việt: Awareness → Interest → Consideration → Purchase → Loyalty. Mỗi stage có chiến thuật cụ thể.',
    thumbnail: UNSPLASH('photo-1552664730-d307ca884978'),
    content: `<h2>Stage 1: Awareness</h2><p>SEO + Facebook Ads + KOL.</p><h2>Stage 2: Interest</h2><p>Landing page + Lead magnet.</p><h2>Stage 3: Consideration</h2><p>Email nurturing + Webinar.</p><h2>Stage 4: Purchase</h2><p>Demo + Free trial + Discount.</p><h2>Stage 5: Loyalty</h2><p>Referral + Loyalty program.</p>`,
  },
  {
    title: 'Marketing Automation cho SME: 5 workflow ai cũng setup được trong 1 giờ',
    slug: 'marketing-automation-cho-sme-5-workflow-ai-cung-setup-duoc-trong-1-gio',
    categorySlug: 'kien-thuc-marketing',
    excerpt: '5 workflow marketing automation phổ biến nhất cho SME: welcome series, abandoned cart, re-engagement, birthday, post-purchase upsell.',
    thumbnail: UNSPLASH('photo-1432888622747-4eb9a8efeb07'),
    content: `<h2>1. Welcome series</h2><p>3 email trong 7 ngày đầu khách đăng ký.</p><h2>2. Abandoned cart</h2><p>Email + SMS sau 1h và 24h.</p><h2>3. Re-engagement</h2><p>Sau 60 ngày không tương tác.</p><h2>4. Birthday</h2><p>Voucher mừng sinh nhật.</p><h2>5. Post-purchase upsell</h2><p>7 ngày sau mua, gợi ý sản phẩm bổ sung.</p>`,
  },
];

export async function seedNewsPosts(
  categoryRepo: Repository<Category>,
  postRepo: Repository<Post>,
  authorId: number,
) {
  let created = 0;
  let skipped = 0;
  // Phân bố ngày đăng trong 30 ngày gần nhất để có thứ tự "mới nhất"
  // (cố định để re-seed cho cùng kết quả)
  const baseDate = new Date('2026-05-28T09:00:00Z');
  for (let i = 0; i < NEWS_SEED.length; i++) {
    const n = NEWS_SEED[i];
    const exists = await postRepo.findOne({ where: { slug: n.slug } });
    if (exists) {
      skipped++;
      continue;
    }
    const cat = await categoryRepo.findOne({ where: { slug: n.categorySlug } });
    if (!cat) {
      console.warn(`⚠️  Sub-category "${n.categorySlug}" không tồn tại, bỏ qua bài "${n.title}"`);
      continue;
    }
    const publishedAt = new Date(baseDate.getTime() - i * 36 * 60 * 60 * 1000); // mỗi bài cách nhau 36h
    await postRepo.save(
      postRepo.create({
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        content: n.content,
        thumbnail: n.thumbnail,
        categoryId: cat.id,
        authorId,
        status: PostStatus.PUBLISHED,
        publishedAt,
      }),
    );
    created++;
  }
  console.log(`✅ News posts seed: ${created} bài tạo mới, ${skipped} bài đã tồn tại`);
}
