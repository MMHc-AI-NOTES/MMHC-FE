const DashboardHeader = ({ count }: any) => {
  return (
    <div className="flex justify-end">
      <div className="flex w-fit items-center space-x-2 rounded-full border border-orange-600 bg-orange-100 px-3.5 py-2 text-orange-600">
        <div className="h-2 w-2 rounded-full bg-orange-600" />
        <p>Model Drift: {count ? count : 0} alerts</p>
      </div>
    </div>
  );
};

export default DashboardHeader;
