export const devices = [
  {
    id: "DEV-001",
    name: "Motion Sensor 01",
    location: "Living Room",
    status: "online",
    rssi: -42,
    uptime: "14d 6h",
    battery: 100,
    motionDetected: false,
    ip: "192.168.1.101",
    lastActive: "2 min ago",
  },
  {
    id: "DEV-002",
    name: "Motion Sensor 02",
    location: "Bedroom",
    status: "online",
    rssi: -58,
    uptime: "8d 2h",
    battery: 92,
    motionDetected: true,
    ip: "192.168.1.102",
    lastActive: "5 min ago",
  },
  {
    id: "DEV-003",
    name: "Motion Sensor 03",
    location: "Kitchen",
    status: "online",
    rssi: -71,
    uptime: "4d 12h",
    battery: 85,
    motionDetected: false,
    ip: "192.168.1.103",
    lastActive: "1 min ago",
  },
  {
    id: "DEV-004",
    name: "Motion Sensor 04",
    location: "Garage",
    status: "offline",
    rssi: -95,
    uptime: "Disconnected",
    battery: 0,
    motionDetected: false,
    ip: "--",
    lastActive: "2 hrs ago",
  },
  {
    id: "DEV-005",
    name: "Motion Sensor 05",
    location: "Main Entrance",
    status: "online",
    rssi: -38,
    uptime: "22d 8h",
    battery: 97,
    motionDetected: true,
    ip: "192.168.1.105",
    lastActive: "Just now",
  },
  {
    id: "DEV-006",
    name: "Motion Sensor 06",
    location: "Backyard",
    status: "online",
    rssi: -79,
    uptime: "2d 14h",
    battery: 78,
    motionDetected: false,
    ip: "192.168.1.106",
    lastActive: "12 min ago",
  },
];

export const rssiTrendData = [
  { time: "00:00", livingRoom: -48, bedroom: -65, kitchen: -73, entrance: -41 },
  { time: "02:00", livingRoom: -46, bedroom: -63, kitchen: -70, entrance: -39 },
  { time: "04:00", livingRoom: -49, bedroom: -67, kitchen: -74, entrance: -42 },
  { time: "06:00", livingRoom: -44, bedroom: -61, kitchen: -68, entrance: -37 },
  { time: "08:00", livingRoom: -43, bedroom: -60, kitchen: -69, entrance: -36 },
  { time: "10:00", livingRoom: -47, bedroom: -64, kitchen: -72, entrance: -40 },
  { time: "12:00", livingRoom: -45, bedroom: -62, kitchen: -71, entrance: -38 },
  { time: "14:00", livingRoom: -46, bedroom: -63, kitchen: -70, entrance: -39 },
  { time: "16:00", livingRoom: -44, bedroom: -61, kitchen: -69, entrance: -37 },
  { time: "18:00", livingRoom: -48, bedroom: -66, kitchen: -73, entrance: -41 },
  { time: "20:00", livingRoom: -47, bedroom: -65, kitchen: -72, entrance: -40 },
  { time: "22:00", livingRoom: -45, bedroom: -62, kitchen: -71, entrance: -38 },
];

export const motionFrequencyData = [
  { hour: "00:00", events: 0 },
  { hour: "02:00", events: 1 },
  { hour: "04:00", events: 0 },
  { hour: "06:00", events: 5 },
  { hour: "08:00", events: 12 },
  { hour: "10:00", events: 8 },
  { hour: "12:00", events: 15 },
  { hour: "14:00", events: 10 },
  { hour: "16:00", events: 18 },
  { hour: "18:00", events: 22 },
  { hour: "20:00", events: 14 },
  { hour: "22:00", events: 6 },
];

export const alertsData = [
  { id: 1, severity: "high" , message: "Motion detected at Main Entrance", device: "DEV-005", location: "Main Entrance", rssi: -38, time: "2 min ago", timestamp: "14:32:15", acknowledged: false },
  { id: 2, severity: "medium" , message: "Motion detected in Bedroom", device: "DEV-002", location: "Bedroom", rssi: -62, time: "5 min ago", timestamp: "14:29:43", acknowledged: false },
  { id: 3, severity: "high" , message: "Unusual motion pattern detected", device: "DEV-001", location: "Living Room", rssi: -45, time: "18 min ago", timestamp: "14:16:22", acknowledged: true },
  { id: 4, severity: "low" , message: "Device signal strength low", device: "DEV-004", location: "Garage", rssi: -85, time: "2 hrs ago", timestamp: "12:30:00", acknowledged: true },
  { id: 5, severity: "medium" , message: "Motion detected in Kitchen", device: "DEV-003", location: "Kitchen", rssi: -71, time: "3 hrs ago", timestamp: "11:15:33", acknowledged: true },
  { id: 6, severity: "low" , message: "Signal fluctuation detected", device: "DEV-006", location: "Backyard", rssi: -79, time: "4 hrs ago", timestamp: "10:45:12", acknowledged: true },
];

export const dailyAlertStats = [
  { day: "Mon", high: 3, medium: 7, low: 2 },
  { day: "Tue", high: 5, medium: 4, low: 3 },
  { day: "Wed", high: 2, medium: 8, low: 5 },
  { day: "Thu", high: 7, medium: 6, low: 1 },
  { day: "Fri", high: 4, medium: 9, low: 4 },
  { day: "Sat", high: 1, medium: 3, low: 6 },
  { day: "Sun", high: 2, medium: 5, low: 3 },
];

export const weeklyActivityData = [
  { day: "Mon", motions: 45, alerts: 5 },
  { day: "Tue", motions: 52, alerts: 8 },
  { day: "Wed", motions: 38, alerts: 4 },
  { day: "Thu", motions: 61, alerts: 10 },
  { day: "Fri", motions: 55, alerts: 7 },
  { day: "Sat", motions: 29, alerts: 3 },
  { day: "Sun", motions: 34, alerts: 4 },
];

export const roomMotionData = [
  { room: "Entrance", count: 67 },
  { room: "Living Rm", count: 45 },
  { room: "Bedroom", count: 32 },
  { room: "Kitchen", count: 28 },
  { room: "Backyard", count: 23 },
  { room: "Garage", count: 12 },
];

export const signalHistoryData = [
  { time: "14:00", rssi: -45 },
  { time: "14:05", rssi: -47 },
  { time: "14:10", rssi: -43 },
  { time: "14:15", rssi: -49 },
  { time: "14:20", rssi: -44 },
  { time: "14:25", rssi: -41 },
  { time: "14:30", rssi: -46 },
  { time: "14:35", rssi: -48 },
  { time: "14:40", rssi: -45 },
  { time: "14:45", rssi: -42 },
];

export const liveEvents = [
  { id: 1, device: "Main Entrance", rssi: -38, status: "motion" , time: "14:32:15", room: "Entrance" },
  { id: 2, device: "Bedroom Sensor", rssi: -62, status: "motion" , time: "14:29:43", room: "Bedroom" },
  { id: 3, device: "Living Room", rssi: -45, status: "clear" , time: "14:28:10", room: "Living Room" },
  { id: 4, device: "Kitchen Sensor", rssi: -71, status: "clear" , time: "14:25:55", room: "Kitchen" },
  { id: 5, device: "Backyard", rssi: -79, status: "clear" , time: "14:22:30", room: "Backyard" },
];

export const heatmapData = [
  { day: "Mon", h0: 0, h2: 0, h4: 1, h6: 5, h8: 12, h10: 8, h12: 15, h14: 10, h16: 18, h18: 22, h20: 14, h22: 6 },
  { day: "Tue", h0: 1, h2: 0, h4: 0, h6: 3, h8: 10, h10: 9, h12: 13, h14: 12, h16: 17, h18: 20, h20: 15, h22: 7 },
  { day: "Wed", h0: 0, h2: 0, h4: 1, h6: 2, h8: 8, h10: 6, h12: 11, h14: 9, h16: 13, h18: 16, h20: 10, h22: 4 },
  { day: "Thu", h0: 2, h2: 1, h4: 0, h6: 4, h8: 14, h10: 11, h12: 17, h14: 15, h16: 20, h18: 24, h20: 18, h22: 9 },
  { day: "Fri", h0: 1, h2: 0, h4: 1, h6: 3, h8: 11, h10: 8, h12: 14, h14: 13, h16: 19, h18: 21, h20: 16, h22: 8 },
  { day: "Sat", h0: 0, h2: 1, h4: 2, h6: 1, h8: 5, h10: 4, h12: 8, h14: 7, h16: 10, h18: 12, h20: 9, h22: 5 },
  { day: "Sun", h0: 0, h2: 0, h4: 1, h6: 2, h8: 6, h10: 5, h12: 9, h14: 8, h16: 11, h18: 14, h20: 10, h22: 6 },
];


export const notifications = [
  {
    id: 1,
    type: "motion",
    title: "Motion Detected",
    message: "Motion detected at Main Entrance. Activity observed near front door.",
    read: false,
    time: "Just now",
  },

  {
    id: 2,
    type: "motion",
    title: "Bedroom Activity",
    message: "Movement detected inside Bedroom sensor zone.",
    read: false,
    time: "2 min ago",
  },

  {
    id: 3,
    type: "alert",
    title: "High Activity Alert",
    message: "Multiple motion events detected within the last 5 minutes.",
    read: false,
    time: "5 min ago",
  },

  {
    id: 4,
    type: "wifi",
    title: "Signal Strength Changed",
    message: "Device DEV-005 RSSI dropped to -78 dBm.",
    read: true,
    time: "10 min ago",
  },

  {
    id: 5,
    type: "success",
    title: "System Check Complete",
    message: "All sensors responded successfully during health check.",
    read: true,
    time: "18 min ago",
  },

  {
    id: 6,
    type: "security",
    title: "Security Mode Enabled",
    message: "Away Mode has been activated for the property.",
    read: false,
    time: "25 min ago",
  },

  {
    id: 7,
    type: "wifi",
    title: "Device Reconnected",
    message: "Kitchen Sensor (DEV-003) successfully reconnected to WiFi.",
    read: true,
    time: "40 min ago",
  },

  {
    id: 8,
    type: "motion",
    title: "Garage Motion",
    message: "Motion detected near Garage entrance.",
    read: true,
    time: "1 hour ago",
  },

  {
    id: 9,
    type: "alert",
    title: "Sensor Offline",
    message: "Garage sensor went offline unexpectedly.",
    read: false,
    time: "2 hours ago",
  },

  {
    id: 10,
    type: "success",
    title: "Sensor Online",
    message: "Garage sensor is back online and reporting data normally.",
    read: true,
    time: "3 hours ago",
  },

  {
    id: 11,
    type: "security",
    title: "Night Mode Activated",
    message: "Automatic night monitoring mode enabled.",
    read: true,
    time: "Yesterday",
  },

  {
    id: 12,
    type: "wifi",
    title: "Strong Signal",
    message: "Main Entrance sensor RSSI improved to -42 dBm.",
    read: true,
    time: "Yesterday",
  },
];

export const historyData = [
  {
    id: 1,
    room: "Main Entrance",
    deviceId: "DEV-005",
    timestamp: "2026-06-15 14:32:15",
    duration: "12 sec",
    status: "detected",
  },
  {
    id: 2,
    room: "Bedroom",
    deviceId: "DEV-002",
    timestamp: "2026-06-15 14:29:43",
    duration: "8 sec",
    status: "detected",
  },
  {
    id: 3,
    room: "Kitchen",
    deviceId: "DEV-003",
    timestamp: "2026-06-15 14:25:55",
    duration: "4 sec",
    status: "clear",
  },
  {
    id: 4,
    room: "Living Room",
    deviceId: "DEV-001",
    timestamp: "2026-06-15 14:21:10",
    duration: "15 sec",
    status: "detected",
  },
  {
    id: 5,
    room: "Garage",
    deviceId: "DEV-004",
    timestamp: "2026-06-15 13:55:32",
    duration: "7 sec",
    status: "clear",
  },
  {
    id: 6,
    room: "Backyard",
    deviceId: "DEV-006",
    timestamp: "2026-06-15 13:22:18",
    duration: "10 sec",
    status: "detected",
  },
];
