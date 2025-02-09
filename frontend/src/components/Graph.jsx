import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Graph = () => {
  const planAScoreOptions = {
    chart: {
      type: 'pie',
      height: 400
    },
    title: {
      text: 'Plan A Score Distribution'
    },
    series: [{
      name: 'Score',
      data: [
        ['Score A', 30],
        ['Score B', 25],
        ['Score C', 45]
      ]
    }]
  };

  const crossingTypesOptions = {
    chart: {
      type: 'pie',
      height: 400
    },
    title: {
      text: 'Crossing Types Distribution'
    },
    series: [{
      name: 'Types',
      data: [
        ['Type A', 40],
        ['Type B', 35],
        ['Type C', 25]
      ]
    }]
  };

  const structureTypesOptions = {
    chart: {
      type: 'pie',
      height: 400
    },
    title: {
      text: 'Structure Types Distribution'
    },
    series: [{
      name: 'Types',
      data: [
        ['Type X', 45],
        ['Type Y', 30],
        ['Type Z', 25]
      ]
    }]
  };

  const groupConstructionTypesOptions = {
    chart: {
      type: 'pie',
      height: 400
    },
    title: {
      text: 'Group Construction Types'
    },
    series: [{
      name: 'Types',
      data: [
        ['Group 1', 35],
        ['Group 2', 40],
        ['Group 3', 25]
      ]
    }]
  };

  const constructionTypesOptions = {
    chart: {
      type: 'pie',
      height: 400
    },
    title: {
      text: 'Construction Types'
    },
    series: [{
      name: 'Types',
      data: [
        ['Type 1', 30],
        ['Type 2', 35],
        ['Type 3', 35]
      ]
    }]
  };

  const bridgeDamageLevelsOptions = {
    chart: {
      type: 'bar',
      height: 800,
      style: {
        fontFamily: 'Arial, sans-serif'
      }
    },
    title: {
      text: 'Bridges Damage Levels by Damage Kind',
      style: {
        fontSize: '20px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      title: {
        text: 'Number of Damages',
        style: {
          fontSize: '14px'
        }
      },
      gridLineWidth: 1,
      gridLineColor: '#E0E0E0',
      min: 0,
      max: 1200,
      tickInterval: 200,
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yAxis: {
      title: {
        text: 'Damage Kind',
        style: {
          fontSize: '14px'
        }
      },
      categories: [
        'NON', 'Corrosion', 'Crack (Concrete)', 'Looseness - fall', 
        'Deterioration of corrosion protection (paint)', 'Crack (Steel)',
        'Spalling・Exposed re-bar', 'Water leakage・Free lime', 'Fall out',
        'Slab crack', 'Poor concrete adhesion', 'Gap defect',
        'Uneven road surface', 'Pavement defect', 'Bearing malfunction',
        'Other', 'Fixing section defect', 'Discoloration・Deterioration',
        'Leakage・Stagnant water', 'Abnormal sound・Vibration',
        'Abnormal deflection', 'Deformation・loss', 'Clogged soil',
        'Settlement・Move・Incline', 'Scouring'
      ],
      reversed: true,
      gridLineWidth: 1,
      gridLineColor: '#E0E0E0',
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    plotOptions: {
      bar: {
        stacking: 'normal',
        borderWidth: 0
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemStyle: {
        fontSize: '12px'
      },
      reversed: true
    },
    series: [{
      name: 'Bridges Damage Level IV',
      color: '#FFD700',
      data: [30, 25, 35, 45, 10, 40, 80, 50, 60, 15, 30, 40, 50, 60, 20, 70, 50, 40, 30, 10, 20, 50, 60, 30, 20]
    }, {
      name: 'Bridges Damage Level III',
      color: '#808080',
      data: [60, 50, 70, 80, 30, 60, 100, 70, 80, 30, 50, 60, 70, 80, 40, 90, 70, 60, 50, 30, 40, 70, 80, 50, 40]
    }, {
      name: 'Bridges Damage Level II',
      color: '#FFA500',
      data: [80, 70, 90, 100, 50, 80, 120, 90, 100, 50, 70, 80, 90, 100, 60, 110, 90, 80, 70, 50, 60, 90, 100, 70, 60]
    }, {
      name: 'Bridges Damage Level I',
      color: '#0000FF',
      data: [100, 90, 110, 120, 70, 100, 140, 110, 120, 70, 90, 100, 110, 120, 80, 130, 110, 100, 90, 70, 80, 110, 120, 90, 80]
    }],
    credits: {
      enabled: false
    }
  };

  const materialElementDamagesOptions = {
    chart: {
      type: "bar",
      height: 800
    },
    title: {
      text: "Material Element Damages",
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: [
        "Substructure(Pier) - Steel",
        "Concrete",
        "Other",
        "Masonry/brick",
        "Substructure(Abutment) - Steel",
        "Concrete",
        "Other",
        "Masonry/brick",
        "Substructure(Foundation) - Concrete",
        "Other",
        "Bearing - Steel",
        "Concrete",
        "Other",
        "Rubber",
        "Road surface - Steel",
        "Concrete",
        "Rubber",
        "Asphalt",
        "Other",
        "Drainage system - Steel",
        "Vinyl chloride",
        "Other",
        "Attachment - Steel",
        "Vinyl chloride",
        "Other",
        "Wing wall - Concrete",
        "Other",
        "Box Culvert - Other"
      ],
      title: {
        text: "Elements"
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Damages"
      }
    },
    legend: {
      reversed: true
    },
    plotOptions: {
      series: {
        stacking: "normal"
      }
    },
    series: [
      {
        name: "Number of Damages I",
        data: [100, 1800, 200, 300, 400, 150, 400, 200, 100, 100, 400, 50, 50, 20, 30, 20, 10, 200, 800, 100, 400, 200, 10, 10, 400, 50, 10, 20],
        color: "#0000FF"
      },
      {
        name: "Number of Damages II",
        data: [50, 1200, 100, 200, 600, 100, 600, 150, 50, 50, 500, 30, 30, 10, 20, 10, 5, 150, 1000, 50, 500, 300, 5, 5, 600, 30, 5, 10],
        color: "#FFA500"
      },
      {
        name: "Number of Damages III",
        data: [30, 200, 50, 100, 100, 50, 100, 50, 30, 30, 100, 20, 20, 5, 10, 5, 3, 100, 200, 30, 100, 100, 3, 3, 200, 20, 3, 5],
        color: "#808080"
      },
      {
        name: "Number of Damages IV",
        data: [20, 100, 30, 50, 50, 30, 50, 30, 20, 20, 50, 10, 10, 3, 5, 3, 2, 50, 100, 20, 50, 50, 2, 2, 100, 10, 2, 3],
        color: "#FFFF00"
      }
    ]
  };

  const elementCategoryDamagesOptions = {
    chart: {
      type: "bar",
      height: 400
    },
    title: {
      text: "Element category wise damages"
    },
    xAxis: {
      categories: [
        "Superstructure",
        "Substructure(Pier)",
        "Substructure(Abutment)",
        "Substructure(Foundation)",
        "Bearing",
        "Road surface",
        "Drainage system",
        "Attachment",
        "Wing wall",
        "Box Culvert"
      ],
      title: {
        text: "Work Kind"
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "Category"
      },
      max: 3750
    },
    legend: {
      reversed: true
    },
    plotOptions: {
      series: {
        stacking: "normal"
      }
    },
    series: [
      {
        name: "Number of Damages I",
        data: [500, 400, 300, 50, 50, 800, 100, 50, 200, 0],
        color: "#0000FF"
      },
      {
        name: "Number of Damages II",
        data: [1200, 800, 600, 30, 30, 1500, 150, 30, 500, 0],
        color: "#FFA500"
      },
      {
        name: "Number of Damages III",
        data: [400, 300, 200, 20, 20, 500, 50, 20, 150, 0],
        color: "#808080"
      },
      {
        name: "Number of Damages IV",
        data: [200, 150, 100, 10, 10, 250, 25, 10, 75, 0],
        color: "#FFFF00"
      }
    ]
  };

  const bridgeLengthOptions = {
    chart: {
      type: "bar",
      height: 400
    },
    title: {
      text: "Bridge Length Of Structure M"
    },
    xAxis: {
      categories: ["L <= 6", "6m < L≤ 30m", "30m < L≤ 60m", "L < 60m"],
      title: {
        text: "Bridge Length"
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "Construction Types"
      },
      max: 19000
    },
    plotOptions: {
      series: {
        stacking: "normal"
      }
    },
    series: [
      {
        name: "Others",
        data: [100, 50, 10, 5],
        color: "#008000"
      },
      {
        name: "Steel Girder",
        data: [50, 30, 5, 3],
        color: "#0000FF"
      },
      {
        name: "Culverts (box and pipe)",
        data: [200, 100, 20, 10],
        color: "#FFA500"
      },
      {
        name: "Concrete I-Girder",
        data: [100, 50, 10, 5],
        color: "#FFFF00"
      },
      {
        name: "Concrete Deck Slab",
        data: [18000, 1500, 100, 50],
        color: "#FF7F7F"
      },
      {
        name: "Concrete Box Girder",
        data: [50, 30, 5, 3],
        color: "#E6E6FA"
      },
      {
        name: "Arch Structure",
        data: [30, 20, 3, 2],
        color: "#808080"
      }
    ]
  };

  return (
    <div className="bg-white border-2 border-blue-400 p-2 rounded-lg shadow-md">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {/* Pie Charts */}
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={planAScoreOptions}
          />
        </div>
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={crossingTypesOptions}
          />
        </div>
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={structureTypesOptions}
          />
        </div>
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={groupConstructionTypesOptions}
          />
        </div>
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={constructionTypesOptions}
          />
        </div>

        {/* Bridge Damage Levels Chart */}
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={bridgeDamageLevelsOptions}
          />
        </div>

        {/* Bar Charts */}
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={materialElementDamagesOptions}
          />
        </div>
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={elementCategoryDamagesOptions}
          />
        </div>
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={bridgeLengthOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default Graph;
