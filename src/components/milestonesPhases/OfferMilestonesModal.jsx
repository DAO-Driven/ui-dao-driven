
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ExecutorSupplierVotingStrategyABI from '../../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
import ManagerContractABI from '../../contracts/abis/managerContractAbi.json';
const {managerContractAddress} = require('../../contracts/contractsAddresses.json');

export const OfferMilestones = ({ setShowModal, setOfferMilestonesModalClosed, profileId }) => {

    // const isMobile = (window.innerWidth <= 768);
    const [needsFunds, setNeedsFunds] = useState('');
    const [milestonePointer, setMilestonePointer] = useState('');
    const [description, setDescription] = useState('');
    const [web3, setWeb3] = useState(null);
    const [offeredMilestones, setOfferedMilestones] = useState([]);
    const [accounts, setAccounts] = useState(null);
    const [milestonesPercentage, setMilestonesPercentage] = useState(0);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                const fetchedAccounts = await web3Instance.eth.getAccounts();
                setAccounts(fetchedAccounts);
            } else {
                console.log("Please install MetaMask!");
            }
        };

        initWeb3();
    }, []);

    const connectWallet = async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            const fetchedAccounts = await web3Instance.eth.getAccounts();
            setAccounts(fetchedAccounts);
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
        }
    };

    const closeModal = (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('modal-open')) {
            setShowModal(false);
            setOfferMilestonesModalClosed(true);
        }
    };

    const handleOffer = async () => {
        // Perform any action here, e.g., close the modal
        setLoading(true);
        const web3Instance = new Web3(window.ethereum);

        const formatedMilestones = offeredMilestones.map(milestone=> {

            const metadata = {
                protocol: 1,
                pointer: milestone.metadata
            };

            return {
                amountPercentage: web3.utils.toWei((milestone.amountPercentage) / 100, 'ether'),
                metadata: metadata,
                milestoneStatus: 0,
                description: milestone.description
            }
        })

        // console.log("======> FORMATED Offered Milestones")
        // console.log(formatedMilestones)

        try{

            const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
            const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
            // console.log("=====> strategyAddress")
            // console.log(strategyAddress)

            const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);

            const nonce = await web3.eth.getTransactionCount(accounts[0], 'latest');

            const tx = {
                from: accounts[0],
                to: strategyAddress,
                nonce: web3.utils.toHex(nonce),
                data: ExecutorSupplierVotingStrategy.methods.offerMilestones(
                    accounts[0],
                    formatedMilestones
                ).encodeABI()
            };

            const estimatedGas = await web3Instance.eth.estimateGas(tx);
            // console.log("==========> OFFER MILESTONE ESITMATED GAS LIMIT")
            // console.log(estimatedGas)

            const gasLimit = Math.floor(Number(estimatedGas) * 1.1);
            tx.gas = gasLimit;

            // // // Send the transaction
            const sentTx = await web3.eth.sendTransaction(tx);
            const txReceipt = await web3.eth.getTransactionReceipt(sentTx.transactionHash);

            console.log("========> txReceipt <===========")
            console.log(txReceipt)

            setMilestonesPercentage(101)
        }
        catch (error) {
            console.error("Error fetching Strategy data:", error);
        }

        setLoading(false);
    };

    const handleOk = () => {
        // Perform any action here, e.g., close the modal
        setShowModal(null);
        setOfferMilestonesModalClosed(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isFormValid()) {
            alert("Please fill in all the fields.");
            return;
        }

        if (!web3 || !accounts || accounts.length === 0) {
            alert("Please connect to MetaMask.");
            return;
        }

        try {

            const newPercentage = milestonesPercentage + parseInt(needsFunds);
            if (newPercentage <= 100) {
                setMilestonesPercentage(newPercentage);

                setOfferedMilestones(prevMilestones => [
                    ...prevMilestones,
                    {
                        amountPercentage: needsFunds,
                        metadata: milestonePointer,
                        milestoneStatus: 0,
                        description: description
                    }
                ]);

            } else {
                alert("Total percentage exceeds 100%");
            }

        } catch (error) {
            console.error("Error in transaction:", error);
            alert("Error in transaction. See console for details.");
        }
        finally {
            // Clear the form fields regardless of the outcome
            setNeedsFunds('');
            setMilestonePointer('');
            setDescription('');
        }
    };

    const isFormValid = () => {
        return needsFunds && milestonePointer && description && (milestonesPercentage <= 100);
    };

    const buttonContentStyle = (isFormValid) => ({
        fontSize: '21px',
        marginTop: '21px',  
        marginBottom: '21px',
        backgroundColor: isFormValid ? '#8155BA' : '#CCCCCC', // Change color when form is invalid
        color: "#FFFFFF",
        border: '1px solid black',
        borderRadius: "15px",
        cursor: isFormValid ? 'pointer' : 'not-allowed', // Change cursor when form is invalid
        minWidth: '350px',
        paddingTop: '10px', 
        paddingBottom: '10px',
        opacity: isFormValid ? 1 : 0.5, // Change opacity when form is invalid
    });

    return (
        <div className='modal-overlay' onClick={closeModal}>
            <div className='modal modal-open'>
                <div className='modal-content'>
                    <span className='close' onClick={handleOk}>&times;</span>
                    <h2 style={h2Style}>Milestones details</h2>
    
                    {loading ? (
                        <div style={loadingBarContainerStyle}>
                            <div className="loader"></div>
                        </div>
                    ) : (
                        <>
                            {milestonesPercentage !== 101 && offeredMilestones.map((milestone, i) => (
                                <div key={`milestone-${i}`}>
                                    <p style={pStyle}>Milestone {i + 1}</p>
                                    <p style={milestoneInfoStyle}>Percentage to distribute: {milestone.amountPercentage}%</p>
                                    <p style={milestoneInfoStyle}>Pointer: {milestone.metadata}</p>
                                    <p style={milestoneInfoStyle}>Description: {milestone.description}</p>
                                </div>
                            ))}
    
                            {milestonesPercentage < 100 && (
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <label style={pStyle}>Percentage to distribute </label>
                                        <input 
                                            type="text" 
                                            name="needsFunds" 
                                            style={inputStyle} 
                                            value={needsFunds}
                                            onChange={(e) => setNeedsFunds(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label style={pStyle} >Milestone pointer</label>
                                        <input 
                                            type="text" 
                                            name="pointer" 
                                            style={inputStyle} 
                                            value={milestonePointer}
                                            onChange={(e) => setMilestonePointer(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label style={pStyle} >Milestone description</label>
                                        <input 
                                            type="text" 
                                            name="description" 
                                            value={description}
                                            style={inputStyle} 
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        {accounts && accounts.length ? (
                                            <button type="submit" style={buttonContentStyle(isFormValid())} disabled={!isFormValid()}>
                                                Add milestone
                                            </button>
                                        ) : (
                                            <button onClick={connectWallet} style={buttonContentStyle(false)}>
                                                Connect Wallet
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}
    
                            {milestonesPercentage === 100 && (
                                <button type="submit" style={offerButtonContentStyle} onClick={handleOffer}>
                                    Offer milestones
                                </button>
                            )}
    
                            {milestonesPercentage === 101 && (
                                <div>
                                    <p style={pStyle}>🎉All milestones have been added🎉</p>
                                    <button type="submit" style={offerButtonContentStyle} onClick={handleOk}>
                                        ok
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
    

}

const h2Style = {
    fontSize: '27px', 
    padding: "10px",
    color: "#8155BA",
};
const pStyle = {
    fontSize: '17px',
    color: "#8155BA",
};

const milestoneInfoStyle = {
    fontSize: '13px',
    color: "#281C2D",
    padding: '1px 16px',
};

const inputStyle = {
    width: '100%', 
    padding: '8px', 
    margin: '10px 0', 
    borderRadius: '4px', 
    border: '1px solid #ccc', 
    boxSizing: 'border-box',
    marginBottom: '30px',
    color: "#8155BA",
};

const offerButtonContentStyle = {
    fontSize: '21px',
    marginTop: '21px',  
    marginBottom: '21px',
    backgroundColor: '#8155BA', // Change color when form is invalid
    color: "#FFFFFF",
    border: '1px solid black',
    borderRadius: "15px",
    minWidth: '350px',
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
