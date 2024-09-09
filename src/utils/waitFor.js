export async function waitFor(assertionFunction, waitTimeInMs = 500) {
  async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const assertion = assertionFunction();

  if (assertion) {
    return assertion;
  }

  await sleep(waitTimeInMs);

  return waitFor(assertionFunction, waitTimeInMs);
}
