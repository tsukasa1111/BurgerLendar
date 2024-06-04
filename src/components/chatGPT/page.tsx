import React, { useState } from "react";
import Chat from './chat';
import Edu from './education';
import Home from './home';

const App:React.FC = () =>{
  const [output, setOutput] = useState<string>("");

  return (
    <div>
      <Edu setOutput={setOutput} />
      
      <Home output={output} />
    </div>
  );

}

export default App;
