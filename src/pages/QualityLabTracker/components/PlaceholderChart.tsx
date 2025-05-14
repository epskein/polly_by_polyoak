import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import variablePie from "highcharts/modules/variable-pie";


export function PlaceholderBarChart() {
  const options: Highcharts.Options = {
    chart: {
      type: "column",
      height: 200,
      style: {
        fontFamily: `Outfit, sans-serif`, // Replace with your system's font
      },
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: ["Requestor A", "Requestor B", "Requestor C"],
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: "Outstanding Tasks",
      },
    },
    tooltip: {
      shared: true,
    },
    plotOptions: {
      column: {
        borderWidth: 0,
      },
    },
    series: [
      {
        name: "Tasks",
        type: "column",
        data: [5, 8, 2],
        color: "#3b82f6", // Tailwind blue-500
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}



// ✅ Only call this ONCE per app
if (typeof Highcharts === "object" && typeof variablePie === "function") {
  variablePie(Highcharts);
}


export function PlaceholderPieChart() {
  // ✅ Use require instead of import
  const options: Highcharts.Options = {
    chart: {
      type: "variablepie",
      height: 300,
      style: {
        fontFamily: `Outfit, sans-serif`, // Replace with your system's font
      },
    },
    title: {
      text: "",
    },
    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b> ' +
        "{point.name}</b><br/>" +
        "Area (sq km): <b>{point.y}</b><br/>" +
        "Population Density: <b>{point.z}</b><br/>",
    },
    series: [
      {
        type: "variablepie", // ✅ required
        name: "Countries",
        minPointSize: 10,
        innerSize: "20%",
        zMin: 0,
        borderRadius: 5,
        data: [
          { name: "Sarah", y: 9, z: 95 },
          { name: "John", y: 8, z: 210 },
          { name: "Varadana", y: 5, z: 131 },
          { name: "Zelda", y: 12, z: 270 },
          { name: "Mary", y: 3, z: 160 },
          { name: "Alan", y: 5, z: 180 },
          { name: "Etienne", y: 5, z: 180 },
        ],
        colors: [
          "#4caefe",
          "#3dc3e8",
          "#2dd9db",
          "#1feeaf",
          "#ff595e",
          "#00e887",
          "#23e274",
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export function PlaceholderPieChart2() {
  // ✅ Use require instead of import
  const options: Highcharts.Options = {
    chart: {
      type: "variablepie",
      height: 300,
      style: {
        fontFamily: `Outfit, sans-serif`, // Replace with your system's font
        
      },
    },
    title: {
      text: "",
    },
    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b> ' +
        "{point.name}</b><br/>" +
        "No. Tasks: <b>{point.y}</b><br/>" +
        "something else here for the z value: <b>{point.z}</b><br/>",
    },
    series: [
      {
        type: "variablepie", // ✅ required
        name: "Divisions",
        minPointSize: 10,
        innerSize: "20%",
        zMin: 0,
        borderRadius: 5,
        dataLabels: {
          enabled: true,
          style: {
            fontWeight: "normal", // 🔧 Adjust this to normal, lighter, etc.
            fontSize: "11px",   // Optional: tweak font size
          },
        },
        data: [
          { name: "Blowpack", y: 30, z: 270 },
          { name: "PolyPET", y: 12, z: 118 },
          { name: "Dairypack", y: 8, z: 131 },
          { name: "African Closures", y: 12, z: 136 },
          { name: "Preforms", y: 3, z: 120 },
          { name: "Visconti", y: 11, z: 224 },
          { name: "Dairypack - Tubs", y: 14, z: 238 },
        ],
        
        colors: [
          "#1b98e0",
          "#00a8e8",
          "#007ea7",
          "#005377",
          "#ff595e",
          "#2ec4b6",
          "#0f4c5c",
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export function PlaceholderPieChart3() {
  // ✅ Use require instead of import
  const options: Highcharts.Options = {
    chart: {
      type: "variablepie",
      height: 300,
      style: {
        fontFamily: `Outfit, sans-serif`, // Replace with your system's font
      },
    },
    title: {
      text: "",
    },
    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b> ' +
        "{point.name}</b><br/>" +
        "Area (sq km): <b>{point.y}</b><br/>" +
        "Population Density: <b>{point.z}</b><br/>",
    },
    series: [
      {
        type: "variablepie", // ✅ required
        name: "Countries",
        minPointSize: 10,
        innerSize: "20%",
        zMin: 0,
        borderRadius: 5,
        data: [
          { name: "Woolworths", y: 5992, z: 100 },
          { name: "David Jones", y: 11695, z: 118 },
          { name: "Checkers", y: 12679, z: 131 },
          { name: "Whole Foods", y: 78865, z: 290 },
          { name: "Coca-Cola", y: 30336, z: 210 },
        ],
        colors: [
          "#1b98e0",
          "#00a8e8",
          "#007ea7",
          "#005377",
          "#00334e",
          "#2ec4b6",
          "#0f4c5c",
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export function PlaceholderBarChart2() {
  const options: Highcharts.Options = {
    chart: {
      type: "column",
      height: 300,
      style: {
        fontFamily: `Outfit, sans-serif`, // Replace with your system's font
      },
    },
    title: {
      text: "",
    },
    subtitle: {
      text:
        'Source: <a target="_blank" href="https://www.indexmundi.com/agriculture/?commodity=corn">indexmundi</a>',
      useHTML: true,
    },
    xAxis: {
      categories: ["USA", "China", "Brazil", "EU", "Argentina", "India"],
      crosshair: true,
      accessibility: {
        description: "Countries",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "1000 metric tons (MT)",
      },
    },
    tooltip: {
      valueSuffix: " (1000 MT)",
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [
      {
        name: "Corn",
        type: "column",
        data: [387749, 280000, 129000, 64300, 54000, 34300],
      },
      {
        name: "Wheat",
        type: "column",
        data: [45321, 140000, 10000, 140500, 19500, 113500],
      },
    ],
    credits: { enabled: false }, // removes the Highcharts watermark
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export function DemoLineGraph() {
  // ✅ Use require instead of import
  const options: Highcharts.Options = {
    chart: {
      type: 'spline',
      style: {
        fontFamily: `Outfit, sans-serif`, // Replace with your system's font
      },
    },
    title: {
      text: ''
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      title: {
        text: '',
        style: {
          fontSize: '15px',
        }
      },
      categories: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
    },
    yAxis: {
      title: {
        text: '',
        style: {
          fontSize: '15px',
        }
      }
    },
    plotOptions: {
      spline: {
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '10px',
            fontWeight: 'normal'
          }

        },
        enableMouseTracking: true,
        // This controls the smoothness of the curve
    crisp: false // optional: disables snapping to pixel grid
      }
    },
    series: [
      {
        type: 'spline',
        name: "Current Year",
        color: '#468ddd',
        data: [45, 52, 60, 72, 80, 65, 70, 75, 68, 60, 55, 50],
      },
      {
        type: 'spline',
        name: "Last Year",
        color: '#2ec4b6', // blue-green-thiel
        data: [40, 48, 55, 65, 70, 60, 66, 62, 58, 52, 49, 45],
      },
    ],
    credits: { enabled: false }, // removes the Highcharts watermark
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export function DemoBarChart() {
  // ✅ Use require instead of import
  const options: Highcharts.Options = {
    chart: {
      type: 'bar',
      style: {
        fontFamily: `Outfit, sans-serif`, // Replace with your system's font
      },
      marginRight: 50, // adjust as needed
  marginBottom: 80,
    },
    title: {
      text: ''
    },
    xAxis: {
      categories: ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan'],
      title: {
        text: null
      },
      gridLineWidth: 0,
      lineWidth: 0
    },
    yAxis: {
      min: 0,
      title: {
        text: '',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      },
      plotLines: [{
        color: '#FF0000',
        width: 2,
        value: 13, // This is the average value — adjust as needed
        dashStyle: 'ShortDash',
        label: {
          text: 'Average',
          align: 'left',
          style: {
            color: '#FF0000',
            fontWeight: 'bold'
          }
        }
      }]
    },
    tooltip: {
      valueSuffix: ' tasks'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          enabled: true
        },
        groupPadding: 0.1
      }
      
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'bar',
        name: 'Outstanding Tasks',
        data: [12, 4, 10, 24, 2],
        color: '#468ddd',
      },
      {
        type: 'bar',
        name: 'Overdue Tasks',
        data: [3, 1, 6, 15, 0],
        color: '#ff595e',
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export function DemoBarChart2() {
  // ✅ Use require instead of import
  const options: Highcharts.Options = {
    chart: {
      type: 'bar',
      style: {
        fontFamily: `Outfit, sans-serif`, // Replace with your system's font
      },
      marginRight: 50, // adjust as needed
  marginBottom: 80,
    },
    title: {
      text: ''
    },
    xAxis: {
      categories: ['Zelda Morrison', 'Alan Mitchell', 'Deidre Otto'],
      title: {
        text: null
      },
      gridLineWidth: 0,
      lineWidth: 0
    },
    yAxis: {
      min: 0,
      title: {
        text: '',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      },
      plotLines: [{
        color: '#FF0000',
        width: 2,
        value: 27, // This is the average value — adjust as needed
        dashStyle: 'ShortDash',
        label: {
          text: 'Average',
          align: 'left',
          style: {
            color: '#FF0000',
            fontWeight: 'bold'
          }
        }
      }]
    },
    tooltip: {
      valueSuffix: ' tasks'
    },
    plotOptions: {
      bar: {
        color: '#007ea7',
        borderRadius: 4,
        dataLabels: {
          enabled: true
        },
        groupPadding: 0.1
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'bar',
        name: 'Tasks Requested',
        data: [54, 24, 10],
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}


export function DemoBarChart3() {
  // ✅ Use require instead of import
  const options: Highcharts.Options = {
    chart: {
      type: 'bar',
      style: {
        fontFamily: `Outfit, sans-serif`, // Replace with your system's font
      },
      marginRight: 50, // adjust as needed
  marginBottom: 80,
    },
    title: {
      text: ''
    },
    xAxis: {
      categories: ['Top Priority', 'High', 'Normal', 'Low'],
      title: {
        text: null
      },
      gridLineWidth: 0,
      lineWidth: 0
    },
    yAxis: {
      min: 0,
      title: {
        text: '',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      },
      plotLines: [{
        color: '#FF0000',
        width: 2,
        value: 132, // This is the average value — adjust as needed
        dashStyle: 'ShortDash',
        label: {
          text: 'Average',
          align: 'left',
          style: {
            color: '#FF0000',
            fontWeight: 'bold'
          }
        }
      }]
    },
    tooltip: {
      valueSuffix: ' tasks'
    },
    plotOptions: {
      bar: {
        color: '#0363E2',
        borderRadius: 4,
        dataLabels: {
          enabled: true
        },
        groupPadding: 0.1
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'bar',
        name: 'Tasks By Priority',
        data: [70, 272, 210, 6],
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}


