import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const TOKEN_KEY = "token";
const USER_KEY = "health-monitor-user";
const RECORDS_KEY = "health-monitor-records";

const client = axios.create({
  baseURL: API_BASE_URL
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const defaultProfile = {
  name: "Demo User",
  email: "demo@health.local",
  age: "",
  gender: "",
  height: "",
  weight: "",
  profilePic: ""
};

const defaultRecords = [
  {
    id: 1,
    heartRate: 78,
    temperature: 36.8,
    spo2: 98,
    bp: "120/80",
    recordedAt: new Date().toISOString()
  }
];

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

const isBackendUnsupported = (error) => {
  const status = error?.response?.status;
  return !error.response || status === 401 || status === 403 || status === 404;
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

export const imageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/uploads/${path}`;
};

export const authApi = {
  async login(credentials) {
    try {
      const response = await client.post("/login", credentials);
      return response.data;
    } catch (error) {
      if (!isBackendUnsupported(error)) throw error;

      const user = getStoredJson(USER_KEY, null);
      if (user && user.email !== credentials.email) {
        throw error;
      }

      return {
        token: "local-demo-token",
        user: user || {
          ...defaultProfile,
          email: credentials.email || defaultProfile.email
        }
      };
    }
  },

  async register(user) {
    try {
      const response = await client.post("/register", user);
      return response.data;
    } catch (error) {
      if (!isBackendUnsupported(error)) throw error;

      setStoredJson(USER_KEY, {
        ...defaultProfile,
        ...user
      });

      return { message: "Registration saved locally until backend APIs are added." };
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const profileApi = {
  async getProfile() {
    try {
      const response = await client.get("/user/profile");
      return response.data;
    } catch (error) {
      if (!isBackendUnsupported(error)) throw error;
      return getStoredJson(USER_KEY, defaultProfile);
    }
  },

  async updateProfile(profile) {
    try {
      const response = await client.put("/user/profile", profile);
      setStoredJson(USER_KEY, response.data);
      return response.data;
    } catch (error) {
      if (!isBackendUnsupported(error)) throw error;

      const current = getStoredJson(USER_KEY, defaultProfile);
      const updated = { ...current, ...profile };
      setStoredJson(USER_KEY, updated);
      return updated;
    }
  },

  async uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post("/user/profile/upload", formData);
    setStoredJson(USER_KEY, response.data);
    return response.data;
  },

  async changePassword(payload) {
    try {
      const response = await client.put("/user/password", payload, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error) {
      if (!isBackendUnsupported(error)) throw error;
      return { message: "Password change requires backend support." };
    }
  }
};

export const healthApi = {
  async getRecords() {
    try {
      const response = await client.get("/health/data");
      return Array.isArray(response.data) ? response.data.map(normalizeRecord) : [];
    } catch (error) {
      if (!isBackendUnsupported(error)) throw error;
      return getStoredJson(RECORDS_KEY, defaultRecords).map(normalizeRecord);
    }
  },

  async addRecord(record) {
    const payload = normalizeRecord(record);

    try {
      const response = await client.post("/health/data", payload);
      return normalizeRecord(response.data);
    } catch (error) {
      if (!isBackendUnsupported(error)) throw error;

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
      if (!isBackendUnsupported(error)) throw error;
      return [];
    }
  },

  async addAlert(alert) {
    const response = await client.post("/alerts", alert);
    return response.data;
  }
};
