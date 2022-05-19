import './App.css';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

const provider = new ethers.providers.JsonRpcProvider(
  'http://127.0.0.1:8545'
);

const lendingPoolProviderABI = require('./ABI/LendingPoolProvider.json');
const lendingPoolProviderAddress =
  '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5';

const LendingPoolABI = require('./ABI/LendingPool.json');

const DAIABI = require('./ABI/dai-abi.json');
const DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

const aDAIABI = require('./ABI/aDAI.json');
const aDAIAddress = '0x028171bCA77440897B824Ca71D1c56caC55b68A3';

const cDAIABI = require('./ABI/cDAI.json');
const cDAIAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643';

const curveABI = require('./ABI/curveABI.json');
const curveAddress = '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7';

const CRV3ABI = require('./ABI/CRV3ABI.json');
const CRV3Address = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490';

function App() {
  const [userAccount, setuserAccount] = useState('');

  const [userDAIBalance, setuserDAIBalance] = useState(0);
  const [useraDAIBalance, setuseraDAIBalance] = useState(0);
  const [usercDAIBalance, setusercDAIBalance] = useState(0);
  const [userCRV3Balance, setuserCRV3Balance] = useState(0);

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

      setInterval(async () => {
        for (let i = 0; i <= 25; i++) {
          await provider.send('evm_mine');
        }

        await getBalances();
      }, 10000);
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

    const CRV3TokenContract = new ethers.Contract(
      CRV3Address,
      CRV3ABI,
      provider
    );

    const userDAIBalance = await DAITokenContract.balanceOf(
      accounts[0]
    );
    setuserDAIBalance(ethers.utils.formatUnits(userDAIBalance, 18));

    const useraDAIBalance = await aDAITokenContract.balanceOf(
      accounts[0]
    );
    setuseraDAIBalance(ethers.utils.formatUnits(useraDAIBalance, 18));

    const usercDAIBalance = await cDAITokenContract.balanceOf(
      accounts[0]
    );
    setusercDAIBalance(ethers.utils.formatUnits(usercDAIBalance, 18));

    const userCRV3Balance = await CRV3TokenContract.balanceOf(
      accounts[0]
    );
    setuserCRV3Balance(ethers.utils.formatUnits(userCRV3Balance, 18));

    const blockNumber = await provider.getBlockNumber();
    setBlockNumber(blockNumber);
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

  async function depositInComp() {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );
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

    const amountToDepositInWei = ethers.utils.parseEther(
      amountToDeposit.toString()
    );

    const approveTX = await DAITokenContract.approve(
      cDAITokenContract.address,
      amountToDepositInWei
    );
    await approveTX.wait(1);

    const depositTX = await cDAITokenContract.mint(
      amountToDepositInWei
    );
    await depositTX.wait(1);

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

    const cDAITokenContract = new ethers.Contract(
      cDAIAddress,
      cDAIABI,
      signer
    );

    const balance = await cDAITokenContract.balanceOf(accounts[0]);

    const withTX = await cDAITokenContract.redeem(balance);
    await withTX.wait(1);

    await getBalances();
  }

  const depositInCurve = async () => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum
    );

    const signer = provider.getSigner();

    const curve3PoolsContract = new ethers.Contract(
      curveAddress,
      curveABI,
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

    setamountToDeposit(0);

    await getBalances();
  };

  const withdrawInCurve = async () => {
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

    const userCRV3Balance = await CRV3TokenContract.balanceOf(
      accounts[0]
    );

    const withTX =
      await curve3PoolsContract.remove_liquidity_one_coin(
        userCRV3Balance,
        0,
        userCRV3Balance
      );
    await withTX.wait(1);

    setamountToDeposit(0);

    await getBalances();
  };

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
          }}
        >
          DAI WALLET BALANCE : {Number(userDAIBalance).toFixed(10)}
        </div>

        <div
          style={{
            backgroundColor: '#BDBDBD',
            width: '1000px',
            height: '450px',
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
              height: '400px',
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
              Withdraw
            </button>
            <text
              style={{
                marginTop: '25px',
                fontSize: '20px',
                fontWeight: 50,
              }}
            >
              user aDAI balance : {Number(useraDAIBalance).toFixed(5)}
            </text>
          </div>

          <div
            style={{
              backgroundColor: '#282c34',
              width: '300px',
              height: '400px',
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
              Withdraw
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
          </div>
          <div
            style={{
              backgroundColor: '#282c34',
              width: '300px',
              height: '400px',
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
              Deposit To CURVE
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
              onClick={() => withdrawInCurve()}
            >
              Withdraw
            </button>
            <text
              style={{
                marginTop: '25px',
                fontSize: '20px',
                fontWeight: 50,
              }}
            >
              user 3CRV balance : {Number(userCRV3Balance).toFixed(3)}
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
          BlockNumber : {blockNumber}
        </text>
      </header>
    </div>
  );
}

export default App;
