import { Montserrat } from "next/font/google";
import "./globals.css";
import styles from "../styles/layout.module.css";
import Sidebar from "../components/Sidebar";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "700"] });

export const metadata = {
  title: "GoldStats | Premium Football Analytics",
  description: "Advanced heuristics and luxury statistics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <div className={styles.layoutContainer}>
          <header className={styles.mainHeader}>
            <div className={styles.logo}>Gold<span>Stats</span></div>
          </header>
          <div className={styles.contentWrapper}>
            <Sidebar />
            <main className={styles.mainContent}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
