export function MobileProfileInfo() {
  return (
    <div className="flex items-center border-t border-border py-2 gap-2 mt-8">
      <div className="flex-1 flex justify-center items-center flex-col cursor-pointer">
        <div className="font-semibold">1</div>
        <div>подписчиков</div>
      </div>
      <div className="flex-1 flex justify-center items-center flex-col cursor-pointer">
        <div className="font-semibold">2</div>
        <div>капсул</div>
      </div>
      <div className="flex-1 flex justify-center items-center flex-col cursor-pointer">
        <div className="font-semibold">3</div>
        <div>предметов</div>
      </div>
    </div>
  );
}
