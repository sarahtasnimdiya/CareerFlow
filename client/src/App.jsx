import { Button } from "@heroui/react";
import { useEffect, useState } from "react";

import RegisterForm from "./RegisterForm";


function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/health")
      .then((response) => response.json())
      .then((data) => setHealth(data))
      .catch((error) => console.error("Error fetching health data:", error));
  }, []);

  return (
    <div className="p-10">
      <Button color="primary">Check Backend Health</Button>
      {health ? <p>backend says: {health.message}</p> : <p>loading...</p>}
    </div>
  );
}

export default App;