
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import {ProgressBar} from "./ProgressBar";
const {managerContractAddress} = require('../contracts/contractsAddresses.json')


export const ExploreAwaitinProjectModal = ({ setShowModal, profileId }) => {

    // const isMobile = (window.innerWidth <= 768);
    const [projecData, setprojecData] = useState(null);
    const [projctProgress, setProjctProgress] = useState(null);
    const [amountToSend, setAmountToSend] = useState(0);
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [fundedAmount, setFundetAmount] = useState(null);
    const [isSupplier, setisSupplier] = useState(null);
    const [hoverOk, setHoverOK] = useState(false);
    const [loading, setLoading] = useState(false);
    const [revoked, setRevoked] = useState(false);


    const handleOk = () => {
        setShowModal(false);
    };

    const handleRevokeSupply = async () => {
        setLoading(true);

        const managerContract = new web3.eth.Contract(ManagerContractABI, managerContractAddress);
    
        try {
            const txReceipt = await managerContract.methods.revokeProjectSupply(profileId).send({ from: accounts[0] });
            console.log("Transaction Receipt:", txReceipt);

            setRevoked(true);
    
        } catch (error) {
            console.error("Error revoking supply:", error);
            alert("Error in revoking supply. See console for details.");
        }

        setLoading(false);
    };
    

    const handleSendFunds = async () => {

        setLoading(true);

        if (amountToSend > 0){

            const managerContract = new web3.eth.Contract(ManagerContractABI, managerContractAddress);
            const amountInWei = web3.utils.toWei(amountToSend, 'ether');
            
            try {

                const txReceipt = await managerContract.methods.supplyProject(profileId, amountInWei).send({ 
                    from: accounts[0], 
                    value: amountInWei 
                });
        
                const supply = await managerContract.methods.getProjectSupply(profileId).call();
                setprojecData(supply);

                const progress = calculateProgress(supply, web3);
                setProjctProgress(progress);

                setFundetAmount(amountToSend);
                setprojecData(supply);

            } catch (error) {
                console.error("Error sending funds:", error);
                alert("Error in sending funds. See console for details.");
            }
        }

        setLoading(false);
    }

    function calculateProgress(projectData, web3Instance) {
        const need = projectData.need;
        const has = projectData.has;
    
        if (need === '0') {
            return { completed: 0, ethReceived: "0.00", totalNeeded: "0.00" };
        }
    
        const completed = (Number(has) / Number(need)) * 100;
        const ethReceived = web3Instance.utils.fromWei(has, 'ether');
        const totalNeeded = web3Instance.utils.fromWei(need, 'ether');
    
        return { completed, ethReceived, totalNeeded };
    }
    
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                const fetchedAccounts = await web3Instance.eth.getAccounts();
                setAccounts(fetchedAccounts);

                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
                const supply = await managerContract.methods.getProjectSupply(profileId).call({ gas: 1000000 });
                setprojecData(supply);

                const progress = calculateProgress(supply, web3Instance);
                setProjctProgress(progress);

                const projectSuppliers = await managerContract.methods.getProjectSuppliers(profileId).call();
                // console.log("===== Project Suppliers")
                // console.log(projectSuppliers)

                const isSupplier = projectSuppliers.find(supplier=> supplier == fetchedAccounts[0]);
                // console.log("===== IS Supplier:", isSupplier);

                setisSupplier(isSupplier)

            } else {
                console.log("Please install MetaMask!");
            }
        };

        initWeb3();
    }, [revoked]);

    const connectWallet = async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
        }
    };

    const closeModal = (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('modal-open')) {
        setShowModal(false);
        }
    };

    const buttonContentStyle = {
        fontSize: '17px',
        marginTop: '21px',  
        marginBottom: '21px',
        backgroundColor: "white",
        color: amountToSend > 0 ? '#8155BA' : '#CCCCCC',
        border: '1px solid #8155BA',
        borderRadius: "15px",
        cursor: amountToSend > 0 ? 'pointer' : 'not-allowed', // Change cursor when form is invalid
        minWidth: '150px',
        paddingTop: '10px', 
        paddingBottom: '10px',
        opacity: amountToSend > 0 ? 1 : 0.5, // Change opacity when form is invalid
        fontFamily: "FaunaRegular",
    };

    return (
        <div className='modal-overlay' onClick={closeModal}>
            <div className='modal modal-open'>
                <div className='modal-content'>
                    <span className='close' onClick={() => setShowModal(false)}>&times;</span>
                    <h2 style={h2Style}>Explore Awaiting Project</h2>
    
                    {loading ? (
                        <div style={loadingBarContainerStyle}>
                            <div className="loader"></div>
                        </div>
                    ) : projecData ? (
                        <>
                            <h3 style={h3Style}>{projecData.name}</h3>
                            <p style={pStyle}>{projecData.description}</p>
                            <div style={progressBarContainerStyle}>
                                <p style={fundingStyle}>Funding Progress</p>
                                {projctProgress && (
                                    <ProgressBar completed={projctProgress.completed} eth={projctProgress.ethReceived} totalNeeded={projctProgress.totalNeeded}/>
                                )}
                            </div>
    
                            {fundedAmount && !revoked ? (
                                projctProgress.ethReceived >= projctProgress.totalNeeded ? (
                                    <div style={progressBarContainerStyle}>
                                        <p style={fundingStyle}>Your contribution was pivotal 🎉🎉🎉</p>
                                        <p style={fundingStyle}>Thanks to your funding, the project has successfully launched!💫</p>
                                        <p style={fundingInfoPStyle}>The project has transitioned to the active phase and can now be found in the 'Active Projects' section. Stay tuned for updates on milestones and ongoing developments. Your input is vital in shaping the project's trajectory.</p>
                                        <div>
                                            <button 
                                                onMouseEnter={() => console.log("====> onMouseEnter") }
                                                onMouseLeave={() => setHoverOK(false)}
                                                className="regular-button"
                                                onClick={handleOk}
                                            >
                                                ok
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={progressBarContainerStyle}>
                                        <p style={fundingStyle}>Your support propels us forward 🚀</p>
                                        <p style={fundingStyle}>Immense gratitude for being a part of this journey and believing in our project's vision! 🙏🙌</p>
                                        <p style={fundingInfoPStyle}>Stay tuned for the funding milestones! Upon reaching our funding target, you'll be elevated to a distinguished role on the project committee. As a holder of the esteemed 'Supplier Hat', you'll wield the power to shape the project's future by approving or vetoing its forthcoming phases.</p>
                                        <div>
                                            <button className="regular-button" onClick={handleOk}>
                                                OK
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <>
                                    {!revoked && (
                                         <div>
                                            <label htmlFor="amount" style={fundingStyle} >Become a supplier </label>
                                            <input 
                                                id="amount" 
                                                style={inputStyle} 
                                                value={amountToSend} 
                                                onChange={(e) => setAmountToSend(e.target.value)} 
                                            />
                                            <button style={buttonContentStyle} onClick={handleSendFunds}>
                                                Send Funds
                                            </button>
                                        </div>
                                    )}
                    
                                </>
                
                            )}
    
                            {(isSupplier && !revoked) && (
                                <div>
                                    <label htmlFor="amount" style={fundingStyle} >Revoke Supply </label>
                                    <button className="reject-button" onClick={handleRevokeSupply}>
                                        revoke
                                    </button>
                                </div>
                            )}
                            {revoked && (
                                <div style={progressBarContainerStyle}>
                                <p style={fundingStyle}>The supply has been successfully revoked, and the funds have been returned to you</p>
                                <div>
                                    <button className="regular-button" onClick={handleOk}>
                                        OK
                                    </button>
                                </div>
                            </div>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
    
};


const h2Style = {
    fontSize: '27px', 
    padding: "10px",
    color: "#8155BA",
};
const fundingStyle = {
    fontSize: '17px',
    color: "695E93",
    marginBottom: '0px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
};

const fundingInfoPStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '20px',
    fontFamily: "RaxtorRegular",
    marginTop: '25px',
};

const pStyle = {
    fontSize: '17px',
    color: "#444",
    margin: 70    
};

const inputStyle = {
    width: '30%', 
    padding: '8px', 
    margin: '10px 0 10px 0',        
    borderRadius: '4px', 
    border: '1px solid #ccc', 
    boxSizing: 'border-box',
    marginBottom: '30px',
    color: "#8155BA",
    marginRight: '25px',
};


const h3Style = { 
    fontSize: '24px', 
    fontWeight: 'bold',
    color: "695E93"
};

const progressBarContainerStyle = {
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};