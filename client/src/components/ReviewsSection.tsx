/**
 * EverWill 리뷰 + FAQ 섹션
 * 사용자 후기 + 자주 묻는 질문
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// 언어별 국가 리뷰 데이터
const reviewsByLang: Record<string, Array<{ name: string; age: string; location: string; rating: number; text: string; avatar: string }>> = {
  ko: [
    { name: "김민준", age: "58세", location: "서울", rating: 5, text: "17분 만에 유언장을 완성했습니다. 변호사 사무실에 갈 필요도 없고, 복잡한 법률 용어도 없어요. AI가 다 알아서 해줘서 정말 편했습니다.", avatar: "김" },
    { name: "이정숙", age: "71세", location: "부산", rating: 5, text: "자필 유언장을 스캔해서 올리니까 AI가 바로 검증해줬어요. 분산 암호화 보안에 기록된다고 하니 자녀들도 안심하더라고요.", avatar: "이" },
    { name: "박성호", age: "55세", location: "서울", rating: 5, text: "미국 자산과 한국 자산을 동시에 관리할 수 있는 서비스가 드디어 나왔네요. Badge도 주문했는데 정말 고급스럽습니다.", avatar: "박" },
    { name: "최영희", age: "63세", location: "대구", rating: 5, text: "처음엔 어렵게 생각했는데 체크박스 몇 번 누르니까 완성됐어요. 자녀들에게 부담 주지 않아도 되니 마음이 편해졌습니다.", avatar: "최" },
    { name: "정대한", age: "67세", location: "인천", rating: 5, text: "Badge 카드가 생각보다 훨씬 고급스럽고 든든합니다. 응급상황에도 QR로 가족 연락처가 뜬다니 정말 안심이에요.", avatar: "정" },
    { name: "한미숙", age: "59세", location: "광주", rating: 5, text: "영상 유언 기능이 특히 좋았어요. 손녀 성인 되는 날 전달되도록 설정했는데 정말 감동적인 서비스입니다.", avatar: "한" },
  ],
  en: [
    { name: "Sarah Johnson", age: "64", location: "Los Angeles, CA", rating: 5, text: "As a Korean-American with assets in both countries, EverWill is the only platform that handles cross-border inheritance. Absolutely essential.", avatar: "S" },
    { name: "Michael Thompson", age: "61", location: "New York, NY", rating: 5, text: "I completed my will in under 20 minutes. No lawyer needed, no confusing legal jargon. The AI guided me through every step clearly.", avatar: "M" },
    { name: "Patricia Williams", age: "68", location: "Chicago, IL", rating: 5, text: "The Badge system is genius. My family will know exactly what to do in an emergency. Worth every penny for the peace of mind it gives.", avatar: "P" },
    { name: "Robert Davis", age: "72", location: "Houston, TX", rating: 5, text: "Finally a service that handles multi-state assets properly. The lawyer matching for estate execution was seamless and professional.", avatar: "R" },
    { name: "Linda Martinez", age: "58", location: "Phoenix, AZ", rating: 5, text: "The video will feature is incredible. I recorded messages for each of my grandchildren to receive on their 18th birthdays. Truly moving.", avatar: "L" },
    { name: "James Wilson", age: "65", location: "Seattle, WA", rating: 5, text: "I was skeptical at first but the blockchain verification gave me confidence. My attorney confirmed it's legally sound in Washington State.", avatar: "J" },
  ],
  ja: [
    { name: "田中 健一", age: "66歳", location: "東京", rating: 5, text: "日本語対応で、日本の法律に合わせた遺言書が作れます。Badgeシステムは世界初の革新的なアイデアです。", avatar: "田" },
    { name: "山田 花子", age: "62歳", location: "大阪", rating: 5, text: "公正証書遺言の費用が高くて悩んでいましたが、EverWillなら49,000円で完結できました。AIが法的要件を自動チェックしてくれるので安心です。", avatar: "山" },
    { name: "鈴木 一郎", age: "70歳", location: "名古屋", rating: 5, text: "日本とアメリカに資産があり、両国の相続手続きが心配でした。EverWillは両国の法律に対応していて、弁護士も自動マッチングしてくれます。", avatar: "鈴" },
    { name: "佐藤 美恵", age: "58歳", location: "福岡", rating: 5, text: "動画遺言機能が特に感動的でした。孫の成人式の日に届くようにメッセージを録画しました。一生の思い出になると思います。", avatar: "佐" },
    { name: "伊藤 正雄", age: "74歳", location: "札幌", rating: 5, text: "自筆証書遺言をスキャンしてAIで検証してもらいました。ブロックチェーンに記録されるので改ざんの心配がなく、子供たちも安心しています。", avatar: "伊" },
    { name: "渡辺 久子", age: "67歳", location: "京都", rating: 5, text: "Badgeのネックレスタイプを購入しました。緊急時にQRコードで家族に連絡が取れるのは本当に心強いです。デザインも上品で毎日着けています。", avatar: "渡" },
  ],
  zh: [
    { name: "陈伟明", age: "63岁", location: "香港", rating: 5, text: "终于有一个能同时处理香港和内地资产的遗嘱平台了。AI自动生成法律文件，省去了大量律师费用。强烈推荐！", avatar: "陈" },
    { name: "林美华", age: "58岁", location: "台北", rating: 5, text: "Badge系统真的很创新。紧急情况下扫描QR码就能联系到家人，这个功能在任何其他遗嘱服务中都没有见过。", avatar: "林" },
    { name: "张志强", age: "71岁", location: "上海", rating: 5, text: "用了不到20分钟就完成了遗嘱。界面简洁，中文支持完善，AI会自动检查法律要求，非常放心。", avatar: "张" },
    { name: "王淑芬", age: "65岁", location: "广州", rating: 5, text: "视频遗嘱功能让我感动落泪。可以给每个孩子录制单独的视频消息，在特定时间发送，这是最有意义的礼物。", avatar: "王" },
    { name: "刘建国", age: "68岁", location: "深圳", rating: 5, text: "区块链认证让我完全放心。遗嘱一旦记录就无法篡改，律师也确认了法律效力。这才是真正值得信赖的服务。", avatar: "刘" },
    { name: "黄秀英", age: "60岁", location: "新加坡", rating: 5, text: "作为在新加坡的华人，跨境遗产一直是我的烦恼。EverWill完美解决了这个问题，还有专业律师协助执行。", avatar: "黄" },
  ],
  de: [
    { name: "Klaus Müller", age: "65", location: "Berlin", rating: 5, text: "Endlich ein Testament-Service, der deutsches Recht vollständig berücksichtigt. Die KI hat alle Pflichtteile automatisch berechnet. Sehr beeindruckend.", avatar: "K" },
    { name: "Ingrid Schneider", age: "61", location: "München", rating: 5, text: "Das Badge-System ist revolutionär. Im Notfall können Sanitäter sofort meine Kontakte und Gesundheitsdaten abrufen. Das gibt mir echte Sicherheit.", avatar: "I" },
    { name: "Hans Weber", age: "70", location: "Hamburg", rating: 5, text: "Ich habe Immobilien in Deutschland und Spanien. EverWill hat beide Rechtssysteme berücksichtigt und automatisch die richtigen Anwälte zugewiesen.", avatar: "H" },
    { name: "Ursula Becker", age: "67", location: "Frankfurt", rating: 5, text: "Die Videotestament-Funktion hat mich zu Tränen gerührt. Ich habe Botschaften für meine Enkel aufgenommen, die sie zu besonderen Anlässen erhalten werden.", avatar: "U" },
    { name: "Friedrich Koch", age: "73", location: "Stuttgart", rating: 5, text: "Als Rentner war mir die einfache Bedienung wichtig. In 25 Minuten war alles erledigt. Die Blockchain-Verifizierung gibt mir das Gefühl, dass alles sicher ist.", avatar: "F" },
    { name: "Helga Richter", age: "59", location: "Köln", rating: 5, text: "Der Anwalts-Matchmaking-Service nach dem Tod ist genial. Meine Familie muss sich um nichts kümmern – alles wird automatisch abgewickelt.", avatar: "H" },
  ],
  es: [
    { name: "María García", age: "60", location: "Madrid", rating: 5, text: "El sistema de Badge es revolucionario. Nunca había visto algo así en ningún servicio de testamentos del mundo. Totalmente recomendado.", avatar: "M" },
    { name: "Carlos López", age: "65", location: "Barcelona", rating: 5, text: "Completé mi testamento en 18 minutos. La IA verificó automáticamente las legítimas según la ley española. Increíblemente preciso y fácil de usar.", avatar: "C" },
    { name: "Ana Martínez", age: "58", location: "Valencia", rating: 5, text: "Tengo propiedades en España y México. EverWill gestionó ambas jurisdicciones perfectamente y me asignó abogados especializados en herencias internacionales.", avatar: "A" },
    { name: "José Rodríguez", age: "72", location: "Sevilla", rating: 5, text: "El testamento en vídeo me pareció una idea maravillosa. He grabado mensajes para mis nietos que recibirán en momentos especiales de sus vidas.", avatar: "J" },
    { name: "Carmen Sánchez", age: "67", location: "Bilbao", rating: 5, text: "La verificación blockchain me da total tranquilidad. Sé que mi testamento no puede ser alterado y que mis deseos serán respetados.", avatar: "C" },
    { name: "Fernando Torres", age: "63", location: "Málaga", rating: 5, text: "El servicio de ejecución post-mortem es lo que me convenció. Mi familia no tendrá que preocuparse por nada, todo está automatizado.", avatar: "F" },
  ],
  ar: [
    { name: "محمد العمري", age: "62", location: "الرياض", rating: 5, text: "أخيراً خدمة وصية تراعي أحكام الشريعة الإسلامية تلقائياً. حسبت نصيب كل وارث بدقة وفق الفرائض. خدمة لا مثيل لها.", avatar: "م" },
    { name: "فاطمة الزهراني", age: "55", location: "جدة", rating: 5, text: "نظام Badge مبتكر جداً. في حالات الطوارئ يمكن للمسعفين الاطلاع على معلوماتي الطبية وبيانات عائلتي فوراً. هذا ما كنت أحتاجه.", avatar: "ف" },
    { name: "عبدالله القحطاني", age: "68", location: "الدمام", rating: 5, text: "لدي أصول في المملكة وبريطانيا. EverWill تعامل مع كلا النظامين القانونيين بكفاءة عالية وخصص لي محامين متخصصين في الميراث الدولي.", avatar: "ع" },
    { name: "نورة الشمري", age: "60", location: "أبوظبي", rating: 5, text: "ميزة الوصية المرئية رائعة. سجلت رسائل لأطفالي ستصلهم في مناسبات خاصة. هذه هدية لا تقدر بثمن لمن أحب.", avatar: "ن" },
    { name: "خالد المنصور", age: "71", location: "الكويت", rating: 5, text: "التحقق بالبلوك تشين أعطاني ثقة كاملة. وصيتي محفوظة ولا يمكن التلاعب بها. أنصح كل شخص بتسجيل وصيته الآن.", avatar: "خ" },
    { name: "سارة الحربي", age: "57", location: "دبي", rating: 5, text: "أتممت وصيتي في 20 دقيقة فقط. الواجهة باللغة العربية ممتازة والنظام يراعي قانون الأحوال الشخصية الإماراتي تلقائياً.", avatar: "س" },
  ],
  fr: [
    { name: "Jean-Pierre Dupont", age: "64", location: "Paris", rating: 5, text: "EverWill a pris en compte la réserve héréditaire française automatiquement. En 20 minutes, mon testament était complet et conforme au droit français.", avatar: "J" },
    { name: "Marie-Claire Leblanc", age: "61", location: "Lyon", rating: 5, text: "Le système Badge est une innovation remarquable. En cas d'urgence, les secours peuvent accéder à mes informations médicales et contacter ma famille immédiatement.", avatar: "M" },
    { name: "François Martin", age: "69", location: "Marseille", rating: 5, text: "J'ai des biens en France et au Canada. EverWill a géré les deux juridictions parfaitement et m'a mis en contact avec des avocats spécialisés en succession internationale.", avatar: "F" },
    { name: "Isabelle Bernard", age: "58", location: "Bordeaux", rating: 5, text: "La fonction testament vidéo m'a profondément touchée. J'ai enregistré des messages pour mes petits-enfants qu'ils recevront lors de moments importants de leur vie.", avatar: "I" },
    { name: "Pierre Moreau", age: "73", location: "Toulouse", rating: 5, text: "La certification blockchain me donne une tranquillité d'esprit totale. Mon notaire a confirmé que le document est juridiquement valide et infalsifiable.", avatar: "P" },
    { name: "Sophie Petit", age: "60", location: "Nice", rating: 5, text: "Le service d'exécution post-décès est ce qui m'a convaincue. Ma famille n'aura rien à gérer, tout est automatisé. Un service vraiment complet.", avatar: "S" },
  ],
  ru: [
    { name: "Александр Иванов", age: "62", location: "Москва", rating: 5, text: "Наконец-то сервис, который учитывает российское законодательство об обязательной доле наследства. ИИ автоматически рассчитал все доли. Очень впечатляет.", avatar: "А" },
    { name: "Наталья Петрова", age: "58", location: "Санкт-Петербург", rating: 5, text: "Система Badge — настоящая инновация. В экстренной ситуации медики могут сразу получить мои медицинские данные и контакты семьи. Это бесценно.", avatar: "Н" },
    { name: "Сергей Сидоров", age: "67", location: "Екатеринбург", rating: 5, text: "У меня есть активы в России и Германии. EverWill учёл оба правовых режима и автоматически подобрал специалистов по международному наследованию.", avatar: "С" },
    { name: "Ольга Козлова", age: "61", location: "Новосибирск", rating: 5, text: "Функция видеозавещания меня растрогала. Я записала послания детям, которые они получат в особые моменты жизни. Это лучший подарок, который я могу им оставить.", avatar: "О" },
    { name: "Дмитрий Новиков", age: "70", location: "Казань", rating: 5, text: "Блокчейн-верификация даёт полную уверенность. Завещание невозможно подделать, и мои пожелания будут исполнены точно так, как я хочу.", avatar: "Д" },
    { name: "Елена Морозова", age: "55", location: "Краснодар", rating: 5, text: "Завершила завещание за 22 минуты. Интерфейс на русском языке отличный, ИИ проверил все юридические требования автоматически. Рекомендую всем.", avatar: "Е" },
  ],
  hi: [
    { name: "राजेश कुमार", age: "63", location: "मुंबई", rating: 5, text: "हिंदू उत्तराधिकार अधिनियम के अनुसार AI ने स्वचालित रूप से सभी हिस्सों की गणना की। 20 मिनट में वसीयत तैयार हो गई। अद्भुत सेवा!", avatar: "र" },
    { name: "प्रिया शर्मा", age: "58", location: "दिल्ली", rating: 5, text: "Badge सिस्टम बहुत उपयोगी है। आपातकाल में QR स्कैन करके परिवार से संपर्क हो सकता है। यह सुविधा किसी अन्य सेवा में नहीं है।", avatar: "प" },
    { name: "सुरेश पटेल", age: "68", location: "अहमदाबाद", rating: 5, text: "मेरी संपत्ति भारत और अमेरिका दोनों में है। EverWill ने दोनों देशों के कानूनों को ध्यान में रखते हुए वसीयत तैयार की। बेहतरीन सेवा!", avatar: "स" },
    { name: "अनीता सिंह", age: "61", location: "बेंगलुरु", rating: 5, text: "वीडियो वसीयत फीचर बहुत भावुक करने वाला है। मैंने अपने पोते-पोतियों के लिए संदेश रिकॉर्ड किए जो उन्हें खास मौकों पर मिलेंगे।", avatar: "अ" },
    { name: "विजय मेहता", age: "72", location: "पुणे", rating: 5, text: "ब्लॉकचेन वेरिफिकेशन से पूरा भरोसा मिला। वसीयत में कोई छेड़छाड़ नहीं हो सकती। मेरे वकील ने भी इसकी कानूनी वैधता की पुष्टि की।", avatar: "व" },
    { name: "मीना जोशी", age: "59", location: "जयपुर", rating: 5, text: "मृत्यु के बाद स्वचालित निष्पादन सेवा ने मुझे आश्वस्त किया। परिवार को कुछ नहीं करना होगा, सब कुछ अपने आप होगा।", avatar: "म" },
  ],
  pt: [
    { name: "Carlos Oliveira", age: "64", location: "São Paulo", rating: 5, text: "O EverWill considerou automaticamente a legítima do direito brasileiro. Em 20 minutos, meu testamento estava completo e juridicamente válido. Impressionante!", avatar: "C" },
    { name: "Ana Silva", age: "59", location: "Rio de Janeiro", rating: 5, text: "O sistema Badge é uma inovação incrível. Em emergências, os socorristas podem acessar minhas informações médicas e contatar minha família imediatamente.", avatar: "A" },
    { name: "João Santos", age: "67", location: "Belo Horizonte", rating: 5, text: "Tenho bens no Brasil e em Portugal. O EverWill gerenciou ambas as jurisdições perfeitamente e me conectou com advogados especializados em herança internacional.", avatar: "J" },
    { name: "Maria Ferreira", age: "61", location: "Porto Alegre", rating: 5, text: "A função de testamento em vídeo me emocionou profundamente. Gravei mensagens para meus netos que receberão em momentos especiais de suas vidas.", avatar: "M" },
    { name: "Pedro Costa", age: "70", location: "Salvador", rating: 5, text: "A certificação blockchain me dá total tranquilidade. Meu testamento não pode ser adulterado e meus desejos serão cumpridos exatamente como quero.", avatar: "P" },
    { name: "Lucia Rodrigues", age: "56", location: "Fortaleza", rating: 5, text: "O serviço de execução pós-morte foi o que me convenceu. Minha família não precisará se preocupar com nada, tudo é automatizado. Serviço completo!", avatar: "L" },
  ],
};

// 기본 리뷰 (언어 매핑 없을 때 영어 사용)
const getReviewsByLang = (lang: string) => reviewsByLang[lang] ?? reviewsByLang.en;

type ReviewItem = { name: string; age: string; location: string; rating: number; text: string; avatar: string };

interface ReviewsSectionProps {
  countryReviews?: ReviewItem[];
}

export default function ReviewsSection({ countryReviews }: ReviewsSectionProps = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { t, language } = useLanguage();
  const reviews: ReviewItem[] = countryReviews ?? getReviewsByLang(language);

  const faqs = [
    { q: t.reviews.faq1q, a: t.reviews.faq1a },
    { q: t.reviews.faq2q, a: t.reviews.faq2a },
    { q: t.reviews.faq3q, a: t.reviews.faq3a },
    { q: t.reviews.faq4q, a: t.reviews.faq4a },
    { q: t.reviews.faq5q, a: t.reviews.faq5a },
    { q: t.reviews.faq6q, a: t.reviews.faq6a },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 리뷰 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1F3864] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t.reviews.title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#C9A961] text-[#C9A961]" />
              ))}
            </div>
            <span className="font-semibold text-[#1F3864]">4.9</span>
            <span className="text-gray-400">/ 5.0</span>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#FAFAF8] rounded-xl p-6 border border-gray-100 card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {review.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#1F3864] text-sm">{review.name}</div>
                  <div className="text-gray-400 text-xs">{review.age} · {review.location}</div>
                </div>
                <div className="ml-auto flex">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#C9A961] text-[#C9A961]" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1F3864] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t.reviews.faqTitle}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                className="bg-[#FAFAF8] rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-[#1F3864] text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#C9A961] flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <div className="h-px bg-gray-100 mb-4" />
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}
