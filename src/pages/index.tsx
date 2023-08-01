import { useEffect, useState } from 'react';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import Layout from '@/layouts/_layout';
import Button from '@/components/ui/button';
import { ImageSlider } from '@/components/ui/image-slider';
import useSWR from 'swr';
import { TESTNET3_API_URL, getHeight, getJSON, getMintBlock, getMintStatus, getUnmintedNFTs, getWhitelist } from '@/aleo/rpc';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import { Transaction, WalletAdapterNetwork, WalletNotConnectedError } from '@demox-labs/aleo-wallet-adapter-base';
import { NFTProgramId } from '@/aleo/nft-program';
import { getRandomElement } from '@/lib/util';
import MintCountdown from '@/components/mint/countdown';
import { time } from 'console';

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

const MintPage: NextPageWithLayout = () => {
  const { wallet, publicKey } = useWallet();
  const { data, error, isLoading } = useSWR('getMintStatus', () => getMintStatus(TESTNET3_API_URL));
  const { data: unmintedNFTs, error: nftError, isLoading: nftIsLoading} = useSWR('unmintedNfts', () => getUnmintedNFTs(TESTNET3_API_URL));
  const { data: whiteList, error: whitelistError, isLoading: whitelistIsLoading } = useSWR('whitelist', () => getWhitelist(TESTNET3_API_URL));
  const { data: height, error: heightError, isLoading: heightIsLoading } = useSWR('height', () => getHeight(TESTNET3_API_URL));
  const { data: mintBlock, error: mintBlockError, isLoading: mintBlockIsLoading } = useSWR('getMintBlock', () => getMintBlock(TESTNET3_API_URL));

  let [transactionId, setTransactionId] = useState<string | undefined>();
  let [nftImage, setNFTImage] = useState<string | undefined>();
  let [status, setStatus] = useState<string | undefined>();
  let [errorMessage, setErrorMessage] = useState<string | undefined>();

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

    if (!data || !unmintedNFTs) throw new Error('No current mint status');

    const nftToMint: any = getRandomElement(unmintedNFTs);
    const tokenId = nftToMint.inputs[0].value.replace(/\r?\n|\r/g, '');
    const inputs = [tokenId, nftToMint.inputs[1].value];

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      NFTProgramId,
      'mint',
      inputs,
      Math.floor(4_250_000),
    );

    const txId =
      (await (wallet?.adapter as LeoWalletAdapter).requestTransaction(
        aleoTransaction
      )) || '';
    setTransactionId(txId);

    const properties = await getJSON(`https://${nftToMint.url}`);
    setNFTImage(properties.image);
  };

  const getTransactionStatus = async (txId: string) => {
    const status = await (
      wallet?.adapter as LeoWalletAdapter
    ).transactionStatus(txId);
    setStatus(status);
  };

  let timeToMint = 0;
  if (height && mintBlock) {
    timeToMint = (mintBlock.block - height) * 15_000; // 15 seconds per block
  }

  let sliderImages = DEFAULT_IMAGES;
  if (nftImage) {
    sliderImages = [nftImage];
  }

  return (
    <>
      <NextSeo
        title="Leo Wallet | Mint NFTs"
        description="Mint an NFT using the Leo Wallet"
      />
      <div className="mx-auto max-w-md px-4 mt-12 pb-14 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 xl:px-10 2xl:px-0">
        <h2 className="mb-14 text-lg font-medium uppercase text-center tracking-wider text-gray-900 dark:text-white sm:mb-10 sm:text-2xl">
          Aleo NFT Maxpia
        </h2>
        {timeToMint > 0 && (
          <div className='flex justify-center mb-6'>
            <MintCountdown date={Date.now() + timeToMint} />
          </div>
        )}
        <ImageSlider images={sliderImages} interval={5000} />
        {data !== undefined && (
          <div className='flex justify-center my-8'>
            <Button
              className="text-xl shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
              size='large'
              disabled={!data.active || !publicKey}
              onClick={() => handleMint()}
            >
                {!publicKey ? 'Connect Your Wallet' : (data.active ? 'MINT NOW' : 'GET READY')}
            </Button>
          </div>
        )}
        {transactionId && (
          <div className='text-white text-center'>
            <div>{`Transaction status: ${status}`}</div>
          </div>
        )}
        {whiteList && publicKey && !transactionId && (
          <div className='text-white text-center'>
            <div>{whiteList.filter((elm: any) => elm.address === publicKey).length > 0 ? `You're on the whitelist!` : `You're not on the whitelist!`}</div>
          </div>
        )}
      </div>
    </>
  );
};

MintPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default MintPage;
