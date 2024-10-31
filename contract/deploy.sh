# Check if the WASM file exists
if [ ! -f "out/ .wasm" ]; then
    echo "Error: out/main.wasm not found. Make sure you've built the contract."
    exit 1
fi
near deploy --wasmFile out/main.wasm  --init-function new --accountId $CONTRACT