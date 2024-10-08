import Layout from "../components/Layout";
import SentimentCard from "../components/SentimentCard";
import ReportsOverview from "../components/ReportsOverview";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [keywords, setKeywords] = useState([]);
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await fetch("/api/keywords");
        const data = await response.json();
        setKeywords(data);
      } catch (error) {
        console.error("Error fetching keywords:", error);
      }
    };

    fetchKeywords();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600 mt-2">
            Overview of your AI sentiment scores.
          </p>

          {/* Displaying Keywords and Scores */}
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Tracked Keywords</h3>
            <ul>
              {keywords.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.keyword}</span>
                  <span
                    className={`font-bold ${
                      item.score > 50 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sentiment Scores */}
          <SentimentCard title="Overall Sentiment" score={75} trend="up" />

          {/* Reports Overview */}
          <ReportsOverview />

          {/* Placeholder for Additional Cards */}
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="text-xl font-semibold">Additional Widget</h3>

            <p className="text-gray-600">Add content here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
