"use client";

import { Beaker, Waves, Zap } from "lucide-react";
import mqtt from "mqtt";
import { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";
import MessageUI from "./components/MessageUI";
import Graph from "./components/Graph";
import axios from "axios";

export interface data {
  //   doc["valve_pos"] = pos;
  //   doc["water_level"] = finalval;
  //   doc["generated_v"] = in_voltage;

  valve_pos: number;
  water_level: number;
  generated_v: number;
}

export interface predData {
  //   doc["valve_pos"] = pos;
  //   doc["water_level"] = finalval;
  //   doc["generated_v"] = in_voltage;
  generated_v: number;
}

const valveMap = {
  180: "CLOSED",
  0: "OPENED",
};

type valveStatus = "OPENED" | "CLOSED";

export default function Home() {
  const [data, setData] = useState<data>({
    generated_v: 0,
    valve_pos: 0,
    water_level: 0,
  });
  const [maxV, setMaxV] = useState(data.generated_v);
  const [predData, setPredData] = useState<predData[]>([]);
  const [pastData, setPastData] = useState<data[]>([]);
  const [valve, setValve] = useState<valveStatus>("CLOSED");
  const [capacity, setCapacity] = useState<number>(0);

  useEffect(() => {
    const client = mqtt.connect("ws://aira.teguhbayu.xyz:8080");

    client.subscribe("initopic", (err) => {});

    client.on("message", (topic, message) => {
      if (topic === "initopic") {
        const parsedData: data = JSON.parse(message.toString());

        setData(parsedData);
        setPastData((i) => [...(i.length >= 5 ? i.slice(1) : i), parsedData]);
        axios
          .post("http://aira.teguhbayu.xyz:5000/", {
            valve_pos: (Math.abs(parsedData.valve_pos - 180) / 180) * 100,
            water_level: parsedData.water_level,
          })
          .then((i) => {
            setPredData((j) => [
              ...(j.length >= 5 ? j.slice(1) : j),
              { generated_v: i.data.data.predicted_v },
            ]);
          });
      }
    });
  }, []);
  useEffect(() => {
    if (maxV < data.generated_v && !(data.generated_v <= 0.1)) {
      setMaxV(data.generated_v);
    }
    if (valveMap[`${data.valve_pos}` as "0" | "180"] !== valve)
      setValve(valveMap[`${data.valve_pos}` as "0" | "180"] as valveStatus);
    setCapacity(data.water_level);
  }, [data]);

  return (
    <div className="relative">
      <div className="fixed h-screen w-1/4 py-2">
        <MessageUI data={data} />
      </div>

      <div className="text-white ps-[25vw] w-full font-sans flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-5 sm:p-20">
        <div className="w-[80%] h-[50vh] flex flex-col gap-2 items-center bg-[#212121] px-2 py-3 rounded-xl">
          <Graph datas={pastData} predDatas={predData} />
        </div>
        <div className="flex flex-col gap-2 items-center bg-[#212121] px-2 py-3 rounded-xl">
          <h1 className="inline-flex gap-1">
            <Zap fill="#ffffff" /> Generated Voltage
          </h1>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex flex-col items-center gap-2">
              <GaugeComponent
                minValue={0}
                maxValue={5}
                value={data.generated_v < 0.1 ? 0 : data.generated_v}
                arc={{
                  subArcs: [
                    {
                      limit: 1,
                      color: "#EA4228",
                      showTick: true,
                    },
                    {
                      limit: 2,
                      color: "#F58B19",
                      showTick: true,
                    },
                    {
                      limit: 3,
                      color: "#F5CD19",
                      showTick: true,
                    },
                    {
                      limit: 5,
                      color: "#5BE12C",
                      showTick: true,
                    },
                  ],
                }}
                labels={{
                  valueLabel: {
                    formatTextValue(value) {
                      return `${value}v`;
                    },
                  },
                }}
              />
              <h2>Current</h2>
            </div>
            <div className="flex flex-col items-center gap-2">
              <GaugeComponent
                minValue={0}
                maxValue={5}
                value={maxV}
                arc={{
                  subArcs: [
                    {
                      limit: 1,
                      color: "#EA4228",
                      showTick: true,
                    },
                    {
                      limit: 2,
                      color: "#F58B19",
                      showTick: true,
                    },
                    {
                      limit: 3,
                      color: "#F5CD19",
                      showTick: true,
                    },
                    {
                      limit: 5,
                      color: "#5BE12C",
                      showTick: true,
                    },
                  ],
                }}
                labels={{
                  valueLabel: {
                    formatTextValue(value) {
                      return `${value}v`;
                    },
                  },
                }}
              />
              <h2>Max</h2>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center bg-[#212121] px-2 py-3 rounded-xl">
          <h1 className="inline-flex gap-1">
            <Waves /> Valve State
          </h1>
          <div className="grid grid-cols-1 gap-1">
            <h2
              className={`font-bold text-xl ${
                valve === "OPENED" ? "text-green-500" : "text-red-500"
              }`}
            >
              {valve}
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center bg-[#212121] px-2 py-3 rounded-xl">
          <h1 className="inline-flex gap-1">
            <Beaker /> Water Level
          </h1>
          <div className="grid grid-cols-1 gap-1">
            <div className="flex flex-col items-center gap-2">
              <GaugeComponent
                minValue={0}
                maxValue={100}
                value={capacity}
                arc={{
                  subArcs: [
                    {
                      limit: 20,
                      color: "#EA4228",
                      showTick: true,
                    },
                    {
                      limit: 40,
                      color: "#F58B19",
                      showTick: true,
                    },
                    {
                      limit: 60,
                      color: "#F5CD19",
                      showTick: true,
                    },
                    {
                      limit: 80,
                      color: "#5BE12C",
                      showTick: true,
                    },
                  ],
                }}
                labels={{
                  valueLabel: {
                    formatTextValue(value) {
                      return `${value}%`;
                    },
                  },
                }}
              />
              <h2>Current</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
