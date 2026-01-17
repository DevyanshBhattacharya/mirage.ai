import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/navbar.jsx";
// import Home from './pages/Home.jsx';
// import About from './pages/About.jsx';
// import Contact from './pages/Contact.jsx';
import { ThemeProvider } from "./context/themeProvider.jsx";
import Landing from "./pages/Landing.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import SidebarLayout from "./Components/SidebarLayout.jsx";
import Home from "./pages/Home.jsx";
import ArtCloack from "./pages/ArtCloack.jsx";
import FaceCloak from "./pages/FaceCloak.jsx";
import Playground from "./pages/Playground.jsx";
import MirageBackground from "./Components/Background.jsx";

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* <MirageBackground /> */}
        <div className=" dark:text-muted text-foreground h-screen w-screen overflow-hidden">
          {/* <Navbar /> */}
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} /> */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            {/* homepage and other pages with a sidebar */}
            <Route element={<SidebarLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/artcloak" element={<ArtCloack />} />
              <Route path="/facecloak" element={<FaceCloak />} />
              <Route path="/playground" element={<Playground />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
