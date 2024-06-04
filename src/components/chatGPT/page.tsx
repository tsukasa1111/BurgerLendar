import React, { useState, useEffect } from "react";
import Chat from "./chat";
import Edu from "./education";
import Home from "./home";

const App: React.FC = () => {
  const [output, setOutput] = useState<string>("");
  
  useEffect(() => {
    console.log("in page.tsx output:");
    console.log(output);
  }, [output]);

  return (
    <div>
      <Edu setOutput={setOutput} />

      <Home output={output} />
    </div>
  );
};

export default App;
