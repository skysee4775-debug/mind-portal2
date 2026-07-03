import { GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { CounselingRequest } from "../types";

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth listener
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get access token from Google Auth");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Helper to parse and log Google API errors in detail
const handleGoogleApiError = async (res: Response, context: string): Promise<never> => {
  let errorDetail = "";
  let errorPayload: any = null;
  try {
    errorPayload = await res.json();
    errorDetail = JSON.stringify(errorPayload, null, 2);
  } catch (e) {
    errorDetail = res.statusText || String(res.status);
  }

  console.error(`🔴 [GOOGLE API ERROR DETECTED] Context: ${context}`);
  console.error(`- HTTP Status: ${res.status} ${res.statusText}`);
  
  if (errorPayload && errorPayload.error) {
    console.error(`- Error Code: ${errorPayload.error.code}`);
    console.error(`- Error Status: ${errorPayload.error.status}`);
    console.error(`- Error Message: ${errorPayload.error.message}`);
    if (errorPayload.error.errors) {
      console.error(`- Detailed Errors:`, JSON.stringify(errorPayload.error.errors, null, 2));
    }
  } else {
    console.error(`- Raw Payload: ${errorDetail}`);
  }

  const cleanMessage = errorPayload?.error?.message || errorDetail;
  throw new Error(`Google API Error [${res.status}]: ${cleanMessage}`);
};

// Search for existing spreadsheet in user's Drive
export const searchSpreadsheet = async (accessToken: string): Promise<string | null> => {
  try {
    const q = encodeURIComponent("name='마음포탈 상담 신청 내역' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      await handleGoogleApiError(res, "searchSpreadsheet");
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error("Error searching spreadsheet in Drive:", error);
    throw error;
  }
};

// Create a new Spreadsheet with title "마음포탈 상담 신청 내역"
export const createSpreadsheet = async (accessToken: string): Promise<string> => {
  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        title: "마음포탈 상담 신청 내역"
      }
    })
  });
  if (!res.ok) {
    await handleGoogleApiError(res, "createSpreadsheet");
  }
  const data = await res.json();
  return data.spreadsheetId;
};

// Setup Column Headers in Sheet1
export const setupSheetHeaders = async (accessToken: string, spreadsheetId: string): Promise<void> => {
  const headers = [
    ["신청 ID", "학생 이름", "학과", "학번", "연락처", "상담 구분", "희망 날짜", "희망 시간", "진단 검사명", "진단 결과 요약", "예약 상태", "신청 일자"]
  ];
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:L1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      values: headers
    })
  });
  if (!res.ok) {
    await handleGoogleApiError(res, "setupSheetHeaders");
  }
};

// Append a request to Google Sheets
export const appendRequestToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  req: CounselingRequest
): Promise<void> => {
  const row = [
    req.id,
    req.studentName,
    req.department,
    req.studentId,
    req.contact,
    req.method === "face_to_face" ? "대면" : "비대면",
    req.preferredDate,
    req.preferredTime,
    req.testName,
    req.testResultSummary,
    req.status === "pending" ? "대기 중" : req.status === "confirmed" ? "승인됨" : "취소됨",
    req.createdAt
  ];

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:L:append?valueInputOption=USER_ENTERED`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      values: [row]
    })
  });
  if (!res.ok) {
    await handleGoogleApiError(res, "appendRequestToSheet");
  }
};

// Load counseling requests from Google Sheet
export const loadRequestsFromSheet = async (
  accessToken: string,
  spreadsheetId: string
): Promise<CounselingRequest[]> => {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:L`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    await handleGoogleApiError(res, "loadRequestsFromSheet");
  }
  const data = await res.json();
  const rows = data.values || [];

  return rows.map((row: any) => {
    let method: "face_to_face" | "online" = "face_to_face";
    if (row[5] === "비대면" || row[5] === "online") {
      method = "online";
    }

    let status: "pending" | "confirmed" | "cancelled" = "pending";
    if (row[10] === "승인됨" || row[10] === "confirmed") {
      status = "confirmed";
    } else if (row[10] === "취소됨" || row[10] === "cancelled") {
      status = "cancelled";
    }

    return {
      id: row[0] || `req_${Math.random().toString(36).substr(2, 9)}`,
      studentName: row[1] || "",
      department: row[2] || "",
      studentId: row[3] || "",
      contact: row[4] || "",
      method,
      preferredDate: row[6] || "",
      preferredTime: row[7] || "",
      testName: row[8] || "",
      testResultSummary: row[9] || "",
      status,
      createdAt: row[11] || ""
    };
  });
};

// Update request status in Google Sheet
export const updateRequestStatusInSheet = async (
  accessToken: string,
  spreadsheetId: string,
  reqId: string,
  newStatus: "pending" | "confirmed" | "cancelled"
): Promise<void> => {
  // First, load all rows to find the matching row index
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:A`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    await handleGoogleApiError(res, "updateRequestStatusInSheet_readIds");
  }
  const data = await res.json();
  const idRows = data.values || [];
  
  const rowIndex = idRows.findIndex((row: any) => row[0] === reqId);
  if (rowIndex === -1) {
    throw new Error(`Request with ID ${reqId} not found in Google Sheet`);
  }

  // Row number is rowIndex + 2 (since index 0 corresponds to Row 2)
  const cellRange = `Sheet1!K${rowIndex + 2}`;
  const statusString = newStatus === "pending" ? "대기 중" : newStatus === "confirmed" ? "승인됨" : "취소됨";

  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${cellRange}?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      values: [[statusString]]
    })
  });
  if (!updateRes.ok) {
    await handleGoogleApiError(updateRes, "updateRequestStatusInSheet_updateCell");
  }
};

// Delete request from Google Sheet (by rewriting values)
export const deleteRequestFromSheet = async (
  accessToken: string,
  spreadsheetId: string,
  reqId: string
): Promise<void> => {
  // 1. Fetch all current requests
  const currentRequests = await loadRequestsFromSheet(accessToken, spreadsheetId);
  const remainingRequests = currentRequests.filter((r) => r.id !== reqId);

  // 2. Clear values from row 2 onwards
  const clearRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:L:clear`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!clearRes.ok) {
    await handleGoogleApiError(clearRes, "deleteRequestFromSheet_clear");
  }

  // 3. Put remaining rows back
  if (remainingRequests.length > 0) {
    const values = remainingRequests.map((req) => [
      req.id,
      req.studentName,
      req.department,
      req.studentId,
      req.contact,
      req.method === "face_to_face" ? "대면" : "비대면",
      req.preferredDate,
      req.preferredTime,
      req.testName,
      req.testResultSummary,
      req.status === "pending" ? "대기 중" : req.status === "confirmed" ? "승인됨" : "취소됨",
      req.createdAt
    ]);

    const putRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values
      })
    });
    if (!putRes.ok) {
      await handleGoogleApiError(putRes, "deleteRequestFromSheet_rewrite");
    }
  }
};

// Get the sheet link for opening it in a new tab
export const getSpreadsheetUrl = (spreadsheetId: string): string => {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
};

// Send request data directly to Google Apps Script Web App
export const sendToAppsScript = async (
  webAppUrl: string,
  req: CounselingRequest
): Promise<boolean> => {
  try {
    const cleanUrl = webAppUrl.trim();
    if (!cleanUrl) return false;

    const response = await fetch(cleanUrl, {
      method: "POST",
      mode: "no-cors", // Use no-cors to prevent CORS issues on direct Apps Script requests from browser
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req)
    });
    // With 'no-cors', we cannot read response details, but the browser will execute the request successfully.
    // So we treat it as successful if it does not throw an exception.
    return true;
  } catch (error) {
    console.error("Error sending to Apps Script Web App:", error);
    return false;
  }
};

// Fetch data from Google Apps Script Web App (if doGet is supported)
export const fetchFromAppsScript = async (webAppUrl: string): Promise<CounselingRequest[]> => {
  try {
    const cleanUrl = webAppUrl.trim();
    if (!cleanUrl) return [];

    const response = await fetch(cleanUrl);
    if (!response.ok) {
      throw new Error(`Apps Script responded with ${response.status}`);
    }
    const json = await response.json();
    if (json.result === "success" && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching from Apps Script Web App:", error);
    return [];
  }
};

