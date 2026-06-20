// 추억 상자처럼 친밀한 단일 폭. 화면별 topbar는 각 페이지가 가짐.
export default function DreamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 py-8">
      {children}
    </div>
  );
}
