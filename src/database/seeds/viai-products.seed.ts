import { Repository, In, Not } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { Post, PostStatus } from '../../entities/post.entity';

const UNSPLASH = (id: string, w = 1280, h = 720) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const MKT SOFTWARE_COMMITMENTS = {
  heading: 'MKT Software cam kết',
  items: [
    { iconName: 'Zap', title: 'Triển khai 4-8 tuần', description: 'Methodology chia nhỏ module, bàn giao cuốn chiếu. Có demo từng sprint.' },
    { iconName: 'HeartHandshake', title: 'Hỗ trợ 1-1', description: 'Hỗ trợ 1-1 trong suốt quá trình sử dụng phần mềm.' },
    { iconName: 'Wallet', title: 'Hoàn tiền 7 ngày', description: 'Hoàn tiền 100% trong 7 ngày đầu nếu sản phẩm không như mô tả, không hỏi lý do.' },
    { iconName: 'ShieldCheck', title: 'Bảo hành & update miễn phí', description: 'Bảo hành và update miễn phí trọn đời cho gói đã mua.' },
    { iconName: 'GraduationCap', title: 'Cầm tay chỉ việc', description: 'Đào tạo, cầm tay chỉ việc đến khi nhân viên của bạn thành thạo.' },
  ],
};

type ViAiProduct = {
  slug: string;
  title: string;
  shortName: string;
  excerpt: string;
  badge: string | null;
  displayOrder: number;
  menuGroupLabel: 'Kinh doanh & khách hàng' | 'Vận hành & quản trị';
  thumbnail: string;
  logoUrl: string;
  productPageConfig: object;
};

export const VIAI_PRODUCTS: ViAiProduct[] = [
  // ─── 1. ViAI Ads ─────────────────────────────────────────────────────────
  {
    slug: 'viai-ads',
    title: 'ViAI Ads — AI tự động chạy quảng cáo đa nền tảng',
    shortName: 'ViAI Ads',
    excerpt: 'AI Agent tự nghiên cứu audience, sinh creative và A/B test ngân sách quảng cáo Facebook, Google, TikTok, Zalo 24/7 — tối ưu ROAS không cần đội Media Buyer.',
    badge: 'Hot',
    displayOrder: 1,
    menuGroupLabel: 'Kinh doanh & khách hàng',
    thumbnail: UNSPLASH('photo-1551288049-bebda4e38f71'),
    logoUrl: UNSPLASH('photo-1611162617213-7d7a39e9b1d7', 200, 200),
    productPageConfig: {
      hero: {
        tagline: 'AI tự động chạy quảng cáo 24/7 — tối ưu ROAS không cần đội Media Buyer',
        statBig: '1.5x',
        statSub: 'ROAS trung bình sau 6 tuần triển khai',
        ctaPrimary: { text: 'Dùng thử 7 ngày miễn phí', href: '/lien-he' },
        ctaSecondary: { text: 'Xem demo', href: '#demo' },
        heroImageSrc: UNSPLASH('photo-1611162617213-7d7a39e9b1d7'),
        heroImageAlt: 'ViAI Ads dashboard',
      },
      trustStrip: { text: 'Đã có hàng trăm agency và shop ecommerce tin dùng' },
      painPoints: {
        heading: 'Bạn đang gặp những vấn đề này khi chạy ads?',
        items: [
          { iconName: 'Frown', title: 'ROAS giảm, CPL tăng mà không biết vì sao', description: 'Set ads xong nhưng performance không ổn định, phải canh sửa từng ngày.' },
          { iconName: 'Clock', title: 'Tốn 4-6h/ngày test creative', description: 'Media Buyer phải tự design, viết caption, đẩy lên platform thủ công.' },
          { iconName: 'DollarSign', title: 'Lương Media Buyer 15-30tr/tháng', description: 'Tuyển khó, giữ khó, làm 6 tháng nghỉ là phải đào tạo lại từ đầu.' },
          { iconName: 'AlertTriangle', title: 'Đốt ngân sách vào audience không hiệu quả', description: 'Test sai audience tốn vài chục triệu mới biết, không có cơ chế cảnh báo sớm.' },
          { iconName: 'Layers', title: 'Quản lý đa nền tảng cực mệt', description: 'Facebook + Google + TikTok + Zalo — mỗi platform 1 dashboard, đối soát thủ công.' },
          { iconName: 'BarChart', title: 'Không có insight để cải thiện', description: 'Báo cáo cuối tháng chỉ có số, không có khuyến nghị hành động cụ thể.' },
        ],
      },
      solutions: {
        heading: 'ViAI Ads giải quyết triệt để',
        items: [
          { iconName: 'CheckCircle', text: 'AI tự nghiên cứu audience theo sản phẩm + đối thủ' },
          { iconName: 'CheckCircle', text: 'Sinh creative đa định dạng (ảnh / carousel / video) trong vài phút' },
          { iconName: 'CheckCircle', text: 'A/B test hàng chục biến thể cùng lúc, tự kill kém' },
          { iconName: 'CheckCircle', text: 'Tối ưu ngân sách realtime theo khung giờ vàng' },
          { iconName: 'CheckCircle', text: 'Quản lý đồng bộ Facebook, Google, TikTok, Zalo Ads' },
          { iconName: 'CheckCircle', text: 'Báo cáo ROAS/CPL realtime kèm khuyến nghị AI' },
        ],
        ctaPrimary: { text: 'Trải nghiệm miễn phí', href: '/lien-he' },
        ctaSecondary: { text: 'Bảng giá', href: '#pricing' },
      },
      features: {
        heading: '6 tính năng cốt lõi',
        items: [
          {
            title: 'Tự nghiên cứu audience theo sản phẩm và đối thủ',
            bullets: [
              'AI phân tích landing page, sản phẩm, đối thủ trong ngành',
              'Đề xuất 5-10 nhóm audience phù hợp với từng campaign',
              'Tự refine audience theo dữ liệu conversion thật',
            ],
            imageSrc: UNSPLASH('photo-1551288049-bebda4e38f71'),
            imageAlt: 'Audience research',
          },
          {
            title: 'Sinh creative đa định dạng tự động',
            bullets: [
              'AI viết headline, caption, CTA theo brand voice',
              'Tạo ảnh quảng cáo, carousel, video ngắn từ ảnh sản phẩm',
              'Tự nhân bản 20-50 biến thể từ 1 brief',
            ],
            imageSrc: UNSPLASH('photo-1460925895917-afdab827c52f'),
            imageAlt: 'Creative generation',
          },
          {
            title: 'A/B test đến 50 biến thể song song',
            bullets: [
              'Test đồng thời nhiều creative, audience, placement',
              'Tự kill biến thể CPL cao, scale biến thể CPL thấp',
              'Học từ data trong 24-48h, không phải chờ tuần',
            ],
            imageSrc: UNSPLASH('photo-1454165804606-c3d57bc86b40'),
            imageAlt: 'A/B testing',
          },
          {
            title: 'Tối ưu ngân sách theo khung giờ vàng',
            bullets: [
              'AI phát hiện khung giờ ROAS cao nhất từng vùng',
              'Tự bid nhiều giờ peak, giảm bid giờ thấp',
              'Tối ưu cho mỗi vùng địa lý riêng',
            ],
            imageSrc: UNSPLASH('photo-1518186285589-2f7649de83e0'),
            imageAlt: 'Budget optimization',
          },
          {
            title: 'Quản lý 4 nền tảng trong 1 dashboard',
            bullets: [
              'Facebook Ads, Google Ads, TikTok Ads, Zalo Ads',
              'Đồng bộ data, đối soát chi phí tự động',
              'So sánh hiệu suất giữa các kênh realtime',
            ],
            imageSrc: UNSPLASH('photo-1611162616305-c69b3fa7fbe0'),
            imageAlt: 'Multi-platform dashboard',
          },
          {
            title: 'Báo cáo realtime kèm insight AI',
            bullets: [
              'Dashboard ROAS, CPL, CPA, ROI cập nhật mỗi giờ',
              'AI cảnh báo bất thường + đề xuất hành động cụ thể',
              'Export PDF gửi khách hàng / sếp tự động',
            ],
            imageSrc: UNSPLASH('photo-1551288049-bebda4e38f71'),
            imageAlt: 'AI reporting',
          },
        ],
      },
      pricing: {
        heading: 'Bảng giá ViAI Ads',
        description: 'Giảm 40% cho khách hàng đăng ký trong tháng',
        plans: [
          {
            name: 'Starter',
            subtitle: 'Shop ecom mới, ngân sách <50tr/tháng',
            originalPrice: '1.990.000đ',
            price: '1.190.000đ',
            period: '/tháng',
            features: [
              '1 nền tảng (Facebook hoặc Google)',
              'Tối đa 20 creative A/B test/tháng',
              '5 audience tự nghiên cứu',
              'Báo cáo realtime cơ bản',
              'Hỗ trợ email',
            ],
            ctaText: 'Bắt đầu',
            ctaHref: '/lien-he',
          },
          {
            name: 'Pro',
            subtitle: 'Agency 5-30 KH, shop ecom 500tr-3 tỷ/tháng',
            originalPrice: '4.990.000đ',
            price: '2.990.000đ',
            period: '/tháng',
            badge: 'Phổ biến',
            featured: true,
            features: [
              '4 nền tảng: Facebook, Google, TikTok, Zalo',
              'Tối đa 50 creative A/B test/tháng',
              'Audience không giới hạn',
              'Báo cáo realtime + insight AI',
              'Hỗ trợ 1-1 Slack/Zalo',
              'Cam kết tăng ROAS 2.5x trong 60 ngày',
            ],
            ctaText: 'Đặt lịch tư vấn',
            ctaHref: '/lien-he',
          },
          {
            name: 'Enterprise',
            subtitle: 'Brand 3+ tỷ ngân sách/tháng, agency 30+ KH',
            originalPrice: '14.990.000đ',
            price: '8.990.000đ',
            period: '/tháng',
            features: [
              'Không giới hạn nền tảng + creative',
              'AI model fine-tune riêng theo ngành',
              'Strategist 1-1 hỗ trợ chiến lược',
              'API + tích hợp BI tool nội bộ',
              'SLA response 1h',
              'Đào tạo nội bộ + workshop',
            ],
            ctaText: 'Liên hệ',
            ctaHref: '/lien-he',
          },
        ],
      },
      testimonials: {
        heading: 'Khách hàng nói gì',
        items: [
          {
            quote: 'Sau 6 tuần triển khai ViAI Ads, ROAS chuỗi cửa hàng tăng từ 2.1 lên 3.4. Tiết kiệm hẳn 1 vị trí Media Buyer.',
            name: 'Nguyễn Minh Tâm',
            role: 'CEO chuỗi mỹ phẩm Pure Beauty',
            avatarSrc: UNSPLASH('photo-1573497019940-1c28c88b4f3e', 200, 200),
          },
          {
            quote: 'Quản lý 4 platform cùng lúc không còn là cơn ác mộng. Insight AI gợi ý kill audience kém rất chính xác.',
            name: 'Trần Văn Hùng',
            role: 'Head of Performance, Agency BlueWave',
            avatarSrc: UNSPLASH('photo-1560250097-0b93528c311a', 200, 200),
          },
        ],
      },
      faq: {
        heading: 'Câu hỏi thường gặp',
        items: [
          { q: 'ViAI Ads có thay thế hoàn toàn Media Buyer không?', a: 'Không. ViAI xử lý 80% việc lặp lại (research, tạo creative, A/B test, tối ưu bid). Media Buyer vẫn cần để định hướng chiến lược + xử lý case đặc biệt. Thực tế: 1 Media Buyer dùng ViAI = sức 4-5 người trước đây.' },
          { q: 'Có hỗ trợ ngành đặc thù như BĐS, ô tô không?', a: 'Có. Pro+ có thể fine-tune AI theo ngành cụ thể. Enterprise có riêng AI model train trên dữ liệu doanh nghiệp.' },
          { q: 'Cam kết ROAS 2.5x có điều kiện gì?', a: 'Áp dụng gói Pro+, ngân sách tối thiểu 100tr/tháng, sản phẩm có market fit, vận hành ≥60 ngày liên tục. Không đạt → miễn phí tháng tiếp theo.' },
          { q: 'Dữ liệu campaign có an toàn không?', a: 'Mã hoá AES-256, lưu tại Vietnam Data Center, tuân thủ PDPA. Không chia sẻ data giữa các khách hàng.' },
        ],
      },
      finalCta: {
        heading: 'Sẵn sàng tăng ROAS gấp 1.5-2.5 lần?',
        description: 'Dùng thử 7 ngày miễn phí, không cần thẻ tín dụng. Hoàn tiền 100% nếu không hài lòng.',
        ctaText: 'Đăng ký dùng thử',
        ctaHref: '/lien-he',
      },
      stickyBottom: {
        enabled: true,
        priceLabel: 'Từ 1.190.000đ/tháng',
        ctaPrimaryText: 'Đặt lịch tư vấn',
        ctaPrimaryHref: '/lien-he',
        ctaSecondaryText: 'Dùng thử miễn phí',
        ctaSecondaryHref: '/lien-he',
      },
    },
  },

  // ─── 2. ViAI CSKH ────────────────────────────────────────────────────────
  {
    slug: 'viai-cskh',
    title: 'ViAI CSKH — Chatbot AI chăm sóc khách hàng 24/7',
    shortName: 'ViAI CSKH',
    excerpt: 'Trợ lý ảo AI trả lời khách Facebook inbox, Zalo OA, chat website dưới 30 giây — học tài liệu sản phẩm của bạn, tone giọng theo brand, không bao giờ nghỉ.',
    badge: 'Phổ biến',
    displayOrder: 2,
    menuGroupLabel: 'Kinh doanh & khách hàng',
    thumbnail: UNSPLASH('photo-1556745757-8d76bdb6984b'),
    logoUrl: UNSPLASH('photo-1531746790731-6c087fecd65a', 200, 200),
    productPageConfig: {
      hero: {
        tagline: 'Trợ lý ảo trả lời khách hàng dưới 30 giây — hoạt động không ngừng nghỉ',
        statBig: '<30s',
        statSub: 'Thời gian phản hồi trung bình',
        ctaPrimary: { text: 'Dùng thử miễn phí', href: '/lien-he' },
        ctaSecondary: { text: 'Xem demo', href: '#demo' },
        heroImageSrc: UNSPLASH('photo-1556745757-8d76bdb6984b'),
        heroImageAlt: 'ViAI CSKH chatbot',
      },
      trustStrip: { text: 'Đã có hàng trăm shop online, spa, F&B sử dụng' },
      painPoints: {
        heading: 'Bạn có đang gặp những vấn đề này?',
        items: [
          { iconName: 'Moon', title: 'Khách inbox 10h tối — không ai trả lời', description: 'Mất 30-40% khách hàng vì phản hồi chậm ngoài giờ hành chính.' },
          { iconName: 'Users', title: 'Tuyển 3-5 nhân viên CSKH lương 8-15tr/tháng', description: 'Chi phí cao, làm 6 tháng nghỉ phải đào tạo lại.' },
          { iconName: 'Frown', title: 'Nhân viên trả lời thiếu nhất quán', description: 'Mỗi người tone giọng khác, thông tin sai lệch giữa các ca.' },
          { iconName: 'Repeat', title: 'Lặp đi lặp lại 80% câu hỏi giống nhau', description: 'Giá bao nhiêu, ship mấy ngày, có hàng size M không... mệt mỏi.' },
          { iconName: 'AlertTriangle', title: 'Bỏ sót khách có ý định mua', description: 'Khách hỏi mua mà inbox đè lên 50 tin spam, nhân viên không thấy.' },
          { iconName: 'BarChart', title: 'Không có data để cải thiện', description: 'Không biết khách thường hỏi gì, sản phẩm nào hot, ai chốt được.' },
        ],
      },
      solutions: {
        heading: 'ViAI CSKH giải quyết hết',
        items: [
          { iconName: 'CheckCircle', text: 'Học tài liệu sản phẩm + chính sách của bạn' },
          { iconName: 'CheckCircle', text: 'Trả lời Facebook inbox, Zalo OA, chat website đồng nhất' },
          { iconName: 'CheckCircle', text: 'Tone giọng tuỳ chỉnh theo brand (friendly / professional)' },
          { iconName: 'CheckCircle', text: 'Tự nhận ý định mua, chuyển nhân viên kịp thời' },
          { iconName: 'CheckCircle', text: 'Đồng bộ CRM Pancake, Haravan, Sapo, KiotViet' },
          { iconName: 'CheckCircle', text: 'Báo cáo response time, conversion, top câu hỏi' },
        ],
        ctaPrimary: { text: 'Trải nghiệm miễn phí', href: '/lien-he' },
        ctaSecondary: { text: 'Bảng giá', href: '#pricing' },
      },
      features: {
        heading: '6 tính năng cốt lõi',
        items: [
          {
            title: 'Học tài liệu sản phẩm + chính sách của bạn',
            bullets: [
              'Upload PDF, Word, Google Doc — AI tự học',
              'Cập nhật chính sách → AI biết ngay, không lag',
              'Trả lời chính xác thông tin riêng của doanh nghiệp',
            ],
            imageSrc: UNSPLASH('photo-1581291518857-4e27b48ff24e'),
            imageAlt: 'Knowledge training',
          },
          {
            title: 'Trả lời đa kênh: FB, Zalo OA, chat website',
            bullets: [
              'Tích hợp Facebook Messenger, Zalo OA, website chat',
              'Đồng bộ lịch sử conversation giữa các kênh',
              'Khách nhắn Zalo → chuyển sang FB vẫn liền mạch',
            ],
            imageSrc: UNSPLASH('photo-1611162617474-5b21e879e113'),
            imageAlt: 'Multi-channel',
          },
          {
            title: 'Tone giọng theo brand (friendly, professional, fun)',
            bullets: [
              'Cấu hình tone trong 5 phút — friendly / formal / fun',
              'AI giữ giọng nhất quán mọi conversation',
              'Theo style sản phẩm: spa thì dịu dàng, gym thì máu lửa',
            ],
            imageSrc: UNSPLASH('photo-1560250097-0b93528c311a'),
            imageAlt: 'Brand tone',
          },
          {
            title: 'Tự nhận ý định mua hàng — chuyển nhân viên ngay',
            bullets: [
              'AI phát hiện khách đang muốn chốt đơn',
              'Tag conversation "hot lead" + ping nhân viên',
              'Nhân viên jump vào trong 1 phút, chốt đơn ngay',
            ],
            imageSrc: UNSPLASH('photo-1556745753-b2904692b3cd'),
            imageAlt: 'Intent detection',
          },
          {
            title: 'Đồng bộ CRM phổ biến',
            bullets: [
              'Tích hợp Pancake, Haravan, Sapo, KiotViet, Misa',
              'Tự lưu thông tin khách vào CRM',
              'Tag khách + lịch sử conversation',
            ],
            imageSrc: UNSPLASH('photo-1551288049-bebda4e38f71'),
            imageAlt: 'CRM integration',
          },
          {
            title: 'Báo cáo response time + top câu hỏi',
            bullets: [
              'Dashboard response time realtime',
              'Top 20 câu hỏi để cải thiện content marketing',
              'Conversion rate từng kênh, từng sản phẩm',
            ],
            imageSrc: UNSPLASH('photo-1460925895917-afdab827c52f'),
            imageAlt: 'Analytics reporting',
          },
        ],
      },
      pricing: {
        heading: 'Bảng giá ViAI CSKH',
        description: 'Giảm 40% cho khách đăng ký tháng này',
        plans: [
          {
            name: 'Starter',
            subtitle: 'Shop online <50 đơn/ngày',
            originalPrice: '890.000đ',
            price: '490.000đ',
            period: '/tháng',
            features: [
              '1.000 tin nhắn/tháng',
              '2 kênh (FB + Zalo OA hoặc website)',
              'Tone giọng cơ bản',
              'Báo cáo cơ bản',
              'Hỗ trợ email',
            ],
            ctaText: 'Bắt đầu',
            ctaHref: '/lien-he',
          },
          {
            name: 'Pro',
            subtitle: 'Shop 50-500 đơn/ngày, spa/clinic, F&B chuỗi',
            originalPrice: '1.990.000đ',
            price: '1.190.000đ',
            period: '/tháng',
            badge: 'Phổ biến',
            featured: true,
            features: [
              '10.000 tin nhắn/tháng',
              '5 kênh (FB + Zalo + website + 2 thêm)',
              'Tích hợp Pancake / Haravan / Sapo / KiotViet',
              'Tone giọng tuỳ chỉnh + intent detection',
              'Báo cáo nâng cao + insight AI',
              'Cam kết response <30s',
            ],
            ctaText: 'Đặt lịch tư vấn',
            ctaHref: '/lien-he',
          },
          {
            name: 'Enterprise',
            subtitle: 'Tập đoàn 5+ thương hiệu, chuỗi 20+ điểm bán',
            originalPrice: '5.490.000đ',
            price: '3.290.000đ',
            period: '/tháng',
            features: [
              'Tin nhắn không giới hạn',
              'Voice AI cho tổng đài hotline',
              'Fine-tune LLM theo dữ liệu doanh nghiệp',
              'API + SDK tích hợp tuỳ chỉnh',
              'SLA response 1h',
              'Đào tạo + workshop định kỳ',
            ],
            ctaText: 'Liên hệ',
            ctaHref: '/lien-he',
          },
        ],
      },
      testimonials: {
        heading: 'Khách hàng nói gì',
        items: [
          {
            quote: 'Chuỗi spa của em đang dùng ViAI CSKH 2 tháng. Tỉ lệ chốt lịch tăng 35%, không phải thuê thêm lễ tân ca tối.',
            name: 'Lê Thị Hà',
            role: 'Founder Saigon Spa Chain',
            avatarSrc: UNSPLASH('photo-1580894732444-8ecded7900cd', 200, 200),
          },
          {
            quote: 'Shop em bán hàng livestream, đỉnh điểm 500 inbox/giờ. ViAI handle hết, em chỉ cần lo đơn quan trọng.',
            name: 'Phạm Minh Thư',
            role: 'Chủ shop thời trang TikTok',
            avatarSrc: UNSPLASH('photo-1573496359142-b8d87734a5a2', 200, 200),
          },
        ],
      },
      faq: {
        heading: 'Câu hỏi thường gặp',
        items: [
          { q: 'AI trả lời có tự nhiên không hay máy móc?', a: 'Rất tự nhiên. ViAI dùng LLM hiểu ngữ cảnh tiếng Việt, có thể trêu, đùa, expressive theo tone brand. Khách thường không phân biệt được với người thật.' },
          { q: 'Bao lâu setup xong?', a: 'Starter 30 phút, Pro 1-2 ngày (cần train tài liệu), Enterprise 1-2 tuần (custom workflow).' },
          { q: 'Có hỗ trợ ngôn ngữ khác ngoài tiếng Việt?', a: 'Có. Pro+ hỗ trợ tiếng Anh. Enterprise thêm Nhật, Hàn, Trung. Phù hợp shop bán xuyên biên giới.' },
          { q: 'Khách yêu cầu nói chuyện với người thật thì sao?', a: 'AI tự nhận diện, gắn tag "cần người thật", ping nhân viên qua Slack/Zalo/Email. Nhân viên có thể jump vào trong vòng 1-2 phút.' },
          { q: 'Có cam kết SLA không?', a: 'Pro+ cam kết response time <30s 95% conversation. Vượt → tự động giảm 20% hoá đơn tháng đó.' },
        ],
      },
      finalCta: {
        heading: 'Để AI chăm khách hàng — bạn lo việc lớn',
        description: 'Dùng thử 7 ngày miễn phí. Không cần thẻ tín dụng, không cần cam kết.',
        ctaText: 'Đăng ký dùng thử',
        ctaHref: '/lien-he',
      },
      stickyBottom: {
        enabled: true,
        priceLabel: 'Từ 490.000đ/tháng',
        ctaPrimaryText: 'Đặt lịch tư vấn',
        ctaPrimaryHref: '/lien-he',
        ctaSecondaryText: 'Dùng thử miễn phí',
        ctaSecondaryHref: '/lien-he',
      },
    },
  },

  // ─── 3. ViAI Video ───────────────────────────────────────────────────────
  {
    slug: 'viai-video',
    title: 'ViAI Video — AI sản xuất video TikTok/Reels số lượng lớn',
    shortName: 'ViAI Video',
    excerpt: 'AI tự viết script, voiceover tiếng Việt 20+ giọng, ghép B-roll & subtitle — sản xuất 100 video/tháng với chi phí 1 video thuê agency.',
    badge: 'Mới',
    displayOrder: 3,
    menuGroupLabel: 'Vận hành & quản trị',
    thumbnail: UNSPLASH('photo-1611162617474-5b21e879e113'),
    logoUrl: UNSPLASH('photo-1574717024653-61fd2cf4d44d', 200, 200),
    productPageConfig: {
      hero: {
        tagline: 'Sản xuất video TikTok/Reels số lượng lớn — voiceover Việt tự nhiên',
        statBig: '5x',
        statSub: 'Engagement TikTok trung bình sau 3 tháng',
        ctaPrimary: { text: 'Dùng thử miễn phí', href: '/lien-he' },
        ctaSecondary: { text: 'Xem demo', href: '#demo' },
        heroImageSrc: UNSPLASH('photo-1611162617474-5b21e879e113'),
        heroImageAlt: 'ViAI Video',
      },
      trustStrip: { text: 'Hàng chục thương hiệu F&B, mỹ phẩm, KOL tin dùng' },
      painPoints: {
        heading: 'Bạn đang gặp những vấn đề này khi làm video?',
        items: [
          { iconName: 'Clock', title: 'Mỗi video tốn 4-8h editor', description: 'Quay → cắt → ghép B-roll → voiceover → subtitle — chuỗi việc nhàm chán.' },
          { iconName: 'DollarSign', title: 'Thuê agency 5-15tr/video', description: 'Muốn 30 video/tháng = đốt 150-450tr, ROI âm với SME.' },
          { iconName: 'Mic', title: 'Voiceover Việt cứng, AI nghe biết liền', description: 'Voice máy móc khiến content mất cảm xúc, engagement thấp.' },
          { iconName: 'Layers', title: 'Brand kit không đồng nhất', description: 'Mỗi editor làm khác nhau, brand identity loạn.' },
          { iconName: 'TrendingDown', title: 'Engagement TikTok thấp', description: 'Post đều mà view < 1k, không hiểu vì sao.' },
          { iconName: 'Calendar', title: 'Không kịp tốc độ trend', description: 'Trend chỉ sống 3-5 ngày, làm video kịp ngày 4 thì trend chết.' },
        ],
      },
      solutions: {
        heading: 'ViAI Video giải quyết',
        items: [
          { iconName: 'CheckCircle', text: 'AI viết script theo công thức hook-build-payoff-CTA' },
          { iconName: 'CheckCircle', text: 'Voiceover Việt 20+ giọng tự nhiên 3 miền Bắc/Trung/Nam' },
          { iconName: 'CheckCircle', text: 'Tự ghép B-roll, transition, subtitle, sticker' },
          { iconName: 'CheckCircle', text: 'Xuất đa tỷ lệ 9:16, 1:1, 16:9' },
          { iconName: 'CheckCircle', text: 'Brand kit tự áp logo, intro, outro nhất quán' },
          { iconName: 'CheckCircle', text: 'Lên lịch đăng trực tiếp TikTok/Reels/Shorts' },
        ],
        ctaPrimary: { text: 'Trải nghiệm miễn phí', href: '/lien-he' },
        ctaSecondary: { text: 'Bảng giá', href: '#pricing' },
      },
      features: {
        heading: '6 tính năng cốt lõi',
        items: [
          {
            title: 'Tự viết script video chuẩn TikTok',
            bullets: [
              'AI viết theo công thức hook 3s → build → payoff → CTA',
              'Nhận topic + sản phẩm → ra 10 script trong vài phút',
              'Tối ưu theo trend đang hot trong ngành',
            ],
            imageSrc: UNSPLASH('photo-1611162616305-c69b3fa7fbe0'),
            imageAlt: 'Script generation',
          },
          {
            title: 'Voiceover tiếng Việt 20+ giọng tự nhiên',
            bullets: [
              'Giọng nam/nữ 3 miền Bắc/Trung/Nam',
              'Tone: trẻ trung, chuyên nghiệp, kể chuyện, hài hước',
              'Tự nhiên đến mức qua test mù với người thật 4.5/5',
            ],
            imageSrc: UNSPLASH('photo-1581291518857-4e27b48ff24e'),
            imageAlt: 'AI voiceover',
          },
          {
            title: 'Tự ghép B-roll, transition, subtitle',
            bullets: [
              'AI chọn B-roll phù hợp script',
              'Transition mượt theo nhịp voiceover',
              'Subtitle Việt chuẩn chính tả, animate đẹp',
            ],
            imageSrc: UNSPLASH('photo-1574717024653-61fd2cf4d44d'),
            imageAlt: 'Video editing',
          },
          {
            title: 'Xuất video đa tỷ lệ',
            bullets: [
              'Dọc 9:16 cho TikTok, Reels, Shorts',
              'Vuông 1:1 cho Facebook, Instagram feed',
              'Ngang 16:9 cho YouTube',
            ],
            imageSrc: UNSPLASH('photo-1611162616475-46b635cb6868'),
            imageAlt: 'Multi-aspect',
          },
          {
            title: 'Brand kit tự áp logo, intro, outro',
            bullets: [
              'Upload logo + màu brand 1 lần',
              'Mọi video tự áp logo góc trên/dưới',
              'Intro + outro nhất quán trên mọi video',
            ],
            imageSrc: UNSPLASH('photo-1611162617213-7d7a39e9b1d7'),
            imageAlt: 'Brand kit',
          },
          {
            title: 'Lên lịch đăng tự động đa nền tảng',
            bullets: [
              'Schedule TikTok, Reels, Shorts cùng lúc',
              'AI gợi ý giờ vàng theo ngành',
              'Auto-caption + hashtag tối ưu cho mỗi nền tảng',
            ],
            imageSrc: UNSPLASH('photo-1611162617213-7d7a39e9b1d7'),
            imageAlt: 'Scheduling',
          },
        ],
      },
      pricing: {
        heading: 'Bảng giá ViAI Video',
        description: 'Giảm 40% cho khách đăng ký tháng này',
        plans: [
          {
            name: 'Starter',
            subtitle: 'Shop online, personal brand mới',
            originalPrice: '1.490.000đ',
            price: '890.000đ',
            period: '/tháng',
            features: [
              '30 video/tháng',
              '5 giọng voiceover',
              '1 kênh đăng (TikTok hoặc Reels)',
              'Brand kit cơ bản',
              'Hỗ trợ email',
            ],
            ctaText: 'Bắt đầu',
            ctaHref: '/lien-he',
          },
          {
            name: 'Pro',
            subtitle: 'Thương hiệu F&B / mỹ phẩm, agency video',
            originalPrice: '3.990.000đ',
            price: '2.390.000đ',
            period: '/tháng',
            badge: 'Phổ biến',
            featured: true,
            features: [
              '100 video/tháng',
              '20+ giọng Bắc/Trung/Nam',
              '5 kênh đăng đồng thời',
              'Brand kit nâng cao + template',
              'Schedule + auto-post',
              'Cam kết voiceover 4.5/5',
            ],
            ctaText: 'Đặt lịch tư vấn',
            ctaHref: '/lien-he',
          },
          {
            name: 'Enterprise',
            subtitle: 'Tập đoàn FMCG, mỹ phẩm chuỗi 20+ chi nhánh',
            originalPrice: '9.990.000đ',
            price: '5.990.000đ',
            period: '/tháng',
            features: [
              'Video không giới hạn',
              'Custom voice cho brand riêng',
              'API + tích hợp Adobe Premiere / DaVinci',
              'Workflow tuỳ chỉnh',
              'SLA 1h',
              'Đào tạo + workshop',
            ],
            ctaText: 'Liên hệ',
            ctaHref: '/lien-he',
          },
        ],
      },
      testimonials: {
        heading: 'Khách hàng nói gì',
        items: [
          {
            quote: 'Trước em thuê editor freelance 7tr/tháng làm 15 video. Giờ dùng ViAI Video làm 100 video, chất lượng đều hơn, view tăng 4x.',
            name: 'Nguyễn Thị Mai',
            role: 'Founder thương hiệu mỹ phẩm Bare Skin',
            avatarSrc: UNSPLASH('photo-1580894732444-8ecded7900cd', 200, 200),
          },
          {
            quote: 'Agency mình quản 20 thương hiệu F&B. ViAI Video cứu sống cả team, không phải thức đêm cắt video nữa.',
            name: 'Trần Hoàng Long',
            role: 'CEO Agency CookMedia',
            avatarSrc: UNSPLASH('photo-1519085360753-af0119f7cbe7', 200, 200),
          },
        ],
      },
      faq: {
        heading: 'Câu hỏi thường gặp',
        items: [
          { q: 'Voiceover AI có nghe ra là máy không?', a: 'Trong test mù với người thật, voiceover ViAI Việt đạt 4.5/5 — phần lớn không phân biệt được với người. Pro+ có 20+ giọng để chọn.' },
          { q: 'Video AI có vi phạm bản quyền nhạc/ảnh không?', a: 'Không. B-roll dùng từ thư viện stock có license thương mại. Nhạc nền dùng track AI tự sinh, không vi phạm.' },
          { q: 'Có hỗ trợ ngành đặc thù như giáo dục, BĐS không?', a: 'Có. Pro+ có template + tone phù hợp từng ngành. Enterprise có thể custom voice brand.' },
          { q: 'Mất bao lâu render 1 video?', a: 'Trung bình 2-5 phút/video tuỳ độ phức tạp. Render đồng thời nhiều video song song.' },
          { q: 'Có cam kết chất lượng voice không?', a: 'Pro+ cam kết voice 4.5/5 qua test mù. Không đạt → đổi giọng miễn phí + hoàn tiền nếu vẫn không hài lòng.' },
        ],
      },
      finalCta: {
        heading: 'Đừng thuê 5 editor — hãy có ViAI Video',
        description: 'Dùng thử 7 ngày miễn phí. Sản xuất ngay 10 video đầu tiên để cảm nhận khác biệt.',
        ctaText: 'Đăng ký dùng thử',
        ctaHref: '/lien-he',
      },
      stickyBottom: {
        enabled: true,
        priceLabel: 'Từ 890.000đ/tháng',
        ctaPrimaryText: 'Đặt lịch tư vấn',
        ctaPrimaryHref: '/lien-he',
        ctaSecondaryText: 'Dùng thử miễn phí',
        ctaSecondaryHref: '/lien-he',
      },
    },
  },

  // ─── 4. ViAI SEO ─────────────────────────────────────────────────────────
  {
    slug: 'viai-seo',
    title: 'ViAI SEO — AI viết bài chuẩn SEO và đăng web tự động',
    shortName: 'ViAI SEO',
    excerpt: 'Research từ khoá, viết bài long-form 2000-4000 từ chuẩn EEAT, đăng tự động lên WordPress/Webflow — phủ Google không cần thuê content team.',
    badge: 'Hot',
    displayOrder: 4,
    menuGroupLabel: 'Vận hành & quản trị',
    thumbnail: UNSPLASH('photo-1432888622747-4eb9a8efeb07'),
    logoUrl: UNSPLASH('photo-1432888622747-4eb9a8efeb07', 200, 200),
    productPageConfig: {
      hero: {
        tagline: 'Tự viết bài SEO chuẩn EEAT và đăng web — phủ Google không cần thuê content team',
        statBig: '+340%',
        statSub: 'Organic traffic trung bình sau 6 tháng',
        ctaPrimary: { text: 'Dùng thử miễn phí', href: '/lien-he' },
        ctaSecondary: { text: 'Xem demo', href: '#demo' },
        heroImageSrc: UNSPLASH('photo-1432888622747-4eb9a8efeb07'),
        heroImageAlt: 'ViAI SEO',
      },
      trustStrip: { text: 'Hàng chục agency SEO + SME B2B tin dùng' },
      painPoints: {
        heading: 'Bạn có gặp những vấn đề này?',
        items: [
          { iconName: 'PenTool', title: 'Thuê content writer 8-15tr/tháng', description: 'Viết được 8-12 bài/tháng, chất lượng không ổn định.' },
          { iconName: 'Clock', title: 'Mỗi bài 4-6h từ research đến đăng', description: 'Research keyword → viết → SEO → đăng — chuỗi việc lặp lại.' },
          { iconName: 'TrendingDown', title: 'Bài viết không lên top Google', description: 'Viết hay mà không tối ưu SEO, traffic chỉ vài lượt/tháng.' },
          { iconName: 'AlertTriangle', title: 'Lo bị Google phạt vì AI content', description: 'Dùng ChatGPT thô viết bài → Google nhận ra → mất ranking.' },
          { iconName: 'Layers', title: 'Phải maintain 5-10 website cùng lúc', description: 'Mỗi web 1 dashboard WP, đăng thủ công cực mệt.' },
          { iconName: 'BarChart', title: 'Không có dashboard tracking ranking', description: 'Không biết keyword nào lên, keyword nào tụt.' },
        ],
      },
      solutions: {
        heading: 'ViAI SEO xử lý tất cả',
        items: [
          { iconName: 'CheckCircle', text: 'AI research từ khoá theo ngành và đối thủ tự động' },
          { iconName: 'CheckCircle', text: 'Viết bài long-form 2000-4000 từ chuẩn SEO + EEAT 2026' },
          { iconName: 'CheckCircle', text: 'Tự sinh meta title, description, schema markup' },
          { iconName: 'CheckCircle', text: 'Tự đăng lên WordPress / Webflow / Ghost qua API' },
          { iconName: 'CheckCircle', text: 'Cluster content theo intent và topic' },
          { iconName: 'CheckCircle', text: 'Báo cáo organic traffic và keyword ranking realtime' },
        ],
        ctaPrimary: { text: 'Trải nghiệm miễn phí', href: '/lien-he' },
        ctaSecondary: { text: 'Bảng giá', href: '#pricing' },
      },
      features: {
        heading: '6 tính năng cốt lõi',
        items: [
          {
            title: 'Research từ khoá tự động theo ngành',
            bullets: [
              'AI phân tích đối thủ top 10 cho từng ngành',
              'Đề xuất 50-100 từ khoá phù hợp + search intent',
              'Tự update khi trend thay đổi',
            ],
            imageSrc: UNSPLASH('photo-1432888622747-4eb9a8efeb07'),
            imageAlt: 'Keyword research',
          },
          {
            title: 'Viết bài long-form 2000-4000 từ chuẩn SEO + EEAT',
            bullets: [
              'Tuân thủ EEAT (Experience, Expertise, Authority, Trust) 2026',
              'Tối ưu density keyword, internal/external links',
              'Tránh nội dung AI thô — viết tự nhiên qua test detector',
            ],
            imageSrc: UNSPLASH('photo-1432888622747-4eb9a8efeb07'),
            imageAlt: 'Long-form writing',
          },
          {
            title: 'Tự sinh meta title, description, schema',
            bullets: [
              'Meta title 60 ký tự tối ưu CTR',
              'Description hấp dẫn, có call-to-action',
              'Schema markup: Article, FAQ, HowTo tự động',
            ],
            imageSrc: UNSPLASH('photo-1551288049-bebda4e38f71'),
            imageAlt: 'Meta + schema',
          },
          {
            title: 'Đăng tự động WordPress / Webflow / Ghost',
            bullets: [
              'Tích hợp API native với 3 nền tảng phổ biến',
              'Tự upload featured image phù hợp content',
              'Set category, tag, schedule đăng',
            ],
            imageSrc: UNSPLASH('photo-1460925895917-afdab827c52f'),
            imageAlt: 'Auto-publish',
          },
          {
            title: 'Cluster content theo intent + topic',
            bullets: [
              'Tự nhóm bài theo topic cluster strategy',
              'Internal link tự động giữa bài liên quan',
              'Pillar page + supporting articles',
            ],
            imageSrc: UNSPLASH('photo-1454165804606-c3d57bc86b40'),
            imageAlt: 'Content cluster',
          },
          {
            title: 'Báo cáo organic traffic + keyword ranking realtime',
            bullets: [
              'Track ranking từng keyword theo từng vùng',
              'Cảnh báo bài tụt rank, gợi ý cải thiện',
              'Compare với đối thủ',
            ],
            imageSrc: UNSPLASH('photo-1551288049-bebda4e38f71'),
            imageAlt: 'Ranking reports',
          },
        ],
      },
      pricing: {
        heading: 'Bảng giá ViAI SEO',
        description: 'Giảm 40% cho khách đăng ký tháng này',
        plans: [
          {
            name: 'Starter',
            subtitle: 'Freelancer, shop online <500 traffic/tháng',
            originalPrice: '990.000đ',
            price: '590.000đ',
            period: '/tháng',
            features: [
              '10 bài long-form/tháng',
              '1 website',
              'Research từ khoá cơ bản',
              'Auto-post WordPress',
              'Hỗ trợ email',
            ],
            ctaText: 'Bắt đầu',
            ctaHref: '/lien-he',
          },
          {
            name: 'Pro',
            subtitle: 'Agency 3-10 KH, thương hiệu 5+ website',
            originalPrice: '2.490.000đ',
            price: '1.490.000đ',
            period: '/tháng',
            badge: 'Phổ biến',
            featured: true,
            features: [
              '50 bài/tháng',
              '5 website',
              'Cluster content nâng cao',
              'Đa nền tảng: WP, Webflow, Ghost',
              'Báo cáo ranking realtime',
              'Cam kết top 10 Google sau 90 ngày',
            ],
            ctaText: 'Đặt lịch tư vấn',
            ctaHref: '/lien-he',
          },
          {
            name: 'Enterprise',
            subtitle: 'Tập đoàn đa thương hiệu, agency 30+ KH',
            originalPrice: '6.490.000đ',
            price: '3.990.000đ',
            period: '/tháng',
            features: [
              'Bài + website không giới hạn',
              'AI custom theo ngành',
              'White-label cho agency',
              'Train model riêng',
              'API + workflow tuỳ chỉnh',
              'SLA 1h',
            ],
            ctaText: 'Liên hệ',
            ctaHref: '/lien-he',
          },
        ],
      },
      testimonials: {
        heading: 'Khách hàng nói gì',
        items: [
          {
            quote: 'Agency em quản 20 KH SEO. ViAI SEO giúp scale lên gấp 3 mà không cần tuyển writer mới. Top 10 cho 60% keyword chính.',
            name: 'Lê Quang Vinh',
            role: 'Founder Agency SEO Mountain',
            avatarSrc: UNSPLASH('photo-1519085360753-af0119f7cbe7', 200, 200),
          },
          {
            quote: 'SaaS B2B của em traffic organic tăng từ 2k lên 9k/tháng sau 4 tháng. ROI gấp 8 lần.',
            name: 'Nguyễn Đức Anh',
            role: 'Co-founder TechBase SaaS',
            avatarSrc: UNSPLASH('photo-1560250097-0b93528c311a', 200, 200),
          },
        ],
      },
      faq: {
        heading: 'Câu hỏi thường gặp',
        items: [
          { q: 'Bài AI có bị Google phạt không?', a: 'Không nếu dùng đúng cách. ViAI tuân thủ EEAT 2026, viết tự nhiên qua test AI detector. Khác hẳn ChatGPT thô prompt thẳng.' },
          { q: 'Cam kết top 10 Google có điều kiện gì?', a: 'Pro+ cam kết top 10 cho ≥1 keyword target sau 90 ngày. Yêu cầu: domain authority ≥20, không cạnh tranh keyword quá khó (search volume > 50k). Không đạt → hoàn tiền hoặc gia hạn 3 tháng.' },
          { q: 'Có viết được ngôn ngữ khác ngoài tiếng Việt không?', a: 'Pro+ có tiếng Anh. Enterprise có Nhật, Hàn, Trung. Phù hợp brand bán xuyên biên giới.' },
          { q: 'Có thay thế được SEO consultant không?', a: 'Không hoàn toàn. ViAI làm 80% việc thực thi (research, viết, đăng, track). Consultant vẫn cần để định hướng chiến lược + xử lý technical SEO.' },
          { q: 'Tích hợp được CMS nào?', a: 'Native: WordPress, Webflow, Ghost. Pro+ thêm Strapi, Sanity. Enterprise có thể custom integrate bất kỳ CMS nào qua API.' },
        ],
      },
      finalCta: {
        heading: 'Phủ Google mà không cần content team',
        description: 'Dùng thử 7 ngày miễn phí. Xuất 5 bài đầu để cảm nhận chất lượng.',
        ctaText: 'Đăng ký dùng thử',
        ctaHref: '/lien-he',
      },
      stickyBottom: {
        enabled: true,
        priceLabel: 'Từ 590.000đ/tháng',
        ctaPrimaryText: 'Đặt lịch tư vấn',
        ctaPrimaryHref: '/lien-he',
        ctaSecondaryText: 'Dùng thử miễn phí',
        ctaSecondaryHref: '/lien-he',
      },
    },
  },
];

export async function seedViaiProducts(
  categoryRepo: Repository<Category>,
  postRepo: Repository<Post>,
  itemRepo: Repository<MenuItem>,
  navMenuId: number,
  authorId: number,
) {
  // 1. Lấy category 'ai-agent'
  const aiAgentCat = await categoryRepo.findOne({ where: { slug: 'ai-agent' } });
  if (!aiAgentCat) {
    console.warn('⚠️  Category "ai-agent" chưa tồn tại, bỏ qua ViAI seed');
    return;
  }

  // 2. Xóa các posts AI Agent cũ KHÔNG nằm trong danh sách ViAI mới
  const viaiSlugs = VIAI_PRODUCTS.map((p) => p.slug);
  const oldPosts = await postRepo.find({
    where: {
      categoryId: aiAgentCat.id,
      slug: Not(In(viaiSlugs)),
    },
  });
  if (oldPosts.length > 0) {
    await postRepo.remove(oldPosts);
    console.log(`🗑️  Đã xóa ${oldPosts.length} AI Agent posts cũ: ${oldPosts.map((p) => p.slug).join(', ')}`);
  }

  // 3. Lấy menu group IDs (Kinh doanh & khách hàng, Vận hành & quản trị)
  const groupItems = await itemRepo.find({ where: { menuId: navMenuId, depth: 1 } });
  const groupLabelToId = new Map(groupItems.map((m) => [m.label, m.id]));

  // 4. Insert/update 4 ViAI products
  let created = 0;
  let updated = 0;
  const baseDate = new Date('2026-05-29T09:00:00Z');
  for (let i = 0; i < VIAI_PRODUCTS.length; i++) {
    const p = VIAI_PRODUCTS[i];
    const menuGroupId = groupLabelToId.get(p.menuGroupLabel);
    if (!menuGroupId) {
      console.warn(`⚠️  Menu group "${p.menuGroupLabel}" không tồn tại, bỏ qua ${p.slug}`);
      continue;
    }
    const publishedAt = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
    const existing = await postRepo.findOne({ where: { slug: p.slug } });
    if (existing) {
      Object.assign(existing, {
        title: p.title,
        shortName: p.shortName,
        excerpt: p.excerpt,
        content: ' ',
        thumbnail: p.thumbnail,
        logoUrl: p.logoUrl,
        badge: p.badge,
        displayOrder: p.displayOrder,
        categoryId: aiAgentCat.id,
        menuGroupId,
        authorId,
        status: PostStatus.PUBLISHED,
        publishedAt,
        productPageConfig: p.productPageConfig,
      });
      await postRepo.save(existing);
      updated++;
    } else {
      await postRepo.save(
        postRepo.create({
          title: p.title,
          slug: p.slug,
          shortName: p.shortName,
          excerpt: p.excerpt,
          content: ' ',
          thumbnail: p.thumbnail,
          logoUrl: p.logoUrl,
          badge: p.badge,
          displayOrder: p.displayOrder,
          categoryId: aiAgentCat.id,
          menuGroupId,
          authorId,
          status: PostStatus.PUBLISHED,
          publishedAt,
          productPageConfig: p.productPageConfig,
        }),
      );
      created++;
    }
  }
  console.log(`✅ ViAI products: ${created} tạo mới, ${updated} cập nhật`);
}
