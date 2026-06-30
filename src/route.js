import { createBrowserRouter } from "react-router-dom";
import {DashboardPage} from "./pages/DashboardPage";
import {FloorMapPage} from "./pages/FloorMapPage";
import {AnalyticsPage} from "./pages/AnalyticsPage";
import {AlertCenterPage} from "./pages/AlertCenterPage";
import {LiveMonitoringPage} from "./pages/LiveMonitoringPage";
import {MotionHistoryPage} from "./pages/MotionHistoryPage";
import { DevicesPage } from "./pages/DevicesPage";
import { DeviceManagePage } from "./pages/DeviceManagePage";
import { WifiConfigManagePage } from "./pages/WifiConfigManagePage";
import { SensorMonitorPage } from "./pages/SensorMonitorPage";
import { SettingsPage } from "./pages/SettingsPage";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./layouts/Layout";
import AuthLayout from "./layouts/AuthLayout";
import { ObservationPage } from "./pages/ObservationPage";
const route = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {
                path: 'dashboard',
                Component: DashboardPage,
                index: true
            },
            {
                path: 'floor-map',
                Component: FloorMapPage
            },
            {
                path: 'analytics',
                Component: AnalyticsPage
            },
            {
                path: 'alert-center',
                Component: AlertCenterPage
            },
            {
                path: 'live-events',
                Component: LiveMonitoringPage
            },
            {
                path: 'history',
                Component: MotionHistoryPage
            },
            {
                path: 'devices',
                Component: DevicesPage
            },
            {
                path: 'device-manage',
                Component: DeviceManagePage
            },
            {
                path: 'wifi-config',
                Component: WifiConfigManagePage
            },
            {
                path: 'sensor-monitor',
                Component: SensorMonitorPage
            },
            {
                path: "settings",
                Component: SettingsPage
            },
            {
                path: "profile",
                Component: Profile
            },
            {
                path: 'observation',
                Component: ObservationPage
            },

        ],
    },
    {
        path: "/auth",
        Component: AuthLayout,
        children: [
            {
                path: "login",
                Component: Login
            },
            {
                path: "register",
                Component: Register
            }
        ]
    }
]);

export default route