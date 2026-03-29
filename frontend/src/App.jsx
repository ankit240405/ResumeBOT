import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthLanding from "./pages/AuthLanding.jsx";
import Upload from "./pages/Upload.jsx";
import Profile from "./pages/Profile.jsx";
import Result from "./pages/Result.jsx";
import Navbar from "./components/Navbar.jsx";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";


function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function App() {
  const location = useLocation();
  const hideNavbar = ["/login"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/login" element={<AuthLanding />} />

        {}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/upload" />
            </ProtectedRoute>
          }
        />

        {}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        /> 
 

        {}
        <Route
          path="/result"
          element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          }
        />

      
        {}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Navigate to="/upload" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
