import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Excution({ excutionInfo, setExcutionInfo }) {
  const [stepNum, setStepNum] = useState(0);
  const [input, setInput] = useState("");
  useEffect(() => {
    return () => {
      setStepNum(0);
    };
  }, []);

  const excuteFunc = async () => {
    if (excutionInfo[stepNum].type == "input") {
      setExcutionInfo((prev) => {
        const newInfo = [...prev];
        newInfo[stepNum].status = "loading";
        return newInfo;
      });
      setInput("");
    }
    if (excutionInfo[stepNum].type == "output") {
    }
    if (excutionInfo[stepNum].type == "agent") {
      setExcutionInfo((prev) => {
        const newInfo = [...prev];
        newInfo[stepNum].status = "loading";
        return newInfo;
      });
      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: excutionInfo[stepNum].description,
          message:
            excutionInfo[stepNum].prompt + "on token" + excutionInfo[0].response
              ? excutionInfo[0].response
              : "SOLANA",
        }),
      });
      const res = await response.json();
      setExcutionInfo((prev) => {
        const newInfo = [...prev];
        newInfo[stepNum].response = res.message;
        newInfo[stepNum].status = "finished";
        return newInfo;
      });
      setStepNum(stepNum + 1);
    }
  };
  useEffect(() => {
    if (excutionInfo) {
      if (stepNum < excutionInfo.length) excuteFunc();
    }
  }, [stepNum]);
  return (
    <>
      {excutionInfo && excutionInfo.length > 0 && (
        <div
          style={{
            margin: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "550px",
            padding: "20px",
            background: "#f0f0f0",
            overflowY: "auto",
            color: "black",
            cursor: "default",
            zIndex: "20",
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <div>
            {excutionInfo.map((info, index) => (
              <div key={index}>
                <h3>Excution {index + 1}</h3>
                <p>Agent: {info.label}</p>
                {info.response ? (
                  <p>
                    Response: <ReactMarkdown>{info.response}</ReactMarkdown>
                  </p>
                ) : null}
                <p>{info.status === "loading" ? "waiting..." : null}</p>
              </div>
            ))}
          </div>
          {excutionInfo[stepNum] && excutionInfo[stepNum].type == "input" && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <input
                style={{
                  minWidth: "80%",
                  marginTop: "auto",
                  background: "transparent",
                  color: "black",
                  outline: "none",
                }}
                placeholder="Enter input"
                onChange={(e) => {
                  setInput(e.target.value);
                }}
              />
              <button
                onClick={() => {
                  setExcutionInfo((prev) => {
                    const newInfo = [...prev];
                    newInfo[stepNum].response = input;
                    newInfo[stepNum].status = "finished";
                    return newInfo;
                  });
                  setStepNum(stepNum + 1);
                }}
              >
                send input
              </button>
            </div>
          )}
          <button
            style={{
              position: "absolute",
              top: "32px",
              right: "32px",
            }}
            onClick={() => {
              setExcutionInfo(null);
              setStepNum(0);
            }}
          >
            cancel
          </button>
        </div>
      )}
    </>
  );
}
