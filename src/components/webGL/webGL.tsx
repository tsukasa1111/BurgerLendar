import React, { useEffect, useState } from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import { useSelector } from "react-redux";

function WebGL() {
  const unityContext = new UnityContext({
    loaderUrl: "unity/test.loader.js",
    dataUrl: "unity/test.data",
    frameworkUrl: "unity/test.framework.js",
    codeUrl: "unity/test.wasm",
  });
  function moveRight() {
    unityContext.send("Sphere", "MoveRight", 10);
  }
  function moveLeft() {
    unityContext.send("Sphere", "MoveLeft", 10);
  }

  return (
    <>
      <div style={{ position: "relative" }}>
        <Unity
          unityContext={unityContext}
          style={{ width: 1280, height: 720 }}
        />
        <button onClick={moveRight}>MoveRight</button>
        <button onClick={moveLeft}>MoveLeft</button>
      </div>
    </>
  );
}

export default WebGL;
