/**
 * EverWill AI 챗봇 위젯
 * - 비회원: 서비스 안내 봇 (3턴 제한 → 가입 유도)
 * - 회원: 모드별 전문 AI (법률/자서전/일기/편지/통합, 히스토리 저장)
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  Sparkles,
  LogIn,
  History,
  Scale,
  BookOpen,
  NotebookPen,
  Mail,
  LayoutGrid,
  ImageIcon,
  Palette,
  Download,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

// AI 모드 타입
type AiMode = "general" | "legal" | "autobiography" | "diary" | "letter";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: AiMode;
}

// AI 모드 설정
const AI_MODES: {
  id: AiMode;
  icon: React.ReactNode;
  label: Record<string, string>;
  color: string;
  bgColor: string;
  description: Record<string, string>;
  placeholder: Record<string, string>;
}[] = [
  {
    id: "general",
    icon: <LayoutGrid className="w-3.5 h-3.5" />,
    label: { ko: "통합", en: "All", ja: "総合", zh: "综合", de: "Alle", es: "Todo", ar: "الكل", fr: "Tout", ru: "Все", hi: "सभी", pt: "Tudo" },
    color: "#1F3864",
    bgColor: "#e0e7ff",
    description: { ko: "모든 분야 통합 상담", en: "All-in-one consultation", ja: "総合相談", zh: "综合咨询", de: "Allgemein", es: "General", ar: "عام", fr: "Général", ru: "Общий", hi: "सामान्य", pt: "Geral" },
    placeholder: { ko: "무엇이든 물어보세요...", en: "Ask me anything...", ja: "何でも聞いてください...", zh: "请随时提问...", de: "Fragen Sie alles...", es: "Pregunta lo que quieras...", ar: "اسألني أي شيء...", fr: "Posez n'importe quelle question...", ru: "Спросите что угодно...", hi: "कुछ भी पूछें...", pt: "Pergunte qualquer coisa..." },
  },
  {
    id: "legal",
    icon: <Scale className="w-3.5 h-3.5" />,
    label: { ko: "법률", en: "Legal", ja: "法律", zh: "法律", de: "Recht", es: "Legal", ar: "قانوني", fr: "Juridique", ru: "Право", hi: "कानूनी", pt: "Jurídico" },
    color: "#1d4ed8",
    bgColor: "#dbeafe",
    description: { ko: "유언·상속 법률 전문", en: "Will & Inheritance Law", ja: "遺言・相続法律", zh: "遗嘱·继承法律", de: "Testament & Erbrecht", es: "Testamento & Herencia", ar: "الوصايا والميراث", fr: "Testament & Succession", ru: "Завещание & Наследство", hi: "वसीयत & विरासत", pt: "Testamento & Herança" },
    placeholder: { ko: "유언·상속 법률 질문을 입력하세요...", en: "Ask about will & inheritance law...", ja: "遺言・相続の法律について...", zh: "询问遗嘱和继承法律...", de: "Fragen zu Testament & Erbrecht...", es: "Preguntas sobre testamento...", ar: "اسأل عن قانون الوصايا...", fr: "Questions sur le testament...", ru: "Вопросы о завещании...", hi: "वसीयत के बारे में पूछें...", pt: "Perguntas sobre testamento..." },
  },
  {
    id: "autobiography",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    label: { ko: "자서전", en: "Story", ja: "自伝", zh: "自传", de: "Biografie", es: "Autobio", ar: "سيرة", fr: "Autobio", ru: "Биография", hi: "आत्मकथा", pt: "Autobio" },
    color: "#7c3aed",
    bgColor: "#ede9fe",
    description: { ko: "인생 이야기 자서전 작성", en: "Life Story & Autobiography", ja: "自伝作成", zh: "自传写作", de: "Autobiografie", es: "Autobiografía", ar: "السيرة الذاتية", fr: "Autobiographie", ru: "Автобиография", hi: "आत्मकथा लेखन", pt: "Autobiografia" },
    placeholder: { ko: "인생 이야기를 들려주세요...", en: "Tell me your life story...", ja: "人生の話を聞かせてください...", zh: "告诉我您的人生故事...", de: "Erzählen Sie Ihre Lebensgeschichte...", es: "Cuéntame tu historia de vida...", ar: "أخبرني قصة حياتك...", fr: "Racontez votre histoire de vie...", ru: "Расскажите свою историю жизни...", hi: "अपनी जीवन कहानी बताएं...", pt: "Conte sua história de vida..." },
  },
  {
    id: "diary",
    icon: <NotebookPen className="w-3.5 h-3.5" />,
    label: { ko: "일기", en: "Diary", ja: "日記", zh: "日记", de: "Tagebuch", es: "Diario", ar: "يوميات", fr: "Journal", ru: "Дневник", hi: "डायरी", pt: "Diário" },
    color: "#059669",
    bgColor: "#d1fae5",
    description: { ko: "오늘 하루 일기 작성", en: "Daily Diary Writing", ja: "日記作成", zh: "日记写作", de: "Tagebuch schreiben", es: "Escribir diario", ar: "كتابة اليوميات", fr: "Écrire un journal", ru: "Написать дневник", hi: "डायरी लिखें", pt: "Escrever diário" },
    placeholder: { ko: "오늘 하루 어떠셨나요?", en: "How was your day today?", ja: "今日はどんな一日でしたか？", zh: "今天过得怎么样？", de: "Wie war Ihr Tag heute?", es: "¿Cómo fue tu día hoy?", ar: "كيف كان يومك اليوم؟", fr: "Comment s'est passée votre journée?", ru: "Как прошёл ваш день?", hi: "आज का दिन कैसा था?", pt: "Como foi seu dia hoje?" },
  },
  {
    id: "letter",
    icon: <Mail className="w-3.5 h-3.5" />,
    label: { ko: "편지", en: "Letter", ja: "手紙", zh: "书信", de: "Brief", es: "Carta", ar: "رسالة", fr: "Lettre", ru: "Письмо", hi: "पत्र", pt: "Carta" },
    color: "#be185d",
    bgColor: "#fce7f3",
    description: { ko: "가족·지인에게 편지 작성", en: "Letters to Family & Friends", ja: "家族への手紙", zh: "家书写作", de: "Familienbriefe", es: "Cartas familiares", ar: "رسائل العائلة", fr: "Lettres familiales", ru: "Семейные письма", hi: "पारिवारिक पत्र", pt: "Cartas familiares" },
    placeholder: { ko: "누구에게 편지를 쓰고 싶으신가요?", en: "Who would you like to write to?", ja: "誰に手紙を書きたいですか？", zh: "您想给谁写信？", de: "Wem möchten Sie schreiben?", es: "¿A quién quieres escribir?", ar: "لمن تريد أن تكتب؟", fr: "À qui voulez-vous écrire?", ru: "Кому вы хотите написать?", hi: "आप किसे पत्र लिखना चाहते हैं?", pt: "Para quem você quer escrever?" },
  },
];

// 모드별 환영 메시지
const MODE_WELCOME: Record<AiMode, Record<string, string>> = {
  general: {
    ko: "안녕하세요! 저는 회원님의 **전담 AI 에버**입니다. 🌟\n\n유언·상속 법률 정보, 자서전 작성, 가족 편지·일기 작성까지 모두 도와드릴 수 있어요.\n\n무엇이든 편하게 물어보세요!",
    en: "Hello! I'm your **dedicated AI Ever**. 🌟\n\nI can help with will & inheritance legal information, autobiography writing, and family letters & diary entries.\n\nFeel free to ask anything!",
    ja: "こんにちは！あなたの**専任AI エバー**です。🌟\n\n遺言・相続の法律情報、自伝作成、家族への手紙・日記作成まですべてお手伝いします。\n\nお気軽に何でもどうぞ！",
    zh: "您好！我是您的**专属AI Ever**。🌟\n\n我可以帮助您了解遗嘱和继承法律信息、撰写自传以及家书和日记。\n\n请随时提问！",
    de: "Hallo! Ich bin Ihr **persönlicher KI-Assistent Ever**. 🌟\n\nIch helfe bei Testament & Erbrecht, Autobiografie-Schreiben und Familienbriefen.\n\nFragen Sie mich alles!",
    es: "¡Hola! Soy tu **IA dedicada Ever**. 🌟\n\nPuedo ayudarte con información legal sobre testamentos y herencias, escritura de autobiografías y cartas familiares.\n\n¡Pregúntame lo que quieras!",
    ar: "مرحباً! أنا **ذكاءك الاصطناعي المخصص إيفر**. 🌟\n\nيمكنني مساعدتك في معلومات قانونية عن الوصايا والميراث، وكتابة السيرة الذاتية والرسائل العائلية.\n\nاسألني أي شيء!",
    fr: "Bonjour! Je suis votre **IA dédiée Ever**. 🌟\n\nJe peux vous aider avec les informations juridiques sur les testaments et successions, la rédaction d'autobiographie et les lettres familiales.\n\nPosez-moi n'importe quelle question!",
    ru: "Привет! Я ваш **персональный ИИ Эвер**. 🌟\n\nЯ помогу с юридической информацией о завещаниях и наследстве, написанием автобиографии и семейными письмами.\n\nСпрашивайте всё что угодно!",
    hi: "नमस्ते! मैं आपका **समर्पित AI Ever** हूं। 🌟\n\nमैं वसीयत और विरासत कानूनी जानकारी, आत्मकथा लेखन और पारिवारिक पत्र लेखन में मदद कर सकता हूं।\n\nकुछ भी पूछें!",
    pt: "Olá! Sou seu **IA dedicado Ever**. 🌟\n\nPosso ajudar com informações jurídicas sobre testamentos e heranças, escrita de autobiografia e cartas familiares.\n\nPergunte qualquer coisa!",
  },
  legal: {
    ko: "안녕하세요! **법률 정보 AI 에버**입니다. ⚖️\n\n14개국 유언·상속법 정보를 안내해 드립니다. 한국 민법부터 미국 UPC, 일본 민법, 샤리아 상속법까지 알고 있어요.\n\n어떤 유언·상속 관련 정보가 필요하신가요? (법률 자문이 아닌 정보 제공 서비스입니다)",
    en: "Hello! I'm **Ever Legal**, your will & inheritance law specialist. ⚖️\n\nI'm an expert in will and inheritance laws across 11 countries. Ask me anything about legal matters!\n\nWhat legal question do you have?",
    ja: "こんにちは！**法律専門AI エバーリーガル**です。⚖️\n\n11カ国の遺言・相続法の専門家です。日本民法から米国UPC、シャリーア相続法まで対応します。\n\nどんな法律のご質問でもどうぞ！",
    zh: "您好！我是**法律专业AI Ever Legal**。⚖️\n\n我精通11个国家的遗嘱和继承法。请问您有什么法律问题？",
    de: "Hallo! Ich bin **Ever Legal**, Ihr Erbrechts-Experte. ⚖️\n\nIch kenne das Erbrecht in 11 Ländern. Welche Rechtsfrage haben Sie?",
    es: "¡Hola! Soy **Ever Legal**, tu especialista en derecho testamentario. ⚖️\n\nSoy experto en leyes de testamentos y herencias en 11 países. ¿Qué pregunta legal tienes?",
    ar: "مرحباً! أنا **إيفر ليغال**، متخصص في قانون الوصايا والميراث. ⚖️\n\nأنا خبير في قوانين الوصايا والميراث في 11 دولة. ما سؤالك القانوني؟",
    fr: "Bonjour! Je suis **Ever Legal**, votre spécialiste en droit successoral. ⚖️\n\nJe connais les lois sur les testaments et successions dans 11 pays. Quelle est votre question juridique?",
    ru: "Привет! Я **Эвер Лигал**, ваш специалист по наследственному праву. ⚖️\n\nЯ эксперт в законах о завещаниях и наследстве в 11 странах. Какой у вас юридический вопрос?",
    hi: "नमस्ते! मैं **Ever Legal** हूं, आपका वसीयत और विरासत कानून विशेषज्ञ। ⚖️\n\nमैं 11 देशों के वसीयत और विरासत कानूनों में विशेषज्ञ हूं। आपका कानूनी प्रश्न क्या है?",
    pt: "Olá! Sou **Ever Legal**, seu especialista em direito sucessório. ⚖️\n\nSou especialista em leis de testamentos e heranças em 11 países. Qual é sua dúvida jurídica?",
  },
  autobiography: {
    ko: "안녕하세요! **자서전 전문 AI 에버 스토리**입니다. 📖\n\n회원님의 소중한 인생 이야기를 아름다운 자서전으로 기록해 드릴게요.\n\n유년기부터 현재까지, 어떤 이야기부터 시작할까요?",
    en: "Hello! I'm **Ever Story**, your autobiography specialist. 📖\n\nI'll help you record your precious life story into a beautiful autobiography.\n\nWhere shall we begin — childhood, career, or family?",
    ja: "こんにちは！**自伝専門AI エバーストーリー**です。📖\n\n大切な人生の物語を美しい自伝として記録します。\n\n幼少期から現在まで、どこから始めましょうか？",
    zh: "您好！我是**自传专业AI Ever Story**。📖\n\n我将帮助您将珍贵的人生故事记录成美丽的自传。\n\n我们从哪里开始——童年、职业还是家庭？",
    de: "Hallo! Ich bin **Ever Story**, Ihr Autobiografie-Spezialist. 📖\n\nIch helfe Ihnen, Ihre Lebensgeschichte in eine schöne Autobiografie zu verwandeln.\n\nWo sollen wir beginnen?",
    es: "¡Hola! Soy **Ever Story**, tu especialista en autobiografías. 📖\n\nTe ayudaré a registrar tu preciosa historia de vida en una hermosa autobiografía.\n\n¿Por dónde empezamos?",
    ar: "مرحباً! أنا **إيفر ستوري**، متخصص في السيرة الذاتية. 📖\n\nسأساعدك في تسجيل قصة حياتك القيمة في سيرة ذاتية جميلة.\n\nمن أين نبدأ؟",
    fr: "Bonjour! Je suis **Ever Story**, votre spécialiste en autobiographie. 📖\n\nJe vous aiderai à transformer votre précieuse histoire de vie en une belle autobiographie.\n\nPar où commençons-nous?",
    ru: "Привет! Я **Эвер Стори**, ваш специалист по автобиографии. 📖\n\nЯ помогу вам записать вашу драгоценную историю жизни в красивую автобиографию.\n\nС чего начнём?",
    hi: "नमस्ते! मैं **Ever Story** हूं, आपका आत्मकथा विशेषज्ञ। 📖\n\nमैं आपकी अनमोल जीवन कहानी को एक सुंदर आत्मकथा में दर्ज करने में मदद करूंगा।\n\nहम कहाँ से शुरू करें?",
    pt: "Olá! Sou **Ever Story**, seu especialista em autobiografia. 📖\n\nVou ajudá-lo a registrar sua preciosa história de vida em uma bela autobiografia.\n\nPor onde começamos?",
  },
  diary: {
    ko: "안녕하세요! **일기 전문 AI 에버 다이어리**입니다. 📝\n\n오늘 하루의 소중한 순간들을 함께 기록해요.\n\n오늘 하루 어떠셨나요?",
    en: "Hello! I'm **Ever Diary**, your daily journal companion. 📝\n\nLet's record the precious moments of your day together.\n\nHow was your day today?",
    ja: "こんにちは！**日記専門AI エバーダイアリー**です。📝\n\n今日の大切な瞬間を一緒に記録しましょう。\n\n今日はどんな一日でしたか？",
    zh: "您好！我是**日记专业AI Ever Diary**。📝\n\n让我们一起记录今天珍贵的时刻。\n\n今天过得怎么样？",
    de: "Hallo! Ich bin **Ever Diary**, Ihr täglicher Tagebuch-Begleiter. 📝\n\nLassen Sie uns gemeinsam die kostbaren Momente Ihres Tages festhalten.\n\nWie war Ihr Tag heute?",
    es: "¡Hola! Soy **Ever Diary**, tu compañero de diario diario. 📝\n\nRegistremos juntos los momentos preciosos de tu día.\n\n¿Cómo fue tu día hoy?",
    ar: "مرحباً! أنا **إيفر دايري**، رفيق يومياتك. 📝\n\nلنسجّل معاً اللحظات الثمينة في يومك.\n\nكيف كان يومك اليوم؟",
    fr: "Bonjour! Je suis **Ever Diary**, votre compagnon de journal quotidien. 📝\n\nEnregistrons ensemble les précieux moments de votre journée.\n\nComment s'est passée votre journée?",
    ru: "Привет! Я **Эвер Дайри**, ваш ежедневный спутник по дневнику. 📝\n\nДавайте вместе запишем драгоценные моменты вашего дня.\n\nКак прошёл ваш день?",
    hi: "नमस्ते! मैं **Ever Diary** हूं, आपका दैनिक डायरी साथी। 📝\n\nआइए मिलकर आपके दिन के अनमोल पलों को दर्ज करें।\n\nआज का दिन कैसा था?",
    pt: "Olá! Sou **Ever Diary**, seu companheiro de diário diário. 📝\n\nVamos registrar juntos os momentos preciosos do seu dia.\n\nComo foi seu dia hoje?",
  },
  letter: {
    ko: "안녕하세요! **편지 전문 AI 에버 레터**입니다. 💌\n\n소중한 사람들에게 마음을 전하는 편지를 함께 써드릴게요.\n\n누구에게 편지를 쓰고 싶으신가요?",
    en: "Hello! I'm **Ever Letter**, your letter writing specialist. 💌\n\nLet me help you write heartfelt letters to your loved ones.\n\nWho would you like to write to?",
    ja: "こんにちは！**手紙専門AI エバーレター**です。💌\n\n大切な方への心のこもった手紙を一緒に書きましょう。\n\n誰に手紙を書きたいですか？",
    zh: "您好！我是**书信专业AI Ever Letter**。💌\n\n让我帮您为亲人写一封真挚的信。\n\n您想给谁写信？",
    de: "Hallo! Ich bin **Ever Letter**, Ihr Brief-Schreibspezialist. 💌\n\nLassen Sie mich Ihnen helfen, herzliche Briefe an Ihre Lieben zu schreiben.\n\nAn wen möchten Sie schreiben?",
    es: "¡Hola! Soy **Ever Letter**, tu especialista en escritura de cartas. 💌\n\nDéjame ayudarte a escribir cartas sinceras para tus seres queridos.\n\n¿A quién quieres escribir?",
    ar: "مرحباً! أنا **إيفر ليتر**، متخصص في كتابة الرسائل. 💌\n\nدعني أساعدك في كتابة رسائل صادقة لأحبائك.\n\nلمن تريد أن تكتب؟",
    fr: "Bonjour! Je suis **Ever Letter**, votre spécialiste en rédaction de lettres. 💌\n\nLaissez-moi vous aider à écrire des lettres sincères à vos proches.\n\nÀ qui voulez-vous écrire?",
    ru: "Привет! Я **Эвер Леттер**, ваш специалист по написанию писем. 💌\n\nПозвольте мне помочь вам написать искренние письма вашим близким.\n\nКому вы хотите написать?",
    hi: "नमस्ते! मैं **Ever Letter** हूं, आपका पत्र लेखन विशेषज्ञ। 💌\n\nमुझे आपके प्रियजनों के लिए हार्दिक पत्र लिखने में मदद करने दें।\n\nआप किसे पत्र लिखना चाहते हैं?",
    pt: "Olá! Sou **Ever Letter**, seu especialista em redação de cartas. 💌\n\nDeixe-me ajudá-lo a escrever cartas sinceras para seus entes queridos.\n\nPara quem você quer escrever?",
  },
};

// 비회원 환영 메시지 (언어별)
const GUEST_WELCOME: Record<string, string> = {
  ko: "안녕하세요! EverWill 안내 봇 **에버**입니다. 😊\n\n유언장 작성, 가격, 기능 등 궁금한 점을 물어보세요!\n\n*더 깊은 상담(법률·자서전·편지)은 회원 가입 후 전담 AI에서 이용하실 수 있어요.*",
  en: "Hello! I'm **Ever**, EverWill's guide bot. 😊\n\nAsk me about will writing, pricing, or features!\n\n*For deeper consultation (legal, autobiography, letters), join as a member to access your dedicated AI.*",
  ja: "こんにちは！EverWillガイドボット**エバー**です。😊\n\n遺言書作成、料金、機能などについてお気軽にどうぞ！\n\n*より深いご相談（法律・自伝・手紙）は会員登録後の専任AIをご利用ください。*",
  zh: "您好！我是EverWill导航机器人**Ever**。😊\n\n请随时询问遗嘱写作、价格或功能！\n\n*更深入的咨询（法律、自传、书信）请注册会员后使用专属AI。*",
  de: "Hallo! Ich bin **Ever**, EverWills Führungsbot. 😊\n\nFragen Sie mich zu Testament, Preisen oder Funktionen!\n\n*Für tiefere Beratung (Recht, Autobiografie, Briefe) registrieren Sie sich für Ihren persönlichen KI-Assistenten.*",
  es: "¡Hola! Soy **Ever**, el bot guía de EverWill. 😊\n\n¡Pregúntame sobre testamentos, precios o funciones!\n\n*Para consultas más profundas (legal, autobiografía, cartas), regístrate para acceder a tu IA dedicada.*",
  ar: "مرحباً! أنا **إيفر**، بوت إرشاد EverWill. 😊\n\nاسألني عن كتابة الوصايا أو الأسعار أو الميزات!\n\n*للاستشارات الأعمق (قانونية، سيرة ذاتية، رسائل)، سجّل للوصول إلى ذكاءك الاصطناعي المخصص.*",
  fr: "Bonjour! Je suis **Ever**, le bot guide d'EverWill. 😊\n\nPosez-moi des questions sur les testaments, les prix ou les fonctionnalités!\n\n*Pour des consultations plus approfondies (juridique, autobiographie, lettres), inscrivez-vous pour votre IA dédiée.*",
  ru: "Привет! Я **Эвер**, бот-гид EverWill. 😊\n\nСпросите меня о завещаниях, ценах или функциях!\n\n*Для более глубоких консультаций (юридических, автобиографических, писем) зарегистрируйтесь для доступа к персональному ИИ.*",
  hi: "नमस्ते! मैं **Ever** हूं, EverWill का गाइड बॉट। 😊\n\nवसीयत लेखन, कीमतों या सुविधाओं के बारे में पूछें!\n\n*गहरी परामर्श (कानूनी, आत्मकथा, पत्र) के लिए सदस्य बनें और अपने समर्पित AI का उपयोग करें।*",
  pt: "Olá! Sou **Ever**, o bot guia do EverWill. 😊\n\nPergunte-me sobre testamentos, preços ou recursos!\n\n*Para consultas mais profundas (jurídico, autobiografia, cartas), cadastre-se para acessar sua IA dedicada.*",
};

// ─── UI 텍스트 다국어 매핑 ────────────────────────────────────────
const CHAT_UI: Record<string, Record<string, string>> = {
  guestName:    { ko: "에버 (Ever)", en: "Ever", ja: "エバー", zh: "Ever", de: "Ever", es: "Ever", ar: "إيفر", fr: "Ever", ru: "Эвер", hi: "एवर", pt: "Ever" },
  memberSub:    { ko: "나의 전담 AI · 기억 저장", en: "My dedicated AI · Memory", ja: "専任AI · 記憶保存", zh: "专属AI · 记忆保存", de: "Mein KI · Erinnerungen", es: "Mi IA · Memoria", ar: "ذكائي المخصص", fr: "Mon IA · Mémoire", ru: "Мой ИИ · Память", hi: "मेरा AI · स्मृति", pt: "Meu AI · Memória" },
  guestSub:     { ko: "EverWill 서비스 안내", en: "EverWill Service Guide", ja: "EverWillサービス案内", zh: "EverWill服务指南", de: "EverWill Service", es: "Guía EverWill", ar: "دليل خدمة EverWill", fr: "Guide EverWill", ru: "Руководство EverWill", hi: "EverWill सेवा मार्गदर्शिका", pt: "Guia EverWill" },
  loginBtn:     { ko: "로그인하기", en: "Log In", ja: "ログイン", zh: "登录", de: "Anmelden", es: "Iniciar sesión", ar: "تسجيل الدخول", fr: "Se connecter", ru: "Войти", hi: "लॉग इन", pt: "Entrar" },
  signupBtn:    { ko: "무료 회원가입", en: "Sign Up Free", ja: "無料登録", zh: "免费注册", de: "Kostenlos registrieren", es: "Registro gratis", ar: "التسجيل مجاناً", fr: "S'inscrire gratuitement", ru: "Бесплатная регистрация", hi: "मुफ्त साइन अप", pt: "Cadastre-se grátis" },
  imageGenBtn:  { ko: "AI 그림 생성 (자서전/일기 일러스트)", en: "AI Image (Autobiography/Diary)", ja: "AI絵生成（自伝/日記）", zh: "AI图像（自传/日记）", de: "KI-Bild (Autobiografie)", es: "Imagen IA (Autobiografía)", ar: "صورة AI (السيرة الذاتية)", fr: "Image IA (Autobiographie)", ru: "ИИ-рисунок (Автобиография)", hi: "AI चित्र (आत्मकथा)", pt: "Imagem IA (Autobiografia)" },
  drawBtn:      { ko: "그리기", en: "Draw", ja: "描く", zh: "绘制", de: "Zeichnen", es: "Dibujar", ar: "رسم", fr: "Dessiner", ru: "Нарисовать", hi: "बनाएं", pt: "Desenhar" },
  disclaimer:   { ko: "AI 정보 제공 서비스 · 법률 자문이 아닙니다 · 모든 대화 기억 저장", en: "AI information service · Not legal advice · All chats saved", ja: "AI情報サービス · 法律相談ではありません · 全会話保存", zh: "AI信息服务 · 非法律建议 · 所有对话已保存", de: "KI-Informationsdienst · Keine Rechtsberatung · Alle Chats gespeichert", es: "Servicio de información IA · No es asesoría legal · Chats guardados", ar: "خدمة معلومات AI · ليست استشارة قانونية · جميع المحادثات محفوظة", fr: "Service d'information IA · Pas de conseil juridique · Chats sauvegardés", ru: "ИИ-информационный сервис · Не юридическая консультация · Все чаты сохранены", hi: "AI सूचना सेवा · कानूनी सलाह नहीं · सभी चैट सहेजे", pt: "Serviço de informação IA · Não é aconselhamento jurídico · Chats salvos" },
  imgError:     { ko: "그림 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.", en: "Image generation failed. Please try again.", ja: "画像生成に失敗しました。後でもう一度お試しください。", zh: "图像生成失败，请稍后重试。", de: "Bildgenerierung fehlgeschlagen. Bitte erneut versuchen.", es: "Error al generar imagen. Inténtelo de nuevo.", ar: "فشل إنشاء الصورة. يرجى المحاولة مرة أخرى.", fr: "Échec de la génération d'image. Réessayez.", ru: "Ошибка генерации изображения. Попробуйте снова.", hi: "छवि निर्माण विफल। कृपया पुनः प्रयास करें।", pt: "Falha na geração de imagem. Tente novamente." },
  chatError:    { ko: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", en: "Sorry, a temporary error occurred. Please try again.", ja: "申し訳ありません。一時的なエラーが発生しました。後でもう一度お試しください。", zh: "抱歉，发生了临时错误，请稍后重试。", de: "Entschuldigung, ein vorübergehender Fehler ist aufgetreten. Bitte erneut versuchen.", es: "Lo siento, ocurrió un error temporal. Inténtelo de nuevo.", ar: "عذراً، حدث خطأ مؤقت. يرجى المحاولة مرة أخرى.", fr: "Désolé, une erreur temporaire s'est produite. Réessayez.", ru: "Извините, произошла временная ошибка. Попробуйте снова.", hi: "क्षमा करें, एक अस्थायी त्रुटि हुई। कृपया पुनः प्रयास करें।", pt: "Desculpe, ocorreu um erro temporário. Tente novamente." },
  guestBanner:  { ko: "💡 회원 가입 후 <유언·상속 법률 상담>과 <자서전·편지 작성>을 이용하세요", en: "💡 Sign up to access <Will & Inheritance Legal Advice> and <Autobiography & Letter Writing>", ja: "💡 会員登録後、<遺言・相続法律相談>と<自伝・手紙作成>をご利用ください", zh: "💡 注册后使用<遗嘱·继承法律咨询>和<自传·书信写作>", de: "💡 Registrieren Sie sich für <Testament & Erbrecht-Beratung> und <Autobiografie & Briefe>", es: "💡 Regístrese para <Asesoría Legal Testamento & Herencia> y <Autobiografía & Cartas>", ar: "💡 سجل للوصول إلى <استشارة قانونية الوصايا> و<كتابة السيرة الذاتية والرسائل>", fr: "💡 Inscrivez-vous pour <Conseil Juridique Testament & Héritage> et <Autobiographie & Lettres>", ru: "💡 Зарегистрируйтесь для <Юридической консультации по завещанию> и <Автобиографии & Письмам>", hi: "💡 <वसीयत और विरासत कानूनी सलाह> और <आत्मकथा और पत्र लेखन> के लिए साइन अप करें", pt: "💡 Cadastre-se para <Consultoria Jurídica Testamento & Herança> e <Autobiografia & Cartas>" },
  styleLabels:  { ko: "수스화|유화|연필스케치|디지털아트|빈티지", en: "Watercolor|Oil Painting|Pencil Sketch|Digital Art|Vintage", ja: "水彩画|油絵|鉛筆スケッチ|デジタルアート|ヴィンテージ", zh: "水彩画|油画|铅笔素描|数字艺术|复古", de: "Aquarell|Ölgemälde|Bleistiftskizze|Digitale Kunst|Vintage", es: "Acuarela|Pintura al óleo|Boceto a lápiz|Arte digital|Vintage", ar: "ألوان مائية|لوحة زيتية|رسم بالقلم الرصاص|فن رقمي|عتيق", fr: "Aquarelle|Peinture à l'huile|Esquisse au crayon|Art numérique|Vintage", ru: "Акварель|Масляная живопись|Карандашный набросок|Цифровое искусство|Винтаж", hi: "जलरंग|तेल चित्रकारी|पेंसिल स्केच|डिजिटल कला|विंटेज", pt: "Aquarela|Pintura a óleo|Esboço a lápis|Arte digital|Vintage" },
};

function getChatUI(key: string, lang: string): string {
  return CHAT_UI[key]?.[lang] ?? CHAT_UI[key]?.['ko'] ?? '';
}

export function ChatbotWidget() {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [guestTurnCount, setGuestTurnCount] = useState(0);
  const [sessionKey, setSessionKey] = useState<string | undefined>(undefined);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [aiMode, setAiMode] = useState<AiMode>("general");
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState<"watercolor" | "oil_painting" | "pencil_sketch" | "digital_art" | "vintage_photo">("watercolor");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 빠른 질문 목록 조회
  const { data: quickData } = trpc.chat.getQuickQuestions.useQuery(
    { language },
    { enabled: isOpen }
  );

  // 최근 세션 조회 (회원)
  const { data: latestSession } = trpc.chat.getLatestSession.useQuery(undefined, {
    enabled: isOpen && isAuthenticated,
  });

  // 히스토리 조회 (회원)
  const { data: historyData } = trpc.chat.getHistory.useQuery(
    { sessionKey: sessionKey || "" },
    { enabled: isAuthenticated && !!sessionKey && !historyLoaded }
  );

  // 비회원 채팅 mutation
  const publicChatMutation = trpc.chat.publicChat.useMutation();

  // 회원 전담 AI mutation
  const memberChatMutation = trpc.chat.memberChat.useMutation();

  // 자서전/일기 그림 생성 mutation
  const generateImageMutation = trpc.chat.generateStoryImage.useMutation();

  // 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 최근 세션 키 설정 (회원)
  useEffect(() => {
    if (latestSession?.sessionKey && !sessionKey) {
      setSessionKey(latestSession.sessionKey);
    }
  }, [latestSession, sessionKey]);

  // 히스토리 로드 (회원)
  useEffect(() => {
    if (historyData && !historyLoaded && isAuthenticated && messages.length === 0) {
      if (historyData.messages.length > 0) {
        const loaded: Message[] = historyData.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
        }));
        setMessages(loaded);
        setShowQuickQuestions(false);
        setHistoryLoaded(true);
        return;
      }
      setHistoryLoaded(true);
    }
  }, [historyData, historyLoaded, isAuthenticated, messages.length]);

  // 챗봇 열릴 때 환영 메시지
  useEffect(() => {
    if (isOpen && messages.length === 0 && historyLoaded) {
      const welcome = isAuthenticated
        ? (MODE_WELCOME[aiMode][language] || MODE_WELCOME[aiMode]["ko"])
        : (GUEST_WELCOME[language] || GUEST_WELCOME["ko"]);
      setMessages([{ role: "assistant", content: welcome, timestamp: new Date() }]);
    }
  }, [isOpen, messages.length, historyLoaded, isAuthenticated, language, aiMode]);

  // 비회원: 히스토리 없으므로 바로 로드 완료 처리
  useEffect(() => {
    if (!isAuthenticated) {
      setHistoryLoaded(true);
    }
  }, [isAuthenticated]);

  // 포커스 이동
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // 모드 변경 시 대화 초기화
  const handleModeChange = (newMode: AiMode) => {
    if (newMode === aiMode) return;
    setAiMode(newMode);
    setMessages([]);
    setShowQuickQuestions(true);
    setHistoryLoaded(true);
    setShowImagePanel(false);
    setGeneratedImageUrl(null);
  };

  // 그림 생성 핸들러
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || generateImageMutation.isPending) return;
    setGeneratedImageUrl(null);
    try {
      const result = await generateImageMutation.mutateAsync({
        prompt: imagePrompt,
        style: imageStyle,
        language,
      });
      setGeneratedImageUrl(result.url ?? null);
    } catch {
      alert(getChatUI('imgError', language));
    }
  };

  // 메시지 전송
  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
      mode: aiMode,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowQuickQuestions(false);

    try {
      if (isAuthenticated) {
        // 회원 전담 AI (모드별)
        const result = await memberChatMutation.mutateAsync({
          message: messageText,
          sessionKey,
          language,
          aiMode,
        });
        if (result.sessionKey && !sessionKey) {
          setSessionKey(result.sessionKey);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.content as string,
            timestamp: new Date(),
            mode: aiMode,
          },
        ]);
      } else {
        // 비회원 안내 봇
        const newTurnCount = guestTurnCount + 1;
        const conversationHistory = [...messages, userMessage]
          .slice(-10)
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        const result = await publicChatMutation.mutateAsync({
          messages: conversationHistory,
          language,
          turnCount: newTurnCount,
        });

        setGuestTurnCount(newTurnCount);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.content as string,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: getChatUI('chatError', language),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 마크다운 간단 렌더링
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      );
      const italicParts = rendered.flatMap((part, idx) => {
        if (typeof part !== "string") return [part];
        const sp = part.split(/\*(.*?)\*/g);
        return sp.map((s, k) => (k % 2 === 1 ? <em key={`${idx}-${k}`}>{s}</em> : s));
      });
      return (
        <span key={i}>
          {italicParts}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  // 챗봇 초기화
  const handleReset = () => {
    setIsOpen(false);
    setMessages([]);
    setShowQuickQuestions(true);
    setGuestTurnCount(0);
    setHistoryLoaded(!isAuthenticated);
    setAiMode("general");
  };

  // 현재 모드 설정
  const currentMode = AI_MODES.find((m) => m.id === aiMode) || AI_MODES[0];
  const currentPlaceholder = currentMode.placeholder[language] || currentMode.placeholder["ko"];

  return (
    <>
      {/* 플로팅 버튼 */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1F3864, #2d5a9e)" }}
              aria-label="EverWill AI 상담사 열기"
            >
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C9A961] rounded-full flex items-center justify-center">
                {isAuthenticated ? (
                  <Sparkles className="w-3 h-3 text-white" />
                ) : (
                  <span className="text-[8px] font-bold text-white">AI</span>
                )}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* 챗봇 창 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 right-0 w-[390px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ height: isAuthenticated ? "620px" : "560px", maxHeight: "calc(100vh - 100px)" }}
            >
              {/* 헤더 */}
              <div
                className="flex items-center justify-between px-4 py-3 text-white flex-shrink-0"
                style={{
                  background: isAuthenticated
                    ? `linear-gradient(135deg, #1F3864, ${currentMode.color})`
                    : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: isAuthenticated ? "#C9A961" : "rgba(255,255,255,0.2)" }}
                  >
                    {isAuthenticated ? (
                      <span className="text-white">{currentMode.icon}</span>
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {isAuthenticated
                        ? (currentMode.description[language] || currentMode.description["ko"])
                        : getChatUI('guestName', language)}
                    </p>
                    <p className="text-xs text-white/70">
                      {isAuthenticated
                        ? getChatUI('memberSub', language)
                        : getChatUI('guestSub', language)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isAuthenticated && sessionKey && (
                    <button
                      onClick={() => {
                        setHistoryLoaded(false);
                        setMessages([]);
                      }}
                      className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                      aria-label="이전 대화 불러오기"
                      title="이전 대화 이어서"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="챗봇 최소화"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="챗봇 닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 회원 AI 모드 선택 탭 */}
              {isAuthenticated && (
                <div className="flex border-b border-gray-100 flex-shrink-0 bg-gray-50">
                  {AI_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id)}
                      className="flex-1 flex flex-col items-center py-2 px-1 text-[10px] font-medium transition-all"
                      style={{
                        color: aiMode === mode.id ? mode.color : "#9ca3af",
                        borderBottom: aiMode === mode.id ? `2px solid ${mode.color}` : "2px solid transparent",
                        background: aiMode === mode.id ? mode.bgColor : "transparent",
                      }}
                      title={mode.description[language] || mode.description["ko"]}
                    >
                      <span style={{ color: aiMode === mode.id ? mode.color : "#9ca3af" }}>
                        {mode.icon}
                      </span>
                      <span className="mt-0.5">{mode.label[language] || mode.label["ko"]}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: isAuthenticated
                            ? `linear-gradient(135deg, #1F3864, ${currentMode.color})`
                            : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                        }}
                      >
                        {isAuthenticated ? (
                          <span className="text-white text-xs">{currentMode.icon}</span>
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-800 rounded-tl-sm"
                      }`}
                      style={
                        msg.role === "user"
                          ? {
                              background: isAuthenticated
                                ? `linear-gradient(135deg, #1F3864, ${currentMode.color})`
                                : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                            }
                          : {}
                      }
                    >
                      {renderContent(msg.content)}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {/* 로딩 */}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isAuthenticated
                          ? `linear-gradient(135deg, #1F3864, ${currentMode.color})`
                          : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                      }}
                    >
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 비회원 가입 유도 버튼 */}
                {!isAuthenticated && guestTurnCount >= 3 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <Link href="/login">
                      <button
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                        style={{ background: "linear-gradient(135deg, #1F3864, #2d5a9e)" }}
                      >
                        <LogIn className="w-4 h-4" />
                        {getChatUI('loginBtn', language)}
                      </button>
                    </Link>
                    <Link href="/login?tab=signup">
                      <button
                        className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2"
                        style={{ borderColor: "#C9A961", color: "#C9A961" }}
                      >
                        {getChatUI('signupBtn', language)}
                      </button>
                    </Link>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 빠른 질문 버튼 (비회원 또는 통합 모드) */}
              {showQuickQuestions && quickData?.questions && (!isAuthenticated || aiMode === "general") && (
                <div className="px-3 pb-2 flex-shrink-0">
                  <div className="flex flex-wrap gap-1.5">
                    {quickData.questions.slice(0, 4).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
                        style={{ borderColor: "#1F3864", color: "#1F3864" }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 회원 자서전/일기 모드: 그림 생성 패널 */}
              {isAuthenticated && (aiMode === "autobiography" || aiMode === "diary") && (
                <div className="border-t border-gray-100 flex-shrink-0">
                  {/* 그림 생성 토글 버튼 */}
                  <button
                    onClick={() => setShowImagePanel(!showImagePanel)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ color: currentMode.color }}
                  >
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {getChatUI('imageGenBtn', language)}
                    </span>
                    <span className="text-gray-400">{showImagePanel ? "▲" : "▼"}</span>
                  </button>

                  {/* 그림 생성 패널 내용 */}
                  <AnimatePresence>
                    {showImagePanel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2">
                          {/* 스타일 선택 */}
                          <div className="flex gap-1 flex-wrap">
                            {(() => {
                              const labels = getChatUI('styleLabels', language).split('|');
                              return [
                                { id: "watercolor", label: labels[0] ?? 'Watercolor' },
                                { id: "oil_painting", label: labels[1] ?? 'Oil Painting' },
                                { id: "pencil_sketch", label: labels[2] ?? 'Pencil Sketch' },
                                { id: "digital_art", label: labels[3] ?? 'Digital Art' },
                                { id: "vintage_photo", label: labels[4] ?? 'Vintage' },
                              ];
                            })().map((s) => (
                              <button
                                key={s.id}
                                onClick={() => setImageStyle(s.id as typeof imageStyle)}
                                className="text-[10px] px-2 py-1 rounded-full border transition-colors"
                                style={{
                                  background: imageStyle === s.id ? currentMode.color : "transparent",
                                  color: imageStyle === s.id ? "white" : currentMode.color,
                                  borderColor: currentMode.color,
                                }}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>

                          {/* 장면 설명 입력 */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={imagePrompt}
                              onChange={(e) => setImagePrompt(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleGenerateImage()}
                              placeholder="그리고 싶은 장면을 설명해주세요..."
                              className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none bg-gray-50"
                              style={{ borderColor: showImagePanel ? currentMode.color : undefined }}
                            />
                            <button
                              onClick={handleGenerateImage}
                              disabled={!imagePrompt.trim() || generateImageMutation.isPending}
                              className="px-3 py-2 rounded-lg text-white text-xs font-medium disabled:opacity-40 flex items-center gap-1"
                              style={{ background: currentMode.color }}
                            >
                              {generateImageMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Palette className="w-3.5 h-3.5" />
                              )}
                              {getChatUI('drawBtn', language)}
                            </button>
                          </div>

                          {/* 생성된 그림 */}
                          {generatedImageUrl && (
                            <div className="relative rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={generatedImageUrl}
                                alt="AI 생성 그림"
                                className="w-full h-40 object-cover"
                              />
                              <a
                                href={generatedImageUrl}
                                download="everwill-story-image.png"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow"
                                title="다운로드"
                              >
                                <Download className="w-3.5 h-3.5 text-gray-700" />
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 비회원 로그인 유도 배너 */}
              {!isAuthenticated && (
                <div
                  className="px-4 py-2 text-xs text-center flex-shrink-0"
                  style={{ background: "#f8f4ec", color: "#92400e" }}
                >
                  {getChatUI('guestBanner', language)}
                </div>
              )}

              {/* 입력창 */}
              <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t border-gray-100">
                <div className="flex gap-2 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isAuthenticated ? currentPlaceholder : "서비스에 대해 물어보세요..."}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1F3864] bg-gray-50"
                    disabled={isLoading || (!isAuthenticated && guestTurnCount >= 3)}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isLoading || (!isAuthenticated && guestTurnCount >= 3)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity"
                    style={{
                      background: isAuthenticated
                        ? `linear-gradient(135deg, #1F3864, ${currentMode.color})`
                        : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-1.5">
                  {getChatUI('disclaimer', language)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
