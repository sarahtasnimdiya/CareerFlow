import {Routes,Route} from "react-router-dom";

import RegisterForm from "./RegisterForm.jsx";
import LoginForm from "./LoginForm.jsx";
import NavBar from "./NavBar.jsx";
import AttributePage from "./AttributePage.jsx";
import AddAttributePage from "./AddAttributePage.jsx";
import EditAttributePage from "./EditAttributePage.jsx";


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
    </Routes>
    </>
  );
}

export default App;