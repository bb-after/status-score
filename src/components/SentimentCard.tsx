import { FC } from "react";

interface SentimentCardProps {
  title: string;
  score: number;
  trend: "up" | "down";
}

const SentimentCard: FC<SentimentCardProps> = ({ title, score, trend }) => {
  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <p
          className={`text-4xl font-bold ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {score}
        </p>
        <p
          className={`text-sm ${
            trend === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend === "up" ? "▲ Increasing" : "▼ Decreasing"}
        </p>
      </div>
    </div>
  );
};

export default SentimentCard;
