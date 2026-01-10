import { expect } from "chai";
import {
  createWalletClient,
  http,
  keccak256,
  toHex,
  encodeFunctionData,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

describe("EIP-7702 Batch Transaction Test", function () {
  // 테스트에 필요한 전역 변수들
  const PRIVATE_KEY = "0x...";
  const account = privateKeyToAccount(PRIVATE_KEY);
  const BATCH_CALL_ADDR = "0x...";
  const VOUCHER_ADDR = "0x...";

  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  });

  it("사용자가 한 번의 트랜잭션으로 바우처를 발행하고 수령해야 한다", async function () {
    const voucherCode = keccak256(toHex("SUMMER_GIFT_2026"));
    const amount = parseEther("10");

    // 1. EIP-7702 위임 서명 (Authorization)
    const authorization = await client.signAuthorization({
      contractAddress: BATCH_CALL_ADDR,
    });

    // 2. 실행 데이터 생성 (Issue + Redeem)
    const issueData = encodeFunctionData({
      abi: [
        {
          name: "issueVoucher",
          type: "function",
          inputs: [
            { name: "code", type: "bytes32" },
            { name: "amount", type: "uint256" },
          ],
        },
      ],
      args: [voucherCode, amount],
    });

    const redeemData = encodeFunctionData({
      abi: [
        {
          name: "redeemVoucher",
          type: "function",
          inputs: [{ name: "code", type: "bytes32" }],
        },
      ],
      args: [voucherCode],
    });

    const calls = [
      { to: VOUCHER_ADDR, value: 0n, data: issueData },
      { to: VOUCHER_ADDR, value: 0n, data: redeemData },
    ];

    // 3. 트랜잭션 전송 (Type 4)
    const hash = await client.sendTransaction({
      to: account.address,
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
            ],
          },
        ], // 서명 없는 버전 혹은 서명 포함 버전 선택
        args: [calls],
      }),
      authorizationList: [authorization],
    });

    console.log(`Transaction Hash: ${hash}`);

    // 검증 (Assertion)
    expect(hash).to.be.a("string");
    expect(hash).to.have.lengthOf(66); // 유효한 TX 해시 길이 확인
  });
});
