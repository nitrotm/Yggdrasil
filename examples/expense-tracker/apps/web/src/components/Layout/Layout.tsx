import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function Layout() {
  return (
    <div>
      <Header />
      <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
