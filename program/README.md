# staking_maxpia_0814.aleo

The subject is to mint tokens and stake to pools and individuals and withdraw the minted tokens.

The input values ​​are as follows.

[mint_to_staking_pool]
```bash
pool_address: address = aleo1mgfq6g40l6zkhsm063n3uhr43qk5e0zsua5aszeq5080dsvlcvxsn0rrau;
stake_amount: u32 = 10000u32;
```

[mint_to_me]
```bash
stake_amount: u32 = 1000u32;
```

[stake]
```bash
staking_pool_account: address = aleo1mgfq6g40l6zkhsm063n3uhr43qk5e0zsua5aszeq5080dsvlcvxsn0rrau;
pool_token_amount_before: u32 = 10000u32;
user_token_amount_before: address = 1000u32;
stake_amount: u32 = 100u32;
last_update_block: u32 = 1111u32;
block_height: u32 = 2222u32;
last_rewards:u32 = 0u32;
```

[withdraw]
```bash
staking_pool_account: address = aleo1mgfq6g40l6zkhsm063n3uhr43qk5e0zsua5aszeq5080dsvlcvxsn0rrau;
pool_token_amount_before: u32 = 10100u32;
user_token_amount_before: u32 = 900u32;
withdraw_amount: u32 = 50u32;
last_update_block: u32 = 2222u32;
block_height: u32 = 3333u32;
last_rewards:u32 = 11110u32;
```

## Build Guide

To compile this Aleo program, run:
```bash
snarkvm build
```

To mint staking pool, run:
```bash
snarkvm run mint_to_staking_pool
```

To mint to me, run:
```bash
snarkvm run mint_to_me
```

To stake, run:
```bash
snarkvm run stake
```

To withdraw, run:
```bash
snarkvm run withdraw
```



