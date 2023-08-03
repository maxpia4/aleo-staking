// The 'aleo_staking' program.
program aleo_staking.aleo {

    // On-chain storage of an `account` map, with `address` as the key,
    // and `u32` as the value.
    mapping account: address => u32;
    mapping staked: address => u32;
    mapping reward: address => u32;
    mapping last_update_block: address => u32;

    // The function `mint_public` issues the specified token amount for the token receiver publicly on the network.
    transition mint_public(public amount: u32) {
        // Mint the tokens publicly by invoking the computation on-chain.
        return then finalize(self.caller, amount);
    }
    finalize mint_public(public receiver: address, public amount: u32) {
        // Increments `account[receiver]` by `amount`.
        // If `account[receiver]` does not exist, it will be created.
        // If `account[receiver] + amount` overflows, `mint_public` is reverted.
        let receiver_amount: u32 = Mapping::get_or_use(account, receiver, 0u32);
        Mapping::set(account, receiver, receiver_amount + amount);
    }

    transition stake(public amount: u32) {
        return then finalize(self.caller, amount);
    }
    finalize stake(public staker: address, public amount: u32) {
        let staker_amount: u32 = Mapping::get_or_use(account, staker, 0u32);
        assert(staker_amount >= amount);

        let block_height: u32 = block.height;
        let m_last_update_block: u32 = Mapping::get_or_use(last_update_block, staker, block_height);
        Mapping::set(last_update_block, staker, block_height);

        let staked_amount: u32 = Mapping::get_or_use(staked, staker, 0u32);
        let reward_new: u32 = (block_height - m_last_update_block) * staked_amount * 1u32;
        let reward_org: u32 = Mapping::get_or_use(reward, staker, 0u32);
        Mapping::set(reward, staker, reward_org + reward_new);

        // Increments `staked[staker]` by `amount`.
        Mapping::set(staked, staker, staked_amount + amount);
        Mapping::set(account, staker, staker_amount - amount);
    }

    transition earn(public amount: u32) {
        return then finalize(self.caller, amount);
    }
    finalize earn(public staker: address, public amount: u32) {
        let reward_amount: u32 = Mapping::get_or_use(reward, staker, 0u32);
        assert(reward_amount >= amount);

        let block_height: u32 = block.height;
        let m_last_update_block: u32 = Mapping::get_or_use(last_update_block, staker, block_height);
        Mapping::set(last_update_block, staker, block_height);

        // decrease `reward[staker]` by `amount`.
        let staked_amount: u32 = Mapping::get_or_use(staked, staker, 0u32);
        let reward_new: u32 = (block_height - m_last_update_block) * staked_amount * 1u32;
        let reward_org: u32 = Mapping::get_or_use(reward, staker, 0u32);
        Mapping::set(reward, staker, reward_org + reward_new - amount);

        // increase `account[staker]` by `amount`.
        let staker_amount: u32 = Mapping::get_or_use(account, staker, 0u32);
        Mapping::set(account, staker, staker_amount + amount);
    }

    transition withdraw(public amount: u32) {
        return then finalize(self.caller, amount);
    }
    finalize withdraw(public staker: address, public amount: u32) {
        let staked_amount: u32 = Mapping::get_or_use(staked, staker, 0u32);
        assert(staked_amount >= amount);

        let block_height: u32 = block.height;
        let m_last_update_block: u32 = Mapping::get_or_use(last_update_block, staker, 0u32);
        Mapping::set(last_update_block, staker, block_height);

        let reward_new: u32 = (block_height - m_last_update_block) * staked_amount * 1u32;
        let reward_org: u32 = Mapping::get_or_use(reward, staker, 0u32);
        Mapping::set(reward, staker, reward_org + reward_new);

        // decrease `staked[staker]` by `amount`.
        Mapping::set(staked, staker, staked_amount - amount);
        let staker_amount: u32 = Mapping::get_or_use(account, staker, 0u32);
        Mapping::set(account, staker, staker_amount + amount);
    }
}
