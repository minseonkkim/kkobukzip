function OtherChatItem({
  message,
  profileImg,
}: {
  message: string;
  profileImg: string;
}) {
  return (
    <>
      <div className="flex flex-row my-2 items-end">
        <img
          src={profileImg}
          className="rounded-full w-[40px] h-[40px] mr-2"
          draggable="false"
        />
        <div className="p-2.5 bg-white rounded-[10px] w-fit max-w-[230px] break-words mr-1">
          {message}
        </div>
        <span className="text-[12px] mr-1 text-gray-400">09:38</span>
      </div>
    </>
  );
}

export default OtherChatItem;