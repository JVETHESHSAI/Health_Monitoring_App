import { useCallback, useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import { alertsApi } from "../services/api";
import "./Notifications.css";

const Notifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const seenAlertIds = useRef(new Set());
  const firstLoadComplete = useRef(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertsApi.getAlerts();
      showBrowserNotifications(data);
      setAlerts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      alert("Browser notifications are not supported on this device.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const showBrowserNotifications = (nextAlerts) => {
    if (!Array.isArray(nextAlerts)) return;

    const isSupported = typeof Notification !== "undefined";
    const canNotify = isSupported && Notification.permission === "granted";

    nextAlerts.forEach((alert) => {
      if (!alert.id || seenAlertIds.current.has(alert.id)) {
        return;
      }

      seenAlertIds.current.add(alert.id);

      if (firstLoadComplete.current && canNotify) {
        new Notification(alert.message || "Emergency alert", {
          body: `Severity: ${alert.severity || "HIGH"} | Command: ${alert.command || "-"}`,
          tag: alert.id
        });
      }
    });

    firstLoadComplete.current = true;
  };

  useEffect(() => {
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 5000);
    return () => clearInterval(timer);
  }, [fetchAlerts]);

  return (
    <Layout>
      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <h2>Emergency Alerts</h2>
            <p>Live alert feed from health sensors and emergency gestures.</p>
          </div>

          <div className="notification-actions">
            <button onClick={fetchAlerts}>Refresh</button>
            <button
              className="notify-btn"
              onClick={requestNotificationPermission}
              disabled={notificationPermission === "granted"}
            >
              {notificationPermission === "granted" ? "Notifications On" : "Enable Notifications"}
            </button>
          </div>
        </div>

        {loading && <p className="empty-state">Loading alerts...</p>}

        {!loading && alerts.length === 0 && (
          <p className="empty-state">No emergency alerts received yet.</p>
        )}

        <div className="alerts-list">
          {alerts.map((alert) => (
            <div className="alert-item" key={alert.id}>
              <div className="alert-main">
                <span className={`severity ${alert.severity || "HIGH"}`}>
                  {alert.severity || "HIGH"}
                </span>
                <h3>{alert.message || "Emergency alert"}</h3>
                <p>{new Date(alert.createdAt).toLocaleString()}</p>
              </div>

              <div className="alert-values">
                <span>Temp: {formatValue(alert.temperature, "C")}</span>
                <span>Pulse: {alert.pulseValue || "-"}</span>
                <span>Command: {alert.command || "-"}</span>
                <span>Email: {alert.emailStatus || "Not checked"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

const formatValue = (value, unit) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return `${value} ${unit}`;
};

export default Notifications;
