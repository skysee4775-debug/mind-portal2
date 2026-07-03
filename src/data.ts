import { Question, TestResult, QuizQuestion, Quote, Post, DiagnosticQuestion } from "./types";

export const STRESS_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Q1. 과제와 시험이 동시에 몰아쳐 머릿속이 터질 것 같은 순간, 당신이 가장 먼저 취하는 행동은?",
    options: [
      { text: "일단 눕자. '어차피 내일의 내가 하겠지' 하며 이불 속으로 피신한다.", score: { sloth: 3, meerkat: 0, lion: 0, whale: 0, hedgehog: 0 } },
      { text: "가만히 있지 못하고 분초 단위로 빽빽하게 계획표를 짜며 손톱을 깨문다.", score: { sloth: 0, meerkat: 3, lion: 1, whale: 0, hedgehog: 0 } },
      { text: "이를 악물고 커피를 연거푸 들이부으며 밤샘 전력투구 모드로 들어간다.", score: { sloth: 0, meerkat: 0, lion: 3, whale: 1, hedgehog: 0 } },
      { text: "겉으로는 태연한 척하지만, 마음 한구석이 꽉 막힌 채 묵묵히 혼자 끙끙 앓는다.", score: { sloth: 0, meerkat: 0, lion: 0, whale: 3, hedgehog: 1 } },
      { text: "누군가 한 마디만 걸어도 신경질이 확 날 것 같아, 귀에 이어폰을 세게 꼽고 세상과 단절한다.", score: { sloth: 0, meerkat: 0, lion: 0, whale: 0, hedgehog: 3 } }
    ]
  },
  {
    id: 2,
    text: "Q2. 친구 혹은 학과 내 동기와의 사소한 오해로 마음이 온종일 좋지 않을 때, 나는 보통 어떻게 대응하나요?",
    options: [
      { text: "친구 눈치를 끊임없이 보며 머릿속으로 '싫어하면 어쩌지?' 백만 가지 걱정을 한다.", score: { sloth: 0, meerkat: 3, lion: 0, whale: 1, hedgehog: 0 } },
      { text: "속상하지만 관계를 망칠까 두려워, 아무 일도 없는 듯 혼자 꾹 참고 속으로 삭인다.", score: { sloth: 0, meerkat: 0, lion: 0, whale: 3, hedgehog: 0 } },
      { text: "단톡방을 무음으로 돌리고 마음속 가시를 세운 채 연락을 먼저 끊어 버린다.", score: { sloth: 0, meerkat: 0, lion: 0, whale: 0, hedgehog: 3 } },
      { text: "신경 쓰는 것도 스트레스! 머리 식힌답시고 유튜브나 게임에 온 정신을 몰두한다.", score: { sloth: 3, meerkat: 0, lion: 0, whale: 0, hedgehog: 1 } },
      { text: "이 찝찝한 상태를 참을 수 없다. 즉각 연락해 삼자대면이든 대화든 빨리 담판을 지으려 한다.", score: { sloth: 0, meerkat: 1, lion: 3, whale: 0, hedgehog: 0 } }
    ]
  },
  {
    id: 3,
    text: "Q3. 많은 시간을 준비해 제출한 프로젝트나 과제 발표의 결과(피드백)가 만족스럽지 못할 때의 나의 반응은?",
    options: [
      { text: "자책감이 몰려와 주위 사람들의 사소한 시선과 평가마저 날선 비수처럼 의식된다.", score: { sloth: 0, meerkat: 3, lion: 0, whale: 1, hedgehog: 0 } },
      { text: "패배감에 깊이 침잠해 침대에 무기력하게 쓰러진 채 무제한 스크롤링만 반복한다.", score: { sloth: 3, meerkat: 0, lion: 0, whale: 0, hedgehog: 1 } },
      { text: "가슴이 철렁 내려앉지만 동료나 팀원들에게는 애써 상냥한 미소를 지으며 다독인다.", score: { sloth: 0, meerkat: 0, lion: 0, whale: 3, hedgehog: 0 } },
      { text: "오기가 생긴다. '내가 뭐가 부족해서?' 하고 눈을 부릅뜬 채 다음 만회할 계획을 몰두한다.", score: { sloth: 0, meerkat: 0, lion: 3, whale: 0, hedgehog: 0 } },
      { text: "세상의 불공평함에 화가 솟구치며 주변 모든 것(특히 사소한 환경이나 사람)에 퉁명스러워진다.", score: { sloth: 0, meerkat: 0, lion: 0, whale: 0, hedgehog: 3 } }
    ]
  },
  {
    id: 4,
    text: "Q4. 기나긴 시험이나 힘든 일정들이 끝나고 드디어 찾아온 꿀맛 같은 주말, 당신이 에너지를 채우는 완벽한 방법은?",
    options: [
      { text: "휴대폰 알람을 모두 끄고, 화장실 갈 때만 빼고 침대 위에서 끝없이 숙면을 취하기", score: { sloth: 3, meerkat: 0, lion: 0, whale: 0, hedgehog: 1 } },
      { text: "방을 암실처럼 어둡게 만들고 홀로 방구석 아늑한 곳에서 조용한 음악이나 독서를 즐기기", score: { sloth: 0, meerkat: 0, lion: 0, whale: 1, hedgehog: 3 } },
      { text: "바다나 탁 트인 공원으로 훌쩍 떠나, 말없이 흘러가는 풍경을 멍하니 바라보며 잡념 비우기", score: { sloth: 1, meerkat: 0, lion: 0, whale: 3, hedgehog: 0 } },
      { text: "또 흐지부지 시간을 보내면 불안하니까, 미뤄뒀던 인강을 듣거나 계획적인 갓생 투어를 떠나기", score: { sloth: 0, meerkat: 1, lion: 3, whale: 0, hedgehog: 0 } },
      { text: "가장 친한 친구들을 잔뜩 불러 수다를 마음껏 떨고 웃으며 마음속에 묵은 감정을 다 털어내기", score: { sloth: 0, meerkat: 3, lion: 0, whale: 0, hedgehog: 0 } }
    ]
  },
  {
    id: 5,
    text: "Q5. '아, 나 지금 진짜 엄청나게 스트레스 한계구나!' 하고 자각하게 만드는 나만의 시그널은?",
    options: [
      { text: "손가락 하나 까딱하기 싫고, 씻는 것조차 거대한 산을 넘는 것처럼 극도로 귀찮아진다.", score: { sloth: 3, meerkat: 0, lion: 0, whale: 0, hedgehog: 0 } },
      { text: "가슴이 두근거리거나 얹힌 듯 소화가 안 되고, 꼬리에 꼬리를 무는 최악의 불면증에 시달린다.", score: { sloth: 0, meerkat: 3, lion: 0, whale: 1, hedgehog: 0 } },
      { text: "눈물이 왈칵 쏟아질 것 같고 온 세상에 나 혼자 버려진 듯 쓸쓸하지만 겉으론 웃고만 있다.", score: { sloth: 0, meerkat: 0, lion: 0, whale: 3, hedgehog: 1 } },
      { text: "몸이 천근만근 무거운데도 '멈추면 뒤처진다'는 불안에 마른 스펀지 쥐어짜듯 계속 몰아붙인다.", score: { sloth: 0, meerkat: 0, lion: 3, whale: 0, hedgehog: 0 } },
      { text: "주변의 가벼운 농담이나 스치듯 건넨 조언마저 나를 깎아내리는 것처럼 느껴져 욱한다.", score: { sloth: 0, meerkat: 0, lion: 0, whale: 0, hedgehog: 3 } }
    ]
  }
];

export const TEST_RESULTS: Record<string, TestResult> = {
  sloth: {
    id: "sloth",
    name: "방전된 아기 나무늘보",
    title: "회피와 무기력의 늪에 빠진 평화주의자",
    description: "스트레스가 과부하되면 뇌 회로의 퓨즈를 아예 내려버리는 타입이에요. 복잡하고 골치 아픈 현실에서 잠시 도망쳐 온종일 잠을 자거나 무기력감에 빠져들곤 해요. 갈등을 극도로 싫어하는 성격이기도 합니다.",
    strengths: [
      "과한 경쟁심이 없어 주위 사람들을 편안하게 해줍니다.",
      "불필요한 갈등을 유발하지 않는 온화한 평화주의자입니다."
    ],
    stressSigns: [
      "방에서 나오지 않고 씻거나 챙겨 먹는 일상 루틴이 극도로 무너집니다.",
      "마음은 엄청나게 불안한데 몸은 무겁게 가라앉아 이불 속에 계속 누워있게 됩니다."
    ],
    tips: [
      "무거운 과업을 아주 작은 크기(예: '책상 앞에 2분만 앉기', '일단 물 한 잔 마시기')로 쪼개어 가볍게 발을 떼 보세요.",
      "침대에서 나와 햇빛을 딱 10분만 쬐며 걷는 것만으로도 가라앉은 마음에 시동을 걸 수 있어요.",
      "무기력의 밑바닥에는 사실 엄청난 잘하고 싶은 욕심이 숨어 있을 수 있어요. 완벽하지 않아도 좋으니 가볍게 해보자고 스스로 다독여주세요."
    ],
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400"
  },
  meerkat: {
    id: "meerkat",
    name: "초초조한 미어캣",
    title: "사소한 불안도 우주 크기로 커지는 프로 과생러",
    description: "스트레스 상황이 오면 마음속 레이더가 사방으로 삐빅대며 돌아갑니다. 주위 사람들의 반응, 미래에 대한 온갖 상상들이 부정적인 소설로 이어지며 스스로를 초조함의 궁지로 몰아넣곤 해요. 에너지가 늘 머리 위쪽으로 과하게 쏠려 있습니다.",
    strengths: [
      "상황에 대한 대처 능력이 빠르고 빈틈이 없습니다.",
      "공감 능력이 좋아 주변 사람들의 마음을 귀신같이 잘 배려해줍니다."
    ],
    stressSigns: [
      "심장이 툭하면 빨리 뛰거나 숨을 얕게 쉬고 소화불량이 자주 일어납니다.",
      "사소한 일도 최악의 시나리오로 부풀려 생각하느라 걱정 때문에 잠에 쉽게 들지 못합니다."
    ],
    tips: [
      "머리로 가 가득 찬 에너지를 발바닥으로 내려보내야 해요. '지금 이 순간 내 발바닥이 땅에 닿는 느낌'에 1분간 온전히 집중해 보세요 (그라운딩 기법).",
      "불안한 생각들을 머릿속으로만 굴리지 말고 하얀 도화지나 메모장에 날것 그대로 다 적어 밖으로 끄집어내 보세요.",
      "그 걱정의 90%는 실제로 일어나지 않는답니다. '지금 당장 내가 바꿀 수 있는 일인가?' 질문을 던져보고 아니라면 시원하게 숨과 함께 내보내요."
    ],
    imageUrl: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&q=80&w=400"
  },
  lion: {
    id: "lion",
    name: "엔진 과열된 불꽃 사자",
    title: "번아웃 신호를 무시하고 폭주하는 완벽주의 야망가",
    description: "스트레스가 오면 오히려 더 속도를 내며 '내가 극복해낸다!'를 외치는 타입이에요. 마음에 경고등이 켜져도 무시하고 질주하다가, 어느 날 갑자기 퓨즈가 완전히 타버려 극단적인 무력감을 겪을 수 있습니다.",
    strengths: [
      "탁월한 추진력과 강한 책임감, 목표를 끝내 성취해내는 의지가 돋보입니다.",
      "위기 상황에서도 당황하지 않고 주도적으로 문제를 해결하려 합니다."
    ],
    stressSigns: [
      "쉬는 날조차 편히 쉬지 못하고 '뒤처지는 것 아닌가?' 불안해서 끊임없이 일거리를 찾습니다.",
      "입술이 트거나 목 뒤가 굳는 등 신체가 고통 신호를 보내도 '이 정도는 참아야 해' 하며 가혹하게 스스로를 채찍질합니다."
    ],
    tips: [
      "하루 일과표에 '공식적인 아무것도 안 하는 쉼'을 의무적으로 채워 넣어 보세요. 쉬는 것도 멋진 생산의 과정입니다.",
      "나의 쓸모나 성과가 나라는 존재의 가치와 완벽히 동일하진 않다는 점을 기억해야 합니다.",
      "한 정거장 일찍 내려 좋아하는 음악을 들으며 천천히 목적지 없이 산책하는 여유를 마음속 일 순위로 예약해주세요."
    ],
    imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=400"
  },
  whale: {
    id: "whale",
    name: "심해의 고독한 고래",
    title: "슬픔을 삼키며 미소 짓는 고요한 수호자",
    description: "내 아픔이나 스트레스를 표현하는 것이 주위 사람들에게 무거운 짐이 될까 봐 두려워하는 타입이에요. 혼자 깊고 고요한 바닷속으로 들어가 슬픔이나 걱정을 가득 안고 삭이며, 남들 앞에선 '나 괜찮아!' 하고 밝은 외피를 유지하곤 해요.",
    strengths: [
      "타인에 대한 깊은 이해심과 말 없는 든든함, 진중한 배려가 아주 아름답습니다.",
      "가벼운 감정적 충동에 휩쓸리지 않고 차분하게 성찰하는 내면의 깊이가 있습니다."
    ],
    stressSigns: [
      "사람들을 만난 후 돌아왔을 때 말할 수 없는 지독한 영혼의 고독함과 공허함을 느낍니다.",
      "눈물이 이유 없이 수시로 고이거나, 누군가 '요즘 힘든 일 없어?'라고 마음을 툭 건드리면 왈칵 눈물이 쏟아질 것 같습니다."
    ],
    tips: [
      "고래가 숨을 쉬기 위해 수면 위로 올라와 '푸우-' 하고 숨구멍을 열 듯, 마음속 응어리를 안전한 곳에서 소리 내어 뱉어내야 합니다.",
      "나의 나약함이나 속상함을 공유하는 것은 민폐가 아니라 타인과 진실되게 소통하는 아주 아름다운 용기입니다.",
      "마음의 응어리를 믿을 수 있는 전문 상담사와 단둘이 안전한 상담실 방에서 솔직하고 시원하게 다 풀어보는 경험을 꼭 추천해 드립니다."
    ],
    imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400"
  },
  hedgehog: {
    id: "hedgehog",
    name: "방어막을 세운 고슴도치",
    title: "상처받지 않으려 가시를 잔뜩 세운 여린 낭만파",
    description: "마음의 에너지가 고갈되면 극도로 예민해져서 사소한 참견이나 농담에도 날선 가시를 삐죽 세우게 됩니다. 상처받고 약해진 자신의 내면을 들키지 않으려 타인을 밀어내지만, 실제로는 누구보다 사랑과 따뜻한 이해를 갈구하고 있어요.",
    strengths: [
      "풍부하고 섬세한 예술적/내면적 감수성을 지니고 있습니다.",
      "적당한 거리 유지를 통해 자신만의 고유한 내면 영역을 소중히 가꿀 줄 압니다."
    ],
    stressSigns: [
      "가까운 연인, 가족, 친구들이 친근하게 건넨 말이 비꼬는 것처럼 들려 날카로운 말투로 후회할 말을 쏘아붙이게 됩니다.",
      "세상과 타인을 향한 불신이나 섭섭함이 솟구치며 스스로 자발적 고립을 선택합니다."
    ],
    tips: [
      "예민함이 치솟아 가시를 세우고 싶어질 땐, 일단 그 자리를 피해 시원한 바람을 쐬거나 5초간 가만히 눈을 감아 마음의 온도를 낮춰 주세요.",
      "나에게 가시를 날카롭게 세우는 타인을 보며 '저 사람도 지금 마음의 에너지가 많이 방전되었구나'라고 제삼자 입장에서 한 걸음 물러나 바라보세요.",
      "날카로운 가시 속에 숨겨진 진짜 내 소중하고 연약한 감정(속상함, 슬픔, 사랑받고 싶음)을 있는 그대로 인정하고 글로 적어 마음을 부드럽게 쓰다듬어 주세요."
    ],
    imageUrl: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&q=80&w=400"
  }
};

export const PSYCHOLOGY_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "상담실에 다녀간 기록은 대학 내 포털이나 학생 이력에 평생 남아서 진로나 취업에 치명적인 불이익을 준다?",
    answer: false,
    explanation: "전혀 사실이 아니에요! 🙅‍♀️ 대학교 학생상담센터의 모든 상담 내용은 고도의 상담 윤리강령 및 법령(개인정보보호법)에 따라 철저한 비밀 유지가 원칙입니다. 학적부, 성적표, 장학금 신청 등 학교 내 그 어떤 공식 행정망에도 상담 이용 여부는 절대 연동되지 않으니 100% 안심하셔도 됩니다!"
  },
  {
    id: 2,
    question: "가슴이 무겁고 우울하거나 화가 날 때, 샌드백을 세게 치거나 소리를 지르면 분노가 건강하게 해소된다?",
    answer: false,
    explanation: "의외로 오답이랍니다! 🥊 심리학의 오랜 '환기 가설(Catharsis Hypothesis)' 연구들에 따르면, 격렬하고 폭력적인 물리적 활동을 통해 화를 분출하는 행동은 분노를 가라앉히기보다 뇌의 흥분과 심장박동을 늘려 오히려 분노 회로를 더욱 자극하고 자제력을 무너뜨린다고 해요. 분노가 차오를 땐 오히려 호흡을 깊고 느리게 조절하거나, 그 자리를 잠시 떠나 조용히 이완하는 것이 심리학적으로 훨씬 유익합니다."
  },
  {
    id: 3,
    question: "성격 유형 검사(MBTI 등) 결과는 타고난 기질이기에 성인이 된 이후에는 평생 고정되어 변하지 않는다?",
    answer: false,
    explanation: "그렇지 않아요! 🌱 성격은 단단하게 굳어진 돌멩이가 아닌, 살아 숨 쉬는 유기체에 가깝습니다. 대학교에 입학해 다양한 사람들과 상호작용하고, 크고 작은 도전과 시련을 극복해 나가면서 생각의 틀과 마음의 대처 방식은 유연하게 변합니다. 성격 검사는 '현재 나의 주된 마음의 사용 습관'을 보여주는 것일 뿐, 나라는 넓은 바다를 규정하는 한계선이 아닙니다."
  },
  {
    id: 4,
    question: "친한 친구나 선배에게 털어놓는 고민 나눔과, 전문 상담실에서 진행되는 개인 상담은 엄연히 성격이 다르다?",
    answer: true,
    explanation: "매우 맞습니다! 🤝 친한 이들과의 대화는 친밀감을 기반으로 한 자연스러운 위로와 공감대 형성이라면, 전문 상담은 심리학 이론과 체계적 수련 과정을 거친 전문가가 구조화되고 안전한 공간에서 내 마음의 깊은 패턴을 분석하고 스스로를 객관화하도록 이끄는 '치유의 과학적 여정'입니다. 사적 관계가 얽히지 않아 눈치 보지 않고 가장 솔직한 나를 안전하게 마주할 수 있다는 독보적인 장점이 있죠."
  },
  {
    id: 5,
    question: "학생상담센터는 극심한 우울증이나 심각한 정신적 질환을 겪는 소수의 학생만 찾아가는 무거운 공간이다?",
    answer: false,
    explanation: "절대 아닙니다! 🏫 학생상담센터의 문은 대다수 대학생의 보편적 성장을 위해 넓게 열려 있어요. '진로 선택의 갈림길에서 머리가 아플 때', '연인 혹은 인간관계가 내 맘대로 풀리지 않을 때', '학업 스트레스로 무기력해질 때', 혹은 그저 '요즘 잠이 잘 안 오고 나 자신에 대해 깊이 알아보고 싶을 때' 등 대학 생활의 모든 소소하고 평범한 고비마다 마음에 반창고를 붙이듯 자유롭고 가볍게 방문해 위안을 얻을 수 있는 포근한 아지트랍니다."
  }
];

export const HEALING_QUOTES: Quote[] = [
  { id: 1, text: "흔들리지 않고 피는 꽃이 어디 있으랴. 도망치는 날이 있어도, 쓰러지는 날이 있어도 괜찮아. 그 모든 걸 겪고 피어나는 너는 정말 소중한 존재란다.", author: "어느 다정한 상담사 선생님" },
  { id: 2, text: "완벽하지 않아도 좋아. 오늘의 네가 쏟은 노력은 온전히 네 삶의 소중한 무늬가 될 거야. 조금만 숨을 돌려도 결코 늦지 않아.", author: "너의 편이 되어줄 위로 구절" },
  { id: 3, text: "나를 사랑하는 첫걸음은 지금 내 마음이 아프고 힘들다는 사실을 있는 그대로 인정해주고 다독여 주는 일부터 시작되는 거야.", author: "마음 수용 연구소" },
  { id: 4, text: "어두운 밤하늘이 있어야 비로소 밤하늘의 은하수가 아름답게 빛나듯이, 마음의 어두운 밤을 지나는 너에게 곧 고운 별빛들이 가득 채워질 거야.", author: "희망 처방전" },
  { id: 5, text: "가장 힘든 것은 나를 자책하는 목소리야. 가슴을 펴고 '그동안 버텨내느라 수고 많았어'라고 너에게 고맙다고 속삭여 주렴.", author: "자기공감 마음 훈련" }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "post_1",
    category: "Social",
    title: "첫인상이 결정되는 3초의 마법, '초두효과' 바로 알기",
    content: "우리가 처음 누군가를 만날 때, 단 3초 만에 그 사람에 대한 많은 이미지가 결정된다는 사실 알고 계셨나요? 이를 심리학에서는 '초두효과(Primacy Effect)'라고 부릅니다. \n\n하지만 대학교 새 학기나 새로운 동아리에 들어갔을 때, 첫인상을 망쳤다고 너무 걱정하지 마세요. 심리학에는 또한 '빈발효과(Frequency Effect)'가 있어서, 진정성 있는 모습을 지속해서 보여준다면 첫인상의 오해는 얼마든지 뒤집을 수 있답니다. 완벽해 보이려고 애쓰는 것보다 자연스러운 여러분의 온도를 보여주세요.",
    createdAt: "2026-06-30",
    likes: 12
  },
  {
    id: "post_2",
    category: "Learning",
    title: "시험 기간 뇌가 굳을 때 쓰는 꿀팁: 뽀모도로 기법",
    content: "공부 효율을 높이기 위해 무작정 5시간씩 자리에 앉아있으면 뇌의 전두엽은 쉽게 지칩니다. 심리학적 집중 효율 극대화 방법으로 '뽀모도로 기법'을 활용해 보세요. \n\n25분간 한 가지 일에 100% 온전히 집중한 뒤, 5분간 완벽하게 자리를 떠나 뇌에 완전한 휴식을 주는 것입니다. 4사이클을 반복한 후에는 20~30분의 긴 휴식을 취해줍니다. 뇌는 '쉬는 시간' 동안 방금 학습한 정보를 영구 기억 저장소로 이동시키는 정리 작업을 한답니다. 똑똑하게 쉬어가는 공부를 실천해 봐요!",
    createdAt: "2026-07-01",
    likes: 24
  },
  {
    id: "post_3",
    category: "Emotion",
    title: "자꾸만 남과 나를 비교하게 될 때의 심리 처방전",
    content: "SNS 속 동기들의 멋진 인턴 일상이나 연애, 맛집 피드를 보며 나의 평범한 자취방 침대가 초라해 보인 경험이 있나요? \n\n심리학에서는 이를 '사회적 비교 이론(Social Comparison Theory)'으로 설명합니다. 인간은 생존을 위해 끊임없이 주변과 자신을 비교하도록 설계되어 있어 아주 자연스러운 감정입니다. 하지만 SNS는 타인의 인생 중 오직 '가장 반짝이는 1%'의 하이라이트 필터 샷일 뿐이라는 점을 명심하세요. 여러분의 비하인드 씬(Behind the scenes)과 타인의 하이라이트 씬을 비교하는 가혹한 습관을 멈추고, 오늘 내가 해낸 아주 작은 한 걸음(예: 밥 잘 챙겨 먹기)에 아낌없는 박수를 보내주세요.",
    createdAt: "2026-07-02",
    likes: 38
  }
];

export const PHQ9_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    text: "1. 평소 하던 일들에 흥미나 즐거움이 거의 없다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 2,
    text: "2. 기분이 가라앉거나, 우울하거나, 희망이 없다고 느낀다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 3,
    text: "3. 잠들기가 어렵거나 자주 깨며, 혹은 반대로 잠을 너무 많이 잔다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 4,
    text: "4. 평소보다 쉽게 피로감을 느끼거나 기운이 없다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 5,
    text: "5. 입맛이 너무 없거나 반대로 과식을 하게 된다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 6,
    text: "6. 내 자신이 실패자처럼 느껴지거나, 나로 인해 가족들이 실망했다고 생각한다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 7,
    text: "7. 신문을 읽거나 과제를 수행하는 등 특정 일에 집중하기가 어렵다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 8,
    text: "8. 다른 사람들이 눈치챌 정도로 행동이나 말투가 느려졌거나, 혹은 반대로 초조해서 안절부절못한다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 9,
    text: "9. 차라리 죽는 게 더 낫겠다는 생각이 들거나, 어떤 식으로든 자신을 해치고 싶다는 무서운 충동이 일어난다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  }
];

export const GAD7_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    text: "1. 초조하거나, 불안하거나, 안절부절못한다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 2,
    text: "2. 걱정하는 것을 스스로 멈추거나 통제할 수 없다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 3,
    text: "3. 여러 가지 다양한 일에 대해 너무 많은 걱정을 지니고 산다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 4,
    text: "4. 편안하게 조용히 휴식을 취하기가 몹시 어렵다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 5,
    text: "5. 안절부절못해서 한 자리에 가만히 오래 앉아 있기가 몹시 어렵다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 6,
    text: "6. 쉽게 신경이 날카로워지거나 짜증이 자주 난다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  },
  {
    id: 7,
    text: "7. 마치 무슨 나쁜 일, 혹은 끔찍한 일이 나에게 들이닥칠 것만 같아 무섭고 두렵다.",
    options: [
      { text: "전혀 없음", value: 0 },
      { text: "며칠 동안 느꼈음", value: 1 },
      { text: "일주일 이상 지속됨", value: 2 },
      { text: "거의 매일 느꼈음", value: 3 }
    ]
  }
];

export const ISI_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    text: "1. 잠자리에 누웠을 때 잠이 들기까지 얼마나 애를 먹거나 시간이 오래 걸리나요? (잠들기 어려움)",
    options: [
      { text: "없음", value: 0 },
      { text: "가볍게 있음", value: 1 },
      { text: "중간 정도", value: 2 },
      { text: "심하게 있음", value: 3 },
      { text: "매우 극심함", value: 4 }
    ]
  },
  {
    id: 2,
    text: "2. 밤에 자던 중에 자주 깨거나 잠을 유지하기가 얼마나 어렵습니까? (잠 유지하기 어려움)",
    options: [
      { text: "없음", value: 0 },
      { text: "가볍게 있음", value: 1 },
      { text: "중간 정도", value: 2 },
      { text: "심하게 있음", value: 3 },
      { text: "매우 극심함", value: 4 }
    ]
  },
  {
    id: 3,
    text: "3. 아침에 너무 일찍 깨서 다시 잠들지 못하는 문제가 얼마나 자주 발생하나요? (조기 각성 문제)",
    options: [
      { text: "없음", value: 0 },
      { text: "가볍게 있음", value: 1 },
      { text: "중간 정도", value: 2 },
      { text: "심하게 있음", value: 3 },
      { text: "매우 극심함", value: 4 }
    ]
  },
  {
    id: 4,
    text: "4. 현재 본인의 수면 상태 및 전반적인 수면 패턴에 느끼는 만족도는 어떠합니까?",
    options: [
      { text: "매우 만족함", value: 0 },
      { text: "약간 만족함", value: 1 },
      { text: "보통 수준 불만족", value: 2 },
      { text: "매우 불만족", value: 3 },
      { text: "극도로 불만족", value: 4 }
    ]
  },
  {
    id: 5,
    text: "5. 수면 문제(또는 수면 부족)로 인해 낮 시간대의 일상 활동(학업, 일의 능률, 집중력, 기억력, 대인관계 등)이 방해받는 정도는 어떠합니까?",
    options: [
      { text: "방해받지 않음", value: 0 },
      { text: "아주 미미하게 방해됨", value: 1 },
      { text: "보통 수준으로 방해됨", value: 2 },
      { text: "상당히 많이 방해됨", value: 3 },
      { text: "매우 심각하게 방해받음", value: 4 }
    ]
  },
  {
    id: 6,
    text: "6. 다른 사람들이 보기에 본인의 수면 문제가 삶의 질이나 일상 기능에 지장을 주거나 떨어뜨린다고 우려하거나 눈치채는 편인가요?",
    options: [
      { text: "전혀 눈치채지 못함", value: 0 },
      { text: "가볍게 신경 쓰이는 정도", value: 1 },
      { text: "보통 정도로 눈치챔", value: 2 },
      { text: "상당히 우려할 정도로 눈치챔", value: 3 },
      { text: "무척 우려하며 잘 알고 있음", value: 4 }
    ]
  },
  {
    id: 7,
    text: "7. 현재 겪고 있는 수면 문제에 대하여 스스로 얼마나 걱정스럽거나 심리적인 피로와 스트레스를 느끼십니까?",
    options: [
      { text: "전혀 우려 안함", value: 0 },
      { text: "약간 우려됨", value: 1 },
      { text: "꽤 많이 우려됨", value: 2 },
      { text: "상당히 고통스러움", value: 3 },
      { text: "매일 극심하게 고통스러움", value: 4 }
    ]
  }
];

export const PSS_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    text: "1. 최근 한 달 동안, 예기치 않게 일어난 일이나 갑작스러운 상황 때문에 당황하거나 곤란했던 적이 얼마나 자주 있었습니까?",
    options: [
      { text: "전혀 없었다", value: 0 },
      { text: "거의 없었다", value: 1 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 3 },
      { text: "매우 자주 있었다", value: 4 }
    ]
  },
  {
    id: 2,
    text: "2. 최근 한 달 동안, 내 인생이나 학교 생활에서 가장 중요한 일들을 내 뜻대로 통제할 수 없다고 느낀 적이 얼마나 자주 있었습니까?",
    options: [
      { text: "전혀 없었다", value: 0 },
      { text: "거의 없었다", value: 1 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 3 },
      { text: "매우 자주 있었다", value: 4 }
    ]
  },
  {
    id: 3,
    text: "3. 최근 한 달 동안, 신경이 극도로 날카로워지거나 화나고 스트레스 가득한 상태에 지배당한 적이 얼마나 자주 있었습니까?",
    options: [
      { text: "전혀 없었다", value: 0 },
      { text: "거의 없었다", value: 1 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 3 },
      { text: "매우 자주 있었다", value: 4 }
    ]
  },
  {
    id: 4,
    text: "4. 최근 한 달 동안, 개인적인 여러 고민이나 돌발 과제 문제를 성공적으로 해결할 수 있다는 자신감이 드는 빈도는 어떠했습니까? [긍정문 - 역채점]",
    options: [
      { text: "전혀 없었다", value: 4 },
      { text: "거의 없었다", value: 3 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 1 },
      { text: "매우 자주 있었다", value: 0 }
    ]
  },
  {
    id: 5,
    text: "5. 최근 한 달 동안, 내가 정한 학업이나 프로젝트 등 계획한 일들이 내 뜻대로 원활하고 순조롭게 진행된다고 느낀 적이 얼마나 자주 있었습니까? [긍정문 - 역채점]",
    options: [
      { text: "전혀 없었다", value: 4 },
      { text: "거의 없었다", value: 3 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 1 },
      { text: "매우 자주 있었다", value: 0 }
    ]
  },
  {
    id: 6,
    text: "6. 최근 한 달 동안, 처리해야 할 산더미 같은 일이나 학업과제가 도무지 혼자서 감당할 수 없을 정도로 압박감을 준 적이 얼마나 자주 있었습니까?",
    options: [
      { text: "전혀 없었다", value: 0 },
      { text: "거의 없었다", value: 1 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 3 },
      { text: "매우 자주 있었다", value: 4 }
    ]
  },
  {
    id: 7,
    text: "7. 최근 한 달 동안, 생활 속 짜증나는 가벼운 갈등이나 일상적인 돌발 상황들을 스스로 잘 조절하고 대처해 나갈 수 있다고 느낀 적이 얼마나 자주 있었습니까? [긍정문 - 역채점]",
    options: [
      { text: "전혀 없었다", value: 4 },
      { text: "거의 없었다", value: 3 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 1 },
      { text: "매우 자주 있었다", value: 0 }
    ]
  },
  {
    id: 8,
    text: "8. 최근 한 달 동안, 모든 일들을 내 의지대로 잘 해 나가고 있으며 내가 최상의 장악력과 지적 상태에 있다고 느낀 적이 얼마나 자주 있었습니까? [긍정문 - 역채점]",
    options: [
      { text: "전혀 없었다", value: 4 },
      { text: "거의 없었다", value: 3 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 1 },
      { text: "매우 자주 있었다", value: 0 }
    ]
  },
  {
    id: 9,
    text: "9. 최근 한 달 동안, 내 통제 수준을 완전히 벗어난 외부적인 요인이나 타인의 개입 때문에 억울하거나 화가 치민 적이 얼마나 자주 있었습니까?",
    options: [
      { text: "전혀 없었다", value: 0 },
      { text: "거의 없었다", value: 1 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 3 },
      { text: "매우 자주 있었다", value: 4 }
    ]
  },
  {
    id: 10,
    text: "10. 최근 한 달 동안, 해결할 수 없는 복잡한 어려움이 내 삶에 너무 빽빽하게 쌓여서 도무지 극복하기 불가능하다고 느낀 적이 얼마나 자주 있었습니까?",
    options: [
      { text: "전혀 없었다", value: 0 },
      { text: "거의 없었다", value: 1 },
      { text: "때때로 있었다", value: 2 },
      { text: "자주 있었다", value: 3 },
      { text: "매우 자주 있었다", value: 4 }
    ]
  }
];

export const LOVE_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "인정받는 말 듣는 것을 좋아한다.", value: 1, category: "words" },
      { text: "안기는 것이 좋다.", value: 1, category: "touch" }
    ]
  },
  {
    id: 2,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "일대일로 시간을 보내는 게 좋다.", value: 1, category: "time" },
      { text: "실질적인 도움을 줄 때 사랑받는다고 느낀다.", value: 1, category: "acts" }
    ]
  },
  {
    id: 3,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "선물 받는 것을 좋아한다.", value: 1, category: "gifts" },
      { text: "만나서 함께 시간을 보내는 게 좋다.", value: 1, category: "time" }
    ]
  },
  {
    id: 4,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "나를 돕는 사람에게 사랑을 느낀다.", value: 1, category: "acts" },
      { text: "나를 만지는 사람에게 사랑을 느낀다.", value: 1, category: "touch" }
    ]
  },
  {
    id: 5,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "나를 안거나 어깨를 만지는 사람에게 사랑을 느낀다.", value: 1, category: "touch" },
      { text: "내가 사랑받고 선물 받을 때 사랑을 느낀다.", value: 1, category: "gifts" }
    ]
  },
  {
    id: 6,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "나와 함께 어디 가는 것을 좋아한다.", value: 1, category: "time" },
      { text: "손을 잡는 것을 좋아한다.", value: 1, category: "touch" }
    ]
  },
  {
    id: 7,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "사랑을 상징하는 선물이 나에게는 중요하다.", value: 1, category: "gifts" },
      { text: "사랑의 말은 나에게 무척 중요하다.", value: 1, category: "words" }
    ]
  },
  {
    id: 8,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "가까이 앉는 것을 좋아한다.", value: 1, category: "touch" },
      { text: "내가 매력적이라고 말해주는 것을 좋아한다.", value: 1, category: "words" }
    ]
  },
  {
    id: 9,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "친구가 나와 함께 시간을 보내는 것을 좋아한다.", value: 1, category: "time" },
      { text: "친구가 나에게 작은 선물을 주는 것을 좋아한다.", value: 1, category: "gifts" }
    ]
  },
  {
    id: 10,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "인정하는 말을 들을 때 사랑받는다고 느낀다.", value: 1, category: "words" },
      { text: "도움을 받을 때 사랑받는다고 느낀다.", value: 1, category: "acts" }
    ]
  },
  {
    id: 11,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "친구가 나와 함께 있어주는 것을 좋아한다.", value: 1, category: "time" },
      { text: "친구가 내가 좋아하는 일을 나와 함께 해주는 것을 좋아한다.", value: 1, category: "acts" }
    ]
  },
  {
    id: 12,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "친구가 나를 격려할 때 사랑받는다고 느낀다.", value: 1, category: "words" },
      { text: "친구가 나와 함께 해주는 것을 좋아한다.", value: 1, category: "time" }
    ]
  },
  {
    id: 13,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "친구가 나에게 주는 선물은 늘 특별하다.", value: 1, category: "gifts" },
      { text: "친구가 나를 위로할 때 사랑을 느낀다.", value: 1, category: "words" }
    ]
  },
  {
    id: 14,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "나를 도와주는 사람에게 친밀감을 느낀다.", value: 1, category: "acts" },
      { text: "나와 신체적인 접촉을 하는 사람에게 친밀감을 느낀다.", value: 1, category: "touch" }
    ]
  },
  {
    id: 15,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "내가 한 일에 대해 칭찬받는 것을 좋아한다.", value: 1, category: "words" },
      { text: "나를 위해 하기 싫은 일을 해주는 것에 사랑을 느낀다.", value: 1, category: "acts" }
    ]
  },
  {
    id: 16,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "나를 안거나 토닥거리는 것을 좋아한다.", value: 1, category: "touch" },
      { text: "친구가 내 이야기를 진지하게 들어주는 것을 좋아한다.", value: 1, category: "time" }
    ]
  },
  {
    id: 17,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "친구가 나를 돕는 일을 할 때 사랑을 느낀다.", value: 1, category: "acts" },
      { text: "친구가 나에게 선물할 때 사랑을 느낀다.", value: 1, category: "gifts" }
    ]
  },
  {
    id: 18,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "내 외모를 칭찬하는 것을 좋아한다.", value: 1, category: "words" },
      { text: "내 감정을 이해하기 위해 시간 내는 것을 좋아한다.", value: 1, category: "time" }
    ]
  },
  {
    id: 19,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "나를 안아주면 안심이 된다.", value: 1, category: "touch" },
      { text: "봉사하는 행동에서 사랑을 느낀다.", value: 1, category: "acts" }
    ]
  },
  {
    id: 20,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "나를 위해 해준 일에 고마움을 느낀다.", value: 1, category: "acts" },
      { text: "나를 위해 준비한 선물에 고마움을 느낀다.", value: 1, category: "gifts" }
    ]
  },
  {
    id: 21,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "나에게 집중하는 것이 좋다.", value: 1, category: "time" },
      { text: "나를 위해 봉사하는 것이 좋다.", value: 1, category: "acts" }
    ]
  },
  {
    id: 22,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "생일 선물을 받으면 사랑받는다고 느낀다.", value: 1, category: "gifts" },
      { text: "생일에 특별한 말을 들으면 사랑받는다고 느낀다.", value: 1, category: "words" }
    ]
  },
  {
    id: 23,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "선물을 주면 그 마음이 느껴진다.", value: 1, category: "gifts" },
      { text: "집안일을 도와주면 사랑이 느껴진다.", value: 1, category: "acts" }
    ]
  },
  {
    id: 24,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "친구가 내 말을 끊지 않고 끝까지 들을 때 고마움을 느낀다.", value: 1, category: "time" },
      { text: "친구가 나에게 선물을 줄 때 고마움을 느낀다.", value: 1, category: "gifts" }
    ]
  },
  {
    id: 25,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "나와 함께 있어주는 사람에게 사랑을 느낀다.", value: 1, category: "time" },
      { text: "내가 부탁한 것을 들어주는 사람에게 사랑을 느낀다.", value: 1, category: "acts" }
    ]
  },
  {
    id: 26,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "키스하거나 안아주는 것을 좋아한다.", value: 1, category: "touch" },
      { text: "이유 없이 선물을 주는 것을 좋아한다.", value: 1, category: "gifts" }
    ]
  },
  {
    id: 27,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "친구가 내게 해준 말은 언제나 잊지 않는다.", value: 1, category: "words" },
      { text: "친구가 나와 함께 해주는 일은 언제나 잊지 않는다.", value: 1, category: "time" }
    ]
  },
  {
    id: 28,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "친구가 나를 위해 해준 모든 선물을 소중히 여긴다.", value: 1, category: "gifts" },
      { text: "친구가 나를 위해 다가오거나 안아줄 때 사랑을 느낀다.", value: 1, category: "touch" }
    ]
  },
  {
    id: 29,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "친구가 나의 부탁을 기꺼이 들어줄 때 사랑을 느낀다.", value: 1, category: "acts" },
      { text: "친구가 나에게 사랑한다고 말할 때 사랑을 느낀다.", value: 1, category: "words" }
    ]
  },
  {
    id: 30,
    text: "나에게 더 중요하게 느껴지는 것은?",
    options: [
      { text: "매일 나를 만져주거나 안아줄 때 사랑을 느낀다.", value: 1, category: "touch" },
      { text: "매일 나에게 인정하는 말을 해줄 때 사랑을 느낀다.", value: 1, category: "words" }
    ]
  }
];

const egoRaw = [
  { text: "다른 사람을 헐뜯기보다 칭찬을 잘 하는 편이다.", cat: "NP" },
  { text: "대화에서 격언, 속담을 잘 인용한다.", cat: "CP" },
  { text: "'법이 없어도 살아갈 수 있는 사람'이라는 소리를 잘 듣는다.", cat: "AC" },
  { text: "행동이나 말이 자유스럽고 자연스럽다.", cat: "FC" },
  { text: "말이나 행동을 냉정하고 침착하게 하므로 안정된 분위기를 느낀다.", cat: "A" },
  { text: "'내가 말하는 대로 된다'는 식으로 말한다.", cat: "CP" },
  { text: "상냥하고 부드러우며 애정이 깃들어 있는 대화나 태도를 취한다.", cat: "NP" },
  { text: "TV, 영화 등을 보면서 마음이 약해 눈물을 잘 흘리는 편이다.", cat: "FC" },
  { text: "6하원칙에 따라 사리를 따지거나 설명하는 편이다.", cat: "A" },
  { text: "호기심이 강하고 기발한(창의적인) 착상을 잘 한다.", cat: "FC" },
  { text: "말을 할 때 상대방의 안색을 자주 살핀다.", cat: "AC" },
  { text: "직장 내외에서 사회봉사활동에 참가하기를 좋아한다.", cat: "A" },
  { text: "사회의 윤리, 도덕, 규칙 등을 중시하고 준수한다.", cat: "CP" },
  { text: "다른 사람으로부터 부탁을 받으면 거절하지 못한다.", cat: "NP" },
  { text: "자세가 바르며 여유가 있다.", cat: "A" },
  { text: "자신을 멋대로라고 생각한다.", cat: "FC" },
  { text: "다른 사람의 마음에 들고 싶다고 생각한다.", cat: "AC" },
  { text: "부모나 상사가 시키는 대로 한다.", cat: "AC" },
  { text: "타산적이며 이해득실을 생각하고 행동한다.", cat: "A" },
  { text: "일을 능률적으로 잘 처리해 간다.", cat: "FC" },
  { text: "매사에 조심스럽고 소극적인 편이다.", cat: "AC" },
  { text: "대화에서 감정적으로 되지 않고 이성적으로 풀어간다.", cat: "A" },
  { text: "상대방의 이야기를 잘 경청하고 공감하는 편이다.", cat: "NP" },
  { text: "책임감이 강하고 약속시간을 엄수한다.", cat: "CP" },
  { text: "부하나 아이의 실패에 대해 관대하고 격려한다.", cat: "NP" },
  { text: "의리와 인정에 끌려서 아이나 부하, 동료 등 누군가를 마음에 걸려한다.", cat: "NP" },
  { text: "신이 나면 도가 지나쳐서 실수를 한다.", cat: "FC" },
  { text: "아이나 부하를 엄격하게 다룬다.", cat: "CP" },
  { text: "생각하고 있는 바를 입밖으로 내지 못하는 성질이다.", cat: "AC" },
  { text: "친구나, 동료, 아이들이나 부하에게 스킨십을 잘 하는 편이다.", cat: "NP" },
  { text: "상대의 말을 가로막고 자신의 생각을 말한다.", cat: "CP" },
  { text: "밝고 유머가 있으며, 장난을 잘 치는 편이다.", cat: "FC" },
  { text: "어떤 일이나 사실에 근거해서 판단한다.", cat: "A" },
  { text: "상대의 실수를 지적하고 정정한다.", cat: "CP" },
  { text: "열등감이 강한 편이고 자신의 감정을 억눌러버리는 편이다.", cat: "AC" },
  { text: "오락이나 술 등 음식물을 만족할 때까지 취한다.", cat: "FC" },
  { text: "미래의 일을 냉정하고 예리하게 예측하고 행동한다.", cat: "A" },
  { text: "욕심나는 것을 가지지 않고는 못 배긴다.", cat: "FC" },
  { text: "자신의 생각을 관철하기 보다 타협하는 경우가 많다.", cat: "AC" },
  { text: "동정심이나 배려심이 강하고 어린이나 타인을 돌봐주기를 좋아한다.", cat: "NP" },
  { text: "어떤 결정을 내릴 때 사실을 확인하거나 반대의견을 듣는다.", cat: "A" },
  { text: "중얼중얼하는 목소리로 말하거나 우물쭈물 사양하는 편이다.", cat: "AC" },
  { text: "상대를 바보 취급하거나 멸시한다.", cat: "CP" },
  { text: "기쁨이나 화를 내는 등 희로애락을 직접적으로 표현하고 뒤끝이 없다.", cat: "FC" },
  { text: "곤경에 처해있는 사람을 위로하거나 북돋아 주기를 즐겨한다.", cat: "NP" },
  { text: "현상을 잘 관찰, 분석하고 합리적으로 의사결정을 한다.", cat: "A" },
  { text: "'~해도 괜찮을까요?', '어차피 저 따위는…' 등의 말을 쓴다.", cat: "AC" },
  { text: "'와, 멋있다!', '굉장하군!', '아하!' 등 감탄사를 자주 쓰며 농담을 잘 한다.", cat: "FC" },
  { text: "'당연히 …해야 한다', '…하지 않으면 안 된다'는 식의 말투를 잘 쓴다.", cat: "CP" },
  { text: "권리를 주장하기 전에 의무를 다한다.", cat: "CP" }
];

export const EGOGRAM_QUESTIONS: DiagnosticQuestion[] = egoRaw.map((q, idx) => ({
  id: idx + 1,
  text: q.text,
  options: [
    { text: "매우 부정 (1점)", value: 1, category: q.cat },
    { text: "부정 (2점)", value: 2, category: q.cat },
    { text: "보통 (3점)", value: 3, category: q.cat },
    { text: "긍정 (4점)", value: 4, category: q.cat },
    { text: "매우 긍정 (5점)", value: 5, category: q.cat }
  ]
}));

export const BIG5_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    text: "나는 사교적이고 대인관계를 적극적으로 주도하는 편이다. (외향성)",
    options: [
      { text: "매우 부정", value: 1, category: "E" },
      { text: "부정", value: 2, category: "E" },
      { text: "보통", value: 3, category: "E" },
      { text: "긍정", value: 4, category: "E" },
      { text: "매우 긍정", value: 5, category: "E" }
    ]
  },
  {
    id: 2,
    text: "나는 타인에게 깊이 공감하고 친절하며 포용하는 편이다. (친화성)",
    options: [
      { text: "매우 부정", value: 1, category: "A" },
      { text: "부정", value: 2, category: "A" },
      { text: "보통", value: 3, category: "A" },
      { text: "긍정", value: 4, category: "A" },
      { text: "매우 긍정", value: 5, category: "A" }
    ]
  },
  {
    id: 3,
    text: "나는 맡은 바 임무를 철저하고 계획적으로, 끝까지 완수하는 편이다. (성실성)",
    options: [
      { text: "매우 부정", value: 1, category: "C" },
      { text: "부정", value: 2, category: "C" },
      { text: "보통", value: 3, category: "C" },
      { text: "긍정", value: 4, category: "C" },
      { text: "매우 긍정", value: 5, category: "C" }
    ]
  },
  {
    id: 4,
    text: "나는 일상생활에서 쉽게 불안해지거나 우울감을 느끼고 긴장하는 편이다. (신경증)",
    options: [
      { text: "매우 부정", value: 1, category: "N" },
      { text: "부정", value: 2, category: "N" },
      { text: "보통", value: 3, category: "N" },
      { text: "긍정", value: 4, category: "N" },
      { text: "매우 긍정", value: 5, category: "N" }
    ]
  },
  {
    id: 5,
    text: "나는 새로운 사상이나 창의적인 아이디어, 예술적 경험에 호기심이 많다. (개방성)",
    options: [
      { text: "매우 부정", value: 1, category: "O" },
      { text: "부정", value: 2, category: "O" },
      { text: "보통", value: 3, category: "O" },
      { text: "긍정", value: 4, category: "O" },
      { text: "매우 긍정", value: 5, category: "O" }
    ]
  },
  {
    id: 6,
    text: "나는 말수가 다소 적고, 사교적인 모임보다는 혼자 조용히 지내는 것을 선호한다. (외향성)",
    options: [
      { text: "매우 부정", value: 1, category: "E_rev" },
      { text: "부정", value: 2, category: "E_rev" },
      { text: "보통", value: 3, category: "E_rev" },
      { text: "긍정", value: 4, category: "E_rev" },
      { text: "매우 긍정", value: 5, category: "E_rev" }
    ]
  },
  {
    id: 7,
    text: "나는 타인의 의견에 쉽게 시비를 가리거나 논쟁을 벌이는 것을 두려워하지 않는다. (친화성)",
    options: [
      { text: "매우 부정", value: 1, category: "A_rev" },
      { text: "부정", value: 2, category: "A_rev" },
      { text: "보통", value: 3, category: "A_rev" },
      { text: "긍정", value: 4, category: "A_rev" },
      { text: "매우 긍정", value: 5, category: "A_rev" }
    ]
  },
  {
    id: 8,
    text: "나는 체계적이기보다 즉흥적이며, 계획을 미루거나 가끔 게으르게 행동한다. (성실성)",
    options: [
      { text: "매우 부정", value: 1, category: "C_rev" },
      { text: "부정", value: 2, category: "C_rev" },
      { text: "보통", value: 3, category: "C_rev" },
      { text: "긍정", value: 4, category: "C_rev" },
      { text: "매우 긍정", value: 5, category: "C_rev" }
    ]
  },
  {
    id: 9,
    text: "나는 스트레스나 위기 상황에서도 비교적 침착하고 평정심을 유지한다. (신경증)",
    options: [
      { text: "매우 부정", value: 1, category: "N_rev" },
      { text: "부정", value: 2, category: "N_rev" },
      { text: "보통", value: 3, category: "N_rev" },
      { text: "긍정", value: 4, category: "N_rev" },
      { text: "매우 긍정", value: 5, category: "N_rev" }
    ]
  },
  {
    id: 10,
    text: "나는 풍부한 상상력과 호기심을 발휘하며 독창적인 해결책을 떠올리곤 한다. (개방성)",
    options: [
      { text: "매우 부정", value: 1, category: "O" },
      { text: "부정", value: 2, category: "O" },
      { text: "보통", value: 3, category: "O" },
      { text: "긍정", value: 4, category: "O" },
      { text: "매우 긍정", value: 5, category: "O" }
    ]
  },
  {
    id: 11,
    text: "나는 활력이 넘치고 열정적이며, 모임을 유쾌하게 이끌어가는 편이다. (외향성)",
    options: [
      { text: "매우 부정", value: 1, category: "E" },
      { text: "부정", value: 2, category: "E" },
      { text: "보통", value: 3, category: "E" },
      { text: "긍정", value: 4, category: "E" },
      { text: "매우 긍정", value: 5, category: "E" }
    ]
  },
  {
    id: 12,
    text: "나는 다른 사람들의 단점을 용서하기 쉬우며, 타인을 쉽게 믿고 온화하게 대한다. (친화성)",
    options: [
      { text: "매우 부정", value: 1, category: "A" },
      { text: "부정", value: 2, category: "A" },
      { text: "보통", value: 3, category: "A" },
      { text: "긍정", value: 4, category: "A" },
      { text: "매우 긍정", value: 5, category: "A" }
    ]
  },
  {
    id: 13,
    text: "나는 목표 지향적이며, 체계적이고 철저한 자제력을 발휘하는 편이다. (성실성)",
    options: [
      { text: "매우 부정", value: 1, category: "C" },
      { text: "부정", value: 2, category: "C" },
      { text: "보통", value: 3, category: "C" },
      { text: "긍정", value: 4, category: "C" },
      { text: "매우 긍정", value: 5, category: "C" }
    ]
  },
  {
    id: 14,
    text: "나는 기분의 기복이 다소 심한 편이며, 타인의 시선이나 사소한 일에 마음이 잘 쓰인다. (신경증)",
    options: [
      { text: "매우 부정", value: 1, category: "N" },
      { text: "부정", value: 2, category: "N" },
      { text: "보통", value: 3, category: "N" },
      { text: "긍정", value: 4, category: "N" },
      { text: "매우 긍정", value: 5, category: "N" }
    ]
  },
  {
    id: 15,
    text: "나는 새롭고 추상적인 주제보다는 실용적이고 눈에 보이는 익숙한 일들을 선호하는 편이다. (개방성)",
    options: [
      { text: "매우 부정", value: 1, category: "O_rev" },
      { text: "부정", value: 2, category: "O_rev" },
      { text: "보통", value: 3, category: "O_rev" },
      { text: "긍정", value: 4, category: "O_rev" },
      { text: "매우 긍정", value: 5, category: "O_rev" }
    ]
  }
];


