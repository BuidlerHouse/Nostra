import "@xyflow/react/dist/style.css";
import { useEffect, useState, useContext } from "react";
import ReactMarkdown from "react-markdown";
import { NearContext } from "@/wallets/near";

export default function Excution({ excutionInfo, setExcutionInfo }) {
  const { wallet } = useContext(NearContext);
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
      setExcutionInfo((prev) => {
        const newInfo = [...prev];
        newInfo[stepNum].status = "loading";
        return newInfo;
      });
      const response = await fetch('/api/swap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'mb-metadata': JSON.stringify({ accountData: { accountId: 'near' } })
          },
          body: JSON.stringify({
            tokenIn: 'NEAR',
            tokenOut: 'USDC', 
            quantity: '1'
          })
        });
        const transactions = await response.json();
        // NEAR
        const formattedTransactions = transactions.map(tx => ({
          receiverId: tx.receiverId,
          actions: tx.functionCalls.map(call => ({
            type: "FunctionCall",
            params: {
              methodName: call.methodName,
              args: call.args,
              gas: call.gas
            }
          }))
        }));
          await wallet.signAndSendTransactions({ 
            transactions: formattedTransactions 
          });
        // NEAR END
        
        setExcutionInfo((prev) => {
          const newInfo = [...prev];
          newInfo[stepNum].response = JSON.stringify(data, null, 2);
          newInfo[stepNum].status = "finished";
          return newInfo;
        });
      setStepNum(stepNum + 1);
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
          token: excutionInfo[0].response ? excutionInfo[0].response : "SOLANA",
          agentLabel: excutionInfo[stepNum].label,
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
            width: "850px",
            padding: "20px",
            background: "#f0f0f0",
            overflowY: "auto",
            color: "black",
            cursor: "default",
            zIndex: "20",
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            cursor: "default",
          }}
        >
          <div>
            {excutionInfo.map((info, index) => (
              <div
                key={index}
                style={{
                  margin: "10px 0",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  background:
                    info.status === "loading" && stepNum == index
                      ? "#fff"
                      : "transparent",
                }}
              >
                <h3>
                  {info.type === "agent" ? "Agent:" : "Action:"} {info.label}
                </h3>
                {info.response ? (
                  <p>
                    <ReactMarkdown>{info.response}</ReactMarkdown>
                  </p>
                ) : null}
                <p>
                  {info.status === "loading" && stepNum == index
                    ? "waiting..."
                    : null}
                </p>
              </div>
            ))}
          </div>
          {excutionInfo[stepNum] && excutionInfo[stepNum].type == "input" && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <input
                style={{
                  minWidth: "calc(100% - 50px)",
                  marginTop: "auto",
                  background: "transparent",
                  color: "black",
                  outline: "none",
                }}
                placeholder="Enter input"
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setExcutionInfo((prev) => {
                      const newInfo = [...prev];
                      newInfo[stepNum].response = input;
                      newInfo[stepNum].status = "finished";
                      return newInfo;
                    });
                    setStepNum(stepNum + 1);
                  }
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
                send
              </button>
            </div>
          )}
          <button
            style={{
              position: "absolute",
              top: "24px",
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
