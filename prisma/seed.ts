import bcrypt from "bcryptjs";
import { PrismaClient, Role, ContentStatus } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin1234!", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@cinematic.ai" },
    update: {},
    create: {
      email: "admin@cinematic.ai",
      name: "Admin",
      role: Role.ADMIN,
      passwordHash
    }
  });

  await db.siteSetting.upsert({
    where: { id: "default-site" },
    update: {},
    create: {
      id: "default-site",
      appNameTh: "Cinematic AI",
      appNameEn: "Cinematic AI"
    }
  });

  await db.fAQ.createMany({
    data: [
      {
        questionTh: "คอร์สเหมาะกับใคร",
        questionEn: "Who are these courses for?",
        answerTh: "เหมาะสำหรับผู้เริ่มต้นถึงมืออาชีพที่อยากสร้างงานวิดีโอคุณภาพสูง",
        answerEn: "For beginners to advanced creators who want cinematic quality.",
        position: 1
      },
      {
        questionTh: "เรียนย้อนหลังได้ไหม",
        questionEn: "Can I learn at my own pace?",
        answerTh: "ได้ ดูซ้ำได้ทุกบทเรียนหลังซื้อ",
        answerEn: "Yes, you can revisit all enrolled lessons anytime.",
        position: 2
      }
    ],
    skipDuplicates: true
  });

  const showreel = await db.showreel.create({
    data: {
      slug: "welcome-showreel",
      titleTh: "ตัวอย่างผลงาน",
      titleEn: "Showreel Preview",
      descriptionTh: "ตัวอย่างงานตัดต่อและสี",
      descriptionEn: "Editing and color grading demo",
      externalVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      position: 1
    }
  });

  const course = await db.course.create({
    data: {
      slug: "cinematic-editing-101",
      titleTh: "Cinematic Editing 101",
      titleEn: "Cinematic Editing 101",
      descriptionTh: "ปูพื้นฐานตัดต่อแบบภาพยนตร์ตั้งแต่ศูนย์",
      descriptionEn: "A practical foundation for cinematic editing.",
      priceTHB: 2490,
      contentTh: "คอร์สนี้สอนตั้งแต่ workflow การตัดต่อ, การวางจังหวะ, ไปจนถึงการเก็บรายละเอียดงานส่งลูกค้า",
      contentEn: "This course covers editing workflow, pacing, and final delivery quality.",
      videoEnabled: true,
      videoPriceTHB: 990,
      liveEnabled: true,
      livePriceTHB: 3000,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      position: 1,
      sections: {
        create: [
          {
            titleTh: "เริ่มต้น",
            titleEn: "Getting Started",
            position: 1,
            lessons: {
              create: [
                {
                  slug: "workflow-basics",
                  titleTh: "Workflow พื้นฐาน",
                  titleEn: "Workflow Basics",
                  position: 1,
                  blocks: {
                    create: [
                      {
                        type: "MARKDOWN",
                        markdownTh: "## แผนการตัดต่อ\nเริ่มจากโครงเรื่องก่อน",
                        markdownEn: "## Editing plan\nStart from story structure.",
                        position: 1
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  await db.article.create({
    data: {
      slug: "camera-movement-basics",
      titleTh: "พื้นฐานการเคลื่อนกล้อง",
      titleEn: "Camera Movement Basics",
      excerptTh: "5 เทคนิคเพิ่มมิติให้ภาพ",
      excerptEn: "5 practical techniques for cinematic depth.",
      contentMdTh: "เนื้อหาบทความภาษาไทย",
      contentMdEn: "English article content",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date()
    }
  });

  await db.freeTutorial.create({
    data: {
      slug: "free-color-setup",
      titleTh: "ตั้งค่าโทนสีฟรี",
      titleEn: "Free Color Setup",
      descriptionTh: "บทเรียนฟรีเรื่องการตั้งค่า color profile",
      descriptionEn: "Free tutorial on color profile setup.",
      externalVideoUrl: showreel.externalVideoUrl,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date()
    }
  });

  console.log({ adminId: admin.id, courseId: course.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
