import './App.css';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

const provider = new ethers.providers.JsonRpcProvider(
  'http://127.0.0.1:8545'
);

const DAIABI = require('./ABI/dai-abi.json');
const DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

const lendingPoolProviderABI = require('./ABI/LendingPoolProvider.json');
const lendingPoolProviderAddress =
  '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5';

const LendingPoolABI = require('./ABI/LendingPool.json');

const aDAIABI = require('./ABI/aDAI.json');
const aDAIAddress = '0x028171bCA77440897B824Ca71D1c56caC55b68A3';

const COMPABI = require('./ABI/compABI.json');
const COMPAddress = '0xc00e94cb662c3520282e6f5717214004a7f26888';

const cDAIABI = require('./ABI/cDAI.json');
const cDAIAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643';

const ComptrollerABI = require('./ABI/Comptroller.json');
const ComptrollerAddress =
  '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';

const AAVEControllerABI = require('./ABI/ControllerABI.json');
const AAVEControllerAddress =
  '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5';

const curveABI = require('./ABI/curveABI.json');
const curveAddress = '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7';

const CRV3ABI = require('./ABI/CRV3ABI.json');
const CRV3Address = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490';

const convexBoosterABI = require('./ABI/convexBoosterABI.json');
const convexBoosterAddress =
  '0xF403C135812408BFbE8713b5A23a04b3D48AAE31';

const convexBaseRewardPoolABI = require('./ABI/BaseRewardPool.json');
const convexBaseRewardPoolAddress =
  '0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8';

function App() {
  const [userAccount, setuserAccount] = useState('');

  const [userDAIBalance, setuserDAIBalance] = useState(0);

  const [usercDAIBalance, setusercDAIBalance] = useState(0);
  const [userCompTokenBalance, setuserCompTokenBalance] = useState(0);

  const [useraDAIBalance, setuseraDAIBalance] = useState(0);
  const [aavePendingRewards, setaavePendingRewards] = useState(0);

  const [userCRV3Balance, setuserCRV3Balance] = useState(0);
  const [convexPendingRewards, setconvexPendingRewards] = useState(0);

  const [blockNumber, setBlockNumber] = useState('');

  const [amountToDeposit, setamountToDeposit] = useState(0);

  useEffect(() => {
    LoadAndCreate();
  });

  async function LoadAndCreate() {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setuserAccount(accounts[0].toString());

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      window.ethereum.on(
        'accountsChanged',
        async function (accounts) {
          setuserAccount(accounts[0].toString());
          await LoadAndCreate();
        }
      );

      await getBalances();
    }
  }

  async function requestAccounts() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function getBalances() {
    await requestAccounts();
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const DAITokenContract = new ethers.Contract(
      DAIAddress,
      DAIABI,
      provider
    );

    const aDAITokenContract = new ethers.Contract(
      aDAIAddress,
      aDAIABI,
      provider
    );

    const cDAITokenContract = new ethers.Contract(
      cDAIAddress,
      cDAIABI,
      provider
    );

    const COMPTokenContract = new ethers.Contract(
      COMPAddress,
      COMPABI,
      provider
    );

    const AAVEControllerContract = new ethers.Contract(
      AAVEControllerAddress,
      AAVEControllerABI,
      provider
    );

    const convexRewardManagerContract = new ethers.Contract(
      convexBaseRewardPoolAddress,
      convexBaseRewardPoolABI,
      provider
    );

    const userDAIBalance = await DAITokenContract.balanceOf(
      accounts[0]
    );
    setuserDAIBalance(ethers.utils.formatUnits(userDAIBalance, 18));

    const usercDAIBalance = await cDAITokenContract.balanceOf(
      accounts[0]
    );
    setusercDAIBalance(ethers.utils.formatUnits(usercDAIBalance, 18));

    const userCompTokenBalance = await COMPTokenContract.balanceOf(
      accounts[0]
    );
    setuserCompTokenBalance(
      ethers.utils.formatUnits(userCompTokenBalance, 18)
    );

    const useraDAIBalance = await aDAITokenContract.balanceOf(
      accounts[0]
    );
    setuseraDAIBalance(ethers.utils.formatUnits(useraDAIBalance, 18));

    const aavePendingRewards =
      await AAVEControllerContract.getRewardsBalance(
        [aDAITokenContract.address],
        accounts[0]
      );

    setaavePendingRewards(
      ethers.utils.formatUnits(aavePendingRewards, 18)
    );

    const convexPendingRewards =
      await convexRewardManagerContract.earned(accounts[0]);
    setconvexPendingRewards(
      ethers.utils.formatUnits(convexPendingRewards, 18)
    );

    const userCRV3Balance =
      await convexRewardManagerContract.balanceOf(accounts[0]);

    setuserCRV3Balance(ethers.utils.formatUnits(userCRV3Balance, 18));

    const blockNumber = await provider.getBlockNumber();
    setBlockNumber(blockNumber);
  }

  async function depositInComp() {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const signer = provider.getSigner();

    const DAITokenContract = new ethers.Contract(
      DAIAddress,
      DAIABI,
      signer
    );

    const cDAITokenContract = new ethers.Contract(
      cDAIAddress,
      cDAIABI,
      signer
    );

    const ComptrollerContract = new ethers.Contract(
      ComptrollerAddress,
      ComptrollerABI,
      signer
    );

    const amountToDepositInWei = ethers.utils.parseEther(
      amountToDeposit.toString()
    );

    // mint CDAI approve token
    const cDAIApproveTX = await DAITokenContract.approve(
      cDAITokenContract.address,
      amountToDepositInWei
    );
    await cDAIApproveTX.wait(1);

    // mint CDAI token
    const minntCDAITokenTX = await cDAITokenContract.mint(
      amountToDepositInWei
    );
    await minntCDAITokenTX.wait(1);

    // get cdai balance
    const cDAIBalance = await cDAITokenContract.balanceOf(
      accounts[0]
    );

    // approve to Comptroller
    const ComptrollerApproveTX = await cDAITokenContract.approve(
      ComptrollerContract.address,
      cDAIBalance
    );
    await ComptrollerApproveTX.wait(1);

    // deposit to Comptroller
    const depositComptrollerTX =
      await ComptrollerContract.enterMarkets([
        cDAITokenContract.address,
      ]);
    await depositComptrollerTX.wait(1);

    const getAssetsIn = await ComptrollerContract.getAssetsIn(
      accounts[0]
    );

    console.log(getAssetsIn);

    setamountToDeposit(0);

    await getBalances();
  }

  async function withdrawComp() {
    await requestAccounts();
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );
    const signer = provider.getSigner();

    const ComptrollerContract = new ethers.Contract(
      ComptrollerAddress,
      ComptrollerABI,
      signer
    );

    const cDAITokenContract = new ethers.Contract(
      cDAIAddress,
      cDAIABI,
      signer
    );

    const ComptrollerexitMarket =
      await ComptrollerContract.exitMarket(cDAITokenContract.address);

    await ComptrollerexitMarket.wait(1);

    const balance = await cDAITokenContract.balanceOf(accounts[0]);

    const withTX = await cDAITokenContract.redeem(balance);
    await withTX.wait(1);

    await getBalances();
  }

  async function withdrawCompToken() {
    await requestAccounts();
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );
    const signer = provider.getSigner();

    const COMPTokenContract = new ethers.Contract(
      COMPAddress,
      COMPABI,
      signer
    );

    const ComptrollerContract = new ethers.Contract(
      ComptrollerAddress,
      ComptrollerABI,
      signer
    );

    const COMPWithdrawTX = await ComptrollerContract[
      'claimComp(address)'
    ](accounts[0]);
    await COMPWithdrawTX.wait(1);

    const compBalance = await COMPTokenContract.balanceOf(
      accounts[0]
    );
    console.log(compBalance.toString());

    // const cDAITokenContract = new ethers.Contract(
    //   cDAIAddress,
    //   cDAIABI,
    //   signer
    // );

    // const balance = await cDAITokenContract.balanceOf(accounts[0]);

    // const withTX = await cDAITokenContract.redeem(balance);
    // await withTX.wait(1);

    await getBalances();
  }

  async function depositInAAve() {
    await requestAccounts();
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );
    const signer = provider.getSigner();

    const lendingPoolProviderContract = new ethers.Contract(
      lendingPoolProviderAddress,
      lendingPoolProviderABI,
      signer
    );

    const lendingPoolAddress =
      await lendingPoolProviderContract.getLendingPool();

    const lendingPoolContract = new ethers.Contract(
      lendingPoolAddress,
      LendingPoolABI,
      signer
    );

    const DAITokenContract = new ethers.Contract(
      DAIAddress,
      DAIABI,
      signer
    );

    const amountToDepositInWei = ethers.utils.parseEther(
      amountToDeposit.toString()
    );

    const approveTX = await DAITokenContract.approve(
      lendingPoolAddress,
      amountToDepositInWei
    );
    await approveTX.wait(1);

    const depositTX = await lendingPoolContract.deposit(
      DAITokenContract.address,
      amountToDepositInWei,
      accounts[0],
      0
    );
    await depositTX.wait(1);

    setamountToDeposit(0);

    await getBalances();
  }

  async function withdrawFromAave() {
    await requestAccounts();
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );
    const signer = provider.getSigner();

    const lendingPoolProviderContract = new ethers.Contract(
      lendingPoolProviderAddress,
      lendingPoolProviderABI,
      signer
    );

    const lendingPoolAddress =
      await lendingPoolProviderContract.getLendingPool();

    const lendingPoolContract = new ethers.Contract(
      lendingPoolAddress,
      LendingPoolABI,
      signer
    );

    const DAITokenContract = new ethers.Contract(
      DAIAddress,
      DAIABI,
      signer
    );

    const aDAITokenContract = new ethers.Contract(
      aDAIAddress,
      aDAIABI,
      signer
    );

    const useraDAIBalance = await aDAITokenContract.balanceOf(
      accounts[0]
    );

    const withTX = await lendingPoolContract.withdraw(
      DAITokenContract.address,
      useraDAIBalance,
      accounts[0]
    );
    await withTX.wait(1);

    await getBalances();
  }

  async function AAVEclaimRewards() {
    await requestAccounts();
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );
    const signer = provider.getSigner();

    const AAVEControllerContract = new ethers.Contract(
      AAVEControllerAddress,
      AAVEControllerABI,
      signer
    );

    const aavePendingRewards =
      await AAVEControllerContract.getRewardsBalance(
        [aDAIAddress],
        accounts[0]
      );

    const claimRewardsTX = await AAVEControllerContract.claimRewards(
      [aDAIAddress],
      aavePendingRewards,
      accounts[0]
    );
    await claimRewardsTX.wait(1);

    await getBalances();
  }

  const depositInCurve = async () => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const signer = provider.getSigner();

    const curve3PoolsContract = new ethers.Contract(
      curveAddress,
      curveABI,
      signer
    );

    const convexBoosterContract = new ethers.Contract(
      convexBoosterAddress,
      convexBoosterABI,
      signer
    );

    const CRV3TokenContract = new ethers.Contract(
      CRV3Address,
      CRV3ABI,
      signer
    );

    const DAITokenContract = new ethers.Contract(
      DAIAddress,
      DAIABI,
      signer
    );

    const amountToDepositInWei = ethers.utils.parseEther(
      amountToDeposit.toString()
    );

    const approveTX = await DAITokenContract.approve(
      curve3PoolsContract.address,
      amountToDepositInWei
    );
    await approveTX.wait(1);

    const depositTX = await curve3PoolsContract.add_liquidity(
      [amountToDepositInWei, 0, 0],
      0
    );
    await depositTX.wait(1);

    const curve3TokenBalance = await CRV3TokenContract.balanceOf(
      accounts[0]
    );

    await CRV3TokenContract.approve(
      convexBoosterContract.address,
      curve3TokenBalance
    );

    const convexDepositTX = await convexBoosterContract.depositAll(
      9,
      true
    );
    await convexDepositTX.wait(1);

    setamountToDeposit(0);

    await getBalances();
  };

  const withdrawMoneyFromCurve = async () => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const signer = provider.getSigner();

    const curve3PoolsContract = new ethers.Contract(
      curveAddress,
      curveABI,
      signer
    );

    const CRV3TokenContract = new ethers.Contract(
      CRV3Address,
      CRV3ABI,
      signer
    );

    const convexBoosterContract = new ethers.Contract(
      convexBoosterAddress,
      convexBoosterABI,
      signer
    );

    const convexRewardManagerContract = new ethers.Contract(
      convexBaseRewardPoolAddress,
      convexBaseRewardPoolABI,
      signer
    );

    const wFromConvexRewardManagerTX =
      await convexRewardManagerContract.withdrawAll(true);
    await wFromConvexRewardManagerTX.wait(1);

    const wFromConvexBoosterTX =
      await convexBoosterContract.withdrawAll(9);
    await wFromConvexBoosterTX.wait(1);

    const curve3TokenBalance = await CRV3TokenContract.balanceOf(
      accounts[0]
    );

    const withTX =
      await curve3PoolsContract.remove_liquidity_one_coin(
        curve3TokenBalance,
        0,
        curve3TokenBalance
      );
    await withTX.wait(1);

    await getBalances();
  };

  const withdrawPnedingRewards = async () => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const signer = provider.getSigner();

    const convexRewardManagerContract = new ethers.Contract(
      convexBaseRewardPoolAddress,
      convexBaseRewardPoolABI,
      signer
    );

    const claimAllRewards = await convexRewardManagerContract[
      'getReward()'
    ]();
    await claimAllRewards.wait(1);

    const curveTokenContract = new ethers.Contract(
      '0xd533a949740bb3306d119cc777fa900ba034cd52',
      require('./ABI/curveTokenABI.json'),
      signer
    );

    console.log(
      'your CURVE token balance is :',
      (await curveTokenContract.balanceOf(accounts[0])).toString()
    );

    setamountToDeposit(0);

    await getBalances();
  };

  async function mine10Blocks() {
    for (let i = 0; i <= 3; i++) {
      await provider.send('evm_mine');
    }

    await getBalances();
  }

  return (
    <div className="App">
      <header className="App-header">
        <div
          style={{
            marginBottom: '25px',
            fontSize: '25px',
            fontWeight: 50,
          }}
        >
          {userAccount}
        </div>

        <div
          style={{
            marginBottom: '25px',
            fontSize: '25px',
            fontWeight: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          DAI WALLET BALANCE : {Number(userDAIBalance).toFixed(10)}
          <button onClick={() => mine10Blocks()}>
            Mine New Blocks
          </button>
        </div>
        <div
          style={{
            backgroundColor: '#BDBDBD',
            width: '1000px',
            height: '500px',
            borderRadius: '5px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '10px',
          }}
        >
          <div
            style={{
              backgroundColor: '#282c34',
              width: '300px',
              height: '450px',
              borderRadius: '5px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px',
              border: '1px solid rgb(37, 49, 60)',
            }}
          >
            <text
              style={{
                fontSize: '55px',
                fontWeight: '100px',
                marginBottom: '10px',
              }}
            >
              AAVE
            </text>
            <text
              style={{
                fontSize: '15px',
                fontWeight: '100px',
                marginBottom: '20px',
              }}
            >
              deposit DAI in AAVE and earn income
            </text>
            <input
              type="number"
              value={amountToDeposit}
              style={{
                width: '250px',
                height: '30px',
                borderRadius: '5px',
                color: 'white',
                backgroundColor: '#2a3236',
                borderColor: '#2a3236',
                border: '0px none',
                opacity: 1,
              }}
              onChange={(e) =>
                setamountToDeposit(Number(e.target.value))
              }
            ></input>
            <button
              style={{
                marginTop: '25px',
                width: '250px',
                height: '35px',
                borderRadius: '5px',
                color: 'white',
                borderColor: '#2a3236',
                border: '0px none',
                backgroundColor: 'rgb(50, 153, 188)',
                fontWeight: 50,
              }}
              onClick={() => depositInAAve()}
            >
              Deposit To AAVE
            </button>
            <button
              style={{
                marginTop: '25px',
                width: '250px',
                height: '35px',
                borderRadius: '5px',
                color: 'white',
                borderColor: '#2a3236',
                border: '0px none',
                backgroundColor: 'rgb(50, 153, 188)',
                fontWeight: 50,
              }}
              onClick={() => withdrawFromAave()}
            >
              Withdraw From AAVE
            </button>
            <button
              style={{
                marginTop: '25px',
                width: '250px',
                height: '35px',
                borderRadius: '5px',
                color: 'white',
                borderColor: '#2a3236',
                border: '0px none',
                backgroundColor: 'rgb(50, 153, 188)',
                fontWeight: 50,
              }}
              onClick={() => AAVEclaimRewards()}
            >
              Withdraw Pending Rewards
            </button>
            <text
              style={{
                marginTop: '25px',
                fontSize: '20px',
                fontWeight: 50,
              }}
            >
              user aDAI balance : {Number(useraDAIBalance).toFixed(7)}
            </text>
            <text
              style={{
                marginTop: '25px',
                fontSize: '20px',
                fontWeight: 50,
              }}
            >
              user Pending Rewards :{' '}
              {Number(aavePendingRewards).toFixed(7)}
            </text>
          </div>
          <div
            style={{
              backgroundColor: '#282c34',
              width: '300px',
              height: '450px',
              borderRadius: '5px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px',
              border: '1px solid rgb(37, 49, 60)',
            }}
          >
            <text
              style={{
                fontSize: '55px',
                fontWeight: '100px',
                marginBottom: '10px',
              }}
            >
              Compound
            </text>
            <text
              style={{
                fontSize: '15px',
                fontWeight: '100px',
                marginBottom: '20px',
              }}
            >
              deposit DAI in Compound and earn income
            </text>
            <input
              type="number"
              value={amountToDeposit}
              style={{
                width: '250px',
                height: '30px',
                borderRadius: '5px',
                color: 'white',
                backgroundColor: '#2a3236',
                borderColor: '#2a3236',
                border: '0px none',
                opacity: 1,
              }}
              onChange={(e) =>
                setamountToDeposit(Number(e.target.value))
              }
            ></input>
            <button
              style={{
                marginTop: '25px',
                width: '250px',
                height: '35px',
                borderRadius: '5px',
                color: 'white',
                borderColor: '#2a3236',
                border: '0px none',
                backgroundColor: 'rgb(50, 153, 188)',
                fontWeight: 50,
              }}
              onClick={() => depositInComp()}
            >
              Deposit To Compound
            </button>
            <button
              style={{
                marginTop: '25px',
                width: '250px',
                height: '35px',
                borderRadius: '5px',
                color: 'white',
                borderColor: '#2a3236',
                border: '0px none',
                backgroundColor: 'rgb(50, 153, 188)',
                fontWeight: 50,
              }}
              onClick={() => withdrawComp()}
            >
              Withdraw From Compound
            </button>
            <button
              style={{
                marginTop: '25px',
                width: '250px',
                height: '35px',
                borderRadius: '5px',
                color: 'white',
                borderColor: '#2a3236',
                border: '0px none',
                backgroundColor: 'rgb(50, 153, 188)',
                fontWeight: 50,
              }}
              onClick={() => withdrawCompToken()}
            >
              Withdraw COMP Token
            </button>
            <text
              style={{
                marginTop: '25px',
                fontSize: '20px',
                fontWeight: 50,
              }}
            >
              user cDAI balance : {Number(usercDAIBalance).toFixed(5)}
            </text>

            <text
              style={{
                marginTop: '25px',
                fontSize: '20px',
                fontWeight: 50,
              }}
            >
              user COMP balance :{' '}
              {Number(userCompTokenBalance).toFixed(5)}
            </text>
          </div>
          <div
            style={{
              backgroundColor: '#282c34',
              width: '300px',
              height: '450px',
              borderRadius: '5px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px',
              border: '1px solid rgb(37, 49, 60)',
            }}
          >
            <text
              style={{
                fontSize: '55px',
                fontWeight: '100px',
                marginBottom: '10px',
              }}
            >
              CURVE
            </text>
            <text
              style={{
                fontSize: '15px',
                fontWeight: '100px',
                marginBottom: '20px',
              }}
            >
              deposit DAI in CURVE and earn income
            </text>
            <input
              type="number"
              value={amountToDeposit}
              style={{
                width: '250px',
                height: '30px',
                borderRadius: '5px',
                color: 'white',
                backgroundColor: '#2a3236',
                borderColor: '#2a3236',
                border: '0px none',
                opacity: 1,
              }}
              onChange={(e) =>
                setamountToDeposit(Number(e.target.value))
              }
            ></input>
            <button
              style={{
                marginTop: '25px',
                width: '250px',
                height: '35px',
                borderRadius: '5px',
                color: 'white',
                borderColor: '#2a3236',
                border: '0px none',
                backgroundColor: 'rgb(50, 153, 188)',
                fontWeight: 50,
              }}
              onClick={() => depositInCurve()}
            >
              Deposit To CURV ==> Convex
            </button>
            <button
              style={{
                marginTop: '25px',
                width: '250px',
                height: '35px',
                borderRadius: '5px',
                color: 'white',
                borderColor: '#2a3236',
                border: '0px none',
                backgroundColor: 'rgb(50, 153, 188)',
                fontWeight: 50,
              }}
              onClick={() => withdrawMoneyFromCurve()}
            >
              Withdraw From convex ==> CURVE
            </button>
            <button
              style={{
                marginTop: '25px',
                width: '250px',
                height: '35px',
                borderRadius: '5px',
                color: 'white',
                borderColor: '#2a3236',
                border: '0px none',
                backgroundColor: 'rgb(50, 153, 188)',
                fontWeight: 50,
              }}
              onClick={() => withdrawPnedingRewards()}
            >
              Withdraw Pending Rewards
            </button>
            <text
              style={{
                marginTop: '25px',
                fontSize: '20px',
                fontWeight: 50,
              }}
            >
              user 3CRV balance : {Number(userCRV3Balance).toFixed(7)}
            </text>
            <text
              style={{
                marginTop: '25px',
                fontSize: '20px',
                fontWeight: 50,
              }}
            >
              Pending Rewards:{' '}
              {Number(convexPendingRewards).toFixed(7)}
            </text>
          </div>
        </div>
        <text
          style={{
            marginTop: '25px',
            fontSize: '25px',
            fontWeight: 50,
          }}
        >
          {' '}
          BlockNumber : {blockNumber}
        </text>
      </header>
    </div>
  );
}

export default App;
