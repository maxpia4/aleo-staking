// The 'staking_maxpia_0814' program.
program staking_maxpia_0814.aleo {


    record Rewards {
        owner: address,
        amount: u32,
        last_update_block: u32
    }

    record Token {
        owner: address, //stake pool, user
        amount: u32,
    }

    transition mint_to_staking_pool(pool_address: address, stake_amount: u32) -> Token {
        return Token {
            owner: pool_address,
            amount: stake_amount,
        };
    }


    transition mint_to_me(mint_amount: u32) -> Token {
        return Token {
            owner: self.caller,
            amount: mint_amount,
        };    
    }


    transition stake(
        staking_pool_account: address, 
        pool_token_amount_before: u32, 
        user_token_amount_before: u32,
        stake_amount: u32,
        last_update_block: u32,
        block_height: u32,
        last_rewards: u32
    ) -> (Token, Token, Rewards)  {
        assert(stake_amount <= user_token_amount_before);
        assert(last_update_block <= block_height);

        let t_pool: Token = Token {
            owner: staking_pool_account,
            amount: pool_token_amount_before + stake_amount,
        };
        let t_me: Token = Token {
            owner: self.caller,
            amount: user_token_amount_before - stake_amount,
        };
        
        let reward_: u32 = (block_height - last_update_block) * 10u32;
        let r_me: Rewards = Rewards {
            owner: self.caller,
            amount: last_rewards + reward_,
            last_update_block: block_height,
        };

        return (t_pool, t_me, r_me);
    }



    transition withdraw(
        staking_pool_account: address, 
        pool_token_amount_before: u32, 
        user_token_amount_before: u32,
        withdraw_amount: u32,
        last_update_block: u32,
        block_height: u32,
        last_rewards: u32
    ) -> (Token, Token, Rewards)  {
        assert(withdraw_amount <= pool_token_amount_before);

        let t_pool: Token = Token {
            owner: staking_pool_account,
            amount: pool_token_amount_before - withdraw_amount,
        };
        let t_me: Token = Token {
            owner: self.caller,
            amount: user_token_amount_before + withdraw_amount,
        };

        let reward_: u32 = (block_height - last_update_block) * 10u32;
        let r_me: Rewards = Rewards {
            owner: self.caller,
            amount: last_rewards + reward_,
            last_update_block: block_height,
        };

        return (t_pool, t_me, r_me);
    }


    transition main(public a: u32, b: u32) -> u32 {
        let c: u32 = a + b;
        return c;
    }
}
