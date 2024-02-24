import React, { useState, useEffect } from 'react';
import { NewProjectTable } from "./newProject";
import { ActiveProjects } from "./activeProjects";
import { FinishedProjects } from "./FinishedProjects";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


export const Portfolio_ = () => {
  const isMobile = window.innerWidth <= 768;
  const [activeIndex, setActiveIndex] = useState(null);

  const renderContent = () => {
    if (activeIndex === null) {
      return (
        <div id='portfolio' className='text-center'>
          <div className='container'>
            <div className='section-title'>
              <h2 style={exploreStyle}>EXPLORE OUR SERVICES</h2>
            </div>
          </div>
        </div>
      )
    } else if (activeIndex === 0) {
      return <NewProjectTable />;
    } else if (activeIndex === 1) {
      return <ActiveProjects />;
    } else if (activeIndex === 2) {
      return <FinishedProjects />;
    }
  };

  const handleBreadcrumbClick = (index) => {
    console.info(`You clicked breadcrumb at index ${index}.`);
    // Logic to handle breadcrumb click
    setActiveIndex(index);
  };

  useEffect(() => {
    setActiveIndex(0);

    if (window.ethereum) {
      window.ethereum.on('chainChanged', async () => {
        window.location.reload();
      });
    }
    else {
      alert("Please install MetaMask!");
    }

  }, []);

  return (
    <div id='portfolio' className='text-center'>
      <div className='container'>
        <div className='section-title'>

          {/* <h2 style={h2Style}>Web3 Cowdfunding atop Allo-V2</h2> */}
          {/* <h2 style={h3InfoStyle}>The project was made for the Allo V2 on Arbitrum Hackathon, organized by BuidlBox</h2> */}
          {/* <h2 style={h3InfoStyleColored}>Disclamer: </h2> */}
          {/* <h2 style={h3InfoStyle}>The project operates solely on the Goerli network</h2> */}
          {/* <h2 style={h3InfoBottomStyle}>Only the native token is permitted</h2> */}
          {/* <h2 style={h3InfoBottomStyle}>It is recommended to maintain a balance greater than 1.5 ETH</h2> */}
        </div>

        <div className='row'>
          <div className='col-md-12' style={contentStyle}>
            <TableContainer 
                component={Paper} 
                sx={{ 
                    // borderRadius: '25px', 
                    overflow: 'hidden',
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    borderBottomLeftRadius: 25,
                    borderBottomRightRadius: 25,
                    // marginBottom: '50px',
                }}
            >
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93"}}>menu</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow align="center">
                          <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}
                          >
                              <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Breadcrumbs aria-label="breadcrumb">
                                  {['AWAITIG', 'ACTIVE', 'SHOWCASE'].map((text, index) => (
                                    <Link
                                      key={text}
                                      underline="hover"
                                      color={activeIndex === index ? "text.primary" : "inherit"}
                                      onClick={() => handleBreadcrumbClick(index)}
                                      sx={{
                                        cursor: 'pointer',
                                        fontSize: activeIndex === index ? '17px' : '15px',
                                        fontWeight: activeIndex === index ? 'bold' : 'normal',
                                        fontFamily: "FaunaRegular",
                                        backgroundColor: '#FFFFFF',
                                        color: "#693D8F"
                                      }}
                                    >
                                      {text}
                                    </Link>
                                  ))}
                                </Breadcrumbs>
                              </div>
                          </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
          </div>
        </div>

        {renderContent()}

      </div>
    </div>
  );
};

const exploreStyle = { 
  fontSize: '21px',
  marginTop: '21px',  
  marginBottom: '21px',
  backgroundColor: '#FFFFFF',
  color: "#8155BA",
  border: 'none',
  // borderRadius: "15px",
  cursor: 'pointer',
  minWidth: '150px',
  marginTop: '0px',
  paddingBottom: '10px',
};

const contentStyle = {
  marginTop: '30px',  
  display: 'flex', // Added for flexbox layout
  justifyContent: 'center', // Center content horizontally
  alignItems: 'center', 
};