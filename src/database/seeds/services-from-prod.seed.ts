import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';

// Patch nội dung từ prod vsoftware.vn cho 4 service.
// Override các phần: hero tagline, painPoints, features (kèm ảnh), testimonials (kèm avatar).
// Giữ nguyên: pricing, faq, commitments, stickyBottom, finalCta, etc.

const UNSPLASH = (id: string, w = 800, h = 450) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
const AVATAR = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=200&h=200&q=80`;

// Avatar dùng chung cho testimonial Nguyễn Tú (chân dung doanh nhân nam Châu Á)
const NGUYEN_TU_AVATAR = AVATAR('photo-1560250097-0b93528c311a');

type Patch = {
  slug: string;
  heroTagline: string;
  painPoints: { title: string; description: string }[];
  features: { title: string; bullets: string[]; imageId: string }[];
  testimonialQuote: string;
  testimonialName: string;
  testimonialRole: string;
};

export const SERVICE_PATCHES: Patch[] = [
  {
    slug: 'app-ban-hang-da-kenh-web-zalo-mini-app-mobile-dong-bo-ton-kho-va-don-hang-realtime',
    heroTagline:
      'Khách hàng mua ở mọi nơi: Facebook, Zalo, website, cửa hàng, sàn TMĐT. Nhưng nếu hệ thống bán hàng của bạn tách rời nhau, mỗi kênh là một Excel riêng — bạn đang mất thời gian tổng hợp thay vì bán thêm.',
    painPoints: [
      { title: 'Tồn kho không đồng bộ giữa các kênh', description: 'Bán cùng một hàng trên nhiều kênh — bán quá, không có hàng giao, khách phàn nàn, mất uy tín.' },
      { title: 'Nhân viên chạy 5 tab phần mềm', description: 'Mỗi kênh một phần mềm riêng — nhầm đơn, chậm xử lý, tăng chi phí vận hành, đào tạo cực mệt.' },
      { title: 'Không biết kênh nào sinh lời nhất', description: 'Không có báo cáo theo kênh để tập trung ngân sách marketing — đốt tiền dàn trải, ROI âm.' },
    ],
    features: [
      { title: 'Đồng bộ tồn kho realtime', bullets: ['Cập nhật tồn kho tức thì khi có đơn ở bất kỳ kênh nào', 'Cảnh báo hết hàng tự động trước khi over-sell', 'Đồng bộ giữa kho online + cửa hàng vật lý'], imageId: 'photo-1553413077-190dd305871c' },
      { title: 'Quản lý đơn tập trung', bullets: ['Mọi đơn từ FB, Zalo, web, sàn về 1 dashboard', 'Phân loại đơn theo kênh, trạng thái, sales', 'Nhân viên chỉ cần mở 1 phần mềm'], imageId: 'photo-1460925895917-afdab827c52f' },
      { title: 'Zalo Mini App', bullets: ['Khách mua hàng ngay trong Zalo, không cần tải app', 'Tích hợp Zalo Pay, ZNS gửi đơn xác nhận', 'Liên kết Zalo OA chăm khách 1-1'], imageId: 'photo-1512941937669-90a1b58e7e9c' },
      { title: 'Website chuẩn SEO', bullets: ['Tốc độ load nhanh, mobile-first', 'Schema sản phẩm, sitemap tự sinh', 'Tích hợp Google Merchant Center'], imageId: 'photo-1432888622747-4eb9a8efeb07' },
      { title: 'Báo cáo theo kênh', bullets: ['Doanh thu, lợi nhuận, CPL từng kênh', 'So sánh hiệu suất theo tuần/tháng', 'Insight kênh nào nên scale, kênh nào nên cắt'], imageId: 'photo-1454165804606-c3d57bc86b40' },
      { title: 'Tích hợp vận chuyển', bullets: ['Kết nối GHN, GHTK, J&T, Viettel Post', 'In vận đơn hàng loạt, tracking realtime', 'Đối soát COD tự động cuối tháng'], imageId: 'photo-1601158935942-52255782d322' },
    ],
    testimonialQuote:
      'Bán trên 5 kênh không khó bằng quản lý 5 kênh. MKT Software gộp tất cả về một nơi — nhân viên làm việc như bán một kênh nhưng doanh thu gấp 5.',
    testimonialName: 'Nguyễn Tú',
    testimonialRole: 'Khách hàng MKT Software',
  },
  {
    slug: 'ai-automation-chatbot-workflow-tu-dong-hoa-cham-soc-khach-hang-khong-can-nhan-su-247',
    heroTagline:
      'AI không còn là tương lai — nó là lợi thế cạnh tranh ngay hôm nay. MKT Software giúp doanh nghiệp SME tích hợp AI vào quy trình thực tế: không cần team AI riêng, không cần kiến thức kỹ thuật sâu — chỉ cần kết quả.',
    painPoints: [
      { title: 'Khách nhắn 11h đêm không ai trả lời', description: 'Sang hôm sau khách đã mua chỗ khác. Mất 30-40% lead vì phản hồi chậm ngoài giờ hành chính.' },
      { title: '3 tiếng/ngày copy-paste, nhập liệu', description: 'Nhân viên dành thời gian cho việc lặp lại, nhập liệu, tổng hợp báo cáo thủ công — không có thời gian làm việc giá trị.' },
      { title: 'Không tận dụng được dữ liệu đang có', description: 'Tháng nào cũng hỏi "khách nào sắp rời bỏ?" mà không có cách trả lời chính xác. Quyết định bằng cảm tính.' },
    ],
    features: [
      { title: 'Chatbot AI', bullets: ['Trả lời câu hỏi, tư vấn sản phẩm, chốt lịch hẹn', 'Hoạt động trên Zalo OA, Facebook, website 24/7', 'Học tài liệu sản phẩm + chính sách của bạn'], imageId: 'photo-1611162617213-7d7a39e9b1d7' },
      { title: 'Workflow tự động', bullets: ['Kết nối hệ thống, tự động hóa quy trình lặp lại', 'Không cần nhân sự làm cầu nối giữa các phần mềm', 'No-code: kéo thả thiết kế workflow'], imageId: 'photo-1518186285589-2f7649de83e0' },
      { title: 'Chăm sóc tự động', bullets: ['Gửi Zalo/Email theo hành vi khách hàng', 'Đúng người, đúng thời điểm, đúng thông điệp', 'Tự động hoá welcome series, abandoned cart, win-back'], imageId: 'photo-1596526131083-e8c633c948d2' },
      { title: 'Phân tích dữ liệu AI', bullets: ['Nhận diện xu hướng từ data lịch sử', 'Dự báo doanh số theo mùa, theo kênh', 'Cảnh báo khách có nguy cơ rời bỏ trước khi mất'], imageId: 'photo-1551288049-bebda4e38f71' },
      { title: 'Báo cáo tự động', bullets: ['Dashboard AI tổng hợp dữ liệu từ nhiều nguồn', 'Gửi báo cáo định kỳ qua Zalo/Email', 'Cảnh báo bất thường KPI realtime'], imageId: 'photo-1460925895917-afdab827c52f' },
      { title: 'Tích hợp sẵn có', bullets: ['Kết nối với hệ thống MKT Software hiện tại: CRM, POS, kho', 'Không cần xây mới hoàn toàn — bù trừ vào cái đang có', 'API mở cho phép tích hợp custom'], imageId: 'photo-1518770660439-4636190af475' },
    ],
    testimonialQuote:
      'AI thực dụng không phải ChatGPT hay robot sắc nét — là con bot nhắn Zalo đúng lúc khách sắp quên mình, là workflow tự điền form khi nhân viên ngủ.',
    testimonialName: 'Nguyễn Tú',
    testimonialRole: 'Khách hàng MKT Software',
  },
  {
    slug: 'thiet-ke-website-chuyen-nghiep-uiux-chuan-figma-mobile-first-toi-uu-chuyen-doi',
    heroTagline:
      'Website đẹp không phải để khen — là để bán hàng và giữ khách ở lại. MKT Software thiết kế website từ bản Figma chuẩn trước, validate với anh trước khi code — không ra sản phẩm theo kiểu "làm xong mới xem".',
    painPoints: [
      { title: 'Đẹp trên desktop, vỡ layout trên mobile', description: '70% khách vào từ điện thoại nhưng web chỉ đẹp trên màn 1920px. Mobile lỗi — mất 70% khách ngay.' },
      { title: 'Load chậm, Core Web Vitals kém', description: 'Google không rank, khách không chờ. Website chậm 5 giây mất 50% khách — đã thoát trước khi xem nội dung.' },
      { title: 'Không có call-to-action rõ ràng', description: 'Khách vào xem xong thoát, không biết làm gì tiếp. Không có nút bấm rõ ràng, mất lead miễn phí.' },
    ],
    features: [
      { title: 'Thiết kế Figma', bullets: ['Wireframe → Mockup → Prototype trước khi code', 'Anh validate từng bước, không bất ngờ khi nghiệm thu', 'Component library tái sử dụng cho tương lai'], imageId: 'photo-1561070791-2526d30994b8' },
      { title: 'Mobile-first (375px+)', bullets: ['Thiết kế từ màn nhỏ nhất, scale up dần', 'Test trên iPhone SE đến iPad Pro', 'Touch target tối thiểu 44px chuẩn Apple'], imageId: 'photo-1512941937669-90a1b58e7e9c' },
      { title: 'Hiệu suất cao', bullets: ['Core Web Vitals xanh, LCP dưới 2.5s', 'Ảnh WebP, lazy load, CDN', 'Bundle JS tối ưu, không lib thừa'], imageId: 'photo-1518186285589-2f7649de83e0' },
      { title: 'SEO on-page', bullets: ['Heading structure chuẩn H1/H2/H3', 'Meta title, description, schema markup', 'Sitemap.xml + robots.txt tự sinh'], imageId: 'photo-1432888622747-4eb9a8efeb07' },
      { title: 'Tối ưu chuyển đổi', bullets: ['CTA primary nổi bật ở mọi section', 'Social proof, testimonial đúng vị trí', 'Form đơn giản, dưới 3 trường'], imageId: 'photo-1552664730-d307ca884978' },
      { title: 'Tích hợp sẵn sàng', bullets: ['CRM (HubSpot, Pancake, MKT Software)', 'Form, chat Zalo OA, Messenger', 'Google Analytics 4, Facebook Pixel'], imageId: 'photo-1611162616305-c69b3fa7fbe0' },
    ],
    testimonialQuote:
      'Thiết kế tốt không phải là màu sắc đẹp — là khách hàng biết phải làm gì tiếp theo sau 3 giây đầu vào trang. MKT Software thiết kế với mục tiêu kinh doanh, không phải giải thưởng.',
    testimonialName: 'Nguyễn Tú',
    testimonialRole: 'Khách hàng MKT Software',
  },
  {
    slug: 'website-landing-page-chuan-seo-tich-hop-crm-tu-dong-cham-soc-lead-tu-lan-click-dau-tien',
    heroTagline:
      'Website công ty và landing page quảng cáo có vai trò khác nhau — nhưng đều phải đưa khách hàng đến hành động cụ thể. MKT Software xây cả hai với nền tảng SEO kỹ thuật đúng và tích hợp CRM để không mất lead nào.',
    painPoints: [
      { title: 'Google không tìm thấy website', description: 'Thiếu schema markup, heading structure sai, sitemap chưa submit, ảnh không có alt — những thứ nhỏ này cộng lại khiến Google không hiểu website nói về gì. Rank thấp, traffic bằng 0.' },
      { title: 'Lead lạnh sau 1 tiếng không phản hồi', description: 'Form nhận thông tin nhưng chỉ gửi email thông báo. Nhân viên bận, email trôi — khách chờ 2 tiếng không có phản hồi là đã liên hệ đối thủ. Lead đắt tiền từ quảng cáo mất trắng.' },
      { title: 'Landing page không tối ưu cho từng chiến dịch', description: 'Dùng trang chủ làm landing page cho mọi chiến dịch. Khách từ quảng cáo spa thấy trang chủ tổng hợp — không liên quan, thoát ra ngay. CPC tăng vì chất lượng landing thấp.' },
    ],
    features: [
      { title: 'SEO kỹ thuật chuẩn', bullets: ['Schema markup, sitemap, canonical tag', 'Core Web Vitals xanh — nền móng để Google rank', 'Heading structure đúng, meta tag đầy đủ'], imageId: 'photo-1432888622747-4eb9a8efeb07' },
      { title: 'Landing page chuyên biệt', bullets: ['Mỗi chiến dịch một landing riêng', 'Thông điệp khớp quảng cáo, CTA rõ ràng', 'A/B test sẵn, không phải code lại'], imageId: 'photo-1460925895917-afdab827c52f' },
      { title: 'Tích hợp CRM', bullets: ['Form tự đẩy lead vào CRM', 'Gán sales, kích hoạt chuỗi chăm sóc tự động', 'Tích hợp với Pancake, HubSpot, MKT Software CRM'], imageId: 'photo-1551434678-e076c223a692' },
      { title: 'Tracking chuyển đổi', bullets: ['GA4, Facebook Pixel, Google Ads conversion', 'Biết chính xác landing nào sinh lead, CPA bao nhiêu', 'Funnel report từ click → form → đơn'], imageId: 'photo-1551288049-bebda4e38f71' },
      { title: 'Tốc độ tối ưu', bullets: ['LCP dưới 2.5s, TTFB thấp', 'Ảnh WebP, CDN, lazy load đúng cách', 'Bundle nhỏ, không lib thừa từ đầu'], imageId: 'photo-1518186285589-2f7649de83e0' },
      { title: 'A/B Testing', bullets: ['Test headline, CTA, layout', 'Tối ưu dần chứ không đoán mò conversion rate', 'Dashboard kết quả realtime'], imageId: 'photo-1454165804606-c3d57bc86b40' },
    ],
    testimonialQuote:
      'Landing page tốt nhất là trang không có lý do nào để thoát ra. MKT Software thiết kế từng element với câu hỏi: điều này giúp khách click CTA không? Nếu không — cắt.',
    testimonialName: 'Nguyễn Tú',
    testimonialRole: 'Khách hàng MKT Software',
  },
];

export async function patchServicesFromProd(postRepo: Repository<Post>) {
  let updated = 0;
  for (const patch of SERVICE_PATCHES) {
    const post = await postRepo.findOne({ where: { slug: patch.slug } });
    if (!post) {
      console.warn(`⚠️  Service "${patch.slug}" không tồn tại, bỏ qua`);
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfg: any = post.productPageConfig ?? {};

    // Override hero tagline (giữ nguyên các field hero khác)
    cfg.hero = { ...cfg.hero, tagline: patch.heroTagline };

    // Override painPoints
    cfg.painPoints = {
      ...cfg.painPoints,
      heading: cfg.painPoints?.heading ?? 'Vấn đề bạn đang gặp?',
      items: patch.painPoints.map((p) => ({ ...p, iconName: 'AlertTriangle' })),
    };

    // Override features kèm ảnh contextual mới
    cfg.features = {
      ...cfg.features,
      heading: cfg.features?.heading ?? '6 tính năng cốt lõi',
      items: patch.features.map((f) => ({
        title: f.title,
        bullets: f.bullets,
        imageSrc: UNSPLASH(f.imageId),
        imageAlt: f.title,
      })),
    };

    // Override testimonial với avatar Nguyễn Tú thống nhất
    cfg.testimonials = {
      heading: cfg.testimonials?.heading ?? 'Khách hàng nói gì',
      items: [
        {
          quote: patch.testimonialQuote,
          name: patch.testimonialName,
          role: patch.testimonialRole,
          avatarSrc: NGUYEN_TU_AVATAR,
        },
        ...(cfg.testimonials?.items?.slice(1) ?? []),
      ],
    };

    post.productPageConfig = cfg;
    await postRepo.save(post);
    updated++;
  }
  console.log(`✅ Patched ${updated} services with prod content`);
}
