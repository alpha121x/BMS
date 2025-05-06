import React, { useEffect, useState, useRef } from 'react';
import { Button, Table, Modal, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import Highcharts from 'highcharts';
import Map from './Map'; // Assuming you have a Map component
import { BASE_URL } from './config'; // Adjust the import based on your project structure

const PrioritizationTable = () => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [bridgeDetails, setBridgeDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [chartHeight, setChartHeight] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Good');
  const tableRef = useRef(null);

  // Fetch data from the API using fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
       const response = await fetch(`${BASE_URL}/api/bms_matrix`); // Adjust the endpoint as needed
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();

        // Process data to match dummyData structure
        const categories = ['Good', 'Fair', 'Poor', 'Severe'];
        const groups = ['GroupA', 'GroupB', 'GroupC', 'GroupD']; // Map to district_id or other grouping
        const districtMapping = {
          1: 'GroupA', // Example: district_id 1 maps to GroupA
          2: 'GroupB',
          3: 'GroupC',
          4: 'GroupD',
        };

        // Initialize bridgeScoreData
        const scoreData = categories.map(category => {
          const row = { category };
          groups.forEach(group => {
            row[group] = 'N.A'; // Default value
          });
          return row;
        });

        // Initialize bridgeDetails
        const details = {
          GroupA: [],
          GroupB: [],
          GroupC: [],
          GroupD: [],
        };

        // Process raw data
        rawData.forEach(item => {
          const group = districtMapping[item.district_id] || 'GroupA'; // Map district_id to group
          const category = item.damagecategory; // Assuming damagecategory is the field

          // Update bridgeScoreData
          const row = scoreData.find(r => r.category === category);
          if (row) {
            row[group] = row[group] === 'N.A' ? 1 : row[group] + 1;
          }

          // Update bridgeDetails
          if (details[group]) {
            details[group].push({
              id: item.uu_bms_id,
              district: item.district,
              roadName: item.road_name,
              structureType: item.structure_type,
              name: item.structure_no,
              dateTime: item.date_time,
              category: item.damagecategory,
            });
          }
        });

        setBridgeScoreData(scoreData);
        setBridgeDetails(details);
        setLoading(false);

        // Set chart height
        if (tableRef.current) {
          const tableHeight = tableRef.current.getBoundingClientRect().height;
          setChartHeight(tableHeight);
        }

        // Create Highcharts pie chart
        const chartData = scoreData.map(row => ({
          name: row.category,
          y: Object.values(row)
            .slice(1)
            .reduce((sum, val) => sum + (val === 'N.A' ? 0 : parseInt(val)), 0),
          color: getCategoryColor(row.category),
        }));

        Highcharts.chart('chart-container', {
          chart: {
            type: 'pie',
            height: chartHeight,
          },
          title: {
            text: 'Bridge Counts by Category',
            align: 'center',
          },
          series: [
            {
              name: 'Categories',
              data: chartData,
              size: '60%',
              dataLabels: {
                enabled: true,
                distance: 30,
                format: '{point.name}: {point.y}',
                style: {
                  fontSize: '12px',
                },
              },
            },
          ],
          legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
              fontSize: '12px',
            },
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              showInLegend: true,
            },
          },
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [chartHeight]);

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Good':
        return { backgroundColor: '#28a745', color: 'white' };
      case 'Fair':
        return { backgroundColor: '#ffc107', color: 'black' };
      case 'Poor':
        return { backgroundColor: '#fd7e14', color: 'white' };
      case 'Severe':
        return { backgroundColor: '#dc3545', color: 'white' };
      default:
        return {};
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Good':
        return '#28a745';
      case 'Fair':
        return '#ffc107';
      case 'Poor':
        return '#fd7e14';
      case 'Severe':
        return '#dc3545';
      default:
        return '#000000';
    }
  };

  const handleDownloadCSV = () => {
    if (!bridgeScoreData.length) {
      console.warn('No data available for CSV download.');
      return;
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Category', 'Group A', 'Group B', 'Group C', 'Group D'].join(','),
        ...bridgeScoreData.map(row =>
          [row.category, row.GroupA, row.GroupB, row.GroupC, row.GroupD].join(','),
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Bridges_Category_Summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTabClick = (category) => {
    setSelectedCategory(category);
  };

  const filteredBridgeDetails = () => {
    const selectedRow = bridgeScoreData.find(row => row.category === selectedCategory);
    if (!selectedRow) return [];

    const groups = ['GroupA', 'GroupB', 'GroupC', 'GroupD'];
    const details = [];

    groups.forEach(group => {
      if (selectedRow[group] !== 'N.A') {
        const groupDetails = bridgeDetails[group] || [];
        const filteredDetails = groupDetails.filter(detail => detail.category === selectedCategory);
        details.push(...filteredDetails);
      }
    });

    return details;
  };

  return (
    <Container fluid className="py-2 bg-light mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="card shadow-sm border-0" ref={tableRef}>
            <div className="card-header border-1 text-white p-2 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-black">Bridge Prioritization Table</h5>
              <Button variant="light" onClick={handleDownloadCSV}>
                <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                CSV
              </Button>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="spinner-border mx-auto my-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <Table bordered hover striped className="mb-0">
                  <thead>
                    <tr>
                      <th className="text-center">Category</th>
                      <th className="text-center">Group A</th>
                      <th className="text-center">Group B</th>
                      <th className="text-center">Group C</th>
                      <th className="text-center">Group D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bridgeScoreData.map((row, index) => (
                      <tr key={index}>
                        <td className="text-center" style={getCategoryStyle(row.category)}>
                          {row.category}
                        </td>
                        {['GroupA', 'GroupB', 'GroupC', 'GroupD'].map(group => (
                          <td key={group} className="text-center">
                            {row[group]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        </Col>
        <Col md={4} className="d-flex align-items-center">
          <div className="card shadow-sm border-1 w-100">
            <div className="card-body p-2">
              <div id="chart-container"></div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Bridges Category - {selectedTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData.length > 0 ? (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Road Name</th>
                  <th>Structure Type</th>
                  <th>Bridge Name</th>
                  <th>Date Time</th>
                </tr>
              </thead>
              <tbody>
                {modalData.map((bridge, idx) => (
                  <tr key={idx}>
                    <td>{bridge.district}</td>
                    <td>{bridge.roadName}</td>
                    <td>{bridge.structureType}</td>
                    <td>{bridge.name}</td>
                    <td>{bridge.dateTime}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No bridges found for this group.</p>
          )}
        </Modal.Body>
      </Modal>

      <Container fluid className="py-2 bg-light mt-3">
        <Row className="justify-content-center">
          <Col md={12}>
            <div className="card shadow-sm border-0">
              <div className="card-header border-1 p-2 d-flex justify-content-between align-items-center">
                <div>
                  {['Good', 'Fair', 'Poor', 'Severe'].map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'primary' : 'outline-primary'}
                      onClick={() => handleTabClick(category)}
                      className="mx-1"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="card-body p-0">
                <Table bordered hover striped className="mb-0">
                  <thead>
                    <tr>
                      <th>District</th>
                      <th>Road Name</th>
                      <th>Structure Type</th>
                      <th>Bridge Name</th>
                      <th>Date Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBridgeDetails().length > 0 ? (
                      filteredBridgeDetails().map((bridge, idx) => (
                        <tr key={idx}>
                          <td>{bridge.district}</td>
                          <td>{bridge.roadName}</td>
                          <td>{bridge.structureType}</td>
                          <td>{bridge.name}</td>
                          <td>{bridge.dateTime}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No bridges found for this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default PrioritizationTable;