import { expect } from "chai";
import * as dotenv from "dotenv";
import {
  createWalletClient,
  http,
  keccak256,
  encodeFunctionData,
  parseEther,
  encodeAbiParameters,
  parseAbiParameters,
  erc20Abi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

dotenv.config();

describe("EIP-7702 Approve & Transfer Batch Test", function () {
  const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
  const account = privateKeyToAccount(PRIVATE_KEY);

  const BATCH_CALL_ADDR = process.env.BATCH_CALL_ADDR as `0x${string}`;
  const TOKEN_ADDR = process.env.TOKEN_ADDRESS as `0x${string}`;
  const RECEIVER = process.env.MY_ADDRESS as `0x${string}`;

  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
  });

  it("Approve와 Transfer가 하나의 트랜잭션(7702)으로 실행되어야 한다", async function () {
    console.log(`- 지갑 주소: ${account.address}`);
    const amount = parseEther("1");

    // 1. EIP-7702 Authorization 서명 (내 계정에 코드 위임)
    const authorization = await client.signAuthorization({
      contractAddress: BATCH_CALL_ADDR,
    });
    console.log("✅ 1/3 Authorization 서명 완료");

    // 2. 실행할 Call 데이터 구성 (Approve + Transfer)
    const approveData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [account.address, amount], // 테스트를 위해 나 자신에게 권한 부여
    });

    const transferData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [RECEIVER, amount],
    });

    const calls = [
      { to: TOKEN_ADDR, value: 0n, data: approveData },
      { to: TOKEN_ADDR, value: 0n, data: transferData },
    ];

    // 3. Batch 실행 서명 (BatchCallAndSponsor.sol 내부 검증용)
    // computeBatchDigest 로직: keccak256(abi.encode(block.chainid, _nonce, calls))
    const currentNonce = 0n; // getNonce()로 가져오는 것이 좋음
    const encodedData = encodeAbiParameters(
      parseAbiParameters(
        "uint256, uint256, (address to, uint256 value, bytes data)[]"
      ),
      [BigInt(sepolia.id), currentNonce, calls]
    );
    const digest = keccak256(encodedData);

    const signature = await client.signMessage({
      message: { raw: digest },
    });
    console.log("✅ 2/3 Batch 데이터 서명 완료");

    // 4. 트랜잭션 전송 (Type 4)
    console.log("🚀 트랜잭션 전송 중...");
    const hash = await client.sendTransaction({
      to: account.address, // 위임된 코드가 실행될 대상 (나 자신)
      data: encodeFunctionData({
        abi: [
          {
            name: "execute",
            type: "function",
            inputs: [
              {
                name: "calls",
                type: "tuple[]",
                components: [
                  { name: "to", type: "address" },
                  { name: "value", type: "uint256" },
                  { name: "data", type: "bytes" },
                ],
              },
              { name: "signature", type: "bytes" },
            ],
          },
        ],
        args: [calls, signature],
      }),
      authorizationList: [authorization],
    });

    console.log(`✅ 3/3 트랜잭션 성공! 해시: ${hash}`);
    expect(hash).to.be.a("string");
  });
});
