import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, Coffee, Compass, BookOpen, Quote as QuoteIcon } from "lucide-react";
import { HEALING_QUOTES } from "../data";
import { Quote } from "../types";

interface LobbyProps {
  onNavigate: (tab: string) => void;
}

export default function Lobby({ onNavigate }: LobbyProps) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isCookieOpened, setIsCookieOpened] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleOpenCookie = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Play sound or dramatic delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * HEALING_QUOTES.length);
      setCurrentQuote(HEALING_QUOTES[randomIndex]);
      setIsCookieOpened(true);
      setIsSpinning(false);
    }, 800);
  };

  const handleResetCookie = () => {
    setIsCookieOpened(false);
    setCurrentQuote(null);
  };

  return (
    <div className="space-y-12">
      {/* Hero Welcome Message */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
          <Heart className="w-4 h-4 fill-emerald-600" />
          <span>캠퍼스 학생상담센터 제공</span>
        </div>
        <h1 className="text-4xl font-extrabold text-stone-800 tracking-tight leading-tight">
          여기는 대학생들의 아지트,<br />
          <span className="text-emerald-600 underline decoration-wavy decoration-emerald-200 underline-offset-8">마음 놀이터</span>입니다
        </h1>
        <p className="text-stone-600 leading-relaxed text-base">
          대학 생활을 하며 학업, 진로, 인간관계로 마음에 그늘이 질 때가 있죠.<br />
          거창한 고민이 아니어도 괜찮아요. 재미있는 심리테스트와 자가진단, 마음 털어놓기로 지친 마음에 편안한 쉼표를 찍어보세요.
        </p>
      </div>

      {/* Main Core Attraction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Attraction 1: Worry Bubble */}
        <motion.div 
          onClick={() => onNavigate("worry")}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-56 text-left group"
          id="attraction-worry"
        >
          <div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 text-lg group-hover:text-emerald-600 transition-colors">걱정 비눗방울 날리기</h3>
            <p className="text-stone-500 text-sm mt-2 leading-relaxed">
              가슴 깊이 묵혀두었던 걱정을 적어 비눗방울로 훨훨 날리고, 상담사 AI의 온정 어린 공감 편지를 받아보세요.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center gap-1 mt-3">
            마음 정화하러 가기 &rarr;
          </span>
        </motion.div>

        {/* Attraction 2: Stress Animal Test */}
        <motion.div 
          onClick={() => onNavigate("test")}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-56 text-left group"
          id="attraction-test"
        >
          <div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 text-lg group-hover:text-emerald-600 transition-colors">나의 스트레스 대처 동물</h3>
            <p className="text-stone-500 text-sm mt-2 leading-relaxed">
              어려움이 닥쳤을 때 내가 취하는 태도는 어떤 귀여운 동물을 닮았을까요? 내 맞춤형 스트레스 해소 꿀팁도 확인해보세요.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-600 group-hover:underline flex items-center gap-1 mt-3">
            테스트 시작하기 &rarr;
          </span>
        </motion.div>

        {/* Attraction 3: Psychology Quiz */}
        <motion.div 
          onClick={() => onNavigate("quiz")}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-56 text-left group"
          id="attraction-quiz"
        >
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 text-lg group-hover:text-emerald-600 transition-colors">심리학 오해와 진실</h3>
            <p className="text-stone-500 text-sm mt-2 leading-relaxed">
              분노 표출은 이로울까요? 상담 기록은 남을까요? 알쏭달쏭 재미있는 OX 퀴즈로 심리학 상식을 채워보세요.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 group-hover:underline flex items-center gap-1 mt-3">
            퀴즈 풀러 가기 &rarr;
          </span>
        </motion.div>

        {/* Attraction 4: Center Guide */}
        <motion.div 
          onClick={() => onNavigate("guide")}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="bg-stone-800 p-6 rounded-2xl border border-stone-700 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-56 text-left group"
          id="attraction-guide"
        >
          <div>
            <div className="w-12 h-12 bg-stone-700 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">상담실 한 걸음 더</h3>
            <p className="text-stone-300 text-sm mt-2 leading-relaxed">
              학교 상담실은 어떻게 신청하고 무엇을 할까요? 가상 방문을 통해 비밀스럽고 안전한 힐링 아지트를 구경해보세요.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 group-hover:underline flex items-center gap-1 mt-3">
            상담실 알아보기 &rarr;
          </span>
        </motion.div>
      </div>

      {/* Interactive Feature: Fortune Cookie / Mind Quote */}
      <div className="bg-amber-50/60 rounded-3xl p-8 border border-amber-100 max-w-xl mx-auto text-center space-y-6">
        <div className="space-y-1">
          <h3 className="font-bold text-stone-800 text-xl flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            오늘의 마음 위로 포춘 쿠키
          </h3>
          <p className="text-stone-500 text-sm">
            지금 내 마음에 꼭 필요한 단 한 구절의 처방을 얻어가세요.
          </p>
        </div>

        <div className="h-44 flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            {!isCookieOpened ? (
              <motion.div
                key="closed-cookie"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  y: isSpinning ? [0, -12, 12, -12, 0] : 0,
                  rotate: isSpinning ? [0, -10, 10, -10, 0] : [0, -2, 2, -2, 0]
                }}
                transition={{ 
                  rotate: isSpinning ? { duration: 0.5, repeat: Infinity } : { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  y: isSpinning ? { duration: 0.5, repeat: Infinity } : undefined,
                  scale: { duration: 0.2 }
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={handleOpenCookie}
                className="cursor-pointer group flex flex-col items-center space-y-3"
              >
                <div className="w-24 h-24 bg-amber-100 hover:bg-amber-200/80 rounded-full flex items-center justify-center shadow-inner border border-amber-200 text-stone-800 text-4xl select-none transition-colors">
                  🥠
                </div>
                <span className="text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-amber-200 text-amber-800 shadow-sm group-hover:bg-amber-100 transition-colors">
                  쿠키를 클릭해 마음 열기
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="opened-cookie"
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-6 rounded-2xl border border-amber-200 max-w-md shadow-sm space-y-4 flex flex-col items-center"
              >
                <div className="flex text-amber-500">
                  <QuoteIcon className="w-6 h-6 rotate-180 opacity-40 mr-1" />
                  <p className="text-stone-700 font-medium text-sm leading-relaxed max-w-sm">
                    {currentQuote?.text}
                  </p>
                  <QuoteIcon className="w-6 h-6 opacity-40 ml-1 self-end" />
                </div>
                <div className="text-xs text-stone-400 font-medium">
                  — {currentQuote?.author} —
                </div>
                <button
                  onClick={handleResetCookie}
                  className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 border-b border-amber-300 hover:border-amber-500 pb-0.5 transition-all"
                >
                  다른 쿠키 열어보기
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
