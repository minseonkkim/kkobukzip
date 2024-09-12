import React, { useState, useEffect, useCallback } from "react";
import useDeviceStore from "../../store/useDeviceStore";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { MetaMaskInpageProvider } from "@metamask/providers";
import TurtleTokenAbi from "../../abi/TurtleToken.json";
import { FaArrowRightArrowLeft, FaSpinner } from "react-icons/fa6";

const TURTLE_TOKEN_ABI: AbiItem[] = TurtleTokenAbi.abi as AbiItem[];
const TURTLE_TOKEN_ADDRESS = "0x73b0697A8A69193e5842497Cc010cB1F34A93a0a";
const EXCHANGE_RATE = 5000000; // 1 ETH = 5,000,000 TURT

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

const Wallet: React.FC = () => {
  // 상태 관리
  const isMobile = useDeviceStore((state) => state.isMobile);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<Contract<typeof TURTLE_TOKEN_ABI> | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [fromCurrency, setFromCurrency] = useState<"ETH" | "TURT">("ETH");
  const [toCurrency, setToCurrency] = useState<"ETH" | "TURT">("TURT");
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 모바일 MetaMask 연결 함수
  const connectToMetaMaskMobile = useCallback(() => {
    const dappUrl = process.env.REACT_APP_DAPP_URL;
    if (!dappUrl) {
      setError("dApp URL이 설정되지 않았습니다");
      return;
    }
    const metamaskAppDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
    window.location.href = metamaskAppDeepLink;
  }, []);

  // 계정 변경 처리 함수
  const handleAccountChanged = useCallback((accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount("");
    }
  }, []);

  // 컴포넌트 초기화 및 MetaMask 연결
  useEffect(() => {
    const init = async () => {
      if (isMobile) {
        // 모바일: MetaMask 앱으로 연결 시도
        connectToMetaMaskMobile();
      } else {
        // 데스크톱: MetaMask 브라우저 확장 프로그램 연결
        if (typeof window.ethereum !== "undefined") {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await web3Instance.eth.getAccounts();
            setAccount(accounts[0]);

            const tokenContract = new web3Instance.eth.Contract(TURTLE_TOKEN_ABI as AbiItem[], TURTLE_TOKEN_ADDRESS) as unknown as Contract<typeof TURTLE_TOKEN_ABI>;
            setContract(tokenContract);
          } catch (error) {
            setError("사용자가 계정 접근을 거부했거나 오류가 발생했습니다");
            console.error(error);
          }
        } else {
          setError("MetaMask를 설치해주세요!");
        }
      }
    };

    init();

    // MetaMask 이벤트 리스너 설정
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        handleAccountChanged(accounts as string[]);
      });
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountChanged);
      }
    };
  }, [isMobile, connectToMetaMaskMobile, handleAccountChanged]);

  // 잔액 로드
  useEffect(() => {
    const loadBalances = async () => {
      if (web3 && contract && account) {
        try {
          const turtBalance: number = await contract.methods.balanceOf(account).call();
          setBalance(Web3.utils.fromWei(turtBalance, "ether"));

          const ethBalance: bigint = await web3.eth.getBalance(account);
          setEthBalance(Web3.utils.fromWei(ethBalance, "ether"));
        } catch (error) {
          setError("잔액을 불러오는 중 오류가 발생했습니다");
          console.error(error);
        }
      }
    };

    loadBalances();
  }, [web3, contract, account]);

  // 입력 금액 변경 처리
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value === "") {
      setToAmount("");
    } else {
      const fromValue = parseFloat(value);
      if (!isNaN(fromValue)) {
        if (fromCurrency === "ETH") {
          setToAmount((fromValue * EXCHANGE_RATE).toFixed());
        } else {
          setToAmount((fromValue / EXCHANGE_RATE).toFixed(3));
        }
      } else {
        setToAmount("NaN");
      }
    }
  };

  // 통화 교환
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    handleFromAmountChange(toAmount);
  };

  // TURT 구매
  const handleBuyTurt = async () => {
    if (!web3 || !contract || !account) {
      setError("Web3 또는 계정이 초기화되지 않았습니다");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contract.methods.buyTokens().send({
        from: account,
        value: Web3.utils.toWei(fromAmount, "ether"),
      });

      // 트랜잭션 완료 후 즉시 잔액 업데이트
      if (result.status) {
        const newTurtBalance: number = await contract.methods.balanceOf(account).call();
        const newEthBalance: bigint = await web3.eth.getBalance(account);

        setBalance(Web3.utils.fromWei(newTurtBalance, "ether"));
        setEthBalance(Web3.utils.fromWei(newEthBalance, "ether"));
        setFromAmount("");
        setToAmount("");
      }
    } catch (error) {
      setError("TURT 구매 중 오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // TURT 판매
  const handleSellTurt = async () => {
    if (!web3 || !contract || !account) {
      setError("Web3 또는 계정이 초기화되지 않았습니다");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const turtAmountWei = Web3.utils.toWei(fromAmount, "ether");
      const result = await contract.methods.sellTokens(turtAmountWei).send({ from: account });

      // 트랜잭션 완료 후 즉시 잔액 업데이트
      if (result.status) {
        const newTurtBalance: number = await contract.methods.balanceOf(account).call();
        const newEthBalance: bigint = await web3.eth.getBalance(account);

        setBalance(Web3.utils.fromWei(newTurtBalance, "ether"));
        setEthBalance(Web3.utils.fromWei(newEthBalance, "ether"));
        setFromAmount("");
        setToAmount("");
      }
    } catch (error) {
      setError("TURT 판매 중 오류가 발생했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // // 잔액 업데이트
  // const updateBalances = async () => {
  //   if (web3 && contract && account) {
  //     try {
  //       const newBalance: number = await contract.methods.balanceOf(account).call();
  //       setBalance(Web3.utils.fromWei(newBalance, "ether"));
  //       const newEthBalance = await web3.eth.getBalance(account);
  //       setEthBalance(Web3.utils.fromWei(newEthBalance, "ether"));
  //       setFromAmount("");
  //       setToAmount("");
  //     } catch (error) {
  //       setError("잔액 업데이트 중 오류가 발생했습니다");
  //       console.error(error);
  //     }
  //   }
  // };

  return (
    <div className="bg-yellow-400 text-black p-6 rounded-[10px] w-full max-w-[400px] shadow-md">
      <div className="mt-4 mb-4">
        <div className="truncate">
          <span className="font-semibold">활성 지갑 주소 |</span> {account || "연결되지 않음"}
        </div>
        <div>
          <span className="font-semibold">보유 ETH |</span> {parseFloat(ethBalance).toFixed(4)} ETH
        </div>
        <div>
          <span className="font-semibold">보유 TURT |</span> {parseFloat(balance).toFixed()} TURT
        </div>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {account ? (
        <>
          <div className="flex space-x-2 mb-4">
            <div className="relative flex-1">
              <input type="number" value={fromAmount} onChange={(e) => handleFromAmountChange(e.target.value)} step={fromCurrency === "ETH" ? "0.001" : "1"} min="0" className="w-full p-2 pr-16 border-2 border-yellow-600 rounded bg-white focus:outline-none focus:ring-4 focus:ring-yellow-300" placeholder="0" />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 font-semibold">{fromCurrency}</span>
            </div>
            <button onClick={handleSwap} className="self-center p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
              <FaArrowRightArrowLeft />
            </button>
            <div className="relative flex-1">
              <input type="text" value={toAmount} readOnly className="w-full p-2 pr-16 border-2 border-gray-300 rounded bg-slate-200 focus:outline-none" placeholder="0" />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 font-semibold">{toCurrency}</span>
            </div>
          </div>
          <button onClick={fromCurrency === "ETH" ? handleBuyTurt : handleSellTurt} className={`w-full bg-white text-black py-2 px-4 rounded transition duration-200 font-semibold ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:ring-4 hover:ring-yellow-300"}`} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                처리 중... 잠시만 기다려 주세요!
              </span>
            ) : (
              "환전하기"
            )}
          </button>
        </>
      ) : (
        <button onClick={isMobile ? connectToMetaMaskMobile : () => {}} className="w-full bg-white text-black py-2 px-4 rounded transition duration-200 font-semibold hover:ring-4 hover:ring-yellow-300">
          {isMobile ? "MetaMask 연결" : "MetaMask 설치 필요"}
        </button>
      )}
    </div>
  );
};

export default Wallet;
