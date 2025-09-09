import { ChartData, Point } from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { data, predData } from "../page";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Graph({
  datas,
  predDatas,
}: {
  datas: data[];
  predDatas: predData[];
}) {
  const data: ChartData<"line", (number | Point | null)[], unknown> = {
    datasets: [
      {
        label: "actual v",
        data: datas.map((i) => i.generated_v),
        borderColor: "rgb(255, 99, 132)",
      },
      {
        label: "pred v",
        data: predDatas.map((i) => i.generated_v),
        borderColor: "rgb(99, 255, 132)",
      },
    ],
    labels: ["4s", "3s", "2s", "1s", "now"],
  };

  return (
    <Line
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text: "voltage Overtime",
            color: "#fff",
          },
          colors: {
            forceOverride: true,
            enabled: true,
          },
        },

        color: "#ffffff",
        borderColor: "#ffffff",
        backgroundColor: "#ffffff",
        elements: {
          bar: {
            borderColor: "#fff",
          },
        },
      }}
      data={data}
    />
  );
}
