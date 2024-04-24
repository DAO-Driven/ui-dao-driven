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

// Define styles
const exploreStyle = { 
  fontSize: '21px',
  backgroundColor: '#FFFFFF',
  color: "#8155BA",
  border: 'none',
  cursor: 'pointer',
  minWidth: '150px',
  paddingBottom: '10px',
};

const contentStyle = {
  marginTop: '30px',  
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center', 
};

export const Portfolio_ = () => {
  const [activeSection, setActiveSection] = useState('');

  const renderContent = () => {
    switch (activeSection) {
      case 'awaiting':
        return <NewProjectTable />;
      case 'active':
        return <ActiveProjects />;
      case 'showcase':
        return <FinishedProjects />;
      default:
        return (
          <div id='portfolio' className='text-center'>
            <div className='container'>
              <div className='section-title'>
                <h2 style={exploreStyle}>EXPLORE OUR SERVICES</h2>
              </div>
            </div>
          </div>
        );
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'awaiting';
      setActiveSection(hash);
    };
  
    if (!window.location.hash || !['#awaiting', '#active', '#showcase'].includes(window.location.hash)) {
      window.location.hash = 'awaiting'; // Set default hash
    } else {
      handleHashChange(); // Call to set the state based on the current hash if already present
    }
  
    window.addEventListener('hashchange', handleHashChange);
  
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  

  return (
    <div id='portfolio' className='text-center'>
      <div className='container'>
        <div className='row'>

          <div className='col-md-12' style={contentStyle}>

            <TableContainer component={Paper} sx={{ borderTopLeftRadius: 25, borderTopRightRadius: 25, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93"}}>Menu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow align="center">
                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Breadcrumbs aria-label="breadcrumb">
                          {['AWAITIG', 'ACTIVE', 'SHOWCASE'].map((text, index) => {
                            const hash = ['awaiting', 'active', 'showcase'][index];
                            return (
                              <Link
                                key={text}
                                underline="hover"
                                color={activeSection === hash ? "text.primary" : "inherit"}
                                onClick={() => (window.location.hash = hash)}
                                sx={{
                                  cursor: 'pointer',
                                  fontSize: activeSection === hash ? '17px' : '15px',
                                  fontWeight: activeSection === hash ? 'bold' : 'normal',
                                  fontFamily: "FaunaRegular",
                                  backgroundColor: '#FFFFFF',
                                  color: "#693D8F"
                                }}
                              >
                                {text}
                              </Link>
                            );
                          })}
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
