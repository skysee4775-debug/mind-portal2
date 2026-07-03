import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Sparkles, 
  HelpCircle, 
  MessageSquare, 
  Home, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ArrowLeft, 
  Send, 
  Smile, 
  RotateCcw, 
  BookOpen, 
  AlertCircle,
  Award,
  Calendar,
  Share2,
  Menu,
  X
} from "lucide-react";
import { 
  STRESS_QUESTIONS, 
  TEST_RESULTS, 
  PSYCHOLOGY_QUIZ, 
  HEALING_QUOTES, 
  INITIAL_POSTS,
  PHQ9_QUESTIONS,
  GAD7_QUESTIONS,
  ISI_QUESTIONS,
  PSS_QUESTIONS
} from "./data";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { TestResult, Quote, Question, QuizQuestion, Post, DiagnosticTestId, DiagnosticQuestion, CounselingRequest } from "./types";
import { getDiagnosticResultDetails, DiagnosticResultDetails } from "./utils";
import { User as FirebaseUser } from "firebase/auth";
import {
  initGoogleAuth,
  googleSignIn,
  googleLogout,
  searchSpreadsheet,
  createSpreadsheet,
  setupSheetHeaders,
  appendRequestToSheet,
  loadRequestsFromSheet,
  updateRequestStatusInSheet,
  deleteRequestFromSheet,
  getSpreadsheetUrl,
  getCachedAccessToken,
  sendToAppsScript,
  fetchFromAppsScript
} from "./utils/googleDriveSync";

export const TIME_OPTIONS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export const APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000); // Wait up to 10 seconds

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Create headers if the sheet is fresh
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["신청 ID", "학생 이름", "학과", "학번", "연락처", "상담 구분", "희망 날짜", "희망 시간", "진단 검사명", "진단 결과 요약", "예약 상태", "신청 일자"]);
    }
    
    var methodStr = data.method === "face_to_face" ? "대면" : "비대면";
    var statusStr = data.status === "pending" ? "대기 중" : data.status === "confirmed" ? "승인됨" : "취소됨";
    
    sheet.appendRow([
      data.id,
      data.studentName,
      data.department,
      data.studentId,
      data.contact,
      methodStr,
      data.preferredDate,
      data.preferredTime,
      data.testName,
      data.testResultSummary,
      statusStr,
      data.createdAt
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success", id: data.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ result: "success", data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var method = (row[5] === "비대면" || row[5] === "online" || row[5] === "비대면(온라인)") ? "online" : "face_to_face";
      var status = "pending";
      if (row[10] === "승인됨" || row[10] === "confirmed") status = "confirmed";
      else if (row[10] === "취소됨" || row[10] === "cancelled") status = "cancelled";
      
      data.push({
        id: row[0] || ("req_" + Math.random().toString(36).substr(2, 9)),
        studentName: row[1] || "",
        department: row[2] || "",
        studentId: row[3] || "",
        contact: row[4] || "",
        method: method,
        preferredDate: row[6] || "",
        preferredTime: row[7] || "",
        testName: row[8] || "",
        testResultSummary: row[9] || "",
        status: status,
        createdAt: row[11] || ""
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ result: "success", data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "test" | "psychology" | "posts" | "worry" | "admin">("home");
  const [isDbOffline, setIsDbOffline] = useState<boolean>(false);

  // Google Sheets Integration States
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem("mindportal_spreadsheet_id");
  });
  const [appsScriptUrl, setAppsScriptUrl] = useState<string | null>(() => {
    return localStorage.getItem("mindportal_apps_script_url");
  });
  const [appsScriptInput, setAppsScriptInput] = useState<string>(() => {
    return localStorage.getItem("mindportal_apps_script_url") || "";
  });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [appsScriptTestStatus, setAppsScriptTestStatus] = useState<string | null>(null);
  const [isAppsScriptSyncing, setIsAppsScriptSyncing] = useState<boolean>(false);
  const [isGoogleSheetsConnected, setIsGoogleSheetsConnected] = useState<boolean>(false);
  const [googleSheetsError, setGoogleSheetsError] = useState<string | null>(null);
  const [manualSpreadsheetId, setManualSpreadsheetId] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showSecretLetter, setShowSecretLetter] = useState<boolean>(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isProfessionalTestsExpanded, setIsProfessionalTestsExpanded] = useState<boolean>(false);

  // Editable Homepage Texts
  const [homeWelcomeTitle, setHomeWelcomeTitle] = useState<string>("마음 포털에 오신 것을 환영합니다.");
  const [homeWelcomeDesc, setHomeWelcomeDesc] = useState<string>("지금 당신이 서 있는 곳은 어디인가요? 안전하고 편안한 일상으로 이동하기 위해 현재 마음의 좌표를 잠시 스캔합니다.");
  const [gatekeeperLetter, setGatekeeperLetter] = useState<string>("마음 포털은 여러분이 더 안전하고 편안한 일상으로 이동할 수 있도록 안내하는 가상 환승 공간입니다. 언제든 상담실 포털을 열고 전문가와 함께 다음 목적지로 향해 보세요.");

  const saveHomeWelcomeTitle = async (val: string) => {
    setHomeWelcomeTitle(val);
    try {
      await setDoc(doc(db, "settings", "main"), { homeWelcomeTitle: val }, { merge: true });
    } catch (e) {
      console.error("Error saving homeWelcomeTitle:", e);
      handleFirestoreError(e, OperationType.WRITE, "settings/main");
    }
  };
  const saveHomeWelcomeDesc = async (val: string) => {
    setHomeWelcomeDesc(val);
    try {
      await setDoc(doc(db, "settings", "main"), { homeWelcomeDesc: val }, { merge: true });
    } catch (e) {
      console.error("Error saving homeWelcomeDesc:", e);
      handleFirestoreError(e, OperationType.WRITE, "settings/main");
    }
  };
  const saveGatekeeperLetter = async (val: string) => {
    setGatekeeperLetter(val);
    try {
      await setDoc(doc(db, "settings", "main"), { gatekeeperLetter: val }, { merge: true });
    } catch (e) {
      console.error("Error saving gatekeeperLetter:", e);
      handleFirestoreError(e, OperationType.WRITE, "settings/main");
    }
  };
  
  // Dynamic datasets via LocalStorage for continuous upload & management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  // Admin access state
  const [adminPassword, setAdminPassword] = useState<string>("1234");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<boolean>(false);

  const saveAdminPassword = async (val: string) => {
    setAdminPassword(val);
    try {
      await setDoc(doc(db, "settings", "main"), { adminPassword: val }, { merge: true });
    } catch (e) {
      console.error("Error saving adminPassword:", e);
      handleFirestoreError(e, OperationType.WRITE, "settings/main");
    }
  };

  // Active Post for reading detail
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Admin forms state
  const [newPostCategory, setNewPostCategory] = useState<"Social" | "Learning" | "Emotion" | "Growth">("Social");
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [newPostContent, setNewPostContent] = useState<string>("");

  const [newQuizQuestion, setNewQuizQuestion] = useState<string>("");
  const [newQuizAnswer, setNewQuizAnswer] = useState<boolean>(true);
  const [newQuizExplanation, setNewQuizExplanation] = useState<string>("");

  const [newQuestionText, setNewQuestionText] = useState<string>("");
  const [newQuestionOptions, setNewQuestionOptions] = useState<Array<{text: string, score: Record<string, number>}>>([
    { text: "", score: { sloth: 0, meerkat: 0, lion: 0, whale: 0, hedgehog: 0 } },
    { text: "", score: { sloth: 0, meerkat: 0, lion: 0, whale: 0, hedgehog: 0 } },
    { text: "", score: { sloth: 0, meerkat: 0, lion: 0, whale: 0, hedgehog: 0 } },
    { text: "", score: { sloth: 0, meerkat: 0, lion: 0, whale: 0, hedgehog: 0 } },
    { text: "", score: { sloth: 0, meerkat: 0, lion: 0, whale: 0, hedgehog: 0 } },
  ]);

  // 1. Sync Settings and Dynamic Datasets via Firestore on mount
  useEffect(() => {
    // A. Settings Real-time Sync (Title, Desc, Letter, Password)
    const settingsRef = doc(db, "settings", "main");
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.homeWelcomeTitle !== undefined) setHomeWelcomeTitle(data.homeWelcomeTitle);
        if (data.homeWelcomeDesc !== undefined) setHomeWelcomeDesc(data.homeWelcomeDesc);
        if (data.gatekeeperLetter !== undefined) setGatekeeperLetter(data.gatekeeperLetter);
        if (data.adminPassword !== undefined) setAdminPassword(data.adminPassword);
      } else {
        setDoc(settingsRef, {
          homeWelcomeTitle: "마음 포털에 오신 것을 환영합니다.",
          homeWelcomeDesc: "지금 당신이 서 있는 곳은 어디인가요? 안전하고 편안한 일상으로 이동하기 위해 현재 마음의 좌표를 잠시 스캔합니다.",
          gatekeeperLetter: "마음 포털은 여러분이 더 안전하고 편안한 일상으로 이동할 수 있도록 안내하는 가상 환승 공간입니다. 언제든 상담실 포털을 열고 전문가와 함께 다음 목적지로 향해 보세요.",
          adminPassword: "1234"
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/main");
      setIsDbOffline(true);
    });

    // B. Questions Sync (Stress/Animal test)
    const questionsCollection = collection(db, "questions");
    const unsubscribeQuestions = onSnapshot(questionsCollection, (snapshot) => {
      if (!snapshot.empty) {
        const loadedQuestions: Question[] = [];
        snapshot.forEach((docSnap) => {
          loadedQuestions.push({ ...(docSnap.data() as Question), id: Number(docSnap.id) });
        });
        loadedQuestions.sort((a, b) => a.id - b.id);
        setQuestions(loadedQuestions);
      } else {
        STRESS_QUESTIONS.forEach((q) => {
          setDoc(doc(db, "questions", String(q.id)), q);
        });
        setQuestions(STRESS_QUESTIONS);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "questions");
      setQuestions(STRESS_QUESTIONS);
      setIsDbOffline(true);
    });

    // C. Quizzes Sync
    const quizzesCollection = collection(db, "quizzes");
    const unsubscribeQuizzes = onSnapshot(quizzesCollection, (snapshot) => {
      if (!snapshot.empty) {
        const loadedQuizzes: QuizQuestion[] = [];
        snapshot.forEach((docSnap) => {
          loadedQuizzes.push({ ...(docSnap.data() as QuizQuestion), id: Number(docSnap.id) });
        });
        loadedQuizzes.sort((a, b) => a.id - b.id);
        setQuizzes(loadedQuizzes);
      } else {
        PSYCHOLOGY_QUIZ.forEach((q) => {
          setDoc(doc(db, "quizzes", String(q.id)), q);
        });
        setQuizzes(PSYCHOLOGY_QUIZ);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "quizzes");
      setQuizzes(PSYCHOLOGY_QUIZ);
      setIsDbOffline(true);
    });

    // D. Quotes Sync
    const quotesCollection = collection(db, "quotes");
    const unsubscribeQuotes = onSnapshot(quotesCollection, (snapshot) => {
      if (!snapshot.empty) {
        const loadedQuotes: Quote[] = [];
        snapshot.forEach((docSnap) => {
          loadedQuotes.push({ ...(docSnap.data() as Quote), id: Number(docSnap.id) });
        });
        loadedQuotes.sort((a, b) => a.id - b.id);
        setQuotes(loadedQuotes);
      } else {
        HEALING_QUOTES.forEach((q) => {
          setDoc(doc(db, "quotes", String(q.id)), q);
        });
        setQuotes(HEALING_QUOTES);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "quotes");
      setQuotes(HEALING_QUOTES);
      setIsDbOffline(true);
    });

    // E. Posts Sync
    const postsCollection = collection(db, "posts");
    const unsubscribePosts = onSnapshot(postsCollection, (snapshot) => {
      if (!snapshot.empty) {
        const loadedPosts: Post[] = [];
        snapshot.forEach((docSnap) => {
          loadedPosts.push({ ...(docSnap.data() as Post), id: docSnap.id });
        });
        loadedPosts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setPosts(loadedPosts);
      } else {
        INITIAL_POSTS.forEach((p) => {
          setDoc(doc(db, "posts", p.id), p);
        });
        setPosts(INITIAL_POSTS);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "posts");
      setPosts(INITIAL_POSTS);
      setIsDbOffline(true);
    });

    // F. Counseling Requests Sync
    const requestsCollection = collection(db, "counseling_requests");
    const unsubscribeRequests = onSnapshot(requestsCollection, (snapshot) => {
      if (!snapshot.empty) {
        const loadedRequests: CounselingRequest[] = [];
        snapshot.forEach((docSnap) => {
          loadedRequests.push({ ...(docSnap.data() as CounselingRequest), id: docSnap.id });
        });
        loadedRequests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setCounselingRequests(loadedRequests);
        localStorage.setItem("counseling_requests_local", JSON.stringify(loadedRequests));
      } else {
        const sampleRequests: CounselingRequest[] = [
          {
            id: "req_1",
            studentName: "김민우",
            department: "컴퓨터공학과",
            studentId: "202214785",
            contact: "010-1234-5678",
            method: "face_to_face",
            preferredDate: "2026-07-06",
            preferredTime: "14:00",
            testName: "PHQ-9 우울증 검사",
            testResultSummary: "12점 (중간 정도 우울 - 빠른 상담 지원 권장)",
            status: "pending",
            createdAt: "2026-07-02"
          },
          {
            id: "req_2",
            studentName: "이지은",
            department: "심리학과",
            studentId: "202410982",
            contact: "010-9876-5432",
            method: "online",
            preferredDate: "2026-07-07",
            preferredTime: "10:30",
            testName: "사랑의 언어 유형검사",
            testResultSummary: "함께하는 시간(Quality Time) 유형 - 관계 갈등 고민 상담 희망",
            status: "confirmed",
            createdAt: "2026-07-01"
          }
        ];
        sampleRequests.forEach((req) => {
          setDoc(doc(db, "counseling_requests", req.id), req);
        });
        setCounselingRequests(sampleRequests);
        localStorage.setItem("counseling_requests_local", JSON.stringify(sampleRequests));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "counseling_requests");
      const stored = localStorage.getItem("counseling_requests_local");
      if (stored) {
        setCounselingRequests(JSON.parse(stored));
      } else {
        const sampleRequests: CounselingRequest[] = [
          {
            id: "req_1",
            studentName: "김민우",
            department: "컴퓨터공학과",
            studentId: "202214785",
            contact: "010-1234-5678",
            method: "face_to_face",
            preferredDate: "2026-07-06",
            preferredTime: "14:00",
            testName: "PHQ-9 우울증 검사",
            testResultSummary: "12점 (중간 정도 우울 - 빠른 상담 지원 권장)",
            status: "pending",
            createdAt: "2026-07-02"
          },
          {
            id: "req_2",
            studentName: "이지은",
            department: "심리학과",
            studentId: "202410982",
            contact: "010-9876-5432",
            method: "online",
            preferredDate: "2026-07-07",
            preferredTime: "10:30",
            testName: "사랑의 언어 유형검사",
            testResultSummary: "함께하는 시간(Quality Time) 유형 - 관계 갈등 고민 상담 희망",
            status: "confirmed",
            createdAt: "2026-07-01"
          }
        ];
        setCounselingRequests(sampleRequests);
        localStorage.setItem("counseling_requests_local", JSON.stringify(sampleRequests));
      }
      setIsDbOffline(true);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeQuestions();
      unsubscribeQuizzes();
      unsubscribeQuotes();
      unsubscribePosts();
      unsubscribeRequests();
    };
  }, []);

  // Google Sheets Integration initialization and auto-sync
  useEffect(() => {
    const unsubscribeGoogle = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setIsGoogleSheetsConnected(true);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setIsGoogleSheetsConnected(false);
      }
    );
    return () => {
      unsubscribeGoogle();
    };
  }, []);

  const syncWithGoogleSheets = async () => {
    const token = googleToken || getCachedAccessToken();
    if (!token || !spreadsheetId) return;
    setIsGoogleLoading(true);
    setGoogleSheetsError(null);
    try {
      const sheetReqs = await loadRequestsFromSheet(token, spreadsheetId);
      setCounselingRequests(sheetReqs);
      localStorage.setItem("counseling_requests_local", JSON.stringify(sheetReqs));
    } catch (err: any) {
      console.error("Google Sheets sync failed:", err);
      setGoogleSheetsError("구글 스프레드시트 데이터를 불러오는 데 실패했습니다. 파일이 드라이브에 있고 올바른 권한이 있나요?");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const uploadAllToGoogleSheets = async () => {
    const token = googleToken || getCachedAccessToken();
    if (!token || !spreadsheetId) {
      alert("구글 로그인 및 스프레드시트 연결이 되어있지 않습니다.");
      return;
    }
    setIsGoogleLoading(true);
    setGoogleSheetsError(null);
    try {
      const sheetReqs = await loadRequestsFromSheet(token, spreadsheetId);
      const sheetIds = new Set(sheetReqs.map(r => r.id));
      const missingReqs = counselingRequests.filter(r => !sheetIds.has(r.id));

      if (missingReqs.length === 0) {
        alert("구글 스프레드시트에 이미 모든 내역이 동기화되어 있습니다!");
        return;
      }

      if (confirm(`로컬/데이터베이스의 상담 내역 중 구글 시트에 없는 ${missingReqs.length}개 항목을 구글 스프레드시트에 업로드하시겠습니까?`)) {
        for (const req of missingReqs) {
          await appendRequestToSheet(token, spreadsheetId, req);
        }
        alert("성공적으로 구글 스프레드시트에 일괄 업로드되었습니다!");
        await syncWithGoogleSheets();
      }
    } catch (err: any) {
      console.error("Error uploading to Google Sheets:", err);
      setGoogleSheetsError("구글 스프레드시트 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleConnectSpreadsheet = async () => {
    const token = googleToken || getCachedAccessToken();
    if (!token) {
      alert("구글 계정 로그인이 필요합니다.");
      return;
    }
    setIsGoogleLoading(true);
    setGoogleSheetsError(null);
    try {
      // 1. Search for existing sheet named "마음포탈 상담 신청 내역"
      const foundId = await searchSpreadsheet(token);
      if (foundId) {
        if (confirm("구글 드라이브에서 기존에 생성된 '마음포탈 상담 신청 내역' 스프레드시트를 찾았습니다! 이 파일과 연동하시겠습니까?")) {
          setSpreadsheetId(foundId);
          localStorage.setItem("mindportal_spreadsheet_id", foundId);
          alert("기존 스프레드시트와 성공적으로 연동되었습니다.");
          return;
        }
      }

      // 2. If not found or user chooses not to link, create a new one
      if (confirm("새로운 구글 스프레드시트 '마음포탈 상담 신청 내역'을 드라이브에 생성하여 연동할까요?")) {
        const newId = await createSpreadsheet(token);
        await setupSheetHeaders(token, newId);
        setSpreadsheetId(newId);
        localStorage.setItem("mindportal_spreadsheet_id", newId);
        alert("구글 드라이브에 새로운 스프레드시트가 생성되고 연동이 완료되었습니다!");
      }
    } catch (err: any) {
      console.error("Error connecting spreadsheet:", err);
      setGoogleSheetsError("스프레드시트 탐색/생성에 실패했습니다.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleManualSpreadsheetConnect = async () => {
    const cleanId = manualSpreadsheetId.trim();
    if (!cleanId) {
      alert("올바른 스프레드시트 ID를 입력해 주세요.");
      return;
    }
    const token = googleToken || getCachedAccessToken();
    if (!token) {
      alert("구글 로그인 인증 토큰을 찾을 수 없습니다. 다시 로그인해 주세요.");
      return;
    }
    
    setIsGoogleLoading(true);
    setGoogleSheetsError(null);
    try {
      // 1. Verify access to spreadsheet ID
      const testRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!testRes.ok) {
        let errDetail = "";
        try {
          const errPayload = await testRes.json();
          errDetail = errPayload.error?.message || JSON.stringify(errPayload);
        } catch (e) {
          errDetail = testRes.statusText;
        }
        console.error(`🔴 [MANUAL CONNECTION ERROR] Google Sheets API responded with ${testRes.status}: ${errDetail}`);
        throw new Error(`스프레드시트 ID가 존재하지 않거나, 현재 구글 계정으로 접근할 권한이 없습니다. (상세 에러: ${errDetail})`);
      }
      
      // 2. Ask confirmation
      if (confirm("스프레드시트에 접근하는 데 성공했습니다! 이 스프레드시트를 마음포탈 연동 파일로 지정하시겠습니까?")) {
        try {
          await setupSheetHeaders(token, cleanId);
        } catch (e) {
          console.log("Sheet1!A1:L1 writing headers failed/already exists, skipping...", e);
        }
        setSpreadsheetId(cleanId);
        localStorage.setItem("mindportal_spreadsheet_id", cleanId);
        alert("스프레드시트 ID가 직접 지정되어 연동되었습니다!");
        setManualSpreadsheetId("");
      }
    } catch (err: any) {
      console.error("Error manually connecting spreadsheet:", err);
      setGoogleSheetsError(err.message || "스프레드시트 직접 연동 중 에러가 발생했습니다. 권한(Scopes)과 ID를 다시 확인해 주세요.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSheetsLogout = async () => {
    if (confirm("구글 드라이브 및 스프레드시트 연동을 일시 해제하시겠습니까? (드라이브의 파일은 삭제되지 않습니다)")) {
      await googleLogout();
      setGoogleUser(null);
      setGoogleToken(null);
      setIsGoogleSheetsConnected(false);
      setSpreadsheetId(null);
      localStorage.removeItem("mindportal_spreadsheet_id");
    }
  };

  // Auto-sync spreadsheet data if connected on load or state change
  useEffect(() => {
    const token = googleToken || getCachedAccessToken();
    if (token && spreadsheetId) {
      syncWithGoogleSheets();
    }
  }, [googleToken, spreadsheetId]);

  // Helpers to save datasets back to Firestore
  const saveQuestions = async (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    try {
      const currentIds = new Set(newQuestions.map(q => q.id));
      questions.forEach(async (oldQ) => {
        if (!currentIds.has(oldQ.id)) {
          await deleteDoc(doc(db, "questions", String(oldQ.id)));
        }
      });
      for (const q of newQuestions) {
        await setDoc(doc(db, "questions", String(q.id)), q);
      }
    } catch (e) {
      console.error("Error saving questions to Firestore:", e);
    }
  };

  const saveQuizzes = async (newQuizzes: QuizQuestion[]) => {
    setQuizzes(newQuizzes);
    try {
      const currentIds = new Set(newQuizzes.map(q => q.id));
      quizzes.forEach(async (oldQuiz) => {
        if (!currentIds.has(oldQuiz.id)) {
          await deleteDoc(doc(db, "quizzes", String(oldQuiz.id)));
        }
      });
      for (const q of newQuizzes) {
        await setDoc(doc(db, "quizzes", String(q.id)), q);
      }
    } catch (e) {
      console.error("Error saving quizzes to Firestore:", e);
    }
  };

  const savePosts = async (newPosts: Post[]) => {
    setPosts(newPosts);
    try {
      const currentIds = new Set(newPosts.map(p => p.id));
      posts.forEach(async (oldPost) => {
        if (!currentIds.has(oldPost.id)) {
          await deleteDoc(doc(db, "posts", oldPost.id));
        }
      });
      for (const p of newPosts) {
        await setDoc(doc(db, "posts", p.id), p);
      }
    } catch (e) {
      console.error("Error saving posts to Firestore:", e);
    }
  };

  // State for stress test
  const [testStep, setTestStep] = useState<number>(-1); // -1: Intro, 0~4: Questions, 5: Result
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({
    sloth: 0,
    meerkat: 0,
    lion: 0,
    whale: 0,
    hedgehog: 0
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Comprehensive Diagnostic Tests State
  const [selectedTestId, setSelectedTestId] = useState<DiagnosticTestId | null>(null);
  const [currentTestStep, setCurrentTestStep] = useState<number>(-1); // -1: Intro, index: Question
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<number[]>([]);
  const [diagnosticCategories, setDiagnosticCategories] = useState<string[]>([]);
  const [showDiagnosticResult, setShowDiagnosticResult] = useState<boolean>(false);
  
  // Counseling Request state
  const [counselingRequests, setCounselingRequests] = useState<CounselingRequest[]>([]);
  const [isCounselingFormOpen, setIsCounselingFormOpen] = useState<boolean>(false);
  
  // Reservation Form inputs
  const [resName, setResName] = useState<string>("");
  const [resDept, setResDept] = useState<string>("");
  const [resId, setResId] = useState<string>("");
  const [resContact, setResContact] = useState<string>("");
  const [resMethod, setResMethod] = useState<"face_to_face" | "online">("face_to_face");
  const [resDate, setResDate] = useState<string>("");
  const [resTime, setResTime] = useState<string>("09:00");
  const [resTestName, setResTestName] = useState<string>("");
  const [resResultSummary, setResResultSummary] = useState<string>("");
  const [isResSubmitted, setIsResSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (showDiagnosticResult && selectedTestId) {
      const details = getDiagnosticResultDetails(selectedTestId, diagnosticAnswers, diagnosticCategories);
      const testNames: Record<string, string> = {
        "PHQ-9": "PHQ-9 우울증 자가진단",
        "GAD-7": "GAD-7 불안증 자가진단",
        "ISI": "ISI 불면증 자가평가",
        "PSS": "PSS 지각된 스트레스 검사"
      };
      setResTestName(testNames[selectedTestId] || selectedTestId);
      setResResultSummary(`${details.levelLabel} (점수/유형: ${details.scoreText})`);
    }
  }, [showDiagnosticResult, selectedTestId, diagnosticAnswers, diagnosticCategories]);

  // State for Psychology Quiz
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // State for Worry Box
  const [worryText, setWorryText] = useState<string>("");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("지침");
  const [isWorrySubmitting, setIsWorrySubmitting] = useState<boolean>(false);
  const [worryResponse, setWorryResponse] = useState<string | null>(null);

  // State for healing quote
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Pick a random quote on mount or tab change
    const activeQuotes = quotes.length > 0 ? quotes : HEALING_QUOTES;
    if (activeQuotes.length > 0) {
      const randIndex = Math.floor(Math.random() * activeQuotes.length);
      setCurrentQuote(activeQuotes[randIndex]);
    }
  }, [activeTab, quotes]);

  // Handle stress test answer
  const handleAnswerSelect = (score: Record<string, number>) => {
    const updatedAnswers = { ...testAnswers };
    Object.keys(score).forEach((key) => {
      updatedAnswers[key] = (updatedAnswers[key] || 0) + score[key];
    });
    setTestAnswers(updatedAnswers);

    const activeQuestions = questions.length > 0 ? questions : STRESS_QUESTIONS;
    if (testStep < activeQuestions.length - 1) {
      setTestStep(testStep + 1);
    } else {
      // Calculate final result
      let maxKey = "sloth";
      let maxVal = -1;
      Object.keys(updatedAnswers).forEach((key) => {
        if (updatedAnswers[key] > maxVal) {
          maxVal = updatedAnswers[key];
          maxKey = key;
        }
      });
      const finalResult = TEST_RESULTS[maxKey] || TEST_RESULTS.sloth;
      setTestResult(finalResult);
      setResTestName("동물 스트레스 성격 유형 검사 (PRESERVED)");
      setResResultSummary(`${finalResult.name} (${finalResult.title})`);
      setTestStep(5);
    }
  };

  // Reset Stress Test
  const resetStressTest = () => {
    setTestStep(-1);
    setTestAnswers({
      sloth: 0,
      meerkat: 0,
      lion: 0,
      whale: 0,
      hedgehog: 0
    });
    setTestResult(null);
  };

  const resetDiagnosticTest = () => {
    setSelectedTestId(null);
    setCurrentTestStep(-1);
    setDiagnosticAnswers([]);
    setDiagnosticCategories([]);
    setShowDiagnosticResult(false);
    setIsCounselingFormOpen(false);
    setIsResSubmitted(false);
  };

  const handleDiagnosticAnswer = (value: number, category?: string) => {
    const updatedAnswers = [...diagnosticAnswers, value];
    setDiagnosticAnswers(updatedAnswers);
    
    const updatedCategories = [...diagnosticCategories, category || ""];
    setDiagnosticCategories(updatedCategories);

    let activeQuestions: DiagnosticQuestion[] = [];
    if (selectedTestId === "PHQ-9") activeQuestions = PHQ9_QUESTIONS;
    else if (selectedTestId === "GAD-7") activeQuestions = GAD7_QUESTIONS;
    else if (selectedTestId === "ISI") activeQuestions = ISI_QUESTIONS;
    else if (selectedTestId === "PSS") activeQuestions = PSS_QUESTIONS;

    if (currentTestStep < activeQuestions.length - 1) {
      setCurrentTestStep(currentTestStep + 1);
    } else {
      setShowDiagnosticResult(true);
    }
  };

  const handleCounselingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName || !resDept || !resId || !resContact || !resDate || !resTime) {
      alert("희망 상담 일자 및 시간을 포함하여 모든 예약 정보를 입력해 주세요.");
      return;
    }
    
    const newRequest: CounselingRequest = {
      id: "req_" + Date.now(),
      studentName: resName,
      department: resDept,
      studentId: resId,
      contact: resContact,
      method: resMethod,
      preferredDate: resDate,
      preferredTime: resTime,
      testName: resTestName,
      testResultSummary: resResultSummary,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0]
    };

    // Always cache request locally first to ensure flawless offline-fallback UX
    const updatedRequests = [newRequest, ...counselingRequests];
    setCounselingRequests(updatedRequests);
    localStorage.setItem("counseling_requests_local", JSON.stringify(updatedRequests));

    try {
      // Save single new request document atomically to Firestore
      await setDoc(doc(db, "counseling_requests", newRequest.id), newRequest);
    } catch (err) {
      console.error("Error saving counseling request directly to Firestore:", err);
    }

    // Append to Google Sheets if connected
    const token = googleToken || getCachedAccessToken();
    if (token && spreadsheetId) {
      try {
        await appendRequestToSheet(token, spreadsheetId, newRequest);
      } catch (err) {
        console.error("Error writing counseling request to Google Sheets:", err);
      }
    }

    // Google Apps Script Web App URL integration (Robust fallback/direct sync)
    if (appsScriptUrl) {
      try {
        await sendToAppsScript(appsScriptUrl, newRequest);
      } catch (err) {
        console.error("Error sending counseling request to Google Apps Script:", err);
      }
    }

    setIsResSubmitted(true);
    
    // Clear form
    setResName("");
    setResDept("");
    setResId("");
    setResContact("");
    setResDate("");
    setResTime("09:00");
  };

  // Handle Quiz answer
  const handleQuizAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    const activeQuizzes = quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ;
    const currentQuiz = activeQuizzes[quizIndex];
    if (currentQuiz && currentQuiz.answer === answer) {
      setQuizScore((prev) => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    const activeQuizzes = quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ;
    if (quizIndex < activeQuizzes.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowExplanation(false);
    setQuizFinished(false);
  };

  // Submit Worry to API
  const handleWorrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worryText.trim()) return;

    setIsWorrySubmitting(true);
    setWorryResponse(null);

    try {
      const response = await fetch("/api/comfort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worry: worryText, emotion: selectedEmotion })
      });
      
      const data = await response.json();
      if (response.ok) {
        setWorryResponse(data.comfort);
      } else {
        setWorryResponse(data.error || "마음 편지를 작성하는 도중 지연이 발생했어요. 잠시 후 다시 시도해 주세요!");
      }
    } catch (err) {
      console.error(err);
      setWorryResponse("서버와 연결이 원활하지 않아 마음 배달이 늦어지고 있어요. 하지만 상담 선생님들은 늘 당신을 응원하고 있답니다.");
    } finally {
      setIsWorrySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans flex flex-col md:flex-row relative overflow-x-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF8A65] opacity-[0.07] rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-[#81C784] opacity-[0.07] rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-[#64B5F6] opacity-[0.05] rounded-full blur-3xl pointer-events-none"></div>

      {/* MOBILE HEADER: Only visible on mobile */}
      <header className="md:hidden bg-white border-b border-orange-100/50 px-4 py-3.5 flex items-center gap-1.5 sticky top-0 z-30 w-full shrink-0">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => { setActiveTab("home"); resetStressTest(); }}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-serif font-extrabold italic tracking-tight text-indigo-600 leading-none">
              Mind Portal
            </h1>
            <p className="text-[7px] tracking-widest uppercase font-semibold text-gray-400 mt-0.5">
              마음 포털
            </p>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE MENU DRAWER CONTAINER */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white p-6 flex flex-col justify-between z-50 transform transition-transform duration-300 md:hidden ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div 
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => { setActiveTab("home"); resetStressTest(); setIsMobileMenuOpen(false); }}
            >
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-serif font-extrabold text-indigo-600 text-base block leading-none">Mind Portal</span>
                <span className="text-[9px] tracking-widest uppercase font-semibold text-gray-400 mt-1 block">마음 포털</span>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-[2px] bg-gradient-to-r from-indigo-200 via-transparent to-transparent my-6"></div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab("test"); setIsMobileMenuOpen(false); resetStressTest(); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 font-medium ${
                activeTab === "test"
                  ? "bg-gradient-to-r from-emerald-50 to-emerald-100/30 text-emerald-600 border-l-4 border-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/20"
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>마음 좌표 스캔</span>
            </button>
            <button
              onClick={() => { setActiveTab("psychology"); setIsMobileMenuOpen(false); resetQuiz(); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 font-medium ${
                activeTab === "psychology"
                  ? "bg-gradient-to-r from-blue-50 to-blue-100/30 text-blue-600 border-l-4 border-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-[#2D2D2D] hover:bg-blue-50/20"
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              <span>마음 탐구 상식</span>
            </button>
            <button
              onClick={() => { setActiveTab("posts"); setIsMobileMenuOpen(false); setSelectedPost(null); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 font-medium ${
                activeTab === "posts"
                  ? "bg-gradient-to-r from-purple-50 to-purple-100/30 text-purple-600 border-l-4 border-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-[#2D2D2D] hover:bg-purple-50/20"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>마음 가이드 칼럼</span>
            </button>

            <div className="pt-4 border-t border-dashed border-indigo-100 mt-2">
              <button
                onClick={() => { setActiveTab("admin"); setIsMobileMenuOpen(false); setAdminError(null); }}
                className={`w-full flex items-center gap-4 px-4 py-2 rounded-2xl text-left transition-all duration-300 text-xs font-semibold ${
                  activeTab === "admin"
                    ? "bg-stone-100 text-stone-700 border-l-4 border-stone-400 shadow-sm"
                    : "text-gray-400 hover:text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Award className="w-4 h-4 text-indigo-400" />
                <span>상담사 전용 오피스 🔒</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="mt-8 bg-indigo-50/30 p-5 rounded-[28px] border border-indigo-100 relative overflow-hidden">
          <p className="text-xs text-indigo-600 font-bold mb-1">마음 포털 게이트키퍼 ✉️</p>
          <p className="text-xs font-serif leading-relaxed text-gray-600 italic break-keep">
            &ldquo;{gatekeeperLetter}&rdquo;
          </p>
        </div>
      </aside>

      {/* DESKTOP SIDEBAR: Brand & Navigation */}
      <aside className="hidden md:flex w-80 bg-white border-r border-orange-100/50 p-6 flex-col justify-between z-10 shrink-0">
        <div>
          {/* Logo */}
          <div 
            className="flex items-center gap-3 mb-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => { setActiveTab("home"); resetStressTest(); }}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-extrabold italic tracking-tight text-indigo-600">
                Mind Portal
              </h1>
              <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400">
                마음 포털
              </p>
            </div>
          </div>
          
          <div className="h-[2px] bg-gradient-to-r from-indigo-200 via-transparent to-transparent my-6"></div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab("test"); resetStressTest(); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 font-medium ${
                activeTab === "test"
                  ? "bg-gradient-to-r from-emerald-50 to-emerald-100/30 text-emerald-600 border-l-4 border-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/20"
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>마음 좌표 스캔</span>
            </button>
            <button
              onClick={() => { setActiveTab("psychology"); resetQuiz(); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 font-medium ${
                activeTab === "psychology"
                  ? "bg-gradient-to-r from-blue-50 to-blue-100/30 text-blue-600 border-l-4 border-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-[#2D2D2D] hover:bg-blue-50/20"
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              <span>마음 탐구 상식</span>
            </button>
            <button
              onClick={() => { setActiveTab("posts"); setSelectedPost(null); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 font-medium ${
                activeTab === "posts"
                  ? "bg-gradient-to-r from-purple-50 to-purple-100/30 text-purple-600 border-l-4 border-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-[#2D2D2D] hover:bg-purple-50/20"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>마음 가이드 칼럼</span>
            </button>

            <div className="pt-4 border-t border-dashed border-indigo-100 mt-2">
              <button
                onClick={() => { setActiveTab("admin"); setAdminError(null); }}
                className={`w-full flex items-center gap-4 px-4 py-2 rounded-2xl text-left transition-all duration-300 text-xs font-semibold ${
                  activeTab === "admin"
                    ? "bg-stone-100 text-stone-700 border-l-4 border-stone-400 shadow-sm"
                    : "text-gray-400 hover:text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Award className="w-4 h-4 text-indigo-400" />
                <span>상담사 전용 오피스 🔒</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Counseling Invitation Card */}
        <div className="mt-8 bg-indigo-50/30 p-5 rounded-[28px] border border-indigo-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-600/10 rounded-bl-full pointer-events-none"></div>
          <p className="text-xs text-indigo-600 font-bold mb-1">마음 포털 게이트키퍼의 편지 ✉️</p>
          <p className="text-xs font-serif leading-relaxed text-gray-600 italic break-keep">
            &ldquo;{gatekeeperLetter}&rdquo;
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 z-10 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* ==================================== */}
        {/* TAB 1: HOME PAGE                     */}
        {/* ==================================== */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Gateway Portal Center */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-[40px] p-8 md:p-14 text-white text-center relative overflow-hidden shadow-xl shadow-indigo-900/10 border border-indigo-800/20">
              {/* Ethereal portal graphic background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                {/* Glowing Portal Gate UI */}
                <div className="w-24 h-24 mb-6 rounded-full border border-indigo-400/30 flex items-center justify-center bg-indigo-950/60 shadow-lg shadow-indigo-500/20 relative group">
                  <div className="absolute inset-1 rounded-full border border-dashed border-indigo-400/40 animate-spin" style={{ animationDuration: '20s' }}></div>
                  <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 opacity-80 blur-sm"></div>
                  <Sparkles className="w-8 h-8 text-white relative z-10 animate-pulse" />
                </div>

                <span className="text-indigo-300 text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/30">
                  Mind Portal Gateway
                </span>
                
                <h2 className="text-3xl md:text-4xl font-extrabold mt-6 leading-tight font-serif tracking-tight break-keep">
                  {homeWelcomeTitle}
                </h2>
                
                <p className="mt-3.5 text-indigo-100/80 text-sm md:text-base leading-snug md:leading-normal font-sans max-w-xl break-keep">
                  {homeWelcomeDesc}
                </p>
                
                <button 
                  onClick={() => {
                    setActiveTab("test");
                    setSelectedTestId(null);
                  }}
                  className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-full font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5 active:translate-y-0 border border-indigo-400/20 break-keep"
                >
                  마음 좌표 스캔 시작하기
                </button>
              </div>
            </div>

            {/* Wisdom / Quote Panel (Easter Egg style) */}
            <div className="flex flex-col items-center justify-center py-6">
              {!showSecretLetter ? (
                <button
                  onClick={() => setShowSecretLetter(true)}
                  className="group flex items-center gap-3 px-5 py-3.5 rounded-full bg-white/90 hover:bg-white border border-amber-100 hover:border-amber-200/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-xs font-semibold text-slate-500 hover:text-amber-700"
                >
                  <span className="text-sm transform group-hover:rotate-12 transition-transform duration-300">🍀</span>
                  <span className="break-keep">일상의 길목에서 도착한 <strong>작은 위로의 마음 편지</strong>가 있어요. (열어보기)</span>
                </button>
              ) : (
                <div className="max-w-md w-full bg-[#FAF7F2] rounded-[28px] p-6 border border-amber-100/70 shadow-sm relative overflow-hidden transition-all duration-500 animate-fade-in mx-auto">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/20 rounded-full blur-xl pointer-events-none"></div>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span>💌</span> 숨겨진 위로 한 조각
                      </span>
                      <button 
                        onClick={() => setShowSecretLetter(false)}
                        className="text-[10px] font-bold text-gray-400 hover:text-gray-600 hover:bg-amber-100/40 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        ✕ 편지 접기
                      </button>
                    </div>
                    <blockquote className="text-sm md:text-base font-serif italic text-slate-700 leading-relaxed mb-4 break-keep">
                      &ldquo;{currentQuote ? currentQuote.text : "흔들리지 않고 피는 꽃이 어디 있으랴. 도망치는 날이 있어도, 쓰러지는 날이 있어도 괜찮아."}&rdquo;
                    </blockquote>
                    <p className="text-[11px] text-slate-400 text-right font-medium font-serif mt-2">
                      - {currentQuote ? currentQuote.author : "어느 다정한 상담사 선생님"}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-amber-200/40 mt-4 flex justify-between items-center">
                    <button 
                      onClick={() => {
                        const activeQuotes = quotes.length > 0 ? quotes : HEALING_QUOTES;
                        if (activeQuotes.length > 0) {
                          const idx = Math.floor(Math.random() * activeQuotes.length);
                          setCurrentQuote(activeQuotes[idx]);
                        }
                      }}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 transition-colors hover:bg-amber-100/30 px-2 py-1 rounded"
                    >
                      <RotateCcw className="w-3 h-3" /> 다른 편지 열기
                    </button>
                    <span className="text-[9px] text-amber-400/80 font-mono">Secret Letter for you</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 2: MIND TESTING (STRESS STYLE)   */}
        {/* ==================================== */}
        {activeTab === "test" && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. SELECTION HUB (If no test is selected) */}
            {selectedTestId === null && (
              <div className="bg-white rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-sm">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Mind Portal Scanning Center
                  </span>
                  <h2 className="text-3xl font-extrabold font-serif mt-4 text-indigo-950">
                    마음 좌표 정밀 스캔 🩺
                  </h2>
                  <p className="text-gray-500 text-sm md:text-base mt-3 leading-relaxed break-keep max-w-xl mx-auto">
                    실효성 있는 임상 자가진단 검진을 통해 현재 나의 정서적 좌표를 확인하고, 더 안전하고 편안한 공간으로 이동하기 위한 가상 환승 경로를 제공받으세요.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Category A: Clinical / Emotion Screeners */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                      <span className="text-base">🧭</span> 마음 좌표 정밀 검진 (공인 표준 척도)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* PHQ-9 Card */}
                      <div 
                        onClick={() => setExpandedCardId(expandedCardId === "PHQ-9" ? null : "PHQ-9")}
                        className={`bg-white rounded-3xl p-6 border-slate-100/80 border-l-4 border-l-indigo-500 hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between group shadow-sm border ${
                          expandedCardId === "PHQ-9" ? "ring-2 ring-indigo-500/20" : ""
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">우울 좌표 스캔 (PHQ-9)</span>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg shrink-0">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              <span>3분 • 9문항</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-base md:text-lg font-bold font-serif text-slate-800 group-hover:text-indigo-600 transition-colors break-keep">
                              PHQ-9 우울증 자가진단 검사
                            </h4>
                            <span className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors shrink-0 flex items-center gap-1 bg-indigo-50/50 px-2 py-1 rounded-md">
                              <span>{expandedCardId === "PHQ-9" ? "✕ 접기" : "▼ 더보기"}</span>
                            </span>
                          </div>

                          {expandedCardId === "PHQ-9" && (
                            <div className="mt-4 pt-4 border-t border-slate-100/80 animate-fade-in space-y-4">
                              <p className="text-xs md:text-sm text-slate-500 leading-relaxed break-keep">
                                기분 상태, 피로도, 수면 변화 및 무기력감 등 일상의 건강한 정신 건강 균형도를 나타내는 세계 표준 자가진단 척도입니다.
                              </p>
                              <div className="flex justify-end">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTestId("PHQ-9"); 
                                    setCurrentTestStep(-1);
                                    setIsResSubmitted(false);
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
                                >
                                  <span>포털 진입하기</span>
                                  <span>&rarr;</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* GAD-7 Card */}
                      <div 
                        onClick={() => setExpandedCardId(expandedCardId === "GAD-7" ? null : "GAD-7")}
                        className={`bg-white rounded-3xl p-6 border-slate-100/80 border-l-4 border-l-emerald-500 hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between group shadow-sm border ${
                          expandedCardId === "GAD-7" ? "ring-2 ring-emerald-500/20" : ""
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">불안 좌표 스캔 (GAD-7)</span>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg shrink-0">
                              <Clock className="w-3 h-3 text-emerald-400" />
                              <span>2분 • 7문항</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-base md:text-lg font-bold font-serif text-slate-800 group-hover:text-emerald-600 transition-colors break-keep">
                              GAD-7 불안증 자가진단 검사
                            </h4>
                            <span className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors shrink-0 flex items-center gap-1 bg-emerald-50/50 px-2 py-1 rounded-md">
                              <span>{expandedCardId === "GAD-7" ? "✕ 접기" : "▼ 더보기"}</span>
                            </span>
                          </div>

                          {expandedCardId === "GAD-7" && (
                            <div className="mt-4 pt-4 border-t border-slate-100/80 animate-fade-in space-y-4">
                              <p className="text-xs md:text-sm text-slate-500 leading-relaxed break-keep">
                                사소한 걱정의 제어 여부, 안절부절못함, 가슴 긴장 등 과도한 예민함이나 만성 불안 지수를 진단하는 표준 자가 진단입니다.
                              </p>
                              <div className="flex justify-end">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTestId("GAD-7"); 
                                    setCurrentTestStep(-1);
                                    setIsResSubmitted(false);
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
                                >
                                  <span>포털 진입하기</span>
                                  <span>&rarr;</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ISI Card */}
                      <div 
                        onClick={() => setExpandedCardId(expandedCardId === "ISI" ? null : "ISI")}
                        className={`bg-white rounded-3xl p-6 border-slate-100/80 border-l-4 border-l-blue-500 hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between group shadow-sm border ${
                          expandedCardId === "ISI" ? "ring-2 ring-blue-500/20" : ""
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">수면 만족 스캔 (ISI)</span>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg shrink-0">
                              <Clock className="w-3 h-3 text-blue-400" />
                              <span>3분 • 7문항</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-base md:text-lg font-bold font-serif text-slate-800 group-hover:text-blue-600 transition-colors break-keep">
                              ISI 불면증 지수 자가진단
                            </h4>
                            <span className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors shrink-0 flex items-center gap-1 bg-blue-50/50 px-2 py-1 rounded-md">
                              <span>{expandedCardId === "ISI" ? "✕ 접기" : "▼ 더보기"}</span>
                            </span>
                          </div>

                          {expandedCardId === "ISI" && (
                            <div className="mt-4 pt-4 border-t border-slate-100/80 animate-fade-in space-y-4">
                              <p className="text-xs md:text-sm text-slate-500 leading-relaxed break-keep">
                                잠자리에 누웠을 때의 잠입 장애, 잦은 야간 각성, 아침 각성 여부 등 수면의 심층 만족도를 진단합니다.
                              </p>
                              <div className="flex justify-end">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTestId("ISI"); 
                                    setCurrentTestStep(-1);
                                    setIsResSubmitted(false);
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
                                >
                                  <span>포털 진입하기</span>
                                  <span>&rarr;</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PSS Card */}
                      <div 
                        onClick={() => setExpandedCardId(expandedCardId === "PSS" ? null : "PSS")}
                        className={`bg-white rounded-3xl p-6 border-slate-100/80 border-l-4 border-l-purple-500 hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between group shadow-sm border ${
                          expandedCardId === "PSS" ? "ring-2 ring-purple-500/20" : ""
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full border border-purple-100">스트레스 스캔 (PSS)</span>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg shrink-0">
                              <Clock className="w-3 h-3 text-purple-400" />
                              <span>4분 • 10문항</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-base md:text-lg font-bold font-serif text-slate-800 group-hover:text-purple-600 transition-colors break-keep">
                              PSS 지각된 스트레스 검사
                            </h4>
                            <span className="text-[11px] font-bold text-purple-600 hover:text-purple-800 transition-colors shrink-0 flex items-center gap-1 bg-purple-50/50 px-2 py-1 rounded-md">
                              <span>{expandedCardId === "PSS" ? "✕ 접기" : "▼ 더보기"}</span>
                            </span>
                          </div>

                          {expandedCardId === "PSS" && (
                            <div className="mt-4 pt-4 border-t border-slate-100/80 animate-fade-in space-y-4">
                              <p className="text-xs md:text-sm text-slate-500 leading-relaxed break-keep">
                                최근 한 달간 나의 주변 환경이나 과업 사건에 대해 주관적으로 얼마나 통제력을 가졌는지 지각 지수를 진단합니다.
                              </p>
                              <div className="flex justify-end">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTestId("PSS"); 
                                    setCurrentTestStep(-1);
                                    setIsResSubmitted(false);
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
                                >
                                  <span>포털 진입하기</span>
                                  <span>&rarr;</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upgraded Counseling Center Connect Card */}
                  <div id="counseling-center-card" className="mt-12 bg-[#FAF7F2]/60 rounded-[32px] p-6 md:p-8 border border-slate-200/50 shadow-sm relative">
                    <div 
                      onClick={() => setIsProfessionalTestsExpanded(!isProfessionalTestsExpanded)}
                      className="flex items-start justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 pr-8">
                        <span className="text-2xl mt-0.5 shrink-0">🏠</span>
                        <div>
                          <h4 className="text-base md:text-lg font-bold font-serif text-indigo-900 group-hover:text-indigo-600 transition-colors break-keep flex items-center gap-2">
                            더 전문적인 심리검사 알아보기
                          </h4>
                          <p className="text-xs md:text-sm text-gray-500 leading-relaxed break-keep mt-0.5">
                            마음 포털의 가상 스캔을 넘어, 교내 학생상담실에서 제공하는 다양한 전문 심리평가 및 일대일 맞춤 지원 프로그램을 확인해보세요.
                          </p>
                        </div>
                      </div>
                      <button className="absolute top-6 right-6 md:top-8 md:right-8 w-8 h-8 rounded-full bg-white hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 shadow-sm flex items-center justify-center transition-all shrink-0 text-indigo-600 font-bold">
                        <span className="text-lg leading-none select-none">{isProfessionalTestsExpanded ? "−" : "+"}</span>
                      </button>
                    </div>

                    {isProfessionalTestsExpanded && (
                      <div className="mt-6 pt-6 border-t border-slate-200/50 space-y-6 animate-fade-in">
                        {/* The 4 main tests explained (TCI, GOLDEN, PAI, MMPI-2) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 bg-white rounded-2xl border border-slate-100 break-keep hover:border-indigo-200 transition-colors shadow-sm">
                            <div className="text-xs font-bold text-indigo-600 mb-1">TCI 기질성격검사</div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">타고난 유전적 기질(수동/능동)과 성향을 종합 진단하여 자신을 입체적으로 이해하도록 돕습니다.</p>
                          </div>
                          <div className="p-4 bg-white rounded-2xl border border-slate-100 break-keep hover:border-emerald-200 transition-colors shadow-sm">
                            <div className="text-xs font-bold text-emerald-600 mb-1">GOLDEN 성격유형검사</div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">일상 및 대인관계 속 스트레스 대처 스타일과 행동 양식을 입체적으로 프로파일링합니다.</p>
                          </div>
                          <div className="p-4 bg-white rounded-2xl border border-slate-100 break-keep hover:border-blue-200 transition-colors shadow-sm">
                            <div className="text-xs font-bold text-blue-600 mb-1">PAI 성격평가질문지</div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">현재 느끼는 성격적 특징과 주요 정서적 과부하, 심리적 갈등 상태를 다각도로 평가합니다.</p>
                          </div>
                          <div className="p-4 bg-white rounded-2xl border border-slate-100 break-keep hover:border-purple-200 transition-colors shadow-sm">
                            <div className="text-xs font-bold text-purple-600 mb-1">MMPI-2 다면적인성검사</div>
                            <p className="text-[11px] text-gray-500 leading-relaxed">전 세계적으로 가장 공신력 높은 종합 성격 및 정신 건강 진단 도구로 객관적 지표를 선사합니다.</p>
                          </div>
                        </div>

                        {/* Operational info placed at the bottom */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-x-6 gap-y-2.5 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="break-keep"><strong>상담실 위치:</strong> 취업정주지원센터 K102</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="break-keep"><strong>연락처:</strong> 041-939-3393</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="break-keep"><strong>운영시간:</strong> 평일 09:00 - 18:00</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-gray-400 break-keep">현재 대면 및 전화 상담 접수 활성화 중</span>
                          </div>
                          <span className="text-xs text-indigo-500/80 font-medium">마음 속 고민을 부담 없이 나누어 보세요 🏠</span>
                        </div>
                      </div>
                    )}
                  </div>


                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* 2. SPECIFIC CLINICAL/PERSONALITY TEST (Not Animal) FLOW */}
            {/* ======================================================= */}
            {selectedTestId !== null && (
              <div className="bg-white rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-sm">
                
                {/* A. Intro state for selected test */}
                {currentTestStep === -1 && (
                  <div className="text-center max-w-2xl mx-auto py-8">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                      {selectedTestId === "PHQ-9" ? "🩺" :
                       selectedTestId === "GAD-7" ? "⚡" :
                       selectedTestId === "ISI" ? "🌙" : "🔥"}
                    </div>
                    <h2 className="text-3xl font-extrabold font-serif mb-4 text-indigo-950">
                      {selectedTestId === "PHQ-9" ? "PHQ-9 우울증 자가진단 검사" :
                       selectedTestId === "GAD-7" ? "GAD-7 불안증 자가진단 검사" :
                       selectedTestId === "ISI" ? "ISI 불면증 지수 자가진단" :
                       "PSS 지각된 스트레스 검사"}
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 font-sans">
                      {selectedTestId === "PHQ-9" ? "최근 2주 동안 귀하가 겪은 우울감이나 피로도, 일상의 활기 지수를 점검합니다. 세계정신의학계에서 우울 척도를 선별할 때 활용하는 공인 자가진단 기준입니다." :
                       selectedTestId === "GAD-7" ? "최근 2주 동안 과도하게 걱정이 꼬리를 물거나 안절부절못하는 등 마음이 편안하게 안심하지 못했던 불안 지수를 과학적으로 점검해 봅니다." :
                       selectedTestId === "ISI" ? "잠자리에 누웠을 때 뒤척이는 고민, 자주 각성하는 밤잠의 얕기, 그리고 그로 인해 주간 활동이나 집중에 방해를 느끼는 불면 장애 정도를 체크합니다." :
                       "최근 한 달간 대학 생활 중 학업 과제, 대인관계, 돌발 상황에서 본인이 느낀 인지적 스트레스와 자기 극복 유연성의 밸런스를 측정합니다."}
                    </p>

                    <div className="bg-slate-50 p-5 rounded-2xl text-left border border-slate-100 mb-8 space-y-2 text-xs text-gray-600 leading-relaxed">
                      <p className="font-semibold text-gray-700">📌 문항 제출 시 주의사항:</p>
                      <p>• 정해진 정답은 없습니다. 생각을 깊게 하기보단 마음이 바로 끄덕이는 솔직한 답변을 골라 주세요.</p>
                      <p>• 검사 완료 즉시 해석 리포트와 함께 대학생 학생상담실로 실시간 1:1 상담 예약을 다이렉트 신청할 수 있는 연계 플로우가 작동합니다.</p>
                    </div>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={resetDiagnosticTest}
                        className="border border-slate-200 hover:bg-slate-50 text-gray-500 font-bold px-6 py-3 rounded-full text-xs"
                      >
                        이전 리스트로
                      </button>
                      <button
                        onClick={() => setCurrentTestStep(0)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-3 rounded-full shadow-md shadow-indigo-100 transition-all text-xs"
                      >
                        진단 시작하기 🚀
                      </button>
                    </div>
                  </div>
                )}

                {/* B. Questions loading view */}
                {currentTestStep >= 0 && !showDiagnosticResult && (
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🧭</span>
                        <h3 className="font-bold font-serif text-slate-800 text-sm md:text-base">
                          {selectedTestId === "PHQ-9" ? "PHQ-9 우울증 진단" :
                           selectedTestId === "GAD-7" ? "GAD-7 불안증 진단" :
                           selectedTestId === "ISI" ? "ISI 불면증 지수" :
                           "PSS 지각된 스트레스"}
                        </h3>
                      </div>
                      <button 
                        onClick={resetDiagnosticTest}
                        className="text-[10px] font-bold text-gray-400 hover:text-rose-500"
                      >
                        검사 중단 및 나가기 ×
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center text-xs text-gray-400 font-bold mb-2">
                        <span>마음 좌표 스캔 중...</span>
                        <span>
                          {currentTestStep + 1} / {
                            selectedTestId === "PHQ-9" ? PHQ9_QUESTIONS.length :
                            selectedTestId === "GAD-7" ? GAD7_QUESTIONS.length :
                            selectedTestId === "ISI" ? ISI_QUESTIONS.length :
                            PSS_QUESTIONS.length
                          }
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{ 
                            width: `${((currentTestStep + 1) / (
                              selectedTestId === "PHQ-9" ? PHQ9_QUESTIONS.length :
                              selectedTestId === "GAD-7" ? GAD7_QUESTIONS.length :
                              selectedTestId === "ISI" ? ISI_QUESTIONS.length :
                              PSS_QUESTIONS.length
                            )) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Question text block */}
                    <div className="mb-8 text-center md:text-left">
                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full">
                        Question {currentTestStep + 1}
                      </span>
                      <h3 className="text-lg md:text-xl font-bold font-serif text-gray-800 mt-4 leading-relaxed">
                        {selectedTestId === "PHQ-9" ? PHQ9_QUESTIONS[currentTestStep]?.text :
                         selectedTestId === "GAD-7" ? GAD7_QUESTIONS[currentTestStep]?.text :
                         selectedTestId === "ISI" ? ISI_QUESTIONS[currentTestStep]?.text :
                         PSS_QUESTIONS[currentTestStep]?.text}
                      </h3>
                    </div>

                    {/* Options rendering */}
                    <div className="space-y-3.5">
                      {(
                        selectedTestId === "PHQ-9" ? PHQ9_QUESTIONS[currentTestStep]?.options :
                        selectedTestId === "GAD-7" ? GAD7_QUESTIONS[currentTestStep]?.options :
                        selectedTestId === "ISI" ? ISI_QUESTIONS[currentTestStep]?.options :
                        PSS_QUESTIONS[currentTestStep]?.options
                      ).map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDiagnosticAnswer(opt.value, opt.category)}
                          className="w-full text-left p-4.5 rounded-2xl bg-slate-50/50 hover:bg-indigo-50/25 border border-slate-200/60 hover:border-indigo-300 transition-all duration-200 text-xs md:text-sm font-medium text-gray-700 flex items-center justify-between group active:scale-[0.99]"
                        >
                          <span>{opt.text}</span>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 shrink-0 ml-4 transition-colors" />
                        </button>
                      ))}
                    </div>

                    {/* Back Button */}
                    <div className="mt-8 pt-5 border-t border-slate-100 flex justify-start">
                      <button
                        onClick={() => {
                          if (currentTestStep === 0) {
                            setCurrentTestStep(-1);
                            setDiagnosticAnswers([]);
                            setDiagnosticCategories([]);
                          } else {
                            setCurrentTestStep(currentTestStep - 1);
                            setDiagnosticAnswers(prev => prev.slice(0, -1));
                            setDiagnosticCategories(prev => prev.slice(0, -1));
                          }
                        }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 font-bold"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> 이전 질문으로
                      </button>
                    </div>
                  </div>
                )}

                {/* C. DIAGNOSTIC RESULT VIEW */}
                {showDiagnosticResult && (
                  <div className="animate-fade-in space-y-8">
                    {(() => {
                      const details = getDiagnosticResultDetails(selectedTestId, diagnosticAnswers, diagnosticCategories);
                      return (
                        <>
                          {/* 1. Header Hero Card */}
                          <div className={`rounded-3xl p-6 md:p-8 border border-stone-200/60 ${details.bgClass} relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none"></div>
                            <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 border ${details.badgeClass}`}>
                              {details.levelLabel}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-stone-800 leading-snug">
                              마음 검진 분석 결과 리포트
                            </h2>
                            <p className="text-gray-500 text-xs md:text-sm mt-1">
                              자가 검사로 진단된 당신의 현재 심리 상태 지표입니다.
                            </p>
                          </div>

                          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-stone-100 max-w-md">
                            <div className="text-3xl">📊</div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">계산된 지표 결과</span>
                              <span className={`text-base md:text-lg font-bold font-serif ${details.colorClass}`}>{details.scoreText}</span>
                            </div>
                          </div>



                          {/* 3. Deep Analysis and Advice Paragraph */}
                          <div className="bg-stone-50/50 p-6 md:p-8 rounded-3xl border border-stone-200/40 space-y-4 leading-relaxed">
                            <h3 className="text-sm font-bold font-serif text-stone-800 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-[#FF8A65]" /> 전문상담사의 마음 분석 및 제안
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-serif">
                              {details.description}
                            </p>
                          </div>

                          {/* 4. Action Guidelines */}
                          <div className="bg-[#FAF7F2]/40 p-6 md:p-8 rounded-3xl border border-stone-200/30 space-y-4">
                            <h3 className="text-sm font-bold font-serif text-stone-800 flex items-center gap-2">
                              <Award className="w-4 h-4 text-emerald-500" /> 다정한 전문상담사 선생님의 자가 마인드 처방전
                            </h3>
                            <ul className="space-y-3.5">
                              {details.tips.map((tip, idx) => (
                                <li key={idx} className="text-xs text-gray-600 leading-relaxed flex items-start gap-2.5">
                                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 5. Real-time Counseling Integration Booking Form */}
                          <div className="border-2 border-dashed border-orange-200/80 rounded-3xl p-6 md:p-8 bg-white space-y-6">
                            
                            {!isResSubmitted ? (
                              <div>
                                <div className="space-y-1.5 mb-6">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#FF8A65]" />
                                    <h3 className="text-base md:text-lg font-bold font-serif text-stone-800">
                                      진단 연계 전문 1:1 상담 예약 신청서 📅
                                    </h3>
                                  </div>
                                  <p className="text-xs text-gray-400 leading-relaxed">
                                    이 자가진단 결과를 안고 대학 학생상담실의 선생님과 직접 편안히 얘기 나누어 보세요.<br />
                                    작성하신 예약 정보와 이 진단 분석 수치가 실시간으로 센터 관리소로 자동 전송됩니다.
                                  </p>
                                </div>

                                <form onSubmit={handleCounselingSubmit} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-400 block mb-1">이름</label>
                                      <input 
                                        type="text"
                                        required
                                        placeholder="홍길동"
                                        value={resName}
                                        onChange={(e) => setResName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-300"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-400 block mb-1">소속 학과</label>
                                      <input 
                                        type="text"
                                        required
                                        placeholder="심리학과"
                                        value={resDept}
                                        onChange={(e) => setResDept(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-300"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-400 block mb-1">학번</label>
                                      <input 
                                        type="text"
                                        required
                                        placeholder="202412345"
                                        value={resId}
                                        onChange={(e) => setResId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-300 font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-400 block mb-1">연락처</label>
                                      <input 
                                        type="text"
                                        required
                                        placeholder="010-1234-5678"
                                        value={resContact}
                                        onChange={(e) => setResContact(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-300 font-mono"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-400 block mb-1">선호 상담 형태</label>
                                      <div className="grid grid-cols-2 gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => setResMethod("face_to_face")}
                                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                            resMethod === "face_to_face" 
                                              ? "bg-green-50 border-green-300 text-green-700" 
                                              : "bg-stone-50 text-gray-400 border-stone-200"
                                          }`}
                                        >
                                          대면 상담
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setResMethod("online")}
                                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                            resMethod === "online" 
                                              ? "bg-blue-50 border-blue-300 text-blue-700" 
                                              : "bg-stone-50 text-gray-400 border-stone-200"
                                          }`}
                                        >
                                          비대면 화상
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-400 block mb-1">희망 상담 일자</label>
                                      <input 
                                        type="date"
                                        required
                                        value={resDate}
                                        onChange={(e) => setResDate(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-300 font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-400 block mb-1">희망 상담 시간</label>
                                      <select 
                                        id="res-time-select-1"
                                        required
                                        value={resTime}
                                        onChange={(e) => setResTime(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-300 font-mono cursor-pointer"
                                      >
                                        {TIME_OPTIONS.map((time) => (
                                          <option key={time} value={time}>{time}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-1 text-[11px] text-gray-400">
                                    <p>연계 검사명: <strong className="text-gray-600 font-serif">{resTestName}</strong></p>
                                    <p>진단 결과값 요약: <strong className="text-gray-600 font-serif">{resResultSummary}</strong></p>
                                  </div>

                                  <button
                                    type="submit"
                                    className="w-full bg-[#FF8A65] hover:bg-[#ff7b52] text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-orange-100 text-xs md:text-sm"
                                  >
                                    위 마음진단 결과 연계하여 1:1 상담 신청서 전송 🚀
                                  </button>
                                </form>
                              </div>
                            ) : (
                              /* Submission Success State */
                              <div className="text-center py-6 space-y-4 animate-fade-in">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl mx-auto">
                                  🎉
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold font-serif text-stone-800">1:1 상담 예약 신청서 접수 성공!</h3>
                                  <p className="text-xs text-gray-400 mt-1">자가진단 수치와 예약서가 실시간으로 교내 학생상담실 오피스에 접수되었습니다.</p>
                                </div>
                                <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200/40 text-left text-xs text-gray-600 leading-relaxed max-w-md mx-auto space-y-1 font-serif">
                                  <p className="font-bold text-gray-700 mb-1.5 border-b border-stone-200 pb-1">💡 접수 접수 확인 및 안내사항:</p>
                                  <p>• <strong>예약 상태:</strong> 접수 대기 중 🟡</p>
                                  <p>• <strong>상담 분류:</strong> 자가진단 연계 개별 맞춤상담</p>
                                  <p>• 기재해주신 소속 및 연락처로 담당 상담사 선생님이 업무일 기준 1~2일 이내에 개별 전화를 드려 확정 예약을 조율해 드릴 예정입니다.</p>
                                </div>
                              </div>
                            )}

                          </div>

                          {/* 6. Back Button */}
                          <div className="pt-6 border-t border-stone-100 flex justify-between items-center">
                            <button
                              onClick={resetDiagnosticTest}
                              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" /> 다른 마음 좌표 스캔하러 가기
                            </button>
                            <button
                              onClick={() => { setActiveTab("home"); }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                            >
                              메인 화면으로 환승하기 🧭
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

              </div>
            )}

            {/* ======================================================= */}
            {/* 3. ORIGINAL ANIMAL STRESS TEST (PRESERVED)             */}
            {/* ======================================================= */}
            {selectedTestId === "ANIMAL" && (
              <div className="bg-white rounded-[40px] p-6 md:p-10 border border-orange-100/50 shadow-sm">
                
                {/* Animal Intro */}
                {testStep === -1 && (
                  <div className="text-center max-w-2xl mx-auto py-8">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                      🔍
                    </div>
                    <h2 className="text-3xl font-extrabold font-serif mb-4 text-[#81C784]">
                      스트레스 대처 동물 유형 검사
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
                      대학 생활에서 과제, 연애, 미래 고민이 몰려올 때 나는 어떻게 대처하고 어떤 방어 기제를 보일까요? <br />
                      5개의 심리학 질문을 통해 마음 유형과 스트레스 해소 꿀팁을 알아가세요.
                    </p>
                    <div className="bg-[#FAF7F2] p-5 rounded-2xl text-left border border-stone-200/40 mb-8 space-y-2 text-xs text-gray-600 leading-relaxed">
                      <p className="font-semibold text-gray-700">📌 검사 안내:</p>
                      <p>• 이 검사는 학업, 진로, 관계 등의 대학생 일상 스트레스 반응을 진단합니다.</p>
                      <p>• 정답이 없으니, 가장 첫 느낌에 가깝고 솔직하게 답변해 주세요.</p>
                      <p>• 검사 결과에 따른 따뜻한 다독임과 마인드풀니스 조언이 마지막에 함께합니다.</p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={resetDiagnosticTest}
                        className="border border-stone-200 hover:bg-stone-50 text-gray-500 font-bold px-6 py-3 rounded-full text-xs"
                      >
                        종합 검사센터 가기
                      </button>
                      <button
                        onClick={() => setTestStep(0)}
                        className="bg-[#81C784] text-white font-bold px-10 py-3 rounded-full shadow-md shadow-green-100 hover:opacity-95 transition-all text-xs"
                      >
                        동물 진단 시작하기 🚀
                      </button>
                    </div>
                  </div>
                )}

                {/* Animal Questions */}
                {testStep >= 0 && testStep < (questions.length > 0 ? questions : STRESS_QUESTIONS).length && (
                  <div>
                    {/* Progress bar */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center text-xs text-gray-400 font-bold mb-2">
                        <span>동물 진단 진행도</span>
                        <span>{testStep + 1} / {(questions.length > 0 ? questions : STRESS_QUESTIONS).length}</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#81C784] transition-all duration-300"
                          style={{ width: `${((testStep + 1) / (questions.length > 0 ? questions : STRESS_QUESTIONS).length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Question */}
                    <div className="mb-8 text-center md:text-left">
                      <span className="text-xs font-extrabold text-[#81C784] uppercase tracking-widest bg-green-50 px-3.5 py-1.5 rounded-full">
                        Question {testStep + 1}
                      </span>
                      <h3 className="text-lg md:text-2xl font-bold font-serif text-gray-800 mt-4 leading-relaxed">
                        {(questions.length > 0 ? questions : STRESS_QUESTIONS)[testStep]?.text}
                      </h3>
                    </div>

                    {/* Options list */}
                    <div className="space-y-4">
                      {((questions.length > 0 ? questions : STRESS_QUESTIONS)[testStep]?.options || []).map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(option.score)}
                          className="w-full text-left p-5 rounded-2xl bg-stone-50 hover:bg-green-50/50 border border-stone-200/60 hover:border-[#81C784] transition-all duration-300 text-sm md:text-base font-medium text-gray-700 flex items-center justify-between group active:scale-[0.99]"
                        >
                          <span>{option.text}</span>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#81C784] shrink-0 ml-4 transition-colors" />
                        </button>
                      ))}
                    </div>

                    {/* Back button */}
                    <div className="mt-8 pt-6 border-t border-stone-100 flex justify-start">
                      <button
                        onClick={() => {
                          if (testStep === 0) setTestStep(-1);
                          else setTestStep(testStep - 1);
                        }}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 font-bold"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> 이전 질문으로
                      </button>
                    </div>
                  </div>
                )}

                {/* Animal Result */}
                {testStep === 5 && testResult && (
                  <div className="animate-fade-in space-y-8">
                    {/* Result Title */}
                    <div className="text-center max-w-xl mx-auto">
                      <span className="bg-green-50 text-[#81C784] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-green-100">
                        Your Stress Animal Type
                      </span>
                      <h2 className="text-3xl md:text-4xl font-extrabold font-serif mt-4 text-[#81C784]">
                        {testResult.name}
                      </h2>
                      <p className="text-base text-gray-500 font-medium mt-2">
                        &ldquo;{testResult.title}&rdquo;
                      </p>
                    </div>

                    {/* Main Content Split Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                      
                      {/* Left block: Character Card */}
                      <div className="lg:col-span-2 bg-gradient-to-b from-[#FAF7F2] to-white rounded-3xl p-6 border border-stone-200/50 text-center shadow-sm">
                        <img 
                          src={testResult.imageUrl} 
                          alt={testResult.name} 
                          className="w-full h-48 md:h-64 object-cover rounded-2xl mb-5 shadow-sm"
                        />
                        <div className="bg-white p-4 rounded-xl border border-stone-100 text-left text-xs leading-relaxed text-gray-500">
                          <strong>동물 설명:</strong> {testResult.description}
                        </div>
                      </div>

                      {/* Right block: Analysis & Advice */}
                      <div className="lg:col-span-3 space-y-6">
                        
                        {/* Strengths */}
                        <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-200/60">
                          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                            <CheckCircle className="w-4 h-4 text-[#81C784]" /> 성격적 강점 및 잠재력
                          </h4>
                          <ul className="space-y-2">
                            {testResult.strengths.map((s, idx) => (
                              <li key={idx} className="text-xs text-gray-600 leading-relaxed flex items-start gap-1.5">
                                <span className="text-[#81C784]">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Stress Warning Signs */}
                        <div className="bg-orange-50/20 p-6 rounded-2xl border border-orange-100">
                          <h4 className="text-sm font-bold text-orange-700 flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-orange-400" /> 마음의 적신호 (주의해야 할 순간)
                          </h4>
                          <ul className="space-y-2">
                            {testResult.stressSigns.map((s, idx) => (
                              <li key={idx} className="text-xs text-gray-600 leading-relaxed flex items-start gap-1.5">
                                <span className="text-orange-400">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Counselor's Action Guidelines */}
                        <div className="bg-green-50/20 p-6 rounded-2xl border border-green-100/50">
                          <h4 className="text-sm font-bold text-green-800 flex items-center gap-2 mb-3">
                            <Award className="w-4 h-4 text-[#81C784]" /> 다정한 상담사 선생님의 행동 마음 처방
                          </h4>
                          <ul className="space-y-3">
                            {testResult.tips.map((tip, idx) => (
                              <li key={idx} className="text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#81C784] text-white flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </div>

                    {/* Booking Form Card for Animal test result */}
                    <div className="border-2 border-dashed border-green-200 rounded-3xl p-6 md:p-8 bg-white space-y-6">
                      {!isResSubmitted ? (
                        <div>
                          <div className="space-y-1.5 mb-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-[#81C784]" />
                              <h3 className="text-base md:text-lg font-bold font-serif text-stone-800">
                                동물 진단 연계 1:1 예약 신청 📅
                              </h3>
                            </div>
                            <p className="text-xs text-gray-400">
                              위 동물 유형 결과를 안고, 교내 학생상담실 전문 선생님과 깊이 있는 수다를 예약해 보세요.
                            </p>
                          </div>

                          <form onSubmit={handleCounselingSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 block mb-1">이름</label>
                                <input 
                                  type="text"
                                  required
                                  placeholder="홍길동"
                                  value={resName}
                                  onChange={(e) => setResName(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-green-300"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 block mb-1">소속 학과</label>
                                <input 
                                  type="text"
                                  required
                                  placeholder="컴퓨터공학과"
                                  value={resDept}
                                  onChange={(e) => setResDept(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-green-300"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 block mb-1">학번</label>
                                <input 
                                  type="text"
                                  required
                                  placeholder="202412345"
                                  value={resId}
                                  onChange={(e) => setResId(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-green-300 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 block mb-1">연락처</label>
                                <input 
                                  type="text"
                                  required
                                  placeholder="010-1234-5678"
                                  value={resContact}
                                  onChange={(e) => setResContact(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-green-300 font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 block mb-1">상담 형태</label>
                                <div className="grid grid-cols-2 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setResMethod("face_to_face")}
                                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                      resMethod === "face_to_face" 
                                        ? "bg-green-50 border-green-300 text-green-700" 
                                        : "bg-stone-50 text-gray-400 border-stone-200"
                                    }`}
                                  >
                                    대면
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setResMethod("online")}
                                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                      resMethod === "online" 
                                        ? "bg-blue-50 border-blue-300 text-blue-700" 
                                        : "bg-stone-50 text-gray-400 border-stone-200"
                                    }`}
                                  >
                                    비대면
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 block mb-1">희망 날짜</label>
                                <input 
                                  type="date"
                                  required
                                  value={resDate}
                                  onChange={(e) => setResDate(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-green-300 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 block mb-1">희망 시간</label>
                                <select 
                                  id="res-time-select-2"
                                  required
                                  value={resTime}
                                  onChange={(e) => setResTime(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-green-300 font-mono cursor-pointer"
                                >
                                  {TIME_OPTIONS.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-[#81C784] hover:opacity-95 text-white font-bold py-3.5 rounded-xl text-xs md:text-sm shadow-md transition-all"
                            >
                              이 동물 결과 안고 상담 예약하기 🚀
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="text-center py-6 space-y-4">
                          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl mx-auto">
                            🎉
                          </div>
                          <div>
                            <h3 className="text-lg font-bold font-serif text-stone-800">예약 신청 완료!</h3>
                            <p className="text-xs text-gray-400">동물 유형 정보와 신청 정보가 실시간 상담관리실로 송출되었습니다.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Section with real center help button */}
                    <div className="mt-10 pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
                      <button
                        onClick={() => { resetStressTest(); resetDiagnosticTest(); }}
                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" /> 종합 검사센터 가기
                      </button>
                      <button
                        onClick={() => { setActiveTab("worry"); }}
                        className="bg-[#FF8A65] text-white text-sm font-bold px-6 py-3 rounded-full hover:opacity-95 transition-all flex items-center gap-2"
                      >
                        <span>이 결과를 안고 고민 털어놓기 ✉️</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 3: PSYCHOLOGY TRIVIA & QUIZ      */}
        {/* ==================================== */}
        {activeTab === "psychology" && (
          <div className="bg-white rounded-[40px] p-6 md:p-10 border border-blue-100/50 shadow-sm animate-fade-in">
            <div className="max-w-2xl mx-auto">
              
              {/* Header */}
              <div className="text-center mb-8">
                <span className="bg-blue-50 text-[#64B5F6] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Psychology Trivia Quiz
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold font-serif mt-4 text-[#64B5F6]">
                  심리 상식 O/X 놀이터
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  우리가 몰랐던 마음의 비밀과 대학 상담소에 관한 오해들을 퀴즈로 속 시원하게 풀어보세요!
                </p>
              </div>

              {!quizFinished ? (
                <div className="space-y-6">
                  {/* Progress Indicator */}
                  <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
                    <span>퀴즈 점수: {quizScore} / {(quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ).length}</span>
                    <span>Q{quizIndex + 1}</span>
                  </div>

                  {/* Question Box */}
                  <div className="bg-[#FAF7F2] p-8 rounded-3xl border border-stone-200/50 text-center relative overflow-hidden min-h-[140px] flex items-center justify-center">
                    <div className="absolute top-2 left-4 text-blue-100 text-6xl font-serif select-none">Q</div>
                    <p className="text-base md:text-lg font-bold text-gray-800 leading-relaxed relative z-10">
                      {(quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ)[quizIndex]?.question}
                    </p>
                  </div>

                  {/* Selection Buttons */}
                  {!showExplanation ? (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleQuizAnswer(true)}
                        className="p-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 hover:border-emerald-400 transition-all text-center flex flex-col items-center justify-center gap-2 group active:scale-[0.98]"
                      >
                        <CheckCircle className="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-emerald-800 text-lg">그렇다 (O)</span>
                      </button>
                      <button
                        onClick={() => handleQuizAnswer(false)}
                        className="p-6 rounded-2xl bg-rose-50 hover:bg-rose-100/70 border border-rose-200 hover:border-rose-400 transition-all text-center flex flex-col items-center justify-center gap-2 group active:scale-[0.98]"
                      >
                        <XCircle className="w-12 h-12 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-rose-800 text-lg">아니다 (X)</span>
                      </button>
                    </div>
                  ) : (
                    /* Explanation View */
                    <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4 animate-fade-in shadow-sm">
                      <div className="flex items-center gap-3">
                        {selectedAnswer === (quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ)[quizIndex]?.answer ? (
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold px-4 py-1.5 rounded-full text-xs">
                            <CheckCircle className="w-4 h-4" /> 정답입니다!
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 font-bold px-4 py-1.5 rounded-full text-xs">
                            <XCircle className="w-4 h-4" /> 틀렸습니다!
                          </div>
                        )}
                        <span className="text-xs text-gray-400 font-bold">
                          실제 해답: {(quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ)[quizIndex]?.answer ? "O (그렇다)" : "X (아니다)"}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium bg-stone-50 p-4 rounded-xl border border-stone-100">
                        {(quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ)[quizIndex]?.explanation}
                      </p>

                      <button
                        onClick={handleNextQuiz}
                        className="w-full bg-[#64B5F6] text-white font-bold py-3.5 rounded-xl hover:opacity-95 transition-all text-xs md:text-sm flex items-center justify-center gap-2"
                      >
                        <span>{quizIndex === (quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ).length - 1 ? "결과 보기" : "다음 퀴즈 풀기"}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* QUIZ FINISHED */
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mx-auto">
                    🎓
                  </div>
                  <h3 className="text-2xl font-extrabold font-serif text-gray-800">
                    심리 상식 퀴즈 완료!
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                    수고하셨습니다! 총 {(quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ).length}문제 중 <strong className="text-[#64B5F6]">{quizScore}문제</strong>를 맞추셨어요. <br />
                    이처럼 상담실은 오해와 무거운 시선에서 벗어나 안전하게 이용하실 수 있는 공감의 장터입니다.
                  </p>
                  <div className="bg-[#FAF7F2] p-5 rounded-2xl text-left border border-stone-200/40 text-xs text-gray-600 leading-relaxed max-w-md mx-auto space-y-1">
                    <p className="font-bold text-gray-700 mb-1">상담실 상식 요약정리:</p>
                    <p>✔ <strong>기록의 안전:</strong> 교내외 포털에 상담 기록은 일절 공유되지 않습니다.</p>
                    <p>✔ <strong>모두를 위한 곳:</strong> 학업 슬럼프, 연애 걱정 등 가벼운 스트레스도 든든한 환영 대상입니다.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button
                      onClick={resetQuiz}
                      className="bg-stone-100 hover:bg-stone-200/80 text-gray-600 font-bold px-6 py-3.5 rounded-full transition-all text-xs"
                    >
                      다시 풀기 ↩
                    </button>
                    <button
                      onClick={() => setActiveTab("worry")}
                      className="bg-[#64B5F6] text-white font-bold px-6 py-3.5 rounded-full hover:opacity-95 transition-all text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>익명 고민 우체통 이용해보기 ✉️</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 4: ANONYMOUS WORRY MAILBOX       */}
        {/* ==================================== */}
        {activeTab === "worry" && (
          <div className="bg-white rounded-[40px] p-6 md:p-10 border border-orange-100/50 shadow-sm animate-fade-in">
            <div className="max-w-2xl mx-auto">
              
              {/* Header */}
              <div className="text-center mb-8">
                <span className="bg-orange-50 text-[#FF8A65] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Anonymous Mailbox
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold font-serif mt-4 text-[#FF8A65]">
                  익명 비밀 고민 우체통
                </h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  학과 고민, 교우 관계, 알 수 없는 불안함 등 마음속 무거운 돌멩이를 남겨주세요. <br />
                  AI 상담사가 마음의 긴장을 풀 수 있는 따뜻한 공감 답장을 배달해 드립니다.
                </p>
              </div>

              {!worryResponse ? (
                /* WORRY INPUT FORM */
                <form onSubmit={handleWorrySubmit} className="space-y-6">
                  
                  {/* Emotion Picker */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      현재 마음을 가장 잘 표현하는 감정 단어는?
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {["지침", "우울", "불안", "답답함", "자책", "화남"].map((emotion) => (
                        <button
                          key={emotion}
                          type="button"
                          onClick={() => setSelectedEmotion(emotion)}
                          className={`py-2 px-1 text-xs font-semibold rounded-xl text-center border transition-all ${
                            selectedEmotion === emotion
                              ? "bg-orange-50 border-[#FF8A65] text-[#FF8A65] shadow-sm font-bold scale-[1.03]"
                              : "bg-stone-50 border-stone-200/60 text-gray-500 hover:bg-stone-100/50"
                          }`}
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Worry Text Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      고민을 자유롭게 남겨주세요 (익명성이 철저히 보장됩니다)
                    </label>
                    <textarea
                      value={worryText}
                      onChange={(e) => setWorryText(e.target.value)}
                      placeholder="예) 시험기간인데 집중이 너무 안 돼요. 나만 뒤처지는 것 같아 자꾸 이불 속으로만 숨게 되고 사소한 친구의 반응에도 예민해져서 밤에 잠을 잘 자지 못하겠어요..."
                      rows={6}
                      maxLength={1000}
                      className="w-full p-5 rounded-2xl bg-[#FAF7F2] text-sm text-gray-700 placeholder-gray-400 border border-stone-200/50 focus:border-[#FF8A65] focus:bg-white focus:outline-none transition-all leading-relaxed"
                      required
                    />
                    <div className="text-right text-[11px] text-gray-400">
                      {worryText.length} / 1000자
                    </div>
                  </div>

                  {/* Privacy Checkbox */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex items-start gap-2.5">
                    <input 
                      type="checkbox" 
                      id="privacy" 
                      required 
                      defaultChecked 
                      className="mt-0.5 rounded text-[#FF8A65] focus:ring-[#FF8A65]"
                    />
                    <label htmlFor="privacy" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
                      교내 아지트로서 익명성이 100% 보장되며, 일체 상업적 목적이나 외부 연동으로 마음 정보가 보관되지 않음에 동의합니다.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isWorrySubmitting}
                    className="w-full bg-[#FF8A65] text-white font-bold py-4 rounded-2xl hover:opacity-95 transition-all text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isWorrySubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        <span>따뜻한 손편지를 우체통에 배달하고 있어요...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>비밀 우체통에 고민 날리기 ✉️</span>
                      </>
                    )}
                  </button>

                </form>
              ) : (
                /* WORRY RESPONSE (LETTER SCREEN) */
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Letter Envelope Graphic container */}
                  <div className="bg-gradient-to-br from-[#FFFDF9] to-[#F7F3E9] p-6 md:p-10 rounded-3xl border border-orange-100 relative shadow-md">
                    <div className="absolute top-4 right-4 text-orange-200/40 text-xs font-serif font-bold italic select-none">
                      Campus Healing Letter
                    </div>
                    
                    {/* Hand-written look Header */}
                    <div className="border-b border-orange-200/50 pb-4 mb-6">
                      <p className="text-xs text-[#FF8A65] font-bold">From. 상담사 선생님의 답장 ✉️</p>
                      <h4 className="text-lg font-serif font-extrabold text-stone-700 mt-1">
                        소중한 당신의 고민을 소중히 읽었어요
                      </h4>
                    </div>

                    {/* Letter Body */}
                    <div className="space-y-4 text-sm md:text-base text-stone-600 leading-relaxed font-serif whitespace-pre-wrap">
                      {worryResponse}
                    </div>

                    {/* Letter Footer Signature */}
                    <div className="mt-8 pt-6 border-t border-orange-100/50 flex justify-between items-center text-xs">
                      <span className="text-[#FF8A65] font-bold flex items-center gap-1">
                        <Smile className="w-4 h-4" /> 마음의 든든한 울타리
                      </span>
                      <span className="text-gray-400 font-medium">대학생 마음상담센터</span>
                    </div>
                  </div>

                  {/* Options After receiving response */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      onClick={() => setWorryResponse(null)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 다른 고민 털어놓기
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.print()}
                        className="bg-stone-100 hover:bg-stone-200/60 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" /> 편지 출력/보관하기
                      </button>
                      <button
                        onClick={() => {
                          const contactModal = document.getElementById("contact-section");
                          if (contactModal) contactModal.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="bg-[#FF8A65] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-95 transition-all flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" /> 대면 상담 신청 안내
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 5: COUNSELOR ARTICLES (POSTS)    */}
        {/* ==================================== */}
        {activeTab === "posts" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-[40px] p-6 md:p-10 border border-purple-100/50 shadow-sm text-center">
              <span className="bg-purple-50 text-[#9575CD] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                Counselor's Healing Column
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-serif mt-4 text-[#9575CD]">
                상담사 마음 칼럼 게시판
              </h2>
              <p className="text-sm text-gray-400 mt-3 max-w-xl mx-auto leading-relaxed break-keep">
                캠퍼스 상담실 선생님들이 여러분께 건네는 따뜻한 심리학 이야기와 꿀팁 처방전입니다. 남들과 비교하는 습관, 시험 불안 대처, 인간관계 극복 노하우를 편안하게 읽고 치유의 에너지를 얻어가세요.
              </p>
            </div>

            {/* Main view or Detail view */}
            {!selectedPost ? (
              <div className="space-y-6">
                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <div 
                      key={post.id}
                      className="bg-white rounded-[32px] p-6 border border-stone-200/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            post.category === "Social" ? "bg-orange-50 text-[#FF8A65]" :
                            post.category === "Learning" ? "bg-green-50 text-[#81C784]" :
                            post.category === "Emotion" ? "bg-blue-50 text-[#64B5F6]" :
                            "bg-purple-50 text-[#9575CD]"
                          }`}>
                            {post.category === "Social" ? "인간관계 👥" :
                             post.category === "Learning" ? "학업/공부 ✍" :
                             post.category === "Emotion" ? "내면/정서 🧠" :
                             "성장/갓생 🌱"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{post.createdAt}</span>
                        </div>
                        <h3 className="text-lg font-bold font-serif text-gray-800 line-clamp-2 mb-3 break-keep">
                          {post.title}
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed line-clamp-4 whitespace-pre-wrap mb-4 break-keep">
                          {post.content}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-auto">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-xs font-bold text-[#9575CD] hover:text-[#7E57C2] flex items-center gap-1"
                        >
                          자세히 읽기 <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = posts.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p);
                            savePosts(updated);
                          }}
                          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-600 font-semibold"
                        >
                          <Heart className="w-3.5 h-3.5 fill-rose-100" />
                          <span>공감 {post.likes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {posts.length === 0 && (
                    <div className="col-span-full bg-white rounded-[32px] p-12 text-center border border-dashed border-stone-200">
                      <p className="text-gray-400 text-sm">아직 등록된 칼럼이 없습니다. 상담사 선생님 오피스에서 등록해 주세요!</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Detail Post View */
              <div className="bg-white rounded-[40px] p-6 md:p-10 border border-purple-100/50 shadow-sm space-y-6 animate-fade-in max-w-3xl mx-auto">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 font-bold mb-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> 전체 칼럼 목록으로
                </button>

                <div className="border-b border-stone-100 pb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedPost.category === "Social" ? "bg-orange-50 text-[#FF8A65]" :
                      selectedPost.category === "Learning" ? "bg-green-50 text-[#81C784]" :
                      selectedPost.category === "Emotion" ? "bg-blue-50 text-[#64B5F6]" :
                      "bg-purple-50 text-[#9575CD]"
                    }`}>
                      {selectedPost.category === "Social" ? "인간관계 👥" :
                       selectedPost.category === "Learning" ? "학업/공부 ✍" :
                       selectedPost.category === "Emotion" ? "내면/정서 🧠" :
                       "성장/갓생 🌱"}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{selectedPost.createdAt}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-extrabold text-stone-800 leading-snug">
                    {selectedPost.title}
                  </h3>
                </div>

                <div className="text-sm md:text-base text-stone-600 leading-relaxed space-y-4 whitespace-pre-wrap font-serif min-h-[200px]">
                  {selectedPost.content}
                </div>

                <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    By. 대학생 마음 포털 전문상담사 🧑‍🏫
                  </div>
                  <button
                    onClick={() => {
                      const updated = posts.map(p => p.id === selectedPost.id ? { ...p, likes: p.likes + 1 } : p);
                      savePosts(updated);
                      setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 });
                    }}
                    className="flex items-center gap-2 text-sm bg-rose-50 text-rose-500 font-bold px-5 py-2.5 rounded-full hover:bg-rose-100 transition-all active:scale-[0.98]"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <span>글이 유익했어요 ({selectedPost.likes})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 6: COUNSELOR ADMIN OFFICE (ADMIN) */}
        {/* ==================================== */}
        {activeTab === "admin" && (
          <div className="space-y-6 animate-fade-in">
            {!isAdminAuthenticated ? (
              /* Password Gate */
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-stone-200/50 shadow-sm max-w-md mx-auto text-center space-y-6">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-3xl mx-auto">
                  🔐
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-gray-800">상담실 전용 아지트 로그인</h2>
                  <p className="text-xs text-gray-400 mt-1">상담 선생님들을 위한 질문/칼럼 콘텐츠 실시간 업로드 관리소입니다.</p>
                </div>
                
                <div className="space-y-3">
                  <input 
                    type="password"
                    placeholder="관리자 비밀번호를 입력하세요"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-center text-sm focus:outline-none focus:border-indigo-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (adminPasswordInput === adminPassword) {
                          setIsAdminAuthenticated(true);
                          setAdminError(null);
                        } else {
                          setAdminError("암호가 올바르지 않습니다.");
                        }
                      }
                    }}
                  />
                  {adminError && <p className="text-xs text-rose-500 font-bold">{adminError}</p>}
                </div>

                <button
                  onClick={() => {
                    if (adminPasswordInput === adminPassword) {
                      setIsAdminAuthenticated(true);
                      setAdminError(null);
                    } else {
                      setAdminError("암호가 올바르지 않습니다.");
                    }
                  }}
                  className="w-full bg-[#FF8A65] hover:opacity-95 text-white font-bold py-3.5 rounded-xl transition-all text-xs"
                >
                  상담사 전용실 입장하기 🔑
                </button>
              </div>
            ) : (
              /* Authenticated Control Dashboard */
              <div className="space-y-6">
                {/* Admin Header */}
                <div className="bg-white rounded-[40px] p-6 md:p-8 border border-stone-200/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">
                      🧑‍🏫
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-serif text-stone-800">안녕하세요, 전문상담사 선생님!</h2>
                      <p className="text-xs text-gray-400">학생들을 위해 새로운 검사 문항이나 심리학 아티클을 즉각 발행하고 지울 수 있습니다.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsAdminAuthenticated(false); setAdminPasswordInput(""); }}
                    className="bg-stone-100 hover:bg-stone-200 text-gray-500 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    로그아웃 🚪
                  </button>
                </div>

                {/* 0. Homepage Dynamic Text Management */}
                <div className="bg-white rounded-[32px] p-6 md:p-8 border border-stone-200/50 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                    <span className="text-xl">✍️</span>
                    <h3 className="text-base font-bold font-serif text-indigo-900">
                      홈페이지 랜딩화면 & 게이트키퍼 문구 실시간 편집기
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">웰컴 타이틀 (홈 화면 메인 제목)</label>
                        <input 
                          type="text"
                          value={homeWelcomeTitle}
                          onChange={(e) => saveHomeWelcomeTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">웰컴 서브 가이드 (홈 화면 설명 문구)</label>
                        <textarea 
                          rows={3}
                          value={homeWelcomeDesc}
                          onChange={(e) => saveHomeWelcomeDesc(e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs leading-relaxed focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">게이트키퍼 편지 (사이드바 안내 가이드)</label>
                        <textarea 
                          rows={6}
                          value={gatekeeperLetter}
                          onChange={(e) => saveGatekeeperLetter(e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs leading-relaxed focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-gray-400">
                    <span>💡 입력하는 즉시 브라우저의 로컬 저장소(localStorage)에 동기화되어 실시간 반영됩니다.</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("기본 웰컴 텍스트와 가이드 편지 문구로 되돌리시겠습니까?")) {
                          saveHomeWelcomeTitle("마음 포털에 오신 것을 환영합니다.");
                          saveHomeWelcomeDesc("지금 당신이 서 있는 곳은 어디인가요? 안전하고 편안한 일상으로 이동하기 위해 현재 마음의 좌표를 잠시 스캔합니다.");
                          saveGatekeeperLetter("마음 포털은 여러분이 더 안전하고 편안한 일상으로 이동할 수 있도록 안내하는 가상 환승 공간입니다. 언제든 상담실 포털을 열고 전문가와 함께 다음 목적지로 향해 보세요.");
                        }
                      }}
                      className="text-indigo-500 hover:text-indigo-700 font-bold shrink-0 self-end sm:self-auto"
                    >
                      기본 문구로 초기화
                    </button>
                  </div>
                </div>

                {/* 0.5. Admin Password Security Management */}
                <div className="bg-white rounded-[32px] p-6 md:p-8 border border-stone-200/50 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                    <span className="text-xl">🔐</span>
                    <h3 className="text-base font-bold font-serif text-indigo-900">
                      상담사 아지트 로그인 비밀번호 관리
                    </h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-end gap-4 max-w-2xl">
                    <div className="w-full sm:w-1/3">
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">현재 사용 중인 비밀번호</label>
                      <div className="px-3.5 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono text-gray-500 select-none">
                        {adminPassword}
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-1/3">
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">새로운 비밀번호 입력</label>
                      <input 
                        type="text"
                        value={newPasswordInput}
                        onChange={(e) => {
                          setNewPasswordInput(e.target.value);
                          if (passwordChangeSuccess) setPasswordChangeSuccess(false);
                        }}
                        placeholder="새 비밀번호 입력"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-indigo-400 font-mono"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newPasswordInput.trim();
                        if (!trimmed) {
                          alert("변경할 새로운 비밀번호를 입력해 주세요.");
                          return;
                        }
                        if (trimmed.length < 2) {
                          alert("비밀번호는 최소 2글자 이상이어야 합니다.");
                          return;
                        }
                        saveAdminPassword(trimmed);
                        setNewPasswordInput("");
                        setPasswordChangeSuccess(true);
                        setTimeout(() => setPasswordChangeSuccess(false), 4000);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all whitespace-nowrap active:scale-[0.98] h-[38px] flex items-center justify-center gap-1"
                    >
                      비밀번호 변경하기 🔄
                    </button>
                  </div>
                  
                  {passwordChangeSuccess && (
                    <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                      <span>✓</span> 비밀번호가 성공적으로 변경되었습니다. 다음 로그인부터 새로운 비밀번호가 적용됩니다!
                    </div>
                  )}
                </div>

                {/* 0.75. Google Drive & Sheets Integration Panel */}
                <div className="bg-white rounded-[32px] p-6 md:p-8 border border-stone-200/50 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      <div>
                        <h3 className="text-base font-bold font-serif text-indigo-900">
                          구글 드라이브 & 스프레드시트 실시간 동기화
                        </h3>
                        <p className="text-xs text-gray-400">데이터베이스 불안정 시에도 구글 시트를 통해 실시간 예약 내역을 안전하게 보관 및 관리할 수 있습니다.</p>
                      </div>
                    </div>
                    {isDbOffline && (
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                        ⚠️ 클라우드 데이터베이스 대체 모드 (구글 시트 연동 권장)
                      </span>
                    )}
                  </div>

                  {googleSheetsError && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-600 flex items-start gap-2">
                      <span className="shrink-0 text-base">⚠️</span>
                      <p className="leading-relaxed font-medium">{googleSheetsError}</p>
                    </div>
                  )}

                  {!isGoogleSheetsConnected ? (
                    <div className="space-y-4">
                      <div className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                        전문상담사 선생님의 개인 혹은 기관 구글 계정을 연동해 보세요. 
                        구글 드라이브에 <strong className="text-indigo-600">"마음포탈 상담 신청 내역"</strong> 이라는 스프레드시트가 자동으로 생성되며, 
                        학생들의 상담 신청이 접수되는 즉시 시트 행에 누적 기록됩니다.
                      </div>
                      
                      <button
                        type="button"
                        onClick={async () => {
                          setIsGoogleLoading(true);
                          setGoogleSheetsError(null);
                          try {
                            const res = await googleSignIn();
                            if (res) {
                              setGoogleUser(res.user);
                              setGoogleToken(res.accessToken);
                              setIsGoogleSheetsConnected(true);
                            }
                          } catch (err: any) {
                            console.error("Failed to login to Google:", err);
                            setGoogleSheetsError("구글 계정 로그인에 실패했습니다. 권한 부여 팝업을 확인해 주세요.");
                          } finally {
                            setIsGoogleLoading(false);
                          }
                        }}
                        disabled={isGoogleLoading}
                        className="bg-white hover:bg-stone-50 text-stone-700 font-bold px-5 py-3 rounded-2xl text-xs shadow-sm border border-stone-200 hover:border-stone-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                      >
                        {isGoogleLoading ? (
                          <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></span>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.14 3.01-1 4.14v3.44h6.24c3.65-3.36 5.89-8.3 5.89-13.43z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-6.24-3.44c-1.78 1.19-4.05 1.9-6.72 1.9-5.17 0-9.55-3.5-11.11-8.22H.21v3.56C3.24 21.2 7.37 24 12 24z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M.89 11.33c-.4-1.19-.62-2.45-.62-3.73s.22-2.54.62-3.73V.31H.21C-.47 1.68-.89 3.23-.89 4.88s.42 3.2 1.1 4.57l2.81-.56c-1.56-4.72 2.81-8.22 2.81-8.22z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0 7.37 0 3.24 2.8 1.2 6.77l3.56 2.81c1.56-4.72 5.94-8.22 11.11-8.22z"
                            />
                          </svg>
                        )}
                        구글 계정 연결하기 (Google Drive & Sheets 연동)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Connection Header info */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-50 border border-stone-200/50 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                          {googleUser?.photoURL ? (
                            <img 
                              src={googleUser.photoURL} 
                              alt="Google Profile" 
                              className="w-10 h-10 rounded-full border border-indigo-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-lg">
                              🧑‍🏫
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-stone-800">{googleUser?.displayName || "구글 사용자"}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{googleUser?.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[11px] font-bold text-emerald-600">구글 드라이브 권한 인증됨</span>
                        </div>
                      </div>

                      {/* Spreadsheet Association section */}
                      {!spreadsheetId ? (
                        <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 space-y-4">
                          <div className="text-xs text-amber-800 leading-relaxed font-medium">
                            ⚠️ 구글 로그인은 완료되었으나 연동할 스프레드시트가 선택되지 않았습니다. 
                            기존에 생성된 스프레드시트가 있는지 확인하거나 새 파일을 만들어 보세요.
                          </div>
                          
                          <div className="flex flex-wrap gap-2.5">
                            <button
                              type="button"
                              onClick={handleConnectSpreadsheet}
                              disabled={isGoogleLoading}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5 active:scale-[0.98]"
                            >
                              {isGoogleLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                              🔍 연동용 구글 스프레드시트 탐색 및 연결하기
                            </button>
                            
                            <button
                              type="button"
                              onClick={handleGoogleSheetsLogout}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1"
                            >
                              로그아웃
                            </button>
                          </div>

                          <div className="border-t border-amber-200/50 pt-4 space-y-3">
                            <label className="text-[10px] font-bold text-gray-500 block">또는 스프레드시트 ID 직접 지정 연동</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="예: 1A2b3C4d5E6f7G8h9I0j-kL_mNoP..."
                                value={manualSpreadsheetId}
                                onChange={(e) => setManualSpreadsheetId(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:border-indigo-400 font-mono text-stone-700"
                              />
                              <button
                                type="button"
                                onClick={handleManualSpreadsheetConnect}
                                disabled={isGoogleLoading}
                                className="bg-stone-800 hover:bg-stone-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors whitespace-nowrap"
                              >
                                {isGoogleLoading ? "연결 중..." : "직접 연결"}
                              </button>
                            </div>
                            <p className="text-[9px] text-gray-400 leading-relaxed font-semibold">
                              * 스프레드시트의 주소 표시줄(URL)에서 <code className="bg-stone-100 px-1 py-0.5 rounded text-indigo-600 font-mono">/d/</code>와 <code className="bg-stone-100 px-1 py-0.5 rounded text-indigo-600 font-mono">/edit</code> 사이에 위치한 영문/숫자 혼합 문자열을 입력하면 즉시 지정 연동이 가능합니다.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">연결된 구글 스프레드시트</span>
                              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                                🟢 마음포탈 상담 신청 내역.xlsx
                              </h4>
                            </div>
                            
                            <a
                              href={getSpreadsheetUrl(spreadsheetId)}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3.5 py-1.5 rounded-xl text-[11px] transition-colors border border-emerald-200 inline-flex items-center gap-1"
                            >
                              구글 시트 바로 열기 ↗
                            </a>
                          </div>

                          <div className="text-[11px] text-gray-400 leading-relaxed font-medium">
                            • 학생이 새로운 예약을 완료하면 구글 시트에 즉시 기록됩니다.<br />
                            • 관리자 탭에서 상태 변경 및 삭제 시 구글 시트의 해당 행도 실시간으로 안전하게 동기화됩니다.
                          </div>

                          <div className="pt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={syncWithGoogleSheets}
                              disabled={isGoogleLoading}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-xs transition-all border border-indigo-100 flex items-center gap-1.5 active:scale-[0.98]"
                            >
                              {isGoogleLoading ? (
                                <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <span>🔄</span>
                              )}
                              시트 데이터 실시간 동기화
                            </button>

                            <button
                              type="button"
                              onClick={uploadAllToGoogleSheets}
                              disabled={isGoogleLoading}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-4 py-2 rounded-xl text-xs transition-all border border-amber-100 flex items-center gap-1.5 active:scale-[0.98]"
                            >
                              📤 로컬 내역 전체 시트 업로드
                            </button>

                            <button
                              type="button"
                              onClick={handleGoogleSheetsLogout}
                              className="text-stone-400 hover:text-stone-600 font-bold text-xs px-4 py-2 rounded-xl transition-colors hover:bg-stone-50"
                            >
                              연동 해제
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 0.80. Google Apps Script Web App Integration Panel */}
                <div className="bg-white rounded-[32px] p-6 md:p-8 border border-stone-200/50 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <h3 className="text-base font-bold font-serif text-indigo-900">
                          Google Apps Script (웹 앱 URL) 직접 실시간 연동
                        </h3>
                        <p className="text-xs text-gray-400">브라우저의 구글 로그인 차단이나 API 에러 없이 100% 신뢰성 있는 실시간 시트 저장을 지원합니다.</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 animate-pulse">
                      추천 연동 방식 ✨
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Settings & Test */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 block">Google Apps Script 배포된 웹 앱 URL (Web App URL)</label>
                        <div className="flex gap-2">
                          <input 
                            type="url"
                            placeholder="https://script.google.com/macros/s/.../exec"
                            value={appsScriptInput}
                            onChange={(e) => setAppsScriptInput(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-indigo-400 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const cleanUrl = appsScriptInput.trim();
                              if (!cleanUrl) {
                                alert("올바른 Apps Script 웹 앱 URL을 입력해 주세요.");
                                return;
                              }
                              localStorage.setItem("mindportal_apps_script_url", cleanUrl);
                              setAppsScriptUrl(cleanUrl);
                              alert("구글 앱스 스크립트 웹 앱 URL이 성공적으로 보존되었습니다!");
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                          >
                            저장
                          </button>
                        </div>
                      </div>

                      {appsScriptUrl && (
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                          <div className="text-xs text-emerald-800 leading-relaxed font-semibold flex items-center gap-1.5">
                            <span>✓</span> 웹 앱 URL이 정상 저장되었습니다. (학생들이 상담 신청서를 제출하면 해당 시트에 자동 보관됩니다)
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                setAppsScriptTestStatus("테스트 전송 중...");
                                const testReq: CounselingRequest = {
                                  id: "test_" + Date.now(),
                                  studentName: "홍길동(테스트)",
                                  department: "컴퓨터공학과",
                                  studentId: "20261234",
                                  contact: "010-1234-5678",
                                  method: "face_to_face",
                                  preferredDate: "2026-07-02",
                                  preferredTime: "14:00",
                                  testName: "테스트 예약 연계",
                                  testResultSummary: "경도 우울증 (Apps Script 실시간 연동 테스트)",
                                  status: "pending",
                                  createdAt: new Date().toISOString().split("T")[0]
                                };
                                const success = await sendToAppsScript(appsScriptUrl, testReq);
                                if (success) {
                                  setAppsScriptTestStatus("테스트 데이터를 전송했습니다! 본인 구글 스프레드시트의 맨 아래 행에 데이터가 정상적으로 즉시 들어왔는지 확인해 주세요.");
                                } else {
                                  setAppsScriptTestStatus("전송 실패: URL을 정확히 입력하셨는지, 배포 설정을 '나(Me)'에서 '모든 사용자(Anyone)'로 허용해 두셨는지 확인해 주세요.");
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors shadow-sm"
                            >
                              ⚙️ 스프레드시트로 테스트 데이터 전송해보기
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                setIsAppsScriptSyncing(true);
                                alert("구글 앱스 스크립트로부터 원격 데이터를 읽어옵니다. 잠시만 기다려 주세요...");
                                try {
                                  const fetched = await fetchFromAppsScript(appsScriptUrl);
                                  if (fetched && fetched.length > 0) {
                                    setCounselingRequests(fetched);
                                    localStorage.setItem("counseling_requests_local", JSON.stringify(fetched));
                                    alert(`스프레드시트로부터 ${fetched.length}건의 예약을 완벽하게 원격으로 연동해왔습니다!`);
                                  } else {
                                    alert("스프레드시트에서 데이터를 가져오지 못했거나 저장된 상담 예약이 없습니다. 스크립트의 doGet(e)이 활성화되어 있고 행이 들어있는지 확인해주세요.");
                                  }
                                } catch (e) {
                                  alert("원격 시트 데이터를 불러오는 도중 에러가 발생했습니다.");
                                } finally {
                                  setIsAppsScriptSyncing(false);
                                }
                              }}
                              disabled={isAppsScriptSyncing}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors border border-stone-200"
                            >
                              🔄 시트 내용 원격 동기화 가져오기
                            </button>

                            {appsScriptUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("연동된 Apps Script URL 설정을 초기화할까요?")) {
                                    localStorage.removeItem("mindportal_apps_script_url");
                                    setAppsScriptUrl(null);
                                    setAppsScriptInput("");
                                    setAppsScriptTestStatus(null);
                                  }
                                }}
                                className="text-gray-400 hover:text-rose-500 font-bold text-[10px]"
                              >
                                연동 해제
                              </button>
                            )}
                          </div>

                          {appsScriptTestStatus && (
                            <p className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl leading-relaxed">
                              {appsScriptTestStatus}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Apps Script Code & Instruction Guide */}
                    <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-900">💡 3분 안에 끝내는 완벽 연동 가이드</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 ${
                            isCopied ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {isCopied ? "✓ 복사 완료!" : "📋 스크립트 코드 복사"}
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-500 space-y-1.5 leading-relaxed">
                        <p>1. 사용하실 <strong>구글 스프레드시트</strong>를 열고 상단 메뉴의 <strong>[확장 프로그램] ➔ [Apps Script]</strong>를 누릅니다.</p>
                        <p>2. 열린 코드 에디터의 기존 코드를 전부 지우고, 우측 상단의 <strong>[스크립트 코드 복사]</strong> 버튼을 클릭하여 붙여넣습니다.</p>
                        <p>3. 상단의 💾 저장 버튼을 누른 후, 우측 상단의 <strong>[배포] ➔ [새 배포]</strong>를 클릭합니다.</p>
                        <p>4. 유형 선택에서 <strong>[웹 앱]</strong>을 지정하고 아래 정보를 아래와 같이 구성합니다:</p>
                        <ul className="list-disc list-inside pl-2 text-[10px] font-mono text-indigo-800 space-y-0.5 font-bold">
                          <li>• 웹 앱을 실행할 사용자: <span className="underline">나(본인 계정)</span></li>
                          <li>• 액세스 권한이 있는 사용자: <span className="underline">모든 사용자(Anyone)</span></li>
                        </ul>
                        <p>5. [배포] 버튼을 눌러 승인 과정을 거치면 발급되는 <strong>"웹 앱 URL"</strong>을 복사해서 왼쪽 칸에 붙여넣고 저장하세요!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Student Counseling Requests Dashboard (Real-time synced) */}
                <div className="bg-white rounded-[32px] p-6 md:p-8 border-2 border-dashed border-amber-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-bold font-serif text-stone-800">
                        실시간 마음진단 연계 상담 신청서 목록 ({counselingRequests.length}건)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[11px] font-bold text-gray-500">
                        실시간 상담 예약 수신 중 🟢
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600 min-w-[700px]">
                      <thead>
                        <tr className="bg-stone-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-stone-100">
                          <th className="p-3">신청 학생</th>
                          <th className="p-3">학과 / 학번</th>
                          <th className="p-3">연락처</th>
                          <th className="p-3">방식 / 희망 일시</th>
                          <th className="p-3">연계 마음진단 결과</th>
                          <th className="p-3">예약 상태</th>
                          <th className="p-3 text-right">작업</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {counselingRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-amber-50/20 transition-colors">
                            <td className="p-3 font-semibold text-gray-800">{req.studentName}</td>
                            <td className="p-3">
                              <p className="font-medium text-gray-700">{req.department}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{req.studentId}</p>
                            </td>
                            <td className="p-3 font-mono text-gray-700">{req.contact}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mb-1 ${
                                req.method === "face_to_face" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                              }`}>
                                {req.method === "face_to_face" ? "대면" : "비대면"}
                              </span>
                              <p className="font-medium text-gray-700">{req.preferredDate} {req.preferredTime}</p>
                            </td>
                            <td className="p-3 max-w-xs">
                              <span className="font-bold text-gray-500">[{req.testName}]</span>
                              <p className="text-gray-500 truncate mt-0.5">{req.testResultSummary}</p>
                            </td>
                            <td className="p-3">
                              <select
                                value={req.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as any;
                                  
                                  // Update local state and cache first for instant feedback
                                  const updated = counselingRequests.map(r => r.id === req.id ? { ...r, status: newStatus } : r);
                                  setCounselingRequests(updated);
                                  localStorage.setItem("counseling_requests_local", JSON.stringify(updated));

                                  try {
                                    await setDoc(doc(db, "counseling_requests", req.id), { status: newStatus }, { merge: true });
                                  } catch (err) {
                                    console.error("Error updating counseling request status in Firestore:", err);
                                  }

                                  // Update Google Sheets if connected
                                  const token = googleToken || getCachedAccessToken();
                                  if (token && spreadsheetId) {
                                    try {
                                      await updateRequestStatusInSheet(token, spreadsheetId, req.id, newStatus);
                                    } catch (err) {
                                      console.error("Error updating Google Sheets:", err);
                                      alert("로컬 변경은 완료되었으나 구글 시트 동기화에 실패했습니다.");
                                    }
                                  }
                                }}
                                className={`text-[11px] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none border ${
                                  req.status === "pending" ? "bg-yellow-50 border-yellow-200 text-yellow-700" :
                                  req.status === "confirmed" ? "bg-green-50 border-green-200 text-green-700" :
                                  "bg-stone-100 border-stone-200 text-stone-500"
                                }`}
                              >
                                <option value="pending">대기 중 🟡</option>
                                <option value="confirmed">예약 확정 🟢</option>
                                <option value="completed">상담 완료 ⚫</option>
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={async () => {
                                  if (confirm("정말 이 상담 신청 내역을 지우시겠습니까?")) {
                                    // Update local state and cache first
                                    const updated = counselingRequests.filter(r => r.id !== req.id);
                                    setCounselingRequests(updated);
                                    localStorage.setItem("counseling_requests_local", JSON.stringify(updated));

                                    try {
                                      await deleteDoc(doc(db, "counseling_requests", req.id));
                                    } catch (err) {
                                      console.error("Error deleting counseling request from Firestore:", err);
                                    }

                                    // Delete from Google Sheets if connected
                                    const token = googleToken || getCachedAccessToken();
                                    if (token && spreadsheetId) {
                                      try {
                                        await deleteRequestFromSheet(token, spreadsheetId, req.id);
                                      } catch (err) {
                                        console.error("Error deleting from Google Sheets:", err);
                                        alert("로컬 삭제는 완료되었으나 구글 시트 동기화에 실패했습니다.");
                                      }
                                    }
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-700 font-bold"
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))}
                        {counselingRequests.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-gray-400 text-xs">
                              아직 온라인 자가진단 연계 상담 신청서가 접수되지 않았습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dashboard Forms Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Post Upload Form */}
                  <div className="bg-white rounded-[32px] p-6 border border-stone-200/50 shadow-sm space-y-4">
                    <h3 className="text-base font-bold font-serif text-purple-600 flex items-center gap-2 pb-3 border-b border-stone-100">
                      📝 새로운 마음 칼럼 기고하기
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">카테고리 선택</label>
                        <select 
                          value={newPostCategory}
                          onChange={(e) => setNewPostCategory(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-gray-700"
                        >
                          <option value="Social">인간관계 👥</option>
                          <option value="Learning">학업/공부 ✍</option>
                          <option value="Emotion">내면/정서 🧠</option>
                          <option value="Growth">성장/갓생 🌱</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">칼럼 제목</label>
                        <input 
                          type="text"
                          placeholder="제목을 작성하세요..."
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">칼럼 내용 본문</label>
                        <textarea 
                          placeholder="따뜻하고 유익한 심리학 아티클 내용을 작성해 주세요..."
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          rows={6}
                          className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs leading-relaxed"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newPostTitle.trim() || !newPostContent.trim()) {
                            alert("제목과 내용을 모두 작성해 주세요!");
                            return;
                          }
                          const newPostObj: Post = {
                            id: "post_" + Date.now(),
                            category: newPostCategory,
                            title: newPostTitle,
                            content: newPostContent,
                            createdAt: new Date().toISOString().split("T")[0],
                            likes: 0
                          };
                          const updated = [newPostObj, ...posts];
                          savePosts(updated);
                          setNewPostTitle("");
                          setNewPostContent("");
                          alert("마음 칼럼이 성공적으로 게시판에 발행되었습니다! 🎉");
                        }}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all text-xs"
                      >
                        칼럼 즉시 업로드 🚀
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Quiz Upload Form */}
                  <div className="bg-white rounded-[32px] p-6 border border-stone-200/50 shadow-sm space-y-4">
                    <h3 className="text-base font-bold font-serif text-blue-600 flex items-center gap-2 pb-3 border-b border-stone-100">
                      ❓ 새로운 O/X 심리 퀴즈 등록
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">O/X 질문 문항</label>
                        <input 
                          type="text"
                          placeholder="예) 슬플 때 우는 것은 면역 활성화에 악영향을 준다?"
                          value={newQuizQuestion}
                          onChange={(e) => setNewQuizQuestion(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">실제 진실 정답</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setNewQuizAnswer(true)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              newQuizAnswer ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-stone-50 text-gray-400"
                            }`}
                          >
                            O (그렇다)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewQuizAnswer(false)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              !newQuizAnswer ? "bg-rose-50 border-rose-300 text-rose-700" : "bg-stone-50 text-gray-400"
                            }`}
                          >
                            X (아니다)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">상세 심리학 해설</label>
                        <textarea 
                          placeholder="정답에 관한 과학적/상담학적 해설을 재미있게 기술해 주세요..."
                          value={newQuizExplanation}
                          onChange={(e) => setNewQuizExplanation(e.target.value)}
                          rows={4}
                          className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs leading-relaxed"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newQuizQuestion.trim() || !newQuizExplanation.trim()) {
                            alert("O/X 질문과 해설을 모두 적어 주세요!");
                            return;
                          }
                          const activeQuizzes = quizzes.length > 0 ? quizzes : PSYCHOLOGY_QUIZ;
                          const newQuizObj: QuizQuestion = {
                            id: activeQuizzes.length + 1,
                            question: newQuizQuestion,
                            answer: newQuizAnswer,
                            explanation: newQuizExplanation
                          };
                          const updated = [...activeQuizzes, newQuizObj];
                          saveQuizzes(updated);
                          setNewQuizQuestion("");
                          setNewQuizExplanation("");
                          alert("오늘의 심리 상식 O/X 퀴즈 리스트에 성공적으로 추가되었습니다! 💡");
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all text-xs"
                      >
                        상식 퀴즈 즉시 업로드 🚀
                      </button>
                    </div>
                  </div>

                </div>

                {/* Third block: Content Table */}
                <div className="bg-white rounded-[32px] p-6 border border-stone-200/50 shadow-sm space-y-6">
                  <h3 className="text-base font-bold font-serif text-stone-800 flex items-center gap-2 pb-3 border-b border-stone-100">
                    📂 현재 업로드 및 서비스 중인 칼럼/퀴즈 리스트 관리
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Posts List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-purple-600 flex items-center gap-1.5">
                        📰 작성된 칼럼 내역 ({posts.length})
                      </h4>
                      <div className="max-h-60 overflow-y-auto border border-stone-100 rounded-xl divide-y divide-stone-50 text-xs">
                        {posts.map((post) => (
                          <div key={post.id} className="p-3 flex items-center justify-between hover:bg-stone-50">
                            <div className="truncate pr-4">
                              <span className="font-bold text-purple-500">[{post.category === "Social" ? "관계" : post.category === "Learning" ? "공부" : "정서"}]</span>
                              <span className="ml-1 text-gray-700">{post.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("정말 이 마음 칼럼을 삭제하시겠습니까?")) {
                                  const updated = posts.filter(p => p.id !== post.id);
                                  savePosts(updated);
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700 font-bold shrink-0 ml-2"
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                        {posts.length === 0 && <p className="text-center py-4 text-gray-400 text-xs">작성된 칼럼이 없습니다.</p>}
                      </div>
                    </div>

                    {/* Quizzes List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                        🧠 오늘의 퀴즈 내역 ({quizzes.length})
                      </h4>
                      <div className="max-h-60 overflow-y-auto border border-stone-100 rounded-xl divide-y divide-stone-50 text-xs">
                        {quizzes.map((q) => (
                          <div key={q.id} className="p-3 flex items-center justify-between hover:bg-stone-50">
                            <div className="truncate pr-4">
                              <span className="font-bold text-blue-500">[Q{q.id}]</span>
                              <span className="ml-1 text-gray-700">{q.question}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("정말 이 상식 퀴즈를 삭제하시겠습니까?")) {
                                  const updated = quizzes.filter(qi => qi.id !== q.id);
                                  saveQuizzes(updated);
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700 font-bold shrink-0 ml-2"
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                        {quizzes.length === 0 && <p className="text-center py-4 text-gray-400 text-xs">등록된 퀴즈가 없습니다.</p>}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        )}



      </main>

      {/* RIGHT SIDE RAIL: Quick Info */}
      <aside className="hidden lg:flex w-16 flex-col items-center py-8 border-l border-orange-100/30 bg-white shrink-0 justify-between">
        <div className="writing-vertical-rl rotate-180 text-[10px] font-extrabold tracking-[0.2em] text-gray-400 uppercase">
          Open Hours: 09:00 - 18:00 • Monday to Friday
        </div>
        <div className="space-y-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF8A65] flex items-center justify-center text-xs font-bold hover:scale-105 cursor-pointer transition-transform shadow-sm">
            상담
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 text-[#81C784] flex items-center justify-center text-xs font-bold hover:scale-105 cursor-pointer transition-transform shadow-sm">
            힐링
          </div>
        </div>
      </aside>
    </div>
  );
}
