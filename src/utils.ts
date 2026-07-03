import { DiagnosticTestId } from "./types";

export interface DiagnosticResultDetails {
  scoreText: string;
  levelLabel: string;
  colorClass: string;
  badgeClass: string;
  bgClass: string;
  description: string;
  tips: string[];
}

export function getDiagnosticResultDetails(
  testId: DiagnosticTestId,
  answers: number[],
  categories: string[]
): DiagnosticResultDetails {
  if (testId === "PHQ-9") {
    const sum = answers.reduce((a, b) => a + b, 0);
    const scoreText = `${sum}점 / 27점`;
    if (sum <= 4) {
      return {
        scoreText,
        levelLabel: "현재 좌표: 안정 구역 (Green Zone)",
        colorClass: "text-emerald-600 font-bold",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        bgClass: "bg-emerald-50/20",
        description: "현재 당신의 마음은 비교적 안정적인 궤도에 머무르고 있습니다. 일상의 에너지가 잘 유지되고 있는 상태입니다.",
        tips: [
          "규칙적인 신체 활동과 밝은 햇볕 아래 산책으로 몸의 세로토닌 활성화를 지속해 보세요.",
          "내면의 탄력성이 훌륭하므로 평소 가지고 계신 포근한 마음 면역을 소중히 가꿔나가시길 권장합니다.",
          "혹시 마음 한구석에 가벼운 피로가 깃든다면 일기 쓰기 등으로 소소하게 감정을 환기해 주세요."
        ]
      };
    } else if (sum <= 14) {
      return {
        scoreText,
        levelLabel: "현재 좌표: 흐림 및 난기류 구간 (Yellow Zone)",
        colorClass: "text-amber-600 font-bold",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        bgClass: "bg-amber-50/20",
        description: "마음의 에너지가 다소 정체되거나 흔들리고 있는 구간입니다. 일상의 피로감이 누적되어 잠시 멈추어 가라는 신호일 수 있습니다.",
        tips: [
          "평소보다 취침 시간을 늘려 뇌와 신체에 충분한 에너지를 공급해 주세요.",
          "마음 한구석에 숨겨둔 감정이나 무거움이 있다면 일기를 쓰거나 편안한 사람에게 털어놓으며 환기해 보세요.",
          "상담실에 가볍게 놀러와 차 한잔 마시며 나 자신에게 쉼을 허용하는 시간을 권장합니다."
        ]
      };
    } else {
      return {
        scoreText,
        levelLabel: "현재 좌표: 짙은 안개 및 고립 구간 (Red Zone)",
        colorClass: "text-rose-600 font-bold",
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
        bgClass: "bg-rose-50/20",
        description: "현재 마음의 좌표가 다소 어둡고 고립된 구역을 지나고 있습니다. 시스템 전반에 과부하가 걸려 혼자만의 힘으로는 방향을 찾기 어려울 수 있습니다.",
        tips: [
          "극심한 무기력이나 자책감이 들 때, 이는 '마음에 찾아온 심한 열감기' 같은 증상일 뿐 절대 본인의 나약함 때문이 아님을 인정해 주세요.",
          "일상의 무거운 짐을 억지로 쥐고 무리하게 나아가기보다 지금은 완전한 멈춤과 안전한 휴식이 필요한 시기입니다.",
          "대학 학생상담센터의 전문 1:1 상담 예약 서비스를 통해 전문가와 함께 안전한 마음의 경로를 재탐색해 보시기를 강력하게 권장합니다."
        ]
      };
    }
  }

  if (testId === "GAD-7") {
    const sum = answers.reduce((a, b) => a + b, 0);
    const scoreText = `${sum}점 / 21점`;
    if (sum <= 4) {
      return {
        scoreText,
        levelLabel: "현재 좌표: 안정 구역 (Green Zone)",
        colorClass: "text-emerald-600 font-bold",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        bgClass: "bg-emerald-50/20",
        description: "현재 당신의 마음은 비교적 안정적인 궤도에 머무르고 있습니다. 일상의 에너지가 잘 유지되고 있는 상태입니다.",
        tips: [
          "미래에 대한 건강한 낙관론을 바탕으로 일상의 도전을 즐겁게 수용해 보세요.",
          "현재 가지고 계신 유연하고 의연한 일상의 루틴을 꾸준히 이어나가시길 응원합니다."
        ]
      };
    } else if (sum <= 14) {
      return {
        scoreText,
        levelLabel: "현재 좌표: 흐림 및 난기류 구간 (Yellow Zone)",
        colorClass: "text-amber-600 font-bold",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        bgClass: "bg-amber-50/20",
        description: "마음의 에너지가 다소 정체되거나 흔들리고 있는 구간입니다. 일상의 피로감이 누적되어 잠시 멈추어 가라는 신호일 수 있습니다.",
        tips: [
          "가슴 위에 손을 얹고 4초간 숨을 들이마시고 4초간 입으로 내쉬는 '4-4 호흡 명상'을 실천해 보세요.",
          "아직 일어나지 않은 미래의 최악 시나리오가 맴돌 땐, 그 생각을 간결히 적어보고 '실제 일어날 확률'을 객관적으로 분류해 보세요."
        ]
      };
    } else {
      return {
        scoreText,
        levelLabel: "현재 좌표: 짙은 안개 및 고립 구간 (Red Zone)",
        colorClass: "text-rose-600 font-bold",
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
        bgClass: "bg-rose-50/20",
        description: "현재 마음의 좌표가 다소 어둡고 고립된 구역을 지나고 있습니다. 시스템 전반에 과부하가 걸려 혼자만의 힘으로는 방향을 찾기 어려울 수 있습니다.",
        tips: [
          "극심한 불안과 신체 긴장이 몰려올 땐 주변 물건 5개, 만질 수 있는 것 4개, 들리는 소리 3개에 집중하는 '5-4-3 접지 기법(Grounding)'으로 몸의 신경계를 안착시켜 보세요.",
          "혼자서 불안의 고리를 끊어내려 애쓰지 마시고, 학생상담센터의 동반자들과 함께 안전한 불안 극복 솔루션을 적극적으로 마주해 보세요."
        ]
      };
    }
  }

  if (testId === "ISI") {
    const sum = answers.reduce((a, b) => a + b, 0);
    const scoreText = `${sum}점 / 28점`;
    if (sum <= 7) {
      return {
        scoreText,
        levelLabel: "현재 좌표: 안정 구역 (Green Zone)",
        colorClass: "text-emerald-600 font-bold",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        bgClass: "bg-emerald-50/20",
        description: "현재 당신의 마음은 비교적 안정적인 궤도에 머무르고 있습니다. 일상의 에너지가 잘 유지되고 있는 상태입니다.",
        tips: [
          "매일 일정한 시간에 기상하는 건강한 생체 리듬을 유지해 보세요.",
          "취침 전 1-2시간은 전자기기의 밝은 빛 노출을 최소화하여 뇌가 잠들 준비를 하도록 도와주세요."
        ]
      };
    } else if (sum <= 21) {
      return {
        scoreText,
        levelLabel: "현재 좌표: 흐림 및 난기류 구간 (Yellow Zone)",
        colorClass: "text-amber-600 font-bold",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        bgClass: "bg-amber-50/20",
        description: "마음의 에너지가 다소 정체되거나 흔들리고 있는 구간입니다. 일상의 피로감이 누적되어 잠시 멈추어 가라는 신호일 수 있습니다.",
        tips: [
          "오직 잠을 잘 때만 침대에 눕고, 침대 위에서 공부하거나 전자기기를 보는 일을 줄여 '침대 = 오직 잠자리'라는 연합을 뇌에 심어주세요.",
          "오후 2시 이후에는 커피나 고농도 카페인 음료의 섭취를 중단하여 야간 각성을 예방하세요."
        ]
      };
    } else {
      return {
        scoreText,
        levelLabel: "현재 좌표: 짙은 안개 및 고립 구간 (Red Zone)",
        colorClass: "text-rose-600 font-bold",
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
        bgClass: "bg-rose-50/20",
        description: "현재 마음의 좌표가 다소 어둡고 고립된 구역을 지나고 있습니다. 시스템 전반에 과부하가 걸려 혼자만의 힘으로는 방향을 찾기 어려울 수 있습니다.",
        tips: [
          "침대에 누워 20분 이상 잠이 오지 않으면 억지로 누워 버티지 말고, 거실로 나와 정적인 책을 보다가 강하게 졸릴 때만 다시 누워주세요.",
          "수면에 대한 극심한 공포나 강박은 만성 불면의 원인이 됩니다. 학생상담소의 비약물적 마음 이완 테라피를 처방받아 보세요."
        ]
      };
    }
  }

  if (testId === "PSS") {
    const sum = answers.reduce((a, b) => a + b, 0);
    const scoreText = `${sum}점 / 40점`;
    if (sum <= 13) {
      return {
        scoreText,
        levelLabel: "현재 좌표: 안정 구역 (Green Zone)",
        colorClass: "text-emerald-600 font-bold",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        bgClass: "bg-emerald-50/20",
        description: "현재 당신의 마음은 비교적 안정적인 궤도에 머무르고 있습니다. 일상의 에너지가 잘 유지되고 있는 상태입니다.",
        tips: [
          "외부 스트레스 자극 상황에서도 단단한 정서적 안정감과 회복탄력성을 지니고 있습니다. 앞으로도 이 밸런스를 향유하세요.",
          "주변에 힘들어하는 지인이 있다면 먼저 다정한 온기를 전해 마음 정화의 선한 영향력을 넓혀 보세요."
        ]
      };
    } else if (sum <= 26) {
      return {
        scoreText,
        levelLabel: "현재 좌표: 흐림 및 난기류 구간 (Yellow Zone)",
        colorClass: "text-amber-600 font-bold",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        bgClass: "bg-amber-50/20",
        description: "마음의 에너지가 다소 정체되거나 흔들리고 있는 구간입니다. 일상의 피로감이 누적되어 잠시 멈추어 가라는 신호일 수 있습니다.",
        tips: [
          "주말이나 방과 후, 하던 공부나 과제를 완전히 정지하고 오롯이 리프레시할 수 있는 '소소한 힐링 이벤트'를 가져보세요.",
          "머릿속 잡념을 손글씨나 타이핑으로 직접 꺼내 정리하면 뇌가 과도하게 생각 주머니를 채우지 않도록 환기하는 데 도움을 줍니다."
        ]
      };
    } else {
      return {
        scoreText,
        levelLabel: "현재 좌표: 짙은 안개 및 고립 구간 (Red Zone)",
        colorClass: "text-rose-600 font-bold",
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
        bgClass: "bg-rose-50/20",
        description: "현재 마음의 좌표가 다소 어둡고 고립된 구역을 지나고 있습니다. 시스템 전반에 과부하가 걸려 혼자만의 힘으로는 방향을 찾기 어려울 수 있습니다.",
        tips: [
          "현재 마음 배터리가 번아웃 직전에 처한 신호일 수 있습니다. '내가 다 알아서 해야 해'라는 완벽주의 채찍을 잠시 내려놓고 정서적 보호를 시작하세요.",
          "전문 상담사 선생님과 마주 앉아 무거운 심리적 짐을 안전하게 털어놓고 마음 회로를 재부팅할 수 있도록 상담실 예약을 노크해 보세요."
        ]
      };
    }
  }

  if (testId === "LOVE") {
    // Determine the highest category
    const counts: Record<string, number> = { words: 0, time: 0, gifts: 0, acts: 0, touch: 0 };
    categories.forEach((cat) => {
      if (counts[cat] !== undefined) counts[cat]++;
    });

    let maxCat = "words";
    let maxVal = -1;
    Object.keys(counts).forEach((cat) => {
      if (counts[cat] > maxVal) {
        maxVal = counts[cat];
        maxCat = cat;
      }
    });

    const scoreText = `주요 언어: ${maxCat === "words" ? "인정하는 말" : maxCat === "time" ? "함께하는 시간" : maxCat === "gifts" ? "선물" : maxCat === "acts" ? "봉사" : "스킨십"}`;

    if (maxCat === "words") {
      return {
        scoreText,
        levelLabel: "말 한마디에 우주를 품는 '인정하는 말' 유형 💬",
        colorClass: "text-rose-500 font-bold",
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
        bgClass: "bg-rose-50/10",
        description: "귀하의 가장 주된 사랑의 채널은 다정하고 아낌없는 격려, 진심 어린 칭찬, 그리고 고마움을 구체적인 말과 글로 전해 듣는 것입니다. 상대의 건조한 지적이나 차가운 말투에 자존감이 깊이 짓눌리기 쉬우며, 반대로 '너 요즘 애쓰는 거 내가 참 고맙게 생각해'라는 단 한마디 말에 묵은 피로가 사르르 봄눈 녹듯 녹아내립니다.",
        tips: [
          "주변 친구들이나 연인에게 먼저 '나 요즘 피곤해서 격려 칭찬 백 마디가 필요해!'라고 솔직하고 귀엽게 힌트를 건네보세요.",
          "자신에게도 자학하는 목소리를 거두고 하루 마감 때 '오늘 너 진짜 수고 많았어, 자랑스러워'라고 수용의 격려를 아끼지 마세요.",
          "상담실에 오셔서 다정한 상담사 선생님이 귀하의 마인드 자존감 근육을 가득 채우는 칭찬 비타민 대화를 나눠보셔도 아주 유익합니다."
        ]
      };
    } else if (maxCat === "time") {
      return {
        scoreText,
        levelLabel: "온전한 몰입을 원해요 '함께하는 시간' 유형 ⏰",
        colorClass: "text-amber-500 font-bold",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        bgClass: "bg-amber-50/10",
        description: "귀하는 식사 자리에 마주 앉아 상대가 스마트폰을 내려놓고 내 이야기를 100% 집중하여 귀를 기울여 주거나, 둘만의 뜻깊은 산책, 여행 일정을 오롯이 지켜줄 때 정서적 충만함을 진하게 느낍니다. 같이 있으면서도 건성으로 대답하는 상대의 무성의함에 큰 외로움과 공허를 느끼기 쉽습니다.",
        tips: [
          "친밀한 사람과 만날 땐 '우리가 만나는 단 1시간 동안은 폰을 무음으로 끄고 오롯이 서로에만 취해보자!'라고 건강한 연대를 먼저 리드해 보세요.",
          "나 자신과의 밀도 높은 데이트(예: 좋아하는 미술관 관람, 혼자만의 영화 몰입)를 통해 스스로를 정중하게 극진히 대우해 주세요.",
          "상담실은 오직 당신 한 사람만을 향해 100% 구조적으로 경청하는 절대적 공감 공간입니다. 이 깊이 있는 환대의 시간을 만끽해 보세요."
        ]
      };
    } else if (maxCat === "gifts") {
      return {
        scoreText,
        levelLabel: "마음의 정성을 손에 쥐는 '선물' 유형 🎁",
        colorClass: "text-purple-500 font-bold",
        badgeClass: "bg-purple-50 text-purple-700 border border-purple-200",
        bgClass: "bg-purple-50/10",
        description: "귀하가 가장 좋아하는 사랑과 우정의 표현은 비싼 명품이 아닌, '길을 가다 이 선물을 고르고 결제하기까지 그 사람이 나의 표정을 얼마나 설레며 생각했을까'라는 애정 어린 고민의 궤적을 손에 거머쥐는 것입니다. 정성 담긴 아주 소소한 손편지 엽서 한 장도 영구 보관함에 고이 접어 보물처럼 간직하는 포근한 소장형 마음입니다.",
        tips: [
          "상대방에게 '선물의 가격보다 나를 향해 사색해 준 조그마한 온기가 나를 춤추게 해'라고 취향을 넌지시 알려주세요.",
          "스스로에게도 고된 시험 기간이 끝나면 예쁜 캘린더나 소소한 완소 굿즈를 선물하는 '셀프 선물 세러모니'를 적극 실천해 보세요.",
          "상담실에 오시면 마음 가시를 걷어내는 사려 깊은 심리 검사 처방과 나를 이해할 수 있는 다정한 가이드라인을 선물 보따리처럼 한가득 안겨드립니다."
        ]
      };
    } else if (maxCat === "acts") {
      return {
        scoreText,
        levelLabel: "백 마디 말보다 행동으로 '봉사' 유형 🛠",
        colorClass: "text-blue-500 font-bold",
        badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
        bgClass: "bg-blue-50/10",
        description: "귀하에게 최고의 사랑의 언어는 '행동하는 헌신'입니다. 내가 심한 감기 몸살에 걸려 기어가는데 말로만 100번 힘내라 응원해 주는 것보다, 말없이 약국에 가서 따뜻한 쌍화탕을 문 앞에 고이 걸어두고 가거나 무거운 자취방 짐짝을 묵묵히 낑낑대며 함께 들어 올려줄 때 형용할 수 없는 영혼의 지지감과 의리를 느낍니다.",
        tips: [
          "말뿐인 관계에서 외로움을 느끼기 쉬우므로, 내면의 신뢰를 쌓기 위해 상호적인 실용적 호의와 도움을 나눌 건강한 파트너십을 찾아보세요.",
          "타인을 챙겨주느라 정작 내 밥숟갈, 내 전공 과제를 기한 내 못 챙기고 쩔쩔매고 있진 않나요? 내 그릇을 먼저 채우는 봉사를 시행해 주세요.",
          "상담실은 당신이 메고 있는 무거운 학업 짐과 과제 걱정을 잠시 내려두고, 함께 해결 플랜을 세워주는 실질적인 '마음 해결 지원소'입니다. 기꺼이 그 짐을 반 나눠주세요."
        ]
      };
    } else {
      return {
        scoreText,
        levelLabel: "체온의 온기를 믿는 '스킨십' 유형 🤝",
        colorClass: "text-emerald-500 font-bold",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        bgClass: "bg-emerald-50/10",
        description: "귀하가 연결감을 가장 확신하는 직관적인 채널은 가볍고 따스한 육체적 닿음과 체온입니다. 속상할 때 말보다 내 등을 가만히 쓸어내려 주는 토닥임, 반갑게 건네는 쾌활한 하이파이브, 지지해 줄 때 어깨를 꽉 쥐어 주는 기분 좋은 악력이 우울 박동수를 급격하게 안착시키고 세상의 안전을 상징하는 따스한 살결형 마음입니다.",
        tips: [
          "주변 친구들과 가벼운 포옹이나 기분 좋은 손바닥 밀당 등으로 신체 스트레스 호르몬인 코르티솔 수치를 즉시 완화해 보세요.",
          "긴장될 땐 스스로 자신의 양팔을 교차하여 감싸안고 가만히 토닥이는 '나비 포옹법(Butterfly Hug)'으로도 큰 심리 안정을 얻을 수 있습니다.",
          "상담실에 오셔서 포근하고 편안한 원목 소파에 앉아 푹신한 담요를 안고 편안한 호흡을 시행해 보세요. 물리적 공간이 주는 극진한 안온함을 경험하실 수 있습니다."
        ]
      };
    }
  }

  // EGOGRAM
  if (testId === "EGOGRAM") {
    // We sum the value of each category (CP, NP, A, FC, AC)
    // Egogram answers are 1 to 5 based on categories (50 questions)
    const egogramScores: Record<string, number> = { CP: 0, NP: 0, A: 0, FC: 0, AC: 0 };
    answers.forEach((val, idx) => {
      const cat = categories[idx] || "CP";
      if (egogramScores[cat] !== undefined) {
        egogramScores[cat] += val;
      }
    });

    const scoreText = `자아상태 지표 - CP:${egogramScores.CP}, NP:${egogramScores.NP}, A:${egogramScores.A}, FC:${egogramScores.FC}, AC:${egogramScores.AC}`;
    
    // Find highest state
    let maxState = "NP";
    let maxVal = -1;
    Object.keys(egogramScores).forEach((st) => {
      if (egogramScores[st] > maxVal) {
        maxVal = egogramScores[st];
        maxState = st;
      }
    });

    const labels: Record<string, string> = {
      CP: "통제적 어버이 (Critical Parent) - 규칙과 정의",
      NP: "양육적 어버이 (Nurturing Parent) - 포용과 자상",
      A: "성인 (Adult) - 객관과 이성",
      FC: "자유로운 어린이 (Free Child) - 흥미와 창의",
      AC: "순응하는 어린이 (Adapted Child) - 배려와 순종"
    };

    return {
      scoreText,
      levelLabel: `내면의 대표 지성: ${labels[maxState]} 자아 우세 🧠`,
      colorClass: "text-purple-600 font-bold",
      badgeClass: "bg-purple-50 text-purple-700 border border-purple-200",
      bgClass: "bg-purple-50/20",
      description: "귀하의 5대 이고그램 자아 분포 분석 결과입니다. 이 분석은 마음속에 들어있는 다섯 명의 작은 소리들이 자율적으로 조율하는 지표를 보여줍니다. 높은 지표는 평소 세상을 인지하고 말할 때 가동하는 편안하고 능숙한 마음의 메인 파워 스위치이며, 낮은 지표는 조금 더 가꿔서 일상을 조화롭게 조율해 볼 수 있는 미개척 자아 원석을 의미합니다.\n\n각 지표는 10점부터 50점까지 분포하며, 34점 이상인 경우 해당 자아 상태 에너지가 뚜렷하게 높은 편이며 16점 이하인 경우 낮은 편에 속합니다. 하단 그래프 프로필을 통해 나만의 에너지 균형을 시각적으로 확인해 보세요.",
      tips: [
        `비판적 어버이(CP: ${egogramScores.CP}점): 정의롭고 성실한 규범을 상징하며, 높은 경우 추진력과 도덕성이 뛰어나지만 나 자신과 타인에게 완벽을 강요해 숨 막힐 수 있으니 가끔은 비판 대신 허용을 연습하세요.`,
        `양육적 어버이(NP: ${egogramScores.NP}점): 자상하고 타인을 품는 돌봄의 에너지로, 높은 경우 정 많고 헌신적인 조력자이지만 너무 지나치면 타인의 의존성을 높이고 나 자신의 정서 번아웃을 부르므로 나를 돌보는 경계가 필요합니다.`,
        `어른(A: ${egogramScores.A}점): 상황을 이성적이고 사실에 기반해 냉정히 판단하는 지적 기둥입니다. 높은 경우 논리적이고 객관적인 문제해결사이나 너무 이성에만 치우치면 차갑고 건조하게 보일 수 있어 감성 조율이 요구됩니다.`,
        `자유로운 어린이(FC: ${egogramScores.FC}점): 활력과 호기심, 창의성이 솟구치는 마음의 놀이터입니다. 높은 경우 매력적이고 기발한 장난꾸러기이지만 규제력 부족으로 실수가 잦아질 수 있으니 목표에 책임을 더하면 훌륭한 시너지가 납니다.`,
        `순응하는 어린이(AC: ${egogramScores.AC}점): 타인을 살피고 주변에 조화롭게 적응하는 힘입니다. 높은 경우 부드러운 중재자이고 눈치가 빠르나 내적인 욕구 억압으로 울화가 쌓이기 쉬우므로 솔직하게 내 목소리를 내는 연습이 최고입니다.`,
        `학생상담소에 오시면 이 이고그램 그래프 프로필을 입체적으로 해부해 드립니다. 나의 행동 패턴과 갈등 원인을 1:1로 정확하게 짚고 마음 건강 지도를 설계해 보세요.`
      ]
    };
  }

  // BIG5
  if (testId === "BIG5") {
    const big5Scores: Record<string, number> = { E: 0, A: 0, C: 0, N: 0, O: 0 };
    answers.forEach((val, idx) => {
      const cat = categories[idx] || "E";
      if (["E", "A", "C", "N", "O"].includes(cat)) {
        big5Scores[cat] += val;
      } else if (cat.endsWith("_rev")) {
        const baseCat = cat.replace("_rev", "");
        big5Scores[baseCat] += (6 - val);
      }
    });

    const scoreText = `외향성(E):${big5Scores.E}, 친화성(A):${big5Scores.A}, 성실성(C):${big5Scores.C}, 신경증(N):${big5Scores.N}, 개방성(O):${big5Scores.O}`;
    
    let maxTrait = "C";
    let maxVal = -1;
    Object.keys(big5Scores).forEach((t) => {
      if (big5Scores[t] > maxVal) {
        maxVal = big5Scores[t];
        maxTrait = t;
      }
    });

    const labels: Record<string, string> = {
      E: "외향성 (Extraversion) - 활력과 사교성",
      A: "친화성 (Agreeableness) - 신뢰와 조화",
      C: "성실성 (Conscientiousness) - 책임감과 계획성",
      N: "신경증 (Neuroticism) - 정서적 예민성과 안전 민감도",
      O: "개방성 (Openness to Experience) - 독창성과 경험 수용력"
    };

    return {
      scoreText,
      levelLabel: `주요 성격 특성: ${labels[maxTrait]} 우세 🌟`,
      colorClass: "text-emerald-600 font-bold",
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      bgClass: "bg-emerald-50/20",
      description: `귀하의 Big-Five 5대 성격 특성 분석 결과입니다. 성격의 핵심이 되는 5가지 핵심 영역을 정밀 진단하였으며, 단축형이 아닌 15대 다각 문항을 통해 이성과 감성의 균형도를 검증하였습니다.\n\n각 지표는 3점부터 15점까지 분포하며, 12점 이상인 경우 매우 높고 6점 이하인 경우 아주 낮은 성향에 가깝습니다. 보통 수준(7~11점)이 건강한 조화를 형성합니다. 아래 맞춤형 자가 처방을 정독해 보세요.`,
      tips: [
        `외향성(E: ${big5Scores.E}점): 사회적 에너지를 주도하는 정도로, 높은 경우 쾌활하지만 타인을 설득하기 위한 조용한 경청이 약이 되며, 낮은 경우 고요한 심취와 1:1 소수 관계에서 탁월한 안정감과 기획력을 얻습니다.`,
        `친화성(A: ${big5Scores.A}점): 공감과 이타성을 상징하며, 높은 경우 따뜻한 평화주의자이나 간혹 부당한 요구를 단호히 거절하는 바운더리 훈련이 필요하며, 낮은 경우 독립적이고 비판적 사고가 뛰어나나 의도적 공감이 도움이 됩니다.`,
        `성실성(C: ${big5Scores.C}점): 약속과 계획을 자제력 있게 책임지는 성실도입니다. 높은 경우 꼼꼼하고 주도적인 엘리트이나 높은 잣대로 자기 채찍질을 멈추고 휴식을 권장하며, 낮은 경우 얽매이지 않는 유연하고 창조적인 탐구력을 자랑합니다.`,
        `신경증(N: ${big5Scores.N}점): 위협이나 우울 상황에서 민감한 안전 센서입니다. 높은 경우 위험 예방과 신중함이 대단하나 과한 걱정을 잠재울 호흡 명상이 최우선 처방이며, 낮은 경우 무던하고 태연하게 도전을 즐기는 배포를 탑재했습니다.`,
        `개방성(O: ${big5Scores.O}점): 아이디어와 새로운 지적 모험을 포용하는 척도입니다. 높은 경우 다방면의 재주꾼이고 영감이 넘치나 현실적 착륙 노력을 길러야 하고, 낮은 경우 전통과 규칙, 눈앞의 실무를 듬직하고 안전하게 수호해 냅니다.`,
        `학생상담센터에 방문하시면 이 5대 특성을 기반으로 맞춤형 심리 훈련 지도 및 전공 진로 적합도 코칭을 무료로 받아보실 수 있습니다.`
      ]
    };
  }

  return {
    scoreText: "",
    levelLabel: "",
    colorClass: "",
    badgeClass: "",
    bgClass: "",
    description: "",
    tips: []
  };
}
