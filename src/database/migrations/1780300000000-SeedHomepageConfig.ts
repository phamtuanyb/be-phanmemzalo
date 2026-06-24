import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_HOMEPAGE = {
  hero: {
    badge: '✨ Phần mềm vừa vặn cho SME Việt',
    headline: 'Phần mềm vừa vặn cho doanh nghiệp Việt',
    headlineHighlight: 'vừa vặn',
    description: 'Không dùng chung giải pháp đại trà. MKT Software xây cho bạn đúng bài toán — CRM, App Mobile, Automation, Workflow — đúng chi phí, đúng tiến độ.',
    ctaPrimaryText: 'Tư vấn miễn phí 30 phút',
    ctaPrimaryHref: '/lien-he',
    ctaSecondaryText: 'Xem dịch vụ →',
    badges: ['✅ Không cần đặt cọc lớn', '✅ Demo trước khi ký hợp đồng', '✅ Bảo hành 12 tháng'],
  },
  painPoints: {
    heading: 'Những vấn đề mà hầu hết',
    headingEm: 'SME Việt đang mắc kẹt',
    description: 'Nếu 1 trong 4 điều dưới đây đúng với doanh nghiệp bạn — MKT Software sinh ra để giải quyết.',
    items: [
      { title: 'Quản lý bằng Excel, Zalo, giấy tờ', description: 'Dữ liệu phân tán, sai sót, mất thời gian tổng hợp. Sếp muốn báo cáo — nhân viên loay hoay cả ngày.' },
      { title: 'Phần mềm mua rồi không dùng được', description: 'Mua giải pháp có sẵn nhưng không vừa quy trình. Tiền mất, nhân viên vẫn làm tay, không ai hài lòng.' },
      { title: 'Quy trình vận hành bằng người, không bằng hệ thống', description: 'Nhân viên chủ chốt nghỉ việc — quy trình đứng lại. Kiến thức nằm trong đầu người chứ không trong phần mềm.' },
      { title: 'Không có dữ liệu để ra quyết định', description: 'Không biết khách nào sinh lời, kênh nào hiệu quả, nhân viên nào bán tốt. Quyết định bằng cảm tính = rủi ro.' },
    ],
  },
  howItWorks: {
    heading: '4 bước — từ ý tưởng đến',
    headingEm: 'phần mềm chạy thật',
    description: 'Bạn không cần biết kỹ thuật. MKT Software đồng hành từng bước — từ buổi tư vấn đầu tiên đến khi hệ thống ổn định.',
    steps: [
      { title: 'Tư vấn & Phân tích', description: 'Nghe bài toán, phân tích quy trình hiện tại, đề xuất giải pháp phù hợp nhất. Miễn phí 30 phút.' },
      { title: 'Thiết kế & Demo', description: 'Wireframe, UI mockup đúng nghiệp vụ của bạn. Anh xem trước khi ký — không ưng thì nói thẳng.' },
      { title: 'Phát triển & Test', description: 'Code, test kỹ, demo từng module. Cập nhật tiến độ hàng tuần. Không biến mất giữa dự án.' },
      { title: 'Bàn giao & Hỗ trợ', description: 'Training nhân viên, tài liệu sử dụng, hỗ trợ 24/7 tháng đầu. Bảo hành 12 tháng.' },
    ],
  },
  why: {
    label: 'TẠI SAO MKT SOFTWARE',
    heading: 'Không phải vì chúng tôi nói hay — mà vì chúng tôi làm được',
    description: 'MKT Software thuộc hệ sinh thái ViTechGroup. Đội ngũ đã xây dựng và vận hành nhiều sản phẩm phần mềm thực tế — không phải team học việc.',
    items: [
      { icon: '🎯', title: 'Đúng bài toán — không bán tính năng thừa', description: 'Chúng tôi phân tích quy trình thực tế của bạn, chỉ build những gì bạn thực sự cần. Không phình scope, không thu thêm chi phí ẩn.' },
      { icon: '⚡', title: 'Triển khai nhanh 4–8 tuần', description: 'Methodology chia nhỏ module, bàn giao cuốn chiếu. Bạn dùng được phần đầu trong khi phần sau đang build.' },
      { icon: '🏢', title: 'Thuộc ViTechGroup — có pháp nhân, có địa chỉ', description: 'Không phải freelancer "biến mất sau khi nhận tiền". Hợp đồng rõ ràng, có văn phòng, có đội ngũ chuyên trách bảo hành sau bàn giao.' },
      { icon: '💰', title: 'Chi phí minh bạch từ đầu', description: 'Báo giá chi tiết theo module. Không tăng giá giữa dự án. Dự án nhỏ từ 30 triệu, thanh toán theo milestone thực tế bàn giao.' },
    ],
    stats: [
      { value: '8+', label: 'Năm kinh nghiệm team công nghệ' },
      { value: '4–8 tuần', label: 'Thời gian triển khai trung bình' },
      { value: '100%', label: 'Dự án có demo trước khi ký' },
      { value: '12 tháng', label: 'Bảo hành & hỗ trợ sau bàn giao' },
    ],
    quote: 'MKT Software không chỉ viết code. Chúng tôi đồng hành cùng bạn xây dựng hệ thống — từ bài toán thực tế đến phần mềm vận hành thực sự.',
    quoteAuthor: '— Lê Đức Nam, Founder & CEO ViTechGroup',
  },
  pricing: {
    heading: 'Giá minh bạch — không ẩn phí',
    description: 'MKT Software báo giá theo module thực tế sau khi nghe bài toán. Dưới đây là khung tham khảo để bạn chủ động ngân sách.',
    disclaimer: '* Giá cuối xác nhận sau buổi tư vấn phân tích bài toán. Không có phí ẩn.',
    plans: [
      {
        name: 'Starter', subtitle: 'Hộ KD, Startup, Shop nhỏ',
        price: '15', period: '/ dự án trọn gói',
        features: ['1 phần mềm vertical chuẩn hoá', '1 AI Agent cơ bản (Sales hoặc CSKH)', 'Triển khai 2–4 tuần', 'Đào tạo 1 buổi', 'Bảo hành 6 tháng'],
        ctaText: 'Nhận tư vấn', ctaHref: '/lien-he',
      },
      {
        name: 'Growth', subtitle: 'SME 10–50 nhân sự',
        price: '80', period: '/ dự án trọn gói',
        badge: 'PHỔ BIẾN NHẤT', featured: true,
        features: ['Phần mềm theo yêu cầu (custom)', '2–3 module mở rộng theo nghiệp vụ', '2 AI Agent (Sales + CSKH/Marketing)', 'App Mobile hỗ trợ (nếu cần)', 'Bảo hành 12 tháng + đào tạo nội bộ'],
        ctaText: 'Đặt lịch khảo sát', ctaHref: '/lien-he',
      },
      {
        name: 'Enterprise', subtitle: 'SME 50+ / Chuyển đổi số tổng thể',
        price: '300', period: '/ dự án trọn gói',
        features: ['Full custom theo nghiệp vụ riêng', 'AI Agent toàn phòng ban', 'App Mobile iOS + Android', 'Tích hợp ERP, CRM, kế toán có sẵn', 'Bảo hành 18 tháng + SLA cam kết'],
        ctaText: 'Gặp chuyên gia', ctaHref: '/lien-he',
      },
    ],
  },
  cta: {
    heading: 'Sẵn sàng số hóa doanh nghiệp?',
    description: 'Tư vấn miễn phí 30 phút — MKT Software phân tích bài toán và đề xuất giải pháp phù hợp. Không ràng buộc.',
    ctaPrimaryText: 'Đặt lịch tư vấn miễn phí',
    ctaPrimaryHref: '/lien-he',
    ctaSecondaryText: '💬 Chat Zalo ngay',
    ctaSecondaryHref: 'https://zalo.me/vsoftware',
    note: 'Phản hồi trong vòng 2 giờ làm việc. Không phí tư vấn.',
  },
};

export class SeedHomepageConfig1780300000000 implements MigrationInterface {
  name = 'SeedHomepageConfig1780300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "site_settings" ("key", "value")
       VALUES ('homepage', $1::jsonb)
       ON CONFLICT ("key") DO NOTHING`,
      [JSON.stringify(DEFAULT_HOMEPAGE)],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "site_settings" WHERE "key" = 'homepage'`);
  }
}
