
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/stacks/clarinet-js-sdk
*/

describe("example tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  // it("shows an example", () => {
  //   const { result } = simnet.callReadOnlyFn("counter", "get-counter", [], address1);
  //   expect(result).toBeUint(0);
  // });

   it("submits a water quality reading and flags violation correctly", () => {
    // Define parameters for a reading that exceeds safety thresholds
    const siteId = 1;
    const timestamp = 100;
    const ph = 500; // below MIN-SAFE-PH (650)
    const oxygen = 300; // below MIN-OXYGEN-LEVEL (400)
    const turbidity = 50; // within safe range
    const temp = 3600; // above MAX-TEMPERATURE (3500)
    const conductivity = 200;
    const tds = 300;

    // Submit reading
    const { result } = simnet.mineBlock([
      simnet.tx.contractCall({
        contractAddress: address1,
        contractName: "wealth-water",
        functionName: "submit-reading",
        functionArgs: [
          `(uint ${siteId})`,
          `(uint ${timestamp})`,
          `(uint ${ph})`,
          `(uint ${oxygen})`,
          `(uint ${turbidity})`,
          `(uint ${temp})`,
          `(uint ${conductivity})`,
          `(uint ${tds})`,
        ],
        sender: address1,
      }),
    ]);

    // Expect submission succeeded
    expect(result[0].result).toBeOk();

    // Check stored reading
    const { result: reading } = simnet.callReadOnlyFn(
      "wealth-water",
      "quality-readings",
      [
        `(tuple (site-id ${siteId}) (recorded-at ${timestamp}))`
      ],
      address1
    );

    expect(reading).toBeSome();
    expect(reading.value.violation).toBe(true);
    expect(reading.value.is_verified).toBe(false);
  });
});
