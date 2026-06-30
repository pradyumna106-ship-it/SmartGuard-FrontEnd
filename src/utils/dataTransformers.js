
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_SLOTS = [
  "00:00", "02:00", "04:00", "06:00", "08:00", "10:00",
  "12:00", "14:00", "16:00", "18:00", "20:00", "22:00",
];

const LOCATION_KEYS = {
  "Living Room": "livingRoom",
  Bedroom: "bedroom",
  Kitchen: "kitchen",
  "Main Entrance": "entrance",
  Entrance: "entrance",
  Garage: "garage",
  Backyard: "backyard",
};

const ROOM_LAYOUT = {
  "Living Room": { id: "living", x: 0, y: 0, w: 42, h: 45 },
  Bedroom: { id: "bedroom", x: 43, y: 0, w: 35, h: 45 },
  Kitchen: { id: "kitchen", x: 0, y: 46, w: 42, h: 30 },
  Garage: { id: "garage", x: 79, y: 0, w: 21, h: 45 },
  "Main Entrance": { id: "entrance", x: 43, y: 46, w: 35, h: 30 },
  Backyard: { id: "backyard", x: 0, y: 77, w: 78, h: 23 },
};

export const mapAlerts = (alerts = []) => {
  if (!Array.isArray(alerts)) {
    return [];
  }

  return alerts.map((alert, index) => ({
    id: index + 1, // backend doesn't provide id
    severity: alert.severity?.toLowerCase(),
    message: alert.message,
    device: alert.deviceId,
    location: alert.location,
    rssi: alert.rssi,
    timestamp: alert.timestamp,
    acknowledged: alert.acknowledged,
    accountId: alert.accountId,
  }));
};

export function buildLiveEvents(devices) {
    console.log("Devices:", devices);
    console.log("Is Array:", Array.isArray(devices));
  return devices.map((dev, idx) => ({
    id: idx + 1,
    device: dev.id,
    rssi: dev.rssi,
    status: dev.motionDetected ? "motion" : "clear",
    time: dev.lastActive ?? "—",
    room: dev.location,
  }));
}

export function buildDailyAlertStats(alerts) {
  const stats = DAYS.map((day) => ({ day, high: 0, medium: 0, low: 0 }));

  alerts.forEach((alert) => {
    const date = parseTimestamp(alert.timestamp);
    if (!date) return;
    const day = DAYS[date.getDay()];
    const entry = stats.find((s) => s.day === day);
    if (!entry) return;
    if (alert.severity === "high") entry.high += 1;
    else if (alert.severity === "medium") entry.medium += 1;
    else entry.low += 1;
  });

  return stats;
}

export function buildMotionFrequency(alerts) {
  if (!Array.isArray(alerts)) {
    console.error("Expected alerts array:", alerts);
    return [];
  }

  const counts = Object.fromEntries(HOUR_SLOTS.map((h) => [h, 0]));

  alerts.forEach((alert) => {
    const date = parseTimestamp(alert.timestamp);
    if (!date) return;
    const hour = date.getHours();
    const slot = HOUR_SLOTS.reduce((closest, current) => {
      const currentHour = parseInt(current.split(":")[0], 10);
      const closestHour = parseInt(closest.split(":")[0], 10);
      return Math.abs(hour - currentHour) < Math.abs(hour - closestHour)
        ? current
        : closest;
    });
    counts[slot] += 1;
  });

  return HOUR_SLOTS.map((hour) => ({ hour, events: counts[hour] }));
}

export function buildRssiTrend(alerts) {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return [];
  }

  const sorted = [...alerts]
    .filter(
      (a) =>
        a.timestamp &&
        a.location &&
        typeof a.rssi === "number"
    )
    .sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

  const grouped = {};

  sorted.forEach((alert) => {
    const time = new Date(alert.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!grouped[time]) {
      grouped[time] = { time };
    }

    grouped[time][alert.location] = alert.rssi;
  });

  return Object.values(grouped);
}

export function buildWeeklyActivity(alerts) {
  const stats = DAYS.map((day) => ({ day, motions: 0, alerts: 0 }));

  alerts.forEach((alert) => {
    const date = parseTimestamp(alert.timestamp);
    if (!date) return;
    const day = DAYS[date.getDay()];
    const entry = stats.find((s) => s.day === day);
    if (!entry) return;
    entry.alerts += 1;
    if (alert.message?.toLowerCase().includes("motion")) {
      entry.motions += 1;
    }
  });

  return stats;
}

export function buildRoomMotionData(alerts) {
  const counts = {};

  alerts.forEach((alert) => {
    if (!alert.location) return;
    counts[alert.location] = (counts[alert.location] ?? 0) + 1;
  });

  return Object.entries(counts).map(([room, count]) => ({
    room: room.length > 10 ? `${room.slice(0, 8)}…` : room,
    count,
  }));
}

export function buildHeatmapData(alerts) {
  const hourKeys = ["h0", "h2", "h4", "h6", "h8", "h10", "h12", "h14", "h16", "h18", "h20", "h22"];

  return DAYS.map((day) => {
    const row = { day };
    hourKeys.forEach((key) => {
      row[key] = 0;
    });

    alerts.forEach((alert) => {
      const date = parseTimestamp(alert.timestamp);
      if (!date || DAYS[date.getDay()] !== day) return;
      const hour = date.getHours();
      const slotIndex = Math.min(Math.floor(hour / 2), hourKeys.length - 1);
      row[hourKeys[slotIndex]] += 1;
    });

    return row;
  });
}

export function buildMotionHistory(alerts = []) {
  return alerts.map((alert) => ({
    id: alert.id,
    room: alert.location ?? "Unknown Room",
    deviceId: alert.deviceId ?? "—",
    timestamp: alert.timestamp ?? null,
    duration: alert.duration ?? "—",
    status: alert.motionDetected ? "detected" : "clear",
  }));
}

export function buildNotificationsFromAlerts(alerts) {
  if (!Array.isArray(alerts)) {
    console.error("Expected alerts array:", alerts);
    return [];
  }

  return alerts.map((alert) => ({
    id: alert.id,
    type: alert.message?.toLowerCase().includes("motion")
      ? "motion"
      : alert.severity === "high"
        ? "alert"
        : alert.message?.toLowerCase().includes("signal")
          ? "wifi"
          : "alert",
    title:
      alert.severity === "high"
        ? "High Activity Alert"
        : alert.message?.toLowerCase().includes("motion")
          ? "Motion Detected"
          : "System Alert",
    message: alert.message,
    read: alert.acknowledged,
    time: alert.timestamp,
  }));
}

export function buildFloorMapRooms(devices = []) {
  if (!Array.isArray(devices) || devices.length === 0) return [];

  // fallback positions if backend does not send x/y/w/h
  const fallbackLayout = [
    { x: 4, y: 6, w: 28, h: 24 },
    { x: 36, y: 6, w: 28, h: 24 },
    { x: 68, y: 6, w: 28, h: 24 },
    { x: 4, y: 36, w: 28, h: 24 },
    { x: 36, y: 36, w: 28, h: 24 },
    { x: 68, y: 36, w: 28, h: 24 },
    { x: 20, y: 66, w: 28, h: 20 },
    { x: 52, y: 66, w: 28, h: 20 },
  ];

  return devices.map((device, index) => {
    const layout = fallbackLayout[index % fallbackLayout.length];

    const rssi =
      typeof device?.rssi === "number" ? device.rssi : -100;

    const status = String(
      device?.status ?? "OFFLINE"
    ).toUpperCase();

    return {
      id: device?.id ?? device?.deviceId ?? `room-${index + 1}`,

      // IMPORTANT:
      // Use backend room/location/name instead of hardcoded room names
      name:
        device?.location ||
        device?.roomName ||
        device?.room ||
        device?.name ||
        device?.deviceId ||
        device?.id ||
        `Device ${index + 1}`,

      x: device?.x ?? layout.x,
      y: device?.y ?? layout.y,
      w: device?.w ?? layout.w,
      h: device?.h ?? layout.h,

      deviceId: device?.deviceId ?? device?.id ?? "N/A",
      deviceStatus: status,
      motionDetected: Boolean(device?.motionDetected),
      rssi,
      lastMotion:
        device?.lastMotion ||
        device?.lastActive ||
        "No motion detected",
    };
  });
}

export function avgRssi(devices) {
  if (!Array.isArray(devices)) return 0;
  console.log("In data Transormers:",devices);


  if (devices.length === 0) return 0;

  const totalRssi = devices.reduce((sum, device) => sum + device.rssi, 0);

  return Math.round(totalRssi / devices.length);
}

function parseTimestamp(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (!Number.isNaN(date.getTime())) return date;

  const today = new Date();
  const [timePart] = timestamp.split(" ");
  const parsed = new Date(`${today.toDateString()} ${timePart}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
