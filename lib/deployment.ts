/** Static deployment facts (public hashes only). */
export const DEPLOYMENT = {
  network: "GenLayer Studionet",
  chainId: 61999,
  deployer: "0x44333D342E1378A1e480C79856EC084C780fe35A",
  contractAddress: "0xDee016d4f9C1160f05D75b51Dd996cda9003d80b",
  deployTxHash: "0x989e43705bdc34e421a1bf49bc34fa2537ea483b7fa65c14272b32a8b904648a",
  faucetTxHash: "0x52b55e161f10d774b181f14912a58c46249cbe8a00fc7cf95aa3a7b152e2a2db",
  smoke: [
    { label: "create_brief", hash: "0xeea96efbd0cbf7d0b571587b60090b6feb68e3973643d4ef3c403dcbfd5eee28" },
    { label: "open_brief", hash: "0x9f6a38bc670981ceb28833d6ba173cb9bb55c81259236ac4f63df9013b3c0b64" },
    { label: "submit_concept", hash: "0xc102b0451794fbdab44c84855cb680ba1e28d15bdc87e5240a0ed8c5aaa06cfa" },
    { label: "assess_concept (shortlisted/88/95/92)", hash: "0x73c0e60a642ba5a00eb51f135380bc47843dbb1a5d4cc77cb08f69ed72c9446e" },
    { label: "publish_ranking", hash: "0xd7024cabbc8e9095db9dae934663d5fe6b026d7b8a6947f8ab9bd10094143b89" },
    { label: "challenge_concept", hash: "0x0598ebf33b326dbf9d021e08f56888bc2771ae9d2e4ae347597cd34aa781ef0f" },
    { label: "file_appeal", hash: "0x0798f4edfaffab2c27f9999667c1335239ec23b9f10e03a2a6aa84947436255e" },
    { label: "resolve_challenge (dismissed)", hash: "0xa3483990bc25b8609e7c0e45f0be859e0eb3db86b5af9f98e9c8dc24a2160c02" },
    { label: "resolve_appeal (denied)", hash: "0x9606379f4970f3824ea2fed204d97f4a56fbef4ab80898b5218fabf2ebe29481" },
    { label: "award_brief", hash: "0x9df5beeec18937426ca4505da705b59db8ffb191f40ff8bb4e31991da63c1601" },
    { label: "archive_brief", hash: "0xc4ec5cdf8c5f4ff3ae0d10e2cd404bc7d95c5ed0938f69fbb596f4e86ee995e7" },
  ],
} as const;
