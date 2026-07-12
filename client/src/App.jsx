import {Routes,Route} from "react-router-dom";

import RegisterForm from "./RegisterForm.jsx";
import LoginForm from "./LoginForm.jsx";


function App() {
  

  return (
    <Routes>
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<LoginForm />} />
    </Routes>
  );
}

export default App;