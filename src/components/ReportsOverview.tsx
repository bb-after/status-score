import { FC } from "react";
import LineChart from "./LineChart";

const ReportsOverview: FC = () => {
  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h3 className="text-xl font-semibold mb-2">Reports Overview</h3>
      <p className="text-gray-600 mb-4">
        Here you&apos;ll see a summary of your monthly and quarterly reports.
      </p>

      {/* Placeholder for charts or more content */}
      <div className="mt-4">
        <LineChart />
      </div>

      {/* <div className="mt-4">
        <p className="text-sm text-gray-500">No reports available yet.</p>
      </div> */}
    </div>
  );
};

export default ReportsOverview;
