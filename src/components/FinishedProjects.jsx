import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import { ExploreFinishedProject } from "./ExploreFinishedProject";
import ExecutorSupplierVotingStrategyABI from '../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
const {managerContractAddress} = require('../contracts/contractsAddresses.json');


export const FinishedProjects = () => {
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

                            if (strategyState == 2 || strategyState == 3){

                                const supply = await managerContract.methods.getProjectSupply(project).call();

                                activeProjects.push({ id: project, name: supply.name, description: supply.description, state: strategyState});
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
    }, []);

    const milestoneStatusLabel = (status) => {
        if (status === 2){
            return (
                <span style={{
                    color: '#4caf50',
                    border: '1px solid #4caf50', 
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: "FaunaRegular",
                }}>
                    Executed
                </span>
            );
        }
        else if (status === 3){
            return (
                <span style={{
                    color: '#C70039',
                    border: '1px solid #C70039',
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: "FaunaRegular",
                }}>
                    Rejected
                </span>
            );
        }
        else {
            return (
                <span style={{
                    color: 'orange',
                    border: '1px solid orange', 
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: "FaunaRegular",
                }}>
                    unknow
                </span>
            );
        }
    };

    return (
        <div>
            {selectedProfileId && (
                <ExploreFinishedProject
                    profileId={selectedProfileId}
                    setActiveProject={setSelectedProfileId} 
                />
            )}

            {!selectedProfileId && (
                <div>
                    <div className="section-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>                          
                        <h2 style={h2Style}>Finished projects</h2>
                    </div>

                    {loading ? (
                        <div style={loadingBarContainerStyle}>
                            <div className="loader"></div>
                        </div>
                    ) : (
                        <div className='row'>
                            {profilesData.map((profile, i) => (
                                <div key={`profile-${i}`} className='col-md-4'>
                                    <button
                                        className='col-md-4 project-button-content-style'
                                        onClick={() => setSelectedProfileId(profile.id)}
                                    >
                                        <h3 style={h3Style}>{profile.name}</h3>
                                        <p style={pStyle}>{profile.description}</p>
                                        <p style={pStyle}>Result: {milestoneStatusLabel(profile.state)}</p>
                                        
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
const needStyle = { fontSize: '17px' };

const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};
