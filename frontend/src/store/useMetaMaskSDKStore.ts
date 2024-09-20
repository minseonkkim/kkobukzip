import { create } from "zustand";
import { MetaMaskSDK, MetaMaskSDKOptions } from "@metamask/sdk";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import TurtleTokenAbi from "../abi/TurtleToken.json";

const TURTLE_TOKEN_ABI: AbiItem[] = TurtleTokenAbi.abi as AbiItem[];
const TURTLE_TOKEN_ADDRESS = "0x73b0697A8A69193e5842497Cc010cB1F34A93a0a";

interface MetaMaskSDKState {
  MMSDK: MetaMaskSDK | null;
  web3: Web3 | null;
  account: string;
  contract: Contract<typeof TURTLE_TOKEN_ABI> | null;
  error: string | null;
  isInitialized: boolean;
  isMobile: boolean;
  initializeSDK: () => Promise<void>;
  connectWallet: () => Promise<void>;
  handleAccountsChanged: (accounts: string[]) => void;
  checkAndPromptForMetaMask: () => Promise<boolean>;
}

export const useMetaMaskSDKStore = create<MetaMaskSDKState>((set, get) => ({
  MMSDK: null,
  web3: null,
  account: "",
  contract: null,
  error: null,
  isInitialized: false,
  // 모바일 기기 감지
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

  // MetaMask SDK 초기화 함수
  initializeSDK: async () => {
    if (get().isInitialized) return;

    try {
      // SDK 옵션 설정
      const options: MetaMaskSDKOptions = {
        dappMetadata: {
          name: "KkobukZIP",
          url: window.location.href,
        },
        checkInstallationImmediately: false,
        openDeeplink: (link: string) => {
          window.open(link, "_self");
        },
      };

      // SDK 인스턴스 생성 및 초기화
      const MMSDK = new MetaMaskSDK(options);
      await MMSDK.init();

      // 초기화 성공 시 상태 업데이트
      set({ MMSDK, isInitialized: true, error: null });
    } catch (error) {
      console.error("MetaMask SDK 초기화 실패:", error);
      set({ error: "MetaMask 초기화에 실패했습니다. 잠시 후 다시 시도해주세요." });
    }
  },

  // 지갑 연결 함수
  connectWallet: async () => {
    const { MMSDK, isInitialized, isMobile } = get();
    // SDK가 초기화되지 않은 경우 초기화 시도
    if (!MMSDK || !isInitialized) {
      try {
        await get().initializeSDK();
      } catch {
        set({ error: "MetaMask SDK 초기화에 실패했습니다. 잠시 후 다시 시도해주세요." });
        return;
      }
    }

    try {
      // 모바일인 경우 MetaMask 설치 확인
      if (isMobile) {
        const isMetaMaskInstalled = await get().checkAndPromptForMetaMask();
        if (!isMetaMaskInstalled) return;
      }

      // 프로바이더 가져오기
      const provider = await MMSDK!.getProvider();
      if (!provider) {
        throw new Error("MetaMask 프로바이더를 가져올 수 없습니다.");
      }

      // Web3 인스턴스 및 컨트랙트 생성
      const web3Instance = new Web3(provider);
      const tokenContract = new web3Instance.eth.Contract(
        TURTLE_TOKEN_ABI,
        TURTLE_TOKEN_ADDRESS
      ) as unknown as Contract<typeof TURTLE_TOKEN_ABI>;

      // 계정 연결
      const accounts = await MMSDK!.connect();
      if (accounts && accounts.length > 0) {
        // 연결 성공 시 상태 업데이트
        set({ 
          web3: web3Instance,
          contract: tokenContract,
          account: accounts[0], 
          error: null 
        });

        // 계정 변경 이벤트 리스너 설정
        provider.on('accountsChanged', (...args: unknown[]) => {
          const changedAccounts = args[0] as string[];
          get().handleAccountsChanged(changedAccounts);
        });
      } else {
        throw new Error("연결된 계정이 없습니다.");
      }
    } catch (error) {
      console.error("지갑 연결 실패:", error);
      set({ error: "지갑 연결에 실패했습니다. MetaMask가 설치되어 있고 올바르게 설정되어 있는지 확인해주세요." });
    }
  },

  // 계정 변경 처리 함수
  handleAccountsChanged: (accounts: string[]) => {
    if (accounts.length === 0) {
      set({ account: "", error: "MetaMask가 잠겨있거나 계정이 연결되지 않았습니다." });
    } else if (accounts[0] !== get().account) {
      set({ account: accounts[0], error: null });
    }
  },

  // MetaMask 설치 확인 및 설치 안내 함수
  checkAndPromptForMetaMask: async () => {
    const { MMSDK } = get();
    if (!MMSDK) return false;

    try {
      // MetaMask 설치 여부 확인
      const provider = await MMSDK.getProvider();
      const isMetaMaskInstalled = !!provider;

      if (!isMetaMaskInstalled) {
        // MetaMask 미설치 시 설치 안내
        const confirmed = window.confirm("MetaMask가 설치되어 있지 않습니다. 앱 스토어로 이동하여 설치하시겠습니까?");
        if (confirmed) {
          window.open("https://metamask.io/download/", "_blank");
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error("MetaMask 설치 확인 실패:", error);
      set({ error: "MetaMask 설치 확인에 실패했습니다. 잠시 후 다시 시도해주세요." });
      return false;
    }
  },
}));