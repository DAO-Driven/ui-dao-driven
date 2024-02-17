import React, { useState, useEffect } from 'react';
import { Modal } from './modalNewProject';
import { ExploreAwaitinProjectModal } from "./ExploreAwaitingProject";
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
const {managerContractAddress} = require('../contracts/contractsAddresses.json')


const h2Style = { 
    fontSize: '21px',
    marginTop: '100px',
    marginBottom: '20px',
    padding: '10px',
    borderRadius: '15px', 
};


export const NewProjectTable = () => {

    const [showModal, setShowModal] = useState(false);
    const [showExploreAwaitinProjectModal, setExploreAwaitinProjectModal] = useState(false);
    const [profilesData, setProfilesData] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [loading, setLoading] = useState(false);

    const openModal = () => {
        setShowModal(current => !current);
    };

    const openExploreAwaitinProjectModal = (profileId) => {
        setSelectedProfileId(profileId);
        setExploreAwaitinProjectModal(current => !current);
    };

    const h3Style = { fontSize: '24px', fontWeight: 'bold' };
    const needStyle = { fontSize: '17px'};
    const pStyle = { fontSize: '16px' }; // Example style

    useEffect(() => {

        setLoading(true);

        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);

                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
                try {
                    const profileIds = await managerContract.methods.getProfiles().call();
                    // console.log("===== Profiles ")
                    // console.log(profileIds)

                    const awaitingProfiles = [];

                    const profiles = await Promise.all(profileIds.map(async (id) => {

                        const supply = await managerContract.methods.getProjectSupply(id).call();
                        // console.log("=====> Project Supply")
                        // console.log(supply)

                        const projectHasPool = await managerContract.methods.getProjectPool(id).call();
                        // console.log("=====> Project HAS POOL")
                        // console.log(Number(projectHasPool))

                        if (!Number(projectHasPool)){

                            awaitingProfiles.push({ id: id, name: supply.name, description: supply.description, need: web3Instance.utils.fromWei(supply.need, 'ether')})
                        }
                    }));

                    setProfilesData(awaitingProfiles);

                } catch (error) {
                    console.error("Error fetching profiles:");
                    console.log(error)
                }
            } else {
                console.log("Please install MetaMask!");
            }
        };
    
        initWeb3().finally(() => setLoading(false));
    }, [showExploreAwaitinProjectModal, showModal]);
    
    return (
        <div>
            <div className="section-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={h2Style}>Projects that are awaiting investors</h2>
                <button onClick={() => openModal()}>
                    <h2 className="regular-button">Register new project</h2>
                </button>
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
                                style={buttonContentStyle}
                                onClick={() => openExploreAwaitinProjectModal(profile.id)}
                            >
                                <h3 style={h3Style}>{profile.name}</h3>
                                <p style={pStyle}>{profile.description}</p>
                                <h3 style={needStyle}>Needs {profile.need} ETH</h3>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <Modal setShowModal={setShowModal} />
            )}
            {showExploreAwaitinProjectModal && (
                <ExploreAwaitinProjectModal 
                    setShowModal={setExploreAwaitinProjectModal} 
                    profileId={selectedProfileId} 
                />
            )}
        </div>
    );
};


const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const buttonContentStyle = {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    padding: '10px',
    // height: '100%', // Adjust height as needed
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '500px',
};
