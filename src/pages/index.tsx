import { useState, useEffect, ChangeEvent } from 'react';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import Button from '@/components/ui/button';
import { ImageSlider } from '@/components/ui/image-slider';
import useSWR from 'swr';
import {safeParseInt } from '@/lib/util';

import { TESTNET3_API_URL, getHeight, getJSON, getMintBlock, getMintStatus, getUnmintedNFTs, getWhitelist } from '@/aleo/rpc';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import { Transaction, WalletAdapterNetwork, WalletNotConnectedError } from '@demox-labs/aleo-wallet-adapter-base';
import { NFTProgramId } from '@/aleo/nft-program';
import { getRandomElement } from '@/lib/util';
import MintCountdown from '@/components/mint/countdown';
import { time } from 'console';
import Base from '@/components/ui/base';
import { getMappingValueU32, getLastBlockHeight } from '@/aleo/rpc';


type SectionProps = {
  title: string;
  bgColor: string;
  sectionWidth?: string;
};

export function Section({
  title,
  bgColor,
  children,
  sectionWidth,
}: React.PropsWithChildren<SectionProps>) {
  return (
    <div className="mb-3">
      <div className={`rounded-lg ${bgColor}`}>
        <div className="relative flex items-center justify-between gap-4 p-4">
          <div className={`items-center ltr:mr-6 rtl:ml-6 ${sectionWidth}`}>
            <div>
              <span className="block text-xs font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:text-sm">
                {title}
              </span>
              <span className="mt-1 hidden text-xs tracking-tighter text-gray-600 dark:text-gray-400 sm:block">
                {children}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_IMAGES = [
  'https://aleo-nft-maxpia.vercel.app/nft/2.png',
  'https://aleo-nft-maxpia.vercel.app/nft/1.png',
  'https://aleo-nft-maxpia.vercel.app/nft/8.png',
  'https://aleo-nft-maxpia.vercel.app/nft/10.png',
  'https://aleo-nft-maxpia.vercel.app/nft/11.png',
  'https://aleo-nft-maxpia.vercel.app/nft/12.png',
  'https://aleo-nft-maxpia.vercel.app/nft/14.png',
  'https://aleo-nft-maxpia.vercel.app/nft/15.png',
  'https://aleo-nft-maxpia.vercel.app/nft/16.png',
  'https://aleo-nft-maxpia.vercel.app/nft/19.png',
  'https://aleo-nft-maxpia.vercel.app/nft/21.png',
]

const sample_key = "aleo175p3gq723sj525lkh83edj805qegcsydz8lwegaaq3pcaexqxs9s780j08"

const StakePage: NextPageWithLayout = () => {
  const { wallet, publicKey } = useWallet();

  let [transactionId, setTransactionId] = useState<string | undefined>();
  let [status, setStatus] = useState<string | undefined>();

  let [mint, setMint] = useState(0);
  let [stake, setStake] = useState(0);
  let [withdraw, setWithdraw] = useState(0);
  let [earn, setEarn] = useState(0);
  let [rewards, setRewards] = useState<number>(0);
  let [fee, setFee] = useState<string>('7.52');

  const { data: account, error: accountError, isLoading: accountIsLoading} = useSWR('account', () => getMappingValueU32(NFTProgramId, "account", publicKey ? publicKey : sample_key));
  const { data: staked, error: stakedError, isLoading: stakedIsLoading} = useSWR('staked', () => getMappingValueU32(NFTProgramId, "staked", publicKey ? publicKey : sample_key));
  console.log("staked", staked)
  const { data: last_update_block, error: lastUpdateError, isLoading: lastUpdateIsLoading} = useSWR('last_update_block', () => getMappingValueU32(NFTProgramId, "last_update_block", publicKey ? publicKey : sample_key));
  //console.log("last_update_block", last_update_block)
  const { data: reward, error: rewardsError, isLoading: rewardsIsLoading} = useSWR('reward', () => getMappingValueU32(NFTProgramId, "reward", publicKey ? publicKey : sample_key));
  console.log("reward", reward)
  const { data: last_block, error: lastBlockError, isLoading: lastBlockIsLoading} = useSWR('last_block', () => getLastBlockHeight());
  //console.log("last_block", last_block)

  useEffect(() => {
    if (last_block != undefined
      && last_update_block != undefined
      && staked != undefined
      && reward != undefined
    ) {
      const period = Number(last_block) - Number(last_update_block) + 1
      const rewards =  period * Number(staked) * 1
      console.log("period", period)
      console.log("rewards", rewards)
      setRewards(rewards + Number(reward))
    }
  }, [last_block, last_update_block, staked, reward]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (transactionId) {
      intervalId = setInterval(() => {
        getTransactionStatus(transactionId!);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [transactionId]);



  const handleMint = async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    const inputs = [mint.toString()+"u32"];

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      NFTProgramId,
      'mint_public',
      inputs,
      Math.floor(parseFloat(fee) * 1_000_000),
    );

    const txId =
      (await (wallet?.adapter as LeoWalletAdapter).requestTransaction(
        aleoTransaction
      )) || '';
    setTransactionId(txId);
  };

  const handleStake = async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const inputs = [stake.toString()+"u32"];

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      NFTProgramId,
      'stake',
      inputs,
      Math.floor(parseFloat(fee) * 1_000_000),
    );

    const txId =
      (await (wallet?.adapter as LeoWalletAdapter).requestTransaction(
        aleoTransaction
      )) || '';
    setTransactionId(txId);
  };

  const handleWithdraw = async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const inputs = [withdraw.toString()+"u32"];

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      NFTProgramId,
      'withdraw',
      inputs,
      Math.floor(parseFloat(fee) * 1_000_000),
    );

    const txId =
      (await (wallet?.adapter as LeoWalletAdapter).requestTransaction(
        aleoTransaction
      )) || '';
    setTransactionId(txId);
  };

  const handleEarn = async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const inputs = [earn.toString()+"u32"];

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      NFTProgramId,
      'earn',
      inputs,
      Math.floor(parseFloat(fee) * 1_000_000),
    );

    const txId =
      (await (wallet?.adapter as LeoWalletAdapter).requestTransaction(
        aleoTransaction
      )) || '';
    setTransactionId(txId);
  };

  const getTransactionStatus = async (txId: string) => {
    const status = await (
      wallet?.adapter as LeoWalletAdapter
    ).transactionStatus(txId);
    setStatus(status);
  };


  return (
    <>
      <NextSeo
        title="Aleo | Token Staking"
        description="Stake token using the Leo Wallet"
      />
      <div className="mx-auto px-4 mt-12 pb-14 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 xl:px-10 2xl:px-0">
        <h2 className="mb-14 text-lg font-medium uppercase text-center tracking-wider text-gray-900 dark:text-white sm:mb-10 sm:text-2xl">
          Aleo Staking Maxpia
        </h2>



<Base key="form">
      <div className='flex'>
          <div className='px-4 w-2/2'>
          <div className='text-center text-lg'>Token Staking</div>

             <label className="flex w-full items-center justify-between py-4">
                Token Address:
                {publicKey ? publicKey : sample_key}
              </label>

          <label className="flex w-full items-center justify-between py-4">
                Token Amount:
                {account?.toString()}
              </label>

              <label className="flex w-full items-center justify-between py-4">
                Staked:
                {staked?.toString()}
              </label>

              <label className="flex w-full items-center justify-between py-4">
                Reward:
                {rewards?.toString()}
              </label>

              <div className='w-1/2'>
              <label className="flex w-full items-center justify-between py-4">
                Fee:
                <input
                  className="h-11 w-12/12 appearance-none rounded-lg border-2 border-gray-200 bg-transparent py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-10 rtl:pr-10 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                  onChange={(event) => {
                    if (/^\d*(\.\d*)?$/.test(event.currentTarget.value)) { setFee(event.currentTarget.value)}}}
                  value={fee}
                />
              </label>
              </div>


            <label className="flex w-full items-center justify-between py-4">
                Mint:
                <input
                  className="h-11 w-6/12 appearance-none rounded-lg border-2 border-gray-200 bg-transparent py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-10 rtl:pr-10 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                  placeholder="mint"
                  onChange={(event) => setMint(safeParseInt(event.currentTarget.value))}
                  value={mint}
                />
                &nbsp;
                <Button
                  disabled={!publicKey || !fee}
                  className="shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
                  onClick={() => handleMint()}
                >
                  {!publicKey ? 'Connect Your Wallet' : 'Mint'}
                </Button>
              </label>

                 <label className="flex w-full items-center justify-between py-4">
                Stake:
                <input
                  className="h-11 w-6/12 appearance-none rounded-lg border-2 border-gray-200 bg-transparent py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-10 rtl:pr-10 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                  placeholder="Fee (in microcredits)"
                  onChange={(event) => setStake(safeParseInt(event.currentTarget.value))}
                  value={stake}
                />
                &nbsp;
                <Button
                  disabled={!publicKey || !fee}
                  className="shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
                  onClick={() => handleStake()}
                >
                  {!publicKey ? 'Connect Your Wallet' : 'Stake'}
                </Button>
              </label>
         
              <br></br>

              <label className="flex w-full items-center justify-between py-4">
                Earn:
                <input
                  className="h-11 w-6/12 appearance-none rounded-lg border-2 border-gray-200 bg-transparent py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-10 rtl:pr-10 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                  placeholder="Fee (in microcredits)"
                  onChange={(event) => setEarn(safeParseInt(event.currentTarget.value))}
                  value={earn}
                />
                &nbsp;
                <Button
                  disabled={!publicKey || !fee}
                  className="shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
                  onClick={() => handleEarn()}
                >
                  {!publicKey ? 'Connect Your Wallet' : 'Earn'}
                </Button>
              </label>
         
              <br></br>

              <label className="flex w-full items-center justify-between py-4">
                Withdraw:
                <input
                  className="h-11 w-6/12 appearance-none rounded-lg border-2 border-gray-200 bg-transparent py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-10 rtl:pr-10 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                  onChange={(event) => setWithdraw(safeParseInt(event.currentTarget.value))}
                  value={withdraw}
                />
                &nbsp;
                <Button
                  disabled={!publicKey || !fee}
                  type="submit"
                  className="shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
                  onClick={() => handleWithdraw()}
                >
                  {!publicKey ? 'Connect Your Wallet' : 'Withdraw'}
                </Button>
              </label> 
          </div>
        </div>

      </Base>
        {transactionId && (
          <div className='text-white text-center'>
            <div>{`Transaction status: ${status}`}</div>
          </div>
        )}
      </div>
    </>
  );
};

StakePage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default StakePage;
