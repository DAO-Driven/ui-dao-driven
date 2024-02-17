import React, { useState, useEffect } from 'react';
import JsonData from '../data/data.json';
import { NewProjectTable } from "./newProject";
import { ActiveProjects } from "./activeProjects";
import { FinishedProjects } from "./FinishedProjects";


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

  const h2Style = { 
    fontSize: '32px',
    color: "#8155BA",
    backgroundColor: '#FFFFFF',
    padding: '10px',
    marginBottom: '0px',
    borderTopLeftRadius: "25px",
    borderTopRightRadius: "25px",
  };

  const h3Style = { 
    fontSize: '21px',
    fontFamily: "FaunaRegular",
  };
  const buttonStyle = (index) => ({
    backgroundColor: index === activeIndex ? "#8155BA" : '#FFFFFF',
    color: index === activeIndex ? "#ffff" : "#8155BA",
    border: '1px solid black',
    borderRadius: "15px",
    cursor: 'pointer',
    minWidth: '350px'
  });

  const setIndex = (index) => {
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

          <h2 style={h2Style}>BuidlBox's Hackathon: Allo V2 on Arbitrum</h2>
          <h2 style={h3InfoStyle}>The project was made for the Allo V2 on Arbitrum Hackathon, organized by BuidlBox</h2>
          <h2 style={h3InfoStyleColored}>Disclamer: </h2>
          <h2 style={h3InfoStyle}>The project operates solely on the Goerli network</h2>
          <h2 style={h3InfoBottomStyle}>Only the native token is permitted</h2>
          <h2 style={h3InfoBottomStyle}>It is recommended to maintain a balance greater than 1.5 ETH</h2>
        </div>
        <div className='row'>
          {JsonData.Portfolio.map((item, index) => (
            <div className='col-md-4' key={index}>
              <button
                style={buttonStyle(index)}
                onClick={() => setIndex(index)}
              >
                <div>
                  <h3 style={h3Style} dangerouslySetInnerHTML={{ __html: item.title }} />
                </div>
              </button>
            </div>
          ))}
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

const h3InfoStyle = { 
  fontSize: '17px',
  fontFamily: "RaxtorRegular", 
  justifyContent: 'left',
  justifyContent: 'left',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'left',
  alignItems: 'left',
  flexWrap: 'wrap',
  gap: '20px',
  backgroundColor: '#FFFFFF',
  padding: '10px',
  // borderRadius: "25px",
  marginBottom: '0px',
  marginTop: '0px',
};

const h3InfoBottomStyle = { 
  fontSize: '17px',
  fontFamily: "RaxtorRegular", 
  justifyContent: 'left',
  justifyContent: 'left',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'left',
  alignItems: 'left',
  flexWrap: 'wrap',
  gap: '20px',
  backgroundColor: '#FFFFFF',
  padding: '10px',
  // borderRadius: "25px",
  marginBottom: '0px',
  marginTop: '0px',
  borderBottomLeftRadius: "25px",
  borderBottomRightRadius: "25px",
};

const h3InfoStyleColored = { 
  fontSize: '17px',
  color: "#8155BA",
  fontFamily: "RaxtorRegular", 
  justifyContent: 'left',
  justifyContent: 'left',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'left',
  alignItems: 'left',
  // flexWrap: 'wrap',
  gap: '20px',
  backgroundColor: '#FFFFFF',
  padding: '30px',
  // borderRadius: "25px",
  marginBottom: '0',
  marginTop: '0px',
};


