import {Routes,Route} from "react-router-dom";

import RegisterForm from "./RegisterForm.jsx";
import LoginForm from "./LoginForm.jsx";
import NavBar from "./NavBar.jsx";
import AttributePage from "./AttributePage.jsx";
import AddAttributePage from "./AddAttributePage.jsx";
import EditAttributePage from "./EditAttributePage.jsx";
import PositionPage from "./PositionPage.jsx";
import AddPositionPage from "./AddPositionPage.jsx";
import EditPositionPage from "./EditPositionPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import CVPage from "./CVPage.jsx";
import HomePage from "./HomePage.jsx";


function App() {
  

  return (
    <>
    <NavBar />
    <Routes>
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/attributes" element={<AttributePage />} />
      <Route path="/add-attribute" element={<AddAttributePage />} />
      <Route path="/edit-attribute/:id" element={<EditAttributePage />} />
      <Route path="/positions" element={<PositionPage />} />
      <Route path="/add-position" element={<AddPositionPage />} />
      <Route path="/edit-position/:id" element={<EditPositionPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/cv/:id" element={<CVPage />} />
      <Route path="/" element={<HomePage />} />
    </Routes>
    </>
  );
}

export default App;