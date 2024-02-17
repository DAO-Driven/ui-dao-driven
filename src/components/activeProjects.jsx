import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import { ExploreActiveProject } from "./ExploreActiveProject";
import ExecutorSupplierVotingStrategyABI from '../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
const {managerContractAddress} = require('../contracts/contractsAddresses.json');


export const ActiveProjects = () => {
    const [profilesData, setProfilesData] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        setLoading(true);

        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);

                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
                try {


                    const profileIds = await managerContract.methods.getProfiles().call();
                    const activeProjects = [];

                    await Promise.all(profileIds.map(async project=> {

                        const strategyAddress = await managerContract.methods.getProjectStrategy(project).call();

                        if (strategyAddress != "0x0000000000000000000000000000000000000000"){

                            const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);
                            const strategyState = Number(await ExecutorSupplierVotingStrategy.methods.state().call());
                            // console.log("====> STRATEGY STATE:", strategyState)

                            if (strategyState == 1){

                                const supply = await managerContract.methods.getProjectSupply(project).call();

                                activeProjects.push({ id: project, name: supply.name, description: supply.description, need: web3Instance.utils.fromWei(supply.need, 'ether') });
                            }
                        }
                    }))

                    setProfilesData(activeProjects);

                } catch (error) {
                    console.error("Error fetching profiles:", error);
                }
            } else {
                console.log("Please install MetaMask!");
            }
        };

        initWeb3().finally(() => setLoading(false));
    }, [setSelectedProfileId]);

    return (
        <div>
            <div className="section-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>                
                <h2 style={h2Style}>Active phase projects</h2>
            </div>
            {loading ? (
                <div style={loadingBarContainerStyle}>
                    <div className="loader"></div>
                </div>
            ) : selectedProfileId ? (
                <ExploreActiveProject
                    profileId={selectedProfileId}
                    setActiveProject={setSelectedProfileId} 
                />
            ) : profilesData.length > 0 ? (
                <div>
                    
                    <div className='row'>
                        {profilesData.map((profile, i) => (
                            <div key={`profile-${i}`} className='col-md-4'>
                                <button
                                    className='col-md-4 project-button-content-style'
                                    onClick={() => setSelectedProfileId(profile.id)}
                                >
                                    <h3 style={h3Style}>{profile.name}</h3>
                                    <p style={pStyle}>{profile.description}</p>
                                    {/* <h3 style={needStyle}>Phase Nr</h3> */}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div id='portfolio' className='text-center'>
                    <div className='container'>
                        <div className="section-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h2 style={exploreStyle}>Currently, there are no active projects available</h2>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );    
};

const h2Style = {
    fontSize: '21px',
    marginTop: '100px',
    marginBottom: '20px',
    padding: '10px',
    borderRadius: '15px', 
};

const h3Style = { fontSize: '24px', fontWeight: 'bold' };
const pStyle = { fontSize: '16px' };

const exploreStyle = { 
    fontSize: '21px',
    marginTop: '21px',  
    marginBottom: '21px',
    backgroundColor: '#FFFFFF',
    color: "#8155BA",
    border: 'none',
    borderRadius: "15px",
    cursor: 'pointer',
    minWidth: '150px',
    paddingTop: '10px', 
    paddingBottom: '10px',
};

const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

