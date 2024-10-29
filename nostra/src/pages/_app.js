import { useEffect, useState } from "react";

import "@/styles/globals.css";
import { Navigation } from "@/components/navigation";

import { Wallet, NearContext } from "@/wallets/near";
import { NetworkId } from "@/config";
import { ReactFlowProvider } from "@xyflow/react";

const wallet = new Wallet({ networkId: NetworkId });

export default function MyApp({ Component, pageProps }) {
  const [signedAccountId, setSignedAccountId] = useState("");

  useEffect(() => {
    wallet.startUp(setSignedAccountId);
  }, []);

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      <ReactFlowProvider>
        <Navigation />
        <Component {...pageProps} />
      </ReactFlowProvider>
    </NearContext.Provider>
  );
}
