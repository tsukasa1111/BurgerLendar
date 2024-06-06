import React, { useState, useEffect } from "react";
import Chat from "./chatGPT/chat";
import Edu from "./chatGPT/education";
import Home from "./chatGPT/home";

const App: React.FC = () => {
  const [output, setOutput] = useState<string>("");
  
  // useEffect(() => {
  //   console.log("in page.tsx output:");
  //   console.log(output);
  // }, [output]);

  return (
    <div>
      <Edu setOutput={setOutput} />

      <Home output={output} />
    </div>
  );
};

export default App;
