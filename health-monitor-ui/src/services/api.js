import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://health-monitoring-app-3.onrender.com";
const TOKEN_KEY = "token";
const USER_KEY = "health-monitor-user";
const RECORDS_KEY = "health-monitor-records";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const defaultRecords = [];

const getStoredJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const setStoredJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeRecord = (record) => ({
  id: record.id || createId(),
  heartRate: record.heartRate ?? record.heart_rate ?? "",
  temperature: record.temperature ?? "",
  spo2: record.spo2 ?? record.spO2 ?? "",
  bp: record.bp ?? record.bloodPressure ?? "",
  recordedAt: record.recordedAt ?? record.createdAt ?? new Date().toISOString()
});

export const apiBaseUrl = API_BASE_URL;

export const apiErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.code === "ECONNABORTED") {
    return "The backend is taking too long to respond. Please wait one minute and try again.";
  }

  if (error?.message === "Network Error") {
    return "Cannot reach the backend server. Please check that the backend is deployed and awake.";
  }

  return error?.response?.data?.message || error?.message || fallback;
};

export const imageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/uploads/${path}`;
};

export const authApi = {
  async login(credentials) {
    const response = await client.post("/login", credentials);
    return response.data;
  },

  async register(user) {
    const response = await client.post("/register", user);
    return response.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export const profileApi = {
  async getProfile() {
    const response = await client.get("/user/profile");
    setStoredJson(USER_KEY, response.data);
    return response.data;
  },

  async updateProfile(profile) {
    const response = await client.put("/user/profile", profile);
    setStoredJson(USER_KEY, response.data);
    return response.data;
  },

  async uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post("/user/profile/upload", formData);
    setStoredJson(USER_KEY, response.data);
    return response.data;
  },

  async changePassword(payload) {
    const response = await client.put("/user/password", payload, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  }
};

export const healthApi = {
  async getRecords() {
    try {
      const response = await client.get("/health/data");
      return Array.isArray(response.data) ? response.data.map(normalizeRecord) : [];
    } catch (error) {
      return getStoredJson(RECORDS_KEY, defaultRecords).map(normalizeRecord);
    }
  },

  async addRecord(record) {
    const payload = normalizeRecord(record);

    try {
      const response = await client.post("/health/data", payload);
      return normalizeRecord(response.data);
    } catch (error) {
      const records = getStoredJson(RECORDS_KEY, defaultRecords).map(normalizeRecord);
      const nextRecords = [payload, ...records];
      setStoredJson(RECORDS_KEY, nextRecords);
      return payload;
    }
  }
};

export const alertsApi = {
  async getAlerts() {
    try {
      const response = await client.get("/alerts");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return [];
    }
  },

  async addAlert(alert) {
    const response = await client.post("/alerts", alert);
    return response.data;
  }
};
