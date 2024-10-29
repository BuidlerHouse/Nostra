import Image from "next/image";
import styles from "@/styles/app.module.css";
import Logo from "/public/nostra.png";
import "@xyflow/react/dist/style.css";

export default function Welcome() {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Image src={Logo} alt="Nostra" width={500} height={500} />
      </div>
      <h2
        style={{
          color: "black",
          fontFamily: "monospace",
          fontWeight: "bold",
          letterSpacing: "2px",
          position: "relative",
          zIndex: 1,
        }}
      >
        NOSTRA
      </h2>
      <div className={styles.matrixAnimation}></div>
    </>
  );
}
