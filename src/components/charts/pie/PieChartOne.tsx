import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function PieChartOne() {
  const options: ApexOptions = {
    chart: {
      type: "pie",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: ["#465fff", "#80CAEE", "#FBAF4A", "#FF6B72", "#38E1A1"],
    labels: ["Marketing", "Sales", "Development", "Customer Support", "Other"],
    legend: {
      position: "bottom",
      fontFamily: "Outfit, sans-serif",
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
    dataLabels: {
      style: {
        fontFamily: "Outfit, sans-serif",
        fontSize: "14px",
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const series = [25, 30, 20, 15, 10];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="pieChart" className="min-w-[400px]">
        <Chart options={options} series={series} type="pie" height={280} />
      </div>
    </div>
  );
}
