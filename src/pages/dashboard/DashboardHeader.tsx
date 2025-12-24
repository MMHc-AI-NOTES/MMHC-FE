const DashboardHeader = ({ count }: any) => {
  return (
    <div className="mt-2 flex justify-between">
      <p className="text-primary text-3xl font-bold">Dashboard</p>
      <div className="bg-gradient-primary flex w-fit items-center rounded-full px-4 font-medium text-white">
        <p>Model Drift: {count ? count : 0} alerts</p>
      </div>
    </div>
  );
};

export default DashboardHeader;
