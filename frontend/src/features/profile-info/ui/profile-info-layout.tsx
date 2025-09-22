type ProfileInfoProps = {
  avatar: React.ReactNode;
  info: React.ReactNode;
  controls: React.ReactNode;
  bio: React.ReactNode;
  userName: string;
  mobileInfo: React.ReactNode;
};

export function ProfileInfoLayout({
  avatar,
  info,
  mobileInfo,
  controls,
  bio,
  userName,
}: ProfileInfoProps) {
  return (
    <>
      <div className="flex mt-10 max-md:mt-0">
        <div className="max-md:mx-10 max-md:ml-0 mx-16 flex justify-center items-center">
          {avatar}
        </div>
        <div className="flex flex-col mt-4">
          <div className="flex items-center gap-6 mb-6 max-md:flex-col max-md:gap-2 max-md:items-start">
            <div className="text-lg font-medium max-w-80 truncate">
              {userName}
            </div>
            {controls}
          </div>
          <div className="mb-6 max-md:hidden">{info}</div>
          {bio}
        </div>
      </div>
      {mobileInfo}
    </>
  );
}
