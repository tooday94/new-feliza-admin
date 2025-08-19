import { Route, Routes } from "react-router-dom";
import { NotFound } from "./components/404/not-found";
import { MainLayout } from "./layouts/main-layout";
import { Suspense } from "react";
import { routes } from "./routes/routes";
import Login from "./pages/login/login";
import { ProtectedRoute } from "./auth/protected";
import Loader from "./components/loaders/loader";

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<MainLayout />}>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.element />}
              />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Suspense>
  );
}

export default App;
