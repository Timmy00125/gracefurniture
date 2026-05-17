import { Routes, Route, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import MenuPage from "@/routes/MenuPage";
import ItemPage from "@/routes/ItemPage";
import AdminPage from "@/routes/AdminPage";

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <Link
            to="/admin"
            className="px-3 py-1.5 rounded-full text-[10px] eyebrow border hairline"
            style={{
              background: "var(--color-walnut-2)",
              color: "var(--color-cream-dim)",
            }}
          >
            Admin
          </Link>
        </div>
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <MenuPage />
              </PageWrapper>
            }
          />
          <Route
            path="/item/:id"
            element={
              <PageWrapper>
                <ItemPage />
              </PageWrapper>
            }
          />
          <Route
            path="/admin/*"
            element={
              <PageWrapper>
                <AdminPage />
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}
