import {
    EstimateSwapView,
    Transaction,
    WRAP_NEAR_CONTRACT_ID,
    estimateSwap,
    fetchAllPools,
    ftGetTokenMetadata,
    getExpectedOutputFromSwapTodos,
    getStablePools,
    instantSwap,
    nearDepositTransaction,
    nearWithdrawTransaction,
    percentLess,
    scientificNotationToString,
    separateRoutes,
} from "@ref-finance/ref-sdk";
import Big from "big.js";

import { searchToken } from "@/utils/search-token";

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = request.body;
    const { tokenIn, tokenOut, quantity } = body;
    console.log('Received body:', body);
    const headers = request.headers;
    const mbMetadata = JSON.parse(headers["mb-metadata"] || "{}");
    const accountId = mbMetadata?.accountData?.accountId || "near";

    const { ratedPools, unRatedPools, simplePools } = await fetchAllPools();

    const stablePools = unRatedPools.concat(ratedPools);

    const stablePoolsDetail = await getStablePools(stablePools);

    const tokenInMatch = searchToken(tokenIn)[0];
    const tokenOutMatch = searchToken(tokenOut)[0];

    if (!tokenInMatch || !tokenOutMatch) {
      return response.status(400).json({
        error: `Unable to find token(s) tokenInMatch: ${tokenInMatch?.name} tokenOutMatch: ${tokenOutMatch?.name}`,
      });
    }

    const [tokenInData, tokenOutData] = await Promise.all([
      ftGetTokenMetadata(tokenInMatch.id),
      ftGetTokenMetadata(tokenOutMatch.id),
    ]);

    if (tokenInData.id === tokenOutData.id) {
      if (tokenInData.id === WRAP_NEAR_CONTRACT_ID) {
        return response.status(400).json({ error: "This endpoint does not support wrapping / unwrap NEAR directly" });
      }
      return response.status(400).json({ error: "TokenIn and TokenOut cannot be the same" });
    }

    const refEstimateSwap = (enableSmartRouting) => {
      return estimateSwap({
        tokenIn: tokenInData,
        tokenOut: tokenOutData,
        amountIn: quantity,
        simplePools,
        options: {
          enableSmartRouting,
          stablePools,
          stablePoolsDetail,
        },
      });
    };

    const swapTodos = await refEstimateSwap(true).catch(() => {
      return refEstimateSwap(false); // fallback to non-smart routing if unsupported
    });

    const transactionsRef = await instantSwap({
      tokenIn: tokenInData,
      tokenOut: tokenOutData,
      amountIn: quantity,
      swapTodos,
      slippageTolerance: 0.1,
      AccountId: accountId,
      referralId: "opshenry.near",
    });

    if (tokenInData.id === WRAP_NEAR_CONTRACT_ID) {
      transactionsRef.splice(-1, 0, nearDepositTransaction(quantity));
    }

    if (tokenOutData.id === WRAP_NEAR_CONTRACT_ID) {
      const outEstimate = getExpectedOutputFromSwapTodos(swapTodos, tokenOutData.id);

      const routes = separateRoutes(swapTodos, tokenOutData.id);

      const bigEstimate = routes.reduce((acc, cur) => {
        const curEstimate = Big(cur[cur.length - 1].estimate);
        return acc.add(curEstimate);
      }, outEstimate);

      const minAmountOut = percentLess(0.01, scientificNotationToString(bigEstimate.toString()));

      transactionsRef.push(nearWithdrawTransaction(minAmountOut));
    }

    return response.status(200).json(transactionsRef);
  } catch (error) {
    console.error('Error in swap handler:', error);
    return response.status(500).json({ error: error.message });
  }
}
