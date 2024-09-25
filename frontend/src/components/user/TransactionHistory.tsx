import { useEffect, useState } from "react";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";
import TmpTurtleImg from "../../assets/tmp_turtle.jpg";
import BabyTurtleImg from "../../assets/babyturtle.png";
import { IoCheckmark } from "react-icons/io5";

interface TransactionHistoryProps {
    sellerAddress?: string;
    amount?: number;
    // transactionId: string;
    // status: string;
}

// 컨트랙트 ABI 타입
const CONTRACT_ABI: AbiItem[] = [];
const CONTRACT_ADDRESS = "추후에 추가";

export default function TransactionHistory(props: TransactionHistoryProps){
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [contract, setContract] = useState<Contract<AbiItem[]> | null>(null);
    const [account, setAccount] = useState<string | null>(null);

    console.log(props) // 에러(빨간 줄) 방지용 임시 코드!!!!!!!!!!!!!
    
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    await window.ethereum.request({ method: "eth_requestAccounts" })
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    setWeb3(web3Instance);

                    const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                    setContract(contractInstance);
                } catch (error) {
                    console.error("User denied account access!! => ", error);
                }
            } else {
                console.log("Non-Ethereum browser detected. You should consider trying MetaMask!")
            }
        }

        initWeb3();
    }, [])

    const handleDeposit = async (sellerAddress: string, amount: number) => {
        if (!contract || !account || !web3) return;

        try {
            const transactionId = await contract.methods.createTransaction(sellerAddress, amount).send({ from: account });
            console.log("Transaction created and successfully deposited!!");

            await contract.methods.lockFunds(transactionId).send({ from: account })
            console.log("Funds locked successfully!");
        } catch (error) {
            console.error("Error depositing: ", error);
        }
    }

    const startPapework = async () => {
        // 서류 페이지로 넘어가는 로직
        // 여기에 구매자(양수인), 판매자(양도인) 여부에 따라 네비게이트하는 로직 구체화하여 코드 작성해야 할듯
    }

    const finalizeTransaction = async (transactionId: string) => {
        if (!contract || !account) return;

        try {
            await contract.methods.finalizeTransaction(transactionId).send({ from: account });
            console.log("Transaction finalized successfully!");
        } catch (error) {
            console.error("Error in finalizeTransaction: ", error)
        }
    }

    return <>
        <div className="w-full h-[180px] border-[2px] rounded-[20px] my-[12px] p-[15px] bg-[#f8f8f8] flex flex-row">
            <img src={TmpTurtleImg} className="w-[200px] h-[150px] rounded-[10px] object-cover" draggable="false"/>
            <div className="flex flex-col justify-between w-[420px] ml-[20px]">
                <div>
                    <div>분양자 정보</div>
                    <div>태그</div>
                    <div>가격</div>
                </div>
                {/* 아래 버튼은 거래 진행 상황에 따라 on/off하기! */}
                <div>
                    {/* 경매 거래인 경우에만 활성화 해당(입금 대기 상태일 때) */}
                    <button className="w-24 h-10 bg-[#D8F1D5] rounded-[10px] hover:bg-[#CAEAC6]" onClick={() => {handleDeposit("판매자 지갑 주소", 100)}}>입금하기</button>
                    {/* 예약 단계에 활성화 */}
                    <button className="w-24 h-10 bg-[#D8F1D5] rounded-[10px] hover:bg-[#CAEAC6]" onClick={()=>{startPapework()}}>서류 작성</button>
                    {/* 서류 검토 */}
                    <button className="w-24 h-10 bg-[#D8F1D5] rounded-[10px] hover:bg-[#CAEAC6]" onClick={()=>{finalizeTransaction("임시 트랜잭션 아이디")}}>구매 확정</button>
                </div>
            </div>
            <div>
            <div className="w-[510px] h-[104px] relative mt-[18px]">
                <div className="w-[460px] h-[0px] left-[24px] top-[71px] absolute border-[1.4px] border-gray-400"></div>
                
                <div className="left-0 top-0 absolute text-center text-black text-xl font-[15px]">입금대기</div>
                {/* 입금대기-완료 */}
                <div className="w-[37px] h-[37px] left-[8px] top-[53px] absolute bg-[#e7f6d1] rounded-full border border-black" />
                <div className="w-[25px] h-[29px] left-[14px] top-[57px] absolute"><IoCheckmark className="text-[28px]"/></div>
                {/* 입금대기-진행중 */}
                {/* <img className="w-[68px] left-[7px] top-[40px] absolute origin-top-left" src={BabyTurtleImg} draggable="false"/> */}
                {/* 입금대기-전 */}
                {/* <div className="w-[23px] h-[23px] left-[19px] top-[61px] absolute bg-[#aeaeae] rounded-full border border-black" /> */}

                
                <div className="left-[150px] top-[2px] absolute text-center text-black text-xl font-[15px]">예약</div>
                {/* 예약-완료 */}
                <div className="w-[37px] h-[37px] left-[149px] top-[53px] absolute bg-[#e7f6d1] rounded-full border border-black" />
                <div className="w-[25px] h-[29px] left-[155px] top-[57px] absolute"><IoCheckmark className="text-[28px]"/></div>
                {/* 예약-진행중 */}
                {/* <img className="w-[68px] left-[137px] top-[40px] absolute origin-top-left" src={BabyTurtleImg} draggable="false"/> */}
                {/* 예약-전 */}
                {/* <div className="w-[23px] h-[23px] left-[155px] top-[61px] absolute bg-[#aeaeae] rounded-full border border-black" /> */}


                <div className="left-[290px] top-0 absolute text-center text-black text-[21px] font-bold">서류검토</div>
                {/* 서류검토-완료 */}
                {/* <div className="w-[37px] h-[37px] left-[308px] top-[53px] absolute bg-[#e7f6d1] rounded-full border border-black" />
                <div className="w-[25px] h-[29px] left-[314px] top-[57px] absolute"><IoCheckmark className="text-[28px]"/></div> */}
                {/* 서류검토-진행중 */}
                <img className="w-[68px] left-[297px] top-[40px] absolute origin-top-left" src={BabyTurtleImg} draggable="false"/>
                {/* 서류검토-전 */}
                {/* <div className="w-[23px] h-[23px] left-[317px] top-[61px] absolute bg-[#aeaeae] rounded-full border border-black" /> */}


                <div className="left-[440px] top-[2px] absolute text-center text-black text-xl font-[15px]">거래완료</div>
                {/* 거래완료-완료 */}
                {/* <div className="w-[37px] h-[37px] left-[457px] top-[53px] absolute bg-[#e7f6d1] rounded-full border border-black" />
                <div className="w-[25px] h-[29px] left-[463px] top-[57px] absolute"><IoCheckmark className="text-[28px]"/></div> */}
                {/* 거래완료-진행중 */}
                {/* <img className="w-[68px] left-[447px] top-[40px] absolute origin-top-left" src={BabyTurtleImg} draggable="false"/> */}
                {/* 거래완료-전 */}
                <div className="w-[23px] h-[23px] left-[465px] top-[61px] absolute bg-[#aeaeae] rounded-full border border-black" />
                </div>
            </div>
        </div>
    </>
}