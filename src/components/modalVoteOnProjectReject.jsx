
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import ExecutorSupplierVotingStrategyABI from '../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
const {managerContractAddress} = require('../contracts/contractsAddresses.json');


export const RejectStrategyVoteModal = ({ setSuppliersRejectVotes, setOfferMilestonesModalClosed, profileId }) => {

    const [suppliersRejectVotes, setProjectSuppliersRejectVotes] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [strategyRejected, setStrategyRejected] = useState(null);
    const [hover, setHover] = useState(false);
    const [loading, setLoading] = useState(false);


    const closeModal = (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('modal-open')) {
            setSuppliersRejectVotes(false);
        }
    };

    const handleOk = () => {
        setSuppliersRejectVotes(false);
        setOfferMilestonesModalClosed(true)
    };

    const handleRejectedClick = () => {
        window.location.reload();
    };

    const handleVote = async (status) => {
        setLoading(true);
        try{
            const web3Instance = new Web3(window.ethereum);
            const fetchedAccounts = await web3Instance.eth.getAccounts();
            const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
            const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
            const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);

            const tx = {
                from: fetchedAccounts[0],
                to: strategyAddress,
                data: ExecutorSupplierVotingStrategy.methods.rejectProject(
                    status
                ).encodeABI()
            };

            const sentTx = await web3Instance.eth.sendTransaction(tx);
            const txReceipt = await web3Instance.eth.getTransactionReceipt(sentTx.transactionHash);
            // console.log("========> Reject project txReceipt <===========")
            // console.log(txReceipt)

            if (status == 2){
                const strategyState = Number(await ExecutorSupplierVotingStrategy.methods.state().call());
                // console.log("====> STRATEGY STATE:", strategyState)

                if (strategyState == 3){
                    setStrategyRejected(true);
                }
                else{
                    setSuppliersRejectVotes(false);
                    setOfferMilestonesModalClosed(true)
                }
            }
            else {
                setSuppliersRejectVotes(false);
                setOfferMilestonesModalClosed(true)
            }
        }
        catch(err){
            console.log("Error Project Rejecting");
            console.log(err);
            setSuppliersRejectVotes(false);
            setOfferMilestonesModalClosed(true)
        }
        setLoading(false);
    };

    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
                try {

                    const fetchedAccounts = await web3Instance.eth.getAccounts();
                    const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
                    const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);

                    const rejectSupplierVotes = Number(await ExecutorSupplierVotingStrategy.methods.getRejectProjectSupplierVotes(fetchedAccounts[0]).call());

                    // console.log("---> rejectSupplierVotes:", rejectSupplierVotes)
                    setProjectSuppliersRejectVotes(rejectSupplierVotes);

                    setIsLoaded(true);
                } catch (error) {
                    console.error("Error fetching profiles:", error);
                }
            } else {
                console.log("Please install MetaMask!");
            }
        };

        initWeb3();
    }, []);

    return (
        <div className='modal-overlay' onClick={closeModal}>
        <div className='modal modal-open'>
            <div className='modal-content'>
                <span className='close' onClick={() => setSuppliersRejectVotes(false)}>&times;</span>

                {loading ? (
                        <div style={loadingBarContainerStyle}>
                            <div className="loader"></div>
                        </div>
                    ) : (
                    <>
                        {strategyRejected && (
                        <div>
                            <h2 style={h2Style} >The strategy was rejected</h2>
                            <p>Thank you for your vote! You can now find it in the Showcase Projects section</p>
                            <button
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                style={hover ? buttonHoverStyle : buttonContentStyle}
                                onClick={handleRejectedClick}
                            >
                                OK
                            </button>
                        </div>
                        )}
                        {(isLoaded && !strategyRejected) && (
                            <>
                                {
                                !suppliersRejectVotes ? 
                                    (<div>
                                            <p style={h2Style}>Please Cast Your Vote</p>
                                            <p style={infoStyle}>If the total votes cast in favor of rejecting the project exceed a specified threshold, the project will be deemed rejected. In this scenario, all invested funds will be returned to the contributors. The amount refunded to each contributor will be in proportion to their share of the total funding. Conversely, if the majority of the votes favor continuing the project, it will proceed as planned</p>

                                            <div style={milestonesFlexContainerStyle}>
                                                <button className="reject-button" onClick={() => {handleVote(2)}}>
                                                        Reject project
                                                </button>
                                                <button className="accept-button" onClick={() => {handleVote(3)}}>
                                                    Continue project
                                                </button>
                                            </div>
                                        </div>
                                    )

                                    :

                                    <div>
                                        <p style={infoStyle}>Your vote was proccessed, thank u!</p>\
                                        <button style={buttonStyle} onClick={() => {handleOk()}}>
                                            Ok
                                        </button>
                                    </div>
                                }
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
        </div>
    );
};

const h2Style = {
    fontSize: '21px', 
    padding: "10px",
    color: "#8155BA",
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '100px',
    marginLeft: '100px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};


const infoStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '30px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
    marginLeft: '25px',
};

const buttonStyle = {
    fontSize: '15px',
    marginLeft: '30px', 
    backgroundColor: 'white', 
    color: 'green',
    border: '1px solid green', // Add a black border
    borderRadius: '5px',
    // padding: '10px 20px',
    cursor: 'pointer',
    fontFamily: "FaunaRegular",
};

const rejectButtonStyle = {
    fontSize: '15px',
    marginLeft: '30px', 
    backgroundColor: 'white', 
    color: 'red',
    border: '1px solid red', // Add a black border
    borderRadius: '5px',
    // padding: '10px 20px',
    cursor: 'pointer',
    fontFamily: "FaunaRegular",
};

const milestonesFlexContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const buttonContentStyle = {
    fontSize: '21px',
    marginTop: '21px',
    marginBottom: '21px',
    backgroundColor: '#FFFFFF',
    color: "#8155BA",
    border: '1px solid #8155BA',
    borderRadius: "15px",
    cursor: 'pointer',
    minWidth: '350px',
    paddingTop: '10px',
    paddingBottom: '10px'
};

const buttonHoverStyle = {
    ...buttonContentStyle,
    backgroundColor: '#E0E0E0', 
};

const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};


