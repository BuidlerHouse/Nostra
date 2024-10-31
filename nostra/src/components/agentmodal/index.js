import Image from "next/image";
import Logo from "/public/nostra.png";
import "@xyflow/react/dist/style.css";
import { NearContext } from "@/wallets/near";
import { useContext } from "react";

export default function AgentModal({
  isModalOpen,
  newAgent,
  handleInputChange,
  handleSubmit,
  handleCloseModal,
}) {
  const { signedAccountId, wallet } = useContext(NearContext);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      await wallet.callMethod({
        contractId: "nostra.opshenry.near",
        method: "add_agent",
        args: {
          name: newAgent.name,
          description: newAgent.description,
          prompt: newAgent.prompt,
        },
        gas: "300000000000000",
      });
      handleSubmit(e);
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  };

  return (
    <>
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "5px",
              width: "300px",
            }}
          >
            <h2 style={{ color: "black", textAlign: "center" }}>
              Create Agent
            </h2>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Image src={Logo} alt="Nostra" width={100} height={100} />
            </div>
            <form onSubmit={handleCreateAgent}>
              <div style={{ marginBottom: "10px", color: "black" }}>
                <label htmlFor="name" style={{ color: "black" }}>
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newAgent.name}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "white",
                    color: "black",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="description" style={{ color: "black" }}>
                  Description:
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newAgent.description}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "white",
                    color: "black",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="prompt" style={{ color: "black" }}>
                  Prompt:
                </label>
                <textarea
                  id="prompt"
                  name="prompt"
                  value={newAgent.prompt}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "white",
                    color: "black",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit" style={{ padding: "5px 10px" }}>
                  Create
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ padding: "5px 10px" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
