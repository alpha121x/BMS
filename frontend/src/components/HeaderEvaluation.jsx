import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const activeTab = location.pathname;
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const profileRef = useRef(null);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.setItem("isEvaluationAuthenticated", "false");
        navigate("/LoginEvaluation");
    };

    const userToken = JSON.parse(sessionStorage.getItem("userEvaluation"));
    const userName = userToken?.username;

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen((prev) => !prev);
    };

    const handleClickOutside = (event) => {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
            setIsProfileDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <Navbar
            bg="light"
            expand="lg"
            className="shadow-sm border-bottom border-2 fixed-top"
        >
            <Container fluid>
                <Navbar.Brand
                    as={Link}
                    to="/Evaluation"
                    className="d-flex align-items-center"
                >
                    <img
                        src="/cnw.jpg"
                        alt="Logo"
                        style={{ height: "26px" }}
                        className="mx-2"
                    />
                    <span className="fw-bold text-uppercase" style={{ color: "#005d7f" }}>
                        C&W BMS - Evaluation Module
                    </span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link
                            as={Link}
                            to="/Evaluation"
                            className={
                                activeTab === "/Evaluation"
                                    ? "bg-custom-active text-white active"
                                    : "hover-bg-custom-active"
                            }
                            style={{
                                backgroundColor:
                                    activeTab === "/Evaluation" ? "#005d7f" : "transparent",
                                color: activeTab === "/Evaluation" ? "#fff" : "#000",
                            }}
                        >
                            Evaluation Module
                        </Nav.Link>

                        <NavDropdown
                            title={<FontAwesomeIcon icon={faUserCircle} size="lg" />}
                            align="end"
                            show={isProfileDropdownOpen}
                            onMouseEnter={() => setIsProfileDropdownOpen(true)}
                            onMouseLeave={() => setIsProfileDropdownOpen(false)}
                        >
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