import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname;

  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const [isSetupDropdownOpen, setIsSetupDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("isAuthenticated", "false");
    localStorage.setItem("isEvaluationAuthenticated", "false");
    navigate("/");
  };

  const userToken = JSON.parse(localStorage.getItem("user"));
  const userName = userToken?.username;

  return (
      <Navbar bg="light" expand="lg" className="shadow-sm border-bottom border-2 fixed-top" >
        <Container fluid>
          <Navbar.Brand as={Link} to="/Dashboard" className="d-flex align-items-center">
            <img src="/cnw.jpg" alt="Logo" style={{ height: "26px" }} className="mx-2" />
            <span className="fw-bold text-uppercase" style={{color:"#005d7f"}}>C&W Bridge Management System</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav"   />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link
                  as={Link}
                  to="/Dashboard"
                  className={activeTab === "/Dashboard" ? "bg-custom-active text-white active" : "hover-bg-custom-active"}
                  style={{ backgroundColor: activeTab === "/Dashboard" ? "#005d7f" : "transparent", color: activeTab === "/Dashboard" ? "#fff" : "#000" }}
              >
                Dashboard
              </Nav.Link>
              <Nav.Link
                  as={Link}
                  to="/BridgeWiseScore"
                  className={activeTab === "/BridgeWiseScore" ? "bg-custom-active text-white active" : "hover-bg-custom-active"}
                  style={{ backgroundColor: activeTab === "/BridgeWiseScore" ? "#005d7f" : "transparent", color: activeTab === "/BridgeWiseScore" ? "#fff" : "#000" }}
              >
                Bridge Wise Score
              </Nav.Link>

              <NavDropdown title="Reports" show={isReportsDropdownOpen} onMouseEnter={() => setIsReportsDropdownOpen(true)} onMouseLeave={() => setIsReportsDropdownOpen(false)}>
                <NavDropdown.Item as={Link} to="/Reports/BridgeListing">Bridge Wise Listing</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Reports/CategorySummary">Category Wise Summary</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Reports/DistrictCategory">District Wise Category</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Reports/BridgeCategory">Bridge Wise Category</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Setup Listing" show={isSetupDropdownOpen} onMouseEnter={() => setIsSetupDropdownOpen(true)} onMouseLeave={() => setIsSetupDropdownOpen(false)}>
                <NavDropdown.Item as={Link} to="/SetupListing/DamageRanks">Damage Ranks</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/SetupListing/Elements">Elements</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/SetupListing/DamageTypes">Damage Types</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/SetupListing/RoadClassifications">Road Classifications</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/SetupListing/CarriagewayTypes">Carriageway Types</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/SetupListing/BridgeAgeFactors">Bridge Age Factors</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/SetupListing/FactorCrossings">Factors for Crossings</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/SetupListing/BridgeDimentions">Dimentions</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title={<FontAwesomeIcon icon={faUserCircle} size="lg" />} align="end">
                <NavDropdown.Item>{userName}</NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};

export default Header;
