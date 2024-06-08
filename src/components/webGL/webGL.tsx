import React, { useEffect, useState } from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

interface BurgerConfig {
  meatCount: number;
  cheeseCount: number;
  tomatoCount: number;
  lettuceCount: number;
}

function Webgl() {
  const [burgerConfig, setBurgerConfig] = useState<BurgerConfig>({
    meatCount: 10,
    cheeseCount: 2,
    tomatoCount: 2,
    lettuceCount: 2,
  });

  const unityContext = new UnityContext({
    loaderUrl: "./public/unity/test15.loader.js",
    dataUrl: "./public/unity/test15.data",
    frameworkUrl: "./public/unity/test15.framework.js",
    codeUrl: "./public/unity/test15.wasm",
  });
  

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        const today = new Date();
        const yy = String(today.getFullYear()).slice(-2);
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const yymmdd = `${yy}${mm}${dd}`;
        const docRef = doc(db, 'Users_Burger', userId, 'BurgerData', yymmdd);

        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as BurgerConfig;
            console.log("Fetched BurgerConfig: ", data); // デバッグ用に取得したデータをログに出力
            setBurgerConfig(data);
          } else {
            console.log("No data available");
          }
        } catch (error) {
          console.error("Error fetching burger config: ", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    unityContext.on("loaded", () => {
      try {
        console.log("Unity loaded. Sending config: ", burgerConfig); // デバッグ用に送信するデータをログに出力
        unityContext.send(
          "Scripts",
          "ConfigureBurger",
          JSON.stringify(burgerConfig)
        );
      } catch (error) {
        console.error("Error sending config to Unity: ", error);
      }
    });
  }, [unityContext, burgerConfig]);

  useEffect(() => {
    unityContext.on("BurgerConfigured", (message) => {
      console.log("Burger configured: ", message);
    });
  }, [unityContext]);

  return (
    <div style={{ position: "relative" }}>
      <Unity unityContext={unityContext} style={{ width: 640, height: 640 }} />
    </div>
  );
}

export default Webgl;
