import { useState, useEffect, useLayoutEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../../components/common/Header";
import { useNavigate } from "react-router-dom";
import { AuctionItemDataType } from "../../types/auction";
import { getAuctionDetailItemData } from "../../apis/tradeApi";
import AuctionItemInfo from "../../components/auction/AuctionItemInfo";
import AuctionItemInfoSkeleton from "../../components/auction/skeleton/AuctionItemInfoSkeleton";
import BeforeAuction from "../../components/auction/BeforeAuction";
import DuringAucion from "../../components/auction/DuringAucion";
import AfterAuction from "../../components/auction/AfterAuction";

// flow
// 1. 경매 시작 전 -> SSE 연결, get으로 가져옴
// 2. 경매 시작 -> SSE로 알림, WS로 교체
// 3. 경매 종료 -> WS 종료
// 소켓 통신
// 보유한 금액, 내가 누구인가
// 최고 입찰자 아이디, 금액

// 이 페이지는 타입이 3개.
// 1. 경매 전
// 2. 경매 진행 중
// 3. 경매 후
type AuctionType =
  | "BEFORE_AUCTION"
  | "DURING_AUCTION"
  | "NO_BID"
  | "SUCCESSFUL_BID"
  | null; // 1: 경매전 2: 경매중, 3: 유찰, 4: 낙찰, 5: 로딩중

function AuctionDetailPage() {
  const [auctionStatus, setAuctionStatus] = useState<AuctionType>(null); // 경매 상태, 13은 false, 2는 true
  const [auctionItemData, setAuctionItemData] =
    useState<AuctionItemDataType | null>(null);

  useLayoutEffect(() => {
    // 처음 옥션 데이터 로딩하는 부분
    const getData = async () => {
      const response = await getAuctionDetailItemData(1); // 상품 id 넣을 것
      if (response.success) {
        console.log(response.data.data.auction);
        setAuctionStatus(response.data.data.auction.progress);
        setAuctionItemData(response.data.data.auction);
      } else {
        navigate("/");
      }
    };

    getData();
  }, []);

  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  // 옥션 전-> 옥션 진행
  const changeAuctionStatus = () => {
    setAuctionStatus("DURING_AUCTION");
  };
  return (
    <>
      <Helmet>
        <title>경매중인 거북이</title>
      </Helmet>
      <Header />
      <div className="px-[250px] mt-[85px]">
        <div className="cursor-pointer text-[33px] text-gray-900 font-dnf-bitbit pt-[40px] pb-[13px]">
          <span onClick={goBack}>&lt;&nbsp;경매중인 거북이</span>
        </div>
        <div className="flex flex-row justify-between mt-[10px]">
          {/* 좌측 거북이 정보 */}
          {auctionStatus === null ? (
            <AuctionItemInfoSkeleton />
          ) : (
            <AuctionItemInfo images={auctionItemData?.images!} />
          )}

          {/* 경매 상태별 컴포넌트 */}
          {auctionStatus === "BEFORE_AUCTION" && (
            <BeforeAuction
              changeAuctionStatus={changeAuctionStatus}
              startTime={auctionItemData?.startTime!}
              minBid={auctionItemData?.minBid!}
            />
          )}
          {auctionStatus === "DURING_AUCTION" && <DuringAucion />}
          {auctionStatus === ("NO_BID" || "SUCCESSFUL_BID") && <AfterAuction />}
        </div>
      </div>
    </>
  );
}

export default AuctionDetailPage;
