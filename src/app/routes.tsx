import { createBrowserRouter } from "react-router";
import AdminDashboard from "./components/admin/AdminDashboard";
import AgentDashboard from "./components/agent/AgentDashboard";
import CashierDashboard from "./components/cashier/CashierDashboard";
import PlayerLobby from "./components/player/PlayerLobby";
import GameTable from "./components/player/GameTable";
import Login from "./components/auth/Login";
import Root from "./Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "admin", Component: AdminDashboard },
      { path: "agent", Component: AgentDashboard },
      { path: "cashier", Component: CashierDashboard },
      { path: "player", Component: PlayerLobby },
      { path: "game/:tableId", Component: GameTable },
    ],
  },
]);
